const { pool } = require('../config/db');
const { getExpInfo, EXP_THRESHOLDS } = require('../utils/expHelper');

// GET /api/ranking  — top 20 users by total_exp
const getRanking = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, username, full_name, avatar, total_exp, level
       FROM users WHERE is_active = 1 AND role = 'user'
       ORDER BY total_exp DESC, id ASC
       LIMIT 20`
    );
    const data = rows.map((u, idx) => ({
      rank: idx + 1,
      id: u.id,
      username: u.username,
      full_name: u.full_name || u.username,
      avatar: u.avatar,
      level: u.level || 1,
      total_exp: u.total_exp || 0,
    }));
    return res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// GET /api/ranking/me  — my rank position, exp info, and today's daily tasks
const getMyStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // My rank: how many active users have strictly more EXP
    const [[{ rank_position }]] = await pool.query(
      `SELECT COUNT(*) + 1 AS rank_position
       FROM users
       WHERE is_active = 1 AND role = 'user'
         AND total_exp > (SELECT total_exp FROM users WHERE id = ?)`,
      [userId]
    );

    // My EXP & level
    const [[userRow]] = await pool.query(
      'SELECT total_exp, level FROM users WHERE id = ?',
      [userId]
    );
    const expInfo = getExpInfo(userRow?.total_exp || 0);

    // Today's daily task status
    const today = new Date().toISOString().split('T')[0];
    const [taskRows] = await pool.query(
      'SELECT task_type, is_completed FROM user_daily_tasks WHERE user_id = ? AND task_date = ?',
      [userId, today]
    );
    const taskMap = {};
    taskRows.forEach(t => { taskMap[t.task_type] = !!t.is_completed; });

    const dailyTasks = [
      { type: 'vocab',   label: 'Học 10 từ mới',          icon: '📖', exp: 60,  done: taskMap.vocab   || false },
      { type: 'grammar', label: 'Hoàn thành bài ngữ pháp', icon: '✏️', exp: 80,  done: taskMap.grammar || false },
      { type: 'exam',    label: 'Hoàn thành một đề thi',   icon: '📝', exp: 100, done: taskMap.exam    || false },
    ];

    return res.json({
      success: true,
      data: {
        rank: rank_position,
        ...expInfo,
        dailyTasks,
        expThresholds: EXP_THRESHOLDS,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

module.exports = { getRanking, getMyStats };
