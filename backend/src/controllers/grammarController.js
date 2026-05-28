const { pool } = require('../config/db');
const { awardExp, completeDailyTask } = require('../utils/expHelper');
const { updateStreak, checkFirstDayBonus } = require('../utils/streakHelper');
const { checkAndUnlock } = require('../utils/achievementHelper');

// ── GET /api/grammar/lessons ─────────────────────────────────
const getLessons = async (req, res) => {
  const { level } = req.query;
  try {
    let sql = `SELECT l.id, l.title, l.level, l.order_index, l.created_at, l.youtube_url,
               COUNT(s.id) AS section_count
               FROM grammar_lessons l
               LEFT JOIN grammar_sections s ON s.lesson_id = l.id
               WHERE 1=1`;
    const params = [];
    if (level) { sql += ' AND l.level = ?'; params.push(level); }
    sql += ' GROUP BY l.id ORDER BY l.order_index ASC';
    const [rows] = await pool.query(sql, params);
    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ── GET /api/grammar/lessons/:id ─────────────────────────────
// Returns lesson + sections with user best scores
const getLessonById = async (req, res) => {
  const userId = req.user?.id;
  try {
    const [lessons] = await pool.query('SELECT * FROM grammar_lessons WHERE id = ?', [req.params.id]);
    if (!lessons.length) return res.status(404).json({ success: false, message: 'Không tìm thấy bài học' });
    const lesson = lessons[0];

    // Get sections ordered
    const [sections] = await pool.query(
      `SELECT s.id, s.title, s.description, s.order_index,
              COUNT(q.id) AS question_count
       FROM grammar_sections s
       LEFT JOIN grammar_questions q ON q.section_id = s.id
       WHERE s.lesson_id = ?
       GROUP BY s.id ORDER BY s.order_index ASC`,
      [lesson.id]
    );

    // Fetch user best score per section
    let userScores = {};
    if (userId && sections.length) {
      const sIds = sections.map(s => s.id);
      const [attempts] = await pool.query(
        `SELECT section_id, MAX(score_pct) AS best_score
         FROM grammar_section_attempts WHERE user_id = ? AND section_id IN (?)
         GROUP BY section_id`,
        [userId, sIds]
      );
      attempts.forEach(a => { userScores[a.section_id] = parseFloat(a.best_score); });
    }

    // Determine unlock status: first section always open, rest need previous ≥60%
    const enriched = sections.map((s, i) => ({
      ...s,
      question_count: parseInt(s.question_count) || 0,
      best_score: userScores[s.id] ?? null,
      is_unlocked: i === 0 || (userScores[sections[i - 1].id] ?? 0) >= 60,
    }));

    return res.json({ success: true, data: { ...lesson, sections: enriched } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ── GET /api/grammar/sections/:id ────────────────────────────
// Returns section + questions (answers stripped for security)
const getSectionById = async (req, res) => {
  const userId = req.user?.id;
  try {
    const [secs] = await pool.query(
      'SELECT s.*, l.title AS lesson_title FROM grammar_sections s JOIN grammar_lessons l ON l.id = s.lesson_id WHERE s.id = ?',
      [req.params.id]
    );
    if (!secs.length) return res.status(404).json({ success: false, message: 'Không tìm thấy phần học' });
    const section = secs[0];

    // Questions — strip correct answers
    const [questions] = await pool.query(
      `SELECT id, question_type, question, option_a, option_b, option_c, option_d,
              correct, fill_answer, explanation, order_index
       FROM grammar_questions WHERE section_id = ? ORDER BY order_index ASC`,
      [req.params.id]
    );

    // User attempt count for this section
    let attemptCount = 0;
    if (userId) {
      const [[{ cnt }]] = await pool.query(
        'SELECT COUNT(*) AS cnt FROM grammar_section_attempts WHERE user_id = ? AND section_id = ?',
        [userId, req.params.id]
      );
      attemptCount = cnt;
    }

    return res.json({ success: true, data: { ...section, questions, attempt_count: attemptCount } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ── POST /api/grammar/sections/:id/submit ────────────────────
const submitSection = async (req, res) => {
  const userId = req.user.id;
  const sectionId = req.params.id;
  const { answers } = req.body; // [{ question_id, chosen?, fill? }]

  try {
    // Fetch correct answers
    const [questions] = await pool.query(
      'SELECT id, question_type, correct, fill_answer FROM grammar_questions WHERE section_id = ?',
      [sectionId]
    );
    if (!questions.length) return res.status(400).json({ success: false, message: 'Phần này chưa có câu hỏi' });

    let correct_q = 0;
    questions.forEach(q => {
      const ans = answers.find(a => a.question_id === q.id);
      if (!ans) return;
      if (q.question_type === 'fill_blank') {
        const userAns = (ans.fill || '').trim().toLowerCase();
        const correct  = (q.fill_answer || '').trim().toLowerCase();
        if (userAns === correct) correct_q++;
      } else {
        if (ans.chosen === q.correct) correct_q++;
      }
    });

    const total_q = questions.length;
    const score_pct = total_q > 0 ? Math.round((correct_q / total_q) * 100) : 0;
    const is_unlocked = score_pct >= 60;

    // Is this the first attempt?
    const [[{ cnt }]] = await pool.query(
      'SELECT COUNT(*) AS cnt FROM grammar_section_attempts WHERE user_id = ? AND section_id = ?',
      [userId, sectionId]
    );
    const is_first = cnt === 0;
    let base_exp = is_first ? 50 : 10;

    // Streak multiplier
    const streakInfo = await updateStreak(userId);
    const multiplier = streakInfo.multiplier;

    // First-of-day bonus (2x base EXP for first grammar of the day)
    const isFirstOfDay = await checkFirstDayBonus(userId, 'grammar');
    if (isFirstOfDay) base_exp *= 2;

    const exp_earned = Math.round(base_exp * multiplier);

    // Save attempt
    await pool.query(
      'INSERT INTO grammar_section_attempts (user_id, section_id, score_pct, correct_q, total_q, exp_awarded) VALUES (?,?,?,?,?,?)',
      [userId, sectionId, score_pct, correct_q, total_q, exp_earned]
    );

    // Award EXP
    let expInfo = await awardExp(userId, exp_earned);

    // Daily task (first grammar completion of the day)
    const dailyResult = await completeDailyTask(userId, 'grammar', 80);
    if (!dailyResult.alreadyDone) expInfo = dailyResult.expInfo;

    // Achievement checks
    const [[{ grammar_count }]] = await pool.query(
      'SELECT COUNT(DISTINCT section_id) AS grammar_count FROM grammar_section_attempts WHERE user_id = ?',
      [userId]
    );
    const achievements_unlocked = await checkAndUnlock(userId, {
      grammar_completions: grammar_count,
      grammar_perfect: score_pct === 100,
      streak: streakInfo.current_streak,
    });

    // Find next section if score ≥ 60
    let next_section_id = null;
    if (is_unlocked) {
      const [[sec]] = await pool.query('SELECT lesson_id, order_index FROM grammar_sections WHERE id = ?', [sectionId]);
      const [[nextSec]] = await pool.query(
        'SELECT id FROM grammar_sections WHERE lesson_id = ? AND order_index > ? ORDER BY order_index ASC LIMIT 1',
        [sec.lesson_id, sec.order_index]
      );
      if (nextSec) next_section_id = nextSec.id;
    }

    return res.json({
      success: true,
      data: {
        score_pct, correct_q, total_q,
        is_first_attempt: is_first,
        is_unlocked,
        exp_earned: exp_earned + (dailyResult.alreadyDone ? 0 : 80),
        daily_task_completed: !dailyResult.alreadyDone,
        first_day_bonus: isFirstOfDay,
        streak: { current: streakInfo.current_streak, multiplier, milestone: streakInfo.streak_milestone },
        achievements_unlocked,
        next_section_id,
        level: expInfo?.level,
        total_exp: expInfo?.totalExp,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ── ADMIN: Lessons ───────────────────────────────────────────
const createLesson = async (req, res) => {
  const { title, content, level, order_index, youtube_url } = req.body;
  if (!title || !content) return res.status(400).json({ success: false, message: 'Tiêu đề và nội dung là bắt buộc' });
  try {
    const [r] = await pool.query(
      'INSERT INTO grammar_lessons (title, content, level, order_index, youtube_url, created_by) VALUES (?,?,?,?,?,?)',
      [title, content, level || 'beginner', order_index || 0, youtube_url || null, req.user.id]
    );
    return res.status(201).json({ success: true, id: r.insertId });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const updateLesson = async (req, res) => {
  const { title, content, level, order_index, youtube_url } = req.body;
  try {
    await pool.query(
      'UPDATE grammar_lessons SET title=?, content=?, level=?, order_index=?, youtube_url=? WHERE id=?',
      [title, content, level, order_index, youtube_url || null, req.params.id]
    );
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const deleteLesson = async (req, res) => {
  try {
    await pool.query('DELETE FROM grammar_lessons WHERE id = ?', [req.params.id]);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ── ADMIN: Sections ──────────────────────────────────────────
const createSection = async (req, res) => {
  const { lesson_id, title, description, order_index } = req.body;
  if (!lesson_id || !title) return res.status(400).json({ success: false, message: 'lesson_id và title là bắt buộc' });
  try {
    const [r] = await pool.query(
      'INSERT INTO grammar_sections (lesson_id, title, description, order_index) VALUES (?,?,?,?)',
      [lesson_id, title, description || null, order_index ?? 0]
    );
    return res.status(201).json({ success: true, id: r.insertId });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const updateSection = async (req, res) => {
  const { title, description, order_index } = req.body;
  try {
    await pool.query(
      'UPDATE grammar_sections SET title=?, description=?, order_index=? WHERE id=?',
      [title, description || null, order_index ?? 0, req.params.id]
    );
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const deleteSection = async (req, res) => {
  try {
    await pool.query('DELETE FROM grammar_sections WHERE id = ?', [req.params.id]);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ── ADMIN: Questions ─────────────────────────────────────────
const createQuestion = async (req, res) => {
  const { section_id, question_type, question, option_a, option_b, option_c, option_d, correct, fill_answer, explanation, order_index } = req.body;
  if (!section_id || !question) return res.status(400).json({ success: false, message: 'section_id và question là bắt buộc' });
  try {
    const [r] = await pool.query(
      'INSERT INTO grammar_questions (section_id, question_type, question, option_a, option_b, option_c, option_d, correct, fill_answer, explanation, order_index) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
      [section_id, question_type || 'multiple_choice', question, option_a || null, option_b || null, option_c || null, option_d || null, correct || null, fill_answer || null, explanation || null, order_index ?? 0]
    );
    return res.status(201).json({ success: true, id: r.insertId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const updateQuestion = async (req, res) => {
  const { question_type, question, option_a, option_b, option_c, option_d, correct, fill_answer, explanation, order_index } = req.body;
  try {
    await pool.query(
      'UPDATE grammar_questions SET question_type=?, question=?, option_a=?, option_b=?, option_c=?, option_d=?, correct=?, fill_answer=?, explanation=?, order_index=? WHERE id=?',
      [question_type || 'multiple_choice', question, option_a || null, option_b || null, option_c || null, option_d || null, correct || null, fill_answer || null, explanation || null, order_index ?? 0, req.params.id]
    );
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    await pool.query('DELETE FROM grammar_questions WHERE id = ?', [req.params.id]);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// Legacy: kept for backward compatibility
const submitGrammar = submitSection;

module.exports = {
  getLessons, getLessonById,
  getSectionById, submitSection,
  createLesson, updateLesson, deleteLesson,
  createSection, updateSection, deleteSection,
  createQuestion, updateQuestion, deleteQuestion,
  submitGrammar,
};
