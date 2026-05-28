const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');
const { getUserAchievements } = require('../utils/achievementHelper');
const { getStreak } = require('../utils/streakHelper');
const { getExpInfo } = require('../utils/expHelper');

// GET /api/users/profile
const getProfile = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, email, full_name, avatar, dob, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// PUT /api/users/profile
const updateProfile = async (req, res) => {
  const { full_name, dob } = req.body;
  const avatar = req.file ? req.file.path : undefined; // Cloudinary URL

  try {
    const fields = [];
    const values = [];
    if (full_name !== undefined) { fields.push('full_name = ?'); values.push(full_name); }
    if (dob !== undefined) { fields.push('dob = ?'); values.push(dob); }
    if (avatar !== undefined) { fields.push('avatar = ?'); values.push(avatar); }

    if (!fields.length) return res.status(400).json({ success: false, message: 'Không có thông tin cần cập nhật' });

    values.push(req.user.id);
    await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
    return res.json({ success: true, message: 'Cập nhật thông tin thành công' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ---- ADMIN ----

// GET /api/admin/users
const getAllUsers = async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  try {
    let sql = 'SELECT id, username, email, full_name, role, is_active, created_at FROM users';
    const params = [];
    if (search) { sql += ' WHERE username LIKE ? OR email LIKE ?'; params.push(`%${search}%`, `%${search}%`); }
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const [rows] = await pool.query(sql, params);
    const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM users');
    return res.json({ success: true, data: rows, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// PUT /api/admin/users/:id/toggle-lock
const toggleLock = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT is_active FROM users WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });
    const newStatus = rows[0].is_active ? 0 : 1;
    await pool.query('UPDATE users SET is_active = ? WHERE id = ?', [newStatus, id]);
    return res.json({ success: true, message: newStatus ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản', is_active: newStatus });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// GET /api/users/achievements
const getAchievements = async (req, res) => {
  try {
    const achievements = await getUserAchievements(req.user.id);
    const streak = await getStreak(req.user.id);
    return res.json({ success: true, data: { achievements, streak } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

module.exports = { getProfile, updateProfile, getAllUsers, toggleLock, getAchievements };
