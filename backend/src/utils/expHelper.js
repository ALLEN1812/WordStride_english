const { pool } = require('../config/db');

// Cumulative EXP required to reach each level (index = level - 1)
// Level 1 = 0 EXP, Level 2 = 200 EXP total, etc.
const EXP_THRESHOLDS = [
  0, 200, 500, 900, 1400, 2000, 2700, 3500, 4400, 5400,
  6500, 7700, 9000, 10500, 12100, 13800, 15700, 17700, 19900, 22300,
];

function getLevelFromExp(totalExp) {
  let level = 1;
  for (let i = 0; i < EXP_THRESHOLDS.length; i++) {
    if (totalExp >= EXP_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  return Math.min(level, EXP_THRESHOLDS.length);
}

// Returns breakdown useful for progress bar display
function getExpInfo(totalExp) {
  const exp = totalExp || 0;
  const level = getLevelFromExp(exp);
  const currentThreshold = EXP_THRESHOLDS[level - 1] || 0;
  const nextThreshold = EXP_THRESHOLDS[level] !== undefined
    ? EXP_THRESHOLDS[level]
    : EXP_THRESHOLDS[EXP_THRESHOLDS.length - 1];
  const expInLevel = exp - currentThreshold;
  const expToNext = nextThreshold - currentThreshold;
  return { level, totalExp: exp, expInLevel, expToNext };
}

async function awardExp(userId, amount) {
  if (!amount || amount <= 0) return null;
  const [rows] = await pool.query('SELECT total_exp FROM users WHERE id = ?', [userId]);
  if (!rows.length) return null;
  const newTotal = (rows[0].total_exp || 0) + amount;
  const newLevel = getLevelFromExp(newTotal);
  await pool.query('UPDATE users SET total_exp = ?, level = ? WHERE id = ?', [newTotal, newLevel, userId]);
  return getExpInfo(newTotal);
}

// Marks a daily task complete (once per day) and awards its EXP bonus.
// Returns { alreadyDone, expAwarded, expInfo }
async function completeDailyTask(userId, taskType, expReward) {
  const today = new Date().toISOString().split('T')[0];
  const [existing] = await pool.query(
    'SELECT is_completed FROM user_daily_tasks WHERE user_id = ? AND task_date = ? AND task_type = ?',
    [userId, today, taskType]
  );
  if (existing.length && existing[0].is_completed) {
    return { alreadyDone: true, expAwarded: 0 };
  }
  await pool.query(
    `INSERT INTO user_daily_tasks (user_id, task_date, task_type, is_completed, exp_awarded, completed_at)
     VALUES (?, ?, ?, 1, ?, NOW())
     ON CONFLICT (user_id, task_date, task_type) DO UPDATE
       SET is_completed = 1, exp_awarded = EXCLUDED.exp_awarded, completed_at = NOW()`,
    [userId, today, taskType, expReward]
  );
  const expInfo = await awardExp(userId, expReward);
  return { alreadyDone: false, expAwarded: expReward, expInfo };
}

module.exports = { getLevelFromExp, getExpInfo, awardExp, completeDailyTask, EXP_THRESHOLDS };
