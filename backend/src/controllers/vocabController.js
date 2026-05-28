const { pool } = require('../config/db');
const { awardExp, completeDailyTask } = require('../utils/expHelper');
const { updateStreak, getStreakMultiplier } = require('../utils/streakHelper');
const { checkAndUnlock } = require('../utils/achievementHelper');

// =================== TOPICS (USER) ===================

// GET /api/vocab/topics  — only published topics for users
const getTopics = async (req, res) => {
  const { search, category } = req.query;
  try {
    let sql = "SELECT * FROM vocab_topics WHERE status = 'published'";
    const params = [];
    if (search)   { sql += ' AND name LIKE ?';  params.push(`%${search}%`); }
    if (category) { sql += ' AND category = ?'; params.push(category); }
    sql += ' ORDER BY id DESC';
    const [rows] = await pool.query(sql, params);
    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// GET /api/vocab/topics/:id
const getTopicById = async (req, res) => {
  try {
    const [topics] = await pool.query('SELECT * FROM vocab_topics WHERE id = ?', [req.params.id]);
    if (!topics.length) return res.status(404).json({ success: false, message: 'Không tìm thấy chủ đề' });
    const [cards] = await pool.query(
      `SELECT f.*, COALESCE(ufp.status, 'new') AS user_status
       FROM flashcards f
       LEFT JOIN user_flashcard_progress ufp ON f.id = ufp.flashcard_id AND ufp.user_id = ?
       WHERE f.topic_id = ?
       ORDER BY f.id`,
      [req.user.id, req.params.id]
    );
    return res.json({ success: true, data: { ...topics[0], flashcards: cards } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// =================== TOPICS (ADMIN) ===================

// GET /api/vocab/admin/topics  — all topics with card count
const getAdminTopics = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT t.*, COUNT(f.id) AS card_count
      FROM vocab_topics t
      LEFT JOIN flashcards f ON f.topic_id = t.id
      GROUP BY t.id
      ORDER BY t.id DESC
    `);
    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// GET /api/vocab/admin/topics/:id/flashcards
const getAdminFlashcards = async (req, res) => {
  try {
    const [cards] = await pool.query(
      'SELECT * FROM flashcards WHERE topic_id = ? ORDER BY id',
      [req.params.id]
    );
    return res.json({ success: true, data: cards });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// POST /api/vocab/admin/topics
const createTopic = async (req, res) => {
  const { name, description, category, difficulty, thumbnail, status } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'Tên chủ đề là bắt buộc' });
  try {
    const [r] = await pool.query(
      'INSERT INTO vocab_topics (name, description, category, difficulty, thumbnail, status, created_by) VALUES (?,?,?,?,?,?,?)',
      [name, description || null, category || null, difficulty || 'beginner', thumbnail || null, status || 'published', req.user.id]
    );
    return res.status(201).json({ success: true, id: r.insertId });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// PUT /api/vocab/admin/topics/:id
const updateTopic = async (req, res) => {
  const { name, description, category, difficulty, thumbnail, status } = req.body;
  try {
    await pool.query(
      'UPDATE vocab_topics SET name=?, description=?, category=?, difficulty=?, thumbnail=?, status=? WHERE id=?',
      [name, description || null, category || null, difficulty || 'beginner', thumbnail || null, status || 'published', req.params.id]
    );
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// DELETE /api/vocab/admin/topics/:id
const deleteTopic = async (req, res) => {
  try {
    await pool.query('DELETE FROM flashcards WHERE topic_id = ?', [req.params.id]);
    await pool.query('DELETE FROM vocab_topics WHERE id = ?', [req.params.id]);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// =================== FLASHCARDS (ADMIN) ===================

// POST /api/vocab/admin/flashcards
const createFlashcard = async (req, res) => {
  const { topic_id, word, phonetic, meaning, word_type, example, notes, image_url, audio_url } = req.body;
  if (!topic_id || !word || !meaning) {
    return res.status(400).json({ success: false, message: 'topic_id, word, meaning là bắt buộc' });
  }
  try {
    const [r] = await pool.query(
      'INSERT INTO flashcards (topic_id, word, phonetic, meaning, word_type, example, notes, image_url, audio_url) VALUES (?,?,?,?,?,?,?,?,?)',
      [topic_id, word, phonetic || null, meaning, word_type || null, example || null, notes || null, image_url || null, audio_url || null]
    );
    return res.status(201).json({ success: true, id: r.insertId });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// PUT /api/vocab/admin/flashcards/:id
const updateFlashcard = async (req, res) => {
  const { word, phonetic, meaning, word_type, example, notes, image_url, audio_url } = req.body;
  try {
    await pool.query(
      'UPDATE flashcards SET word=?, phonetic=?, meaning=?, word_type=?, example=?, notes=?, image_url=?, audio_url=? WHERE id=?',
      [word, phonetic || null, meaning, word_type || null, example || null, notes || null, image_url || null, audio_url || null, req.params.id]
    );
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// DELETE /api/vocab/admin/flashcards/:id
const deleteFlashcard = async (req, res) => {
  try {
    await pool.query('DELETE FROM flashcards WHERE id = ?', [req.params.id]);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// POST /api/vocab/admin/topics/:id/import
const importFlashcards = async (req, res) => {
  const { cards } = req.body;
  const topicId = req.params.id;
  if (!Array.isArray(cards) || !cards.length) {
    return res.status(400).json({ success: false, message: 'Không có dữ liệu để import' });
  }
  try {
    const values = cards.map(c => [
      topicId,
      (c.word || '').trim(),
      (c.phonetic || '').trim() || null,
      (c.meaning || '').trim(),
      (c.word_type || '').trim() || null,
      (c.example || '').trim() || null,
      (c.notes || '').trim() || null,
      (c.image_url || '').trim() || null,
      (c.audio_url || '').trim() || null,
    ]);
    await pool.query(
      'INSERT INTO flashcards (topic_id, word, phonetic, meaning, word_type, example, notes, image_url, audio_url) VALUES ?',
      [values]
    );
    return res.json({ success: true, imported: cards.length });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server: ' + err.message });
  }
};

// =================== USER PROGRESS ===================

// PUT /api/vocab/flashcards/:id/progress
const updateProgress = async (req, res) => {
  const { status } = req.body;
  try {
    const [prev] = await pool.query(
      'SELECT status FROM user_flashcard_progress WHERE user_id = ? AND flashcard_id = ?',
      [req.user.id, req.params.id]
    );
    const wasLearned = prev.length && prev[0].status === 'learned';

    await pool.query(
      `INSERT INTO user_flashcard_progress (user_id, flashcard_id, status)
       VALUES (?, ?, ?)
       ON CONFLICT (user_id, flashcard_id) DO UPDATE SET status = EXCLUDED.status, updated_at = NOW()`,
      [req.user.id, req.params.id, status]
    );

    let exp_earned = 0;
    let daily_task_completed = false;
    let achievements_unlocked = [];

    if (status === 'learned' && !wasLearned) {
      const streakInfo = await updateStreak(req.user.id);
      const multiplier = streakInfo.multiplier;
      const baseExp = Math.round(3 * multiplier);
      await awardExp(req.user.id, baseExp);
      exp_earned = baseExp;

      const today = new Date().toISOString().split('T')[0];
      const [[{ learned_today }]] = await pool.query(
        `SELECT COUNT(*) AS learned_today FROM user_flashcard_progress
         WHERE user_id = ? AND status = 'learned' AND DATE(updated_at) = ?`,
        [req.user.id, today]
      );

      if (learned_today >= 10) {
        const dailyResult = await completeDailyTask(req.user.id, 'vocab', 60);
        daily_task_completed = !dailyResult.alreadyDone;
        if (!dailyResult.alreadyDone) exp_earned += 60;
      }

      const [[{ total_learned }]] = await pool.query(
        `SELECT COUNT(*) AS total_learned FROM user_flashcard_progress
         WHERE user_id = ? AND status = 'learned'`,
        [req.user.id]
      );
      achievements_unlocked = await checkAndUnlock(req.user.id, {
        words_learned: total_learned,
        streak: streakInfo.current_streak,
      });
    }

    return res.json({ success: true, exp_earned, daily_task_completed, achievements_unlocked });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// =================== USER CUSTOM SETS ===================

const getMySets = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM user_flashcard_sets WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const createMySet = async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'Tên bộ flashcard là bắt buộc' });
  try {
    const [r] = await pool.query(
      'INSERT INTO user_flashcard_sets (user_id, name, description) VALUES (?,?,?)',
      [req.user.id, name, description]
    );
    return res.status(201).json({ success: true, id: r.insertId });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const updateMySet = async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'Tên bộ từ là bắt buộc' });
  try {
    await pool.query(
      'UPDATE user_flashcard_sets SET name=?, description=? WHERE id=? AND user_id=?',
      [name, description, req.params.id, req.user.id]
    );
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const deleteMySet = async (req, res) => {
  try {
    await pool.query('DELETE FROM user_flashcard_sets WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const getMySetById = async (req, res) => {
  try {
    const [sets] = await pool.query(
      'SELECT * FROM user_flashcard_sets WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (!sets.length) return res.status(404).json({ success: false, message: 'Không tìm thấy bộ từ' });
    const [items] = await pool.query('SELECT * FROM user_flashcard_items WHERE set_id = ? ORDER BY id', [req.params.id]);
    return res.json({ success: true, data: { ...sets[0], items } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const addSetItem = async (req, res) => {
  const { word, phonetic, meaning, example } = req.body;
  if (!word || !meaning) return res.status(400).json({ success: false, message: 'Từ và nghĩa là bắt buộc' });
  try {
    const [sets] = await pool.query(
      'SELECT id FROM user_flashcard_sets WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (!sets.length) return res.status(403).json({ success: false, message: 'Không có quyền' });
    const [r] = await pool.query(
      'INSERT INTO user_flashcard_items (set_id, word, phonetic, meaning, example) VALUES (?,?,?,?,?)',
      [req.params.id, word, phonetic, meaning, example]
    );
    return res.status(201).json({ success: true, id: r.insertId });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const updateSetItem = async (req, res) => {
  const { word, phonetic, meaning, example } = req.body;
  if (!word || !meaning) return res.status(400).json({ success: false, message: 'Từ và nghĩa là bắt buộc' });
  try {
    const [rows] = await pool.query(
      `SELECT ufi.id FROM user_flashcard_items ufi
       JOIN user_flashcard_sets ufs ON ufi.set_id = ufs.id
       WHERE ufi.id = ? AND ufs.user_id = ?`,
      [req.params.itemId, req.user.id]
    );
    if (!rows.length) return res.status(403).json({ success: false, message: 'Không có quyền' });
    await pool.query(
      'UPDATE user_flashcard_items SET word=?, phonetic=?, meaning=?, example=? WHERE id=?',
      [word, phonetic, meaning, example, req.params.itemId]
    );
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const deleteSetItem = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ufi.id FROM user_flashcard_items ufi
       JOIN user_flashcard_sets ufs ON ufi.set_id = ufs.id
       WHERE ufi.id = ? AND ufs.user_id = ?`,
      [req.params.itemId, req.user.id]
    );
    if (!rows.length) return res.status(403).json({ success: false, message: 'Không có quyền' });
    await pool.query('DELETE FROM user_flashcard_items WHERE id = ?', [req.params.itemId]);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

module.exports = {
  getTopics, getTopicById,
  getAdminTopics, getAdminFlashcards,
  createTopic, updateTopic, deleteTopic,
  createFlashcard, updateFlashcard, deleteFlashcard,
  importFlashcards, updateProgress,
  getMySets, createMySet, updateMySet, deleteMySet,
  getMySetById, addSetItem, updateSetItem, deleteSetItem,
};
