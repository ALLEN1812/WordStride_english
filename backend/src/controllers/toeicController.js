const { pool } = require('../config/db');
const { awardExp, completeDailyTask } = require('../utils/expHelper');
const { updateStreak, checkFirstDayBonus } = require('../utils/streakHelper');
const { checkAndUnlock } = require('../utils/achievementHelper');

// Standard TOEIC score conversion (raw 0-100 → scaled 5-495)
const L_TABLE = [5,5,5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95,100,105,110,115,120,125,130,135,140,145,150,155,160,165,170,175,180,185,190,195,200,205,210,215,220,225,230,235,240,245,250,255,260,265,270,275,280,285,290,295,300,305,310,315,320,330,335,340,345,350,355,365,370,375,385,390,395,405,410,420,425,435,440,450,455,460,470,475,480,485,490,491,492,493,494,495,495,495,495,495,495,495];
const R_TABLE = [5,5,5,5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95,100,105,110,115,120,125,130,135,140,145,150,155,160,165,170,175,180,185,190,195,200,205,210,215,220,225,230,235,240,245,250,255,260,265,270,275,285,290,295,300,310,315,320,325,335,340,345,355,360,365,375,380,390,395,400,410,415,425,430,440,445,455,460,465,475,480,485,490,491,492,493,494,495,495,495,495,495,495,495];

function toToeicScore(rawCorrect, totalInSection, section) {
  if (totalInSection === 0) return 5;
  const pct = rawCorrect / totalInSection; // 0.0–1.0
  const idx = Math.min(100, Math.round(pct * 100));
  const tbl = section === 'listening' ? L_TABLE : R_TABLE;
  return tbl[idx];
}

const LISTENING_PARTS = [1, 2, 3, 4];

