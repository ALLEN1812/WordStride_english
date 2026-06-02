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
  const { search, role, locked, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  try {
    const where = [], params = [];
    if (search)      { where.push('(username LIKE ? OR email LIKE ? OR full_name LIKE ?)'); params.push(`%${search}%`,`%${search}%`,`%${search}%`); }
    if (role)        { where.push('role = ?');      params.push(role); }
    if (locked==='1'){ where.push('is_active = 0'); }

    const whereClause = where.length ? ' WHERE ' + where.join(' AND ') : '';
    const [rows]    = await pool.query(`SELECT id, username, email, full_name, avatar, role, is_active, total_exp, level, created_at FROM users${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`, [...params, Number(limit), Number(offset)]);
    const [[{cnt}]] = await pool.query(`SELECT COUNT(*) as cnt FROM users${whereClause}`, params);
    return res.json({ success: true, data: rows, total: cnt, page: Number(page), limit: Number(limit) });
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

// PUT /api/admin/users/:id/role
const changeRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  if (!['user', 'admin'].includes(role))
    return res.status(400).json({ success: false, message: 'Role không hợp lệ' });
  if (Number(id) === req.user.id)
    return res.status(400).json({ success: false, message: 'Không thể đổi role của chính mình' });
  try {
    const [rows] = await pool.query('SELECT id FROM users WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });
    await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    return res.json({ success: true, message: `Đã đổi role thành ${role}` });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  const { id } = req.params;
  if (Number(id) === req.user.id)
    return res.status(400).json({ success: false, message: 'Không thể xóa tài khoản của chính mình' });
  try {
    const [rows] = await pool.query('SELECT id, role FROM users WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });
    if (rows[0].role === 'admin')
      return res.status(403).json({ success: false, message: 'Không thể xóa tài khoản admin' });
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Đã xóa người dùng' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// GET /api/admin/users/stats
const getUserStats = async (req, res) => {
  try {
    const [[total]]  = await pool.query('SELECT COUNT(*) as cnt FROM users');
    const [[active]] = await pool.query('SELECT COUNT(*) as cnt FROM users WHERE is_active = 1');
    const [[locked]] = await pool.query('SELECT COUNT(*) as cnt FROM users WHERE is_active = 0');
    const [[admins]] = await pool.query("SELECT COUNT(*) as cnt FROM users WHERE role = 'admin'");
    return res.json({ success: true, data: {
      total: total.cnt, active: active.cnt, locked: locked.cnt, admins: admins.cnt
    }});
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

module.exports = { getProfile, updateProfile, getAllUsers, toggleLock, getAchievements, changeRole, deleteUser, getUserStats };
