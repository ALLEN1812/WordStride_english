const { pool } = require('../config/db');

function getStreakMultiplier(streak) {
  if (streak >= 30) return 1.5;
  if (streak >= 7)  return 1.25;
  if (streak >= 3)  return 1.1;
  return 1.0;
}

function toDateStr(d) {
  return d.toISOString().split('T')[0];
}

// Update streak for a user when they do any learning activity.
// Returns { current_streak, longest_streak, multiplier, is_new_day, streak_milestone }
async function updateStreak(userId) {
  const today = toDateStr(new Date());
  const yesterday = toDateStr(new Date(Date.now() - 86400000));

  const [rows] = await pool.query(
    'SELECT current_streak, longest_streak, last_activity_date FROM user_streaks WHERE user_id = ?',
    [userId]
  );

  if (!rows.length) {
    await pool.query(
      'INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_activity_date) VALUES (?,1,1,?)',
      [userId, today]
    );
    return { current_streak: 1, longest_streak: 1, multiplier: 1.0, is_new_day: true, streak_milestone: null };
  }

  const { current_streak, longest_streak } = rows[0];
  const last = rows[0].last_activity_date ? toDateStr(new Date(rows[0].last_activity_date)) : null;

  // Already counted today
  if (last === today) {
    return { current_streak, longest_streak, multiplier: getStreakMultiplier(current_streak), is_new_day: false, streak_milestone: null };
  }

  const newStreak = (last === yesterday) ? current_streak + 1 : 1;
  const newLongest = Math.max(longest_streak, newStreak);

  await pool.query(
    'UPDATE user_streaks SET current_streak=?, longest_streak=?, last_activity_date=? WHERE user_id=?',
    [newStreak, newLongest, today, userId]
  );

  // Detect milestone (for frontend notification)
  const milestone = [3, 7, 30, 100].includes(newStreak) ? newStreak : null;

  return {
    current_streak: newStreak,
    longest_streak: newLongest,
    multiplier: getStreakMultiplier(newStreak),
    is_new_day: true,
    streak_milestone: milestone,
  };
}

// Get current effective streak (resets to 0 if no activity yesterday/today)
async function getStreak(userId) {
  const today = toDateStr(new Date());
  const yesterday = toDateStr(new Date(Date.now() - 86400000));

  const [rows] = await pool.query(
    'SELECT current_streak, longest_streak, last_activity_date FROM user_streaks WHERE user_id=?',
    [userId]
  );
  if (!rows.length) return { current_streak: 0, longest_streak: 0, multiplier: 1.0, last_activity_date: null };

  const { current_streak, longest_streak } = rows[0];
  const last = rows[0].last_activity_date ? toDateStr(new Date(rows[0].last_activity_date)) : null;
  const isActive = last === today || last === yesterday;
  const effective = isActive ? current_streak : 0;

  return {
    current_streak: effective,
    longest_streak,
    multiplier: getStreakMultiplier(effective),
    last_activity_date: last,
  };
}

// Check & claim first-of-day bonus for a given activity type.
// Returns true (bonus applies) or false (already used today).
async function checkFirstDayBonus(userId, activityType) {
  const today = toDateStr(new Date());
  try {
    await pool.query(
      'INSERT INTO user_daily_first_bonus (user_id, activity_date, activity_type) VALUES (?,?,?)',
      [userId, today, activityType]
    );
    return true;
  } catch {
    return false; // duplicate key → already used
  }
}

module.exports = { updateStreak, getStreak, getStreakMultiplier, checkFirstDayBonus };