// ── GET /api/toeic/tests ────────────────────────────────────
const getTests = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.*, COUNT(DISTINCT q.id) AS question_count
       FROM toeic_tests t
       LEFT JOIN toeic_questions q ON q.test_id = t.id
       WHERE t.status = 'public'
       GROUP BY t.id ORDER BY t.created_at DESC`
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ── GET /api/toeic/admin/tests ──────────────────────────────
const getAllTests = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.*, COUNT(DISTINCT q.id) AS question_count
       FROM toeic_tests t
       LEFT JOIN toeic_questions q ON q.test_id = t.id
       GROUP BY t.id ORDER BY t.created_at DESC`
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ── GET /api/toeic/tests/:id ────────────────────────────────
const getTestById = async (req, res) => {
  try {
    const [[test]] = await pool.query('SELECT * FROM toeic_tests WHERE id = ?', [req.params.id]);
    if (!test) return res.status(404).json({ success: false, message: 'Không tìm thấy đề thi' });

    const [groups] = await pool.query(
      'SELECT * FROM toeic_question_groups WHERE test_id = ? ORDER BY part_num, group_order',
      [req.params.id]
    );
    const groupMap = {};
    groups.forEach(g => { groupMap[g.id] = g; });

    const [questions] = await pool.query(
      'SELECT * FROM toeic_questions WHERE test_id = ? ORDER BY part_num, order_index, question_num',
      [req.params.id]
    );

    const enriched = questions.map(q => ({
      ...q,
      group: q.group_id ? (groupMap[q.group_id] || null) : null,
    }));

    return res.json({ success: true, data: { ...test, questions: enriched, groups } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ── POST /api/toeic/tests/:id/submit ───────────────────────
const submitTest = async (req, res) => {
  const userId = req.user.id;
  const testId = req.params.id;
  const { answers = [], mode = 'mock_test', time_taken_seconds } = req.body;

  try {
    const [questions] = await pool.query(
      'SELECT id, part_num, correct_answer FROM toeic_questions WHERE test_id = ?',
      [testId]
    );
    if (!questions.length) return res.status(400).json({ success: false, message: 'Đề thi chưa có câu hỏi' });

    let listeningCorrect = 0, readingCorrect = 0;
    const partStats = {};
    const answerRows = [];

    questions.forEach(q => {
      const ans = answers.find(a => a.question_id === q.id);
      const chosen = ans?.chosen || null;
      const isCorrect = chosen && chosen === q.correct_answer ? 1 : 0;

      if (!partStats[q.part_num]) partStats[q.part_num] = { correct: 0, total: 0 };
      partStats[q.part_num].total++;
      if (isCorrect) {
        partStats[q.part_num].correct++;
        if (LISTENING_PARTS.includes(q.part_num)) listeningCorrect++;
        else readingCorrect++;
      }
      answerRows.push([q.id, chosen, isCorrect]);
    });

    const listeningTotal = questions.filter(q => LISTENING_PARTS.includes(q.part_num)).length;
    const readingTotal   = questions.filter(q => !LISTENING_PARTS.includes(q.part_num)).length;
    const listeningScore = toToeicScore(listeningCorrect, listeningTotal, 'listening');
    const readingScore   = toToeicScore(readingCorrect, readingTotal, 'reading');
    const totalScore     = listeningScore + readingScore;

    const [att] = await pool.query(
      `INSERT INTO toeic_attempts
       (user_id, test_id, mode, status, listening_correct, reading_correct,
        listening_score, reading_score, total_score, part_scores, time_taken_seconds, completed_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,NOW())`,
      [userId, testId, mode, 'completed', listeningCorrect, readingCorrect,
       listeningScore, readingScore, totalScore, JSON.stringify(partStats), time_taken_seconds || null]
    );
    const attemptId = att.insertId;

    if (answerRows.length) {
      await pool.query(
        'INSERT INTO toeic_attempt_answers (attempt_id, question_id, chosen, is_correct) VALUES ?',
        [answerRows.map(r => [attemptId, ...r])]
      );
    }

    const totalCorrect = listeningCorrect + readingCorrect;
    let baseExp = Math.round((totalCorrect / questions.length) * 100);

    // Streak multiplier
    const streakInfo = await updateStreak(userId);
    const multiplier = streakInfo.multiplier;

    // First-of-day bonus (2x for first TOEIC of the day)
    const isFirstOfDay = await checkFirstDayBonus(userId, 'toeic');
    if (isFirstOfDay) baseExp *= 2;

    const expEarned = Math.round(baseExp * multiplier);
    let expInfo = await awardExp(userId, expEarned);
    const dailyResult = await completeDailyTask(userId, 'exam', 100);
    if (!dailyResult.alreadyDone) expInfo = dailyResult.expInfo;

    // Achievement checks
    const achievements_unlocked = await checkAndUnlock(userId, {
      toeic_score: totalScore,
      streak: streakInfo.current_streak,
    });

    return res.json({
      success: true,
      data: {
        attempt_id: attemptId,
        listening_correct: listeningCorrect, listening_total: listeningTotal,
        reading_correct: readingCorrect, reading_total: readingTotal,
        listening_score: listeningScore, reading_score: readingScore,
        total_score: totalScore, part_scores: partStats,
        exp_earned: expEarned + (dailyResult.alreadyDone ? 0 : 100),
        daily_task_completed: !dailyResult.alreadyDone,
        first_day_bonus: isFirstOfDay,
        streak: { current: streakInfo.current_streak, multiplier, milestone: streakInfo.streak_milestone },
        achievements_unlocked,
        level: expInfo?.level, total_exp: expInfo?.totalExp,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ── GET /api/toeic/results/:attemptId ──────────────────────
const getAttemptResult = async (req, res) => {
  try {
    const [[attempt]] = await pool.query(
      `SELECT ta.*, tt.title, tt.type, tt.duration_minutes
       FROM toeic_attempts ta
       JOIN toeic_tests tt ON tt.id = ta.test_id
       WHERE ta.id = ? AND ta.user_id = ?`,
      [req.params.attemptId, req.user.id]
    );
    if (!attempt) return res.status(404).json({ success: false, message: 'Không tìm thấy kết quả' });

    const [answers] = await pool.query(
      `SELECT taa.chosen, taa.is_correct,
              tq.id AS question_id, tq.part_num, tq.question_num, tq.question_text,
              tq.option_a, tq.option_b, tq.option_c, tq.option_d,
              tq.correct_answer, tq.explanation, tq.image_url,
              tg.passage, tg.image_url AS group_image_url, tg.audio_url AS group_audio_url, tg.transcript
       FROM toeic_attempt_answers taa
       JOIN toeic_questions tq ON tq.id = taa.question_id
       LEFT JOIN toeic_question_groups tg ON tg.id = tq.group_id
       WHERE taa.attempt_id = ?
       ORDER BY tq.part_num, tq.order_index`,
      [req.params.attemptId]
    );

    return res.json({ success: true, data: { ...attempt, answers } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ── ADMIN: Tests ────────────────────────────────────────────
const createTest = async (req, res) => {
  const { title, type, duration_minutes, difficulty, description, status } = req.body;
  if (!title) return res.status(400).json({ success: false, message: 'Title là bắt buộc' });
  try {
    const [r] = await pool.query(
      'INSERT INTO toeic_tests (title, type, duration_minutes, difficulty, description, status, created_by) VALUES (?,?,?,?,?,?,?)',
      [title, type || 'full_test', duration_minutes || 120, difficulty || 'medium', description || null, status || 'draft', req.user.id]
    );
    return res.status(201).json({ success: true, id: r.insertId });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const updateTest = async (req, res) => {
  const { title, type, duration_minutes, difficulty, description, status } = req.body;
  try {
    await pool.query(
      'UPDATE toeic_tests SET title=?, type=?, duration_minutes=?, difficulty=?, description=?, status=? WHERE id=?',
      [title, type, duration_minutes, difficulty, description || null, status, req.params.id]
    );
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const deleteTest = async (req, res) => {
  try {
    await pool.query('DELETE FROM toeic_tests WHERE id=?', [req.params.id]);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ── ADMIN: Groups ───────────────────────────────────────────
const createGroup = async (req, res) => {
  const { test_id, part_num, group_order, audio_url, image_url, passage, transcript } = req.body;
  if (!test_id || !part_num) return res.status(400).json({ success: false, message: 'test_id và part_num là bắt buộc' });
  try {
    const [r] = await pool.query(
      'INSERT INTO toeic_question_groups (test_id, part_num, group_order, audio_url, image_url, passage, transcript) VALUES (?,?,?,?,?,?,?)',
      [test_id, part_num, group_order || 0, audio_url || null, image_url || null, passage || null, transcript || null]
    );
    return res.status(201).json({ success: true, id: r.insertId });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const updateGroup = async (req, res) => {
  const { group_order, audio_url, image_url, passage, transcript } = req.body;
  try {
    await pool.query(
      'UPDATE toeic_question_groups SET group_order=?, audio_url=?, image_url=?, passage=?, transcript=? WHERE id=?',
      [group_order || 0, audio_url || null, image_url || null, passage || null, transcript || null, req.params.id]
    );
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const deleteGroup = async (req, res) => {
  try {
    await pool.query('DELETE FROM toeic_question_groups WHERE id=?', [req.params.id]);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ── ADMIN: Questions ────────────────────────────────────────
const createQuestion = async (req, res) => {
  const { test_id, group_id, part_num, question_num, question_text, image_url, audio_url,
          option_a, option_b, option_c, option_d, correct_answer, explanation, order_index } = req.body;
  if (!test_id || !part_num) return res.status(400).json({ success: false, message: 'test_id và part_num là bắt buộc' });
  try {
    const [r] = await pool.query(
      `INSERT INTO toeic_questions
       (test_id, group_id, part_num, question_num, question_text, image_url, audio_url,
        option_a, option_b, option_c, option_d, correct_answer, explanation, order_index)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [test_id, group_id || null, part_num, question_num || 0, question_text || null,
       image_url || null, audio_url || null, option_a || null, option_b || null,
       option_c || null, option_d || null, correct_answer || null, explanation || null, order_index || 0]
    );
    return res.status(201).json({ success: true, id: r.insertId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const updateQuestion = async (req, res) => {
  const { group_id, part_num, question_num, question_text, image_url, audio_url,
          option_a, option_b, option_c, option_d, correct_answer, explanation, order_index } = req.body;
  try {
    await pool.query(
      `UPDATE toeic_questions SET group_id=?, part_num=?, question_num=?, question_text=?,
       image_url=?, audio_url=?, option_a=?, option_b=?, option_c=?, option_d=?,
       correct_answer=?, explanation=?, order_index=? WHERE id=?`,
      [group_id || null, part_num, question_num || 0, question_text || null,
       image_url || null, audio_url || null, option_a || null, option_b || null,
       option_c || null, option_d || null, correct_answer || null, explanation || null,
       order_index || 0, req.params.id]
    );
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    await pool.query('DELETE FROM toeic_questions WHERE id=?', [req.params.id]);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ── GET /api/toeic/history ──────────────────────────────────
const getHistory = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ta.id, ta.mode, ta.total_score, ta.listening_score, ta.reading_score,
              ta.listening_correct, ta.reading_correct, ta.time_taken_seconds,
              ta.completed_at, tt.title, tt.type
       FROM toeic_attempts ta
       JOIN toeic_tests tt ON tt.id = ta.test_id
       WHERE ta.user_id = ?
       ORDER BY ta.completed_at DESC`,
      [req.user.id]
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

module.exports = {
  getTests, getAllTests, getTestById,
  submitTest, getAttemptResult, getHistory,
  createTest, updateTest, deleteTest,
  createGroup, updateGroup, deleteGroup,
  createQuestion, updateQuestion, deleteQuestion,
};
