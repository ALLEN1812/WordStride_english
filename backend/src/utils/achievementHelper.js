const { pool } = require('../config/db');
const { awardExp } = require('./expHelper');

// Check which achievements a user newly qualifies for and unlock them.
// conditions: { words_learned?, grammar_completions?, grammar_perfect?, toeic_score?, streak? }
// Returns array of newly unlocked achievement objects.
async function checkAndUnlock(userId, conditions) {
  const [userAchs] = await pool.query(
    'SELECT achievement_id FROM user_achievements WHERE user_id = ?',
    [userId]
  );
  const alreadyUnlocked = new Set(userAchs.map(r => r.achievement_id));
  const [allAchs] = await pool.query('SELECT * FROM achievements');

  const newlyUnlocked = [];

  for (const ach of allAchs) {
    if (alreadyUnlocked.has(ach.id)) continue;

    let qualifies = false;
    switch (ach.code) {
      case 'first_word':       qualifies = (conditions.words_learned  || 0) >= 1;    break;
      case 'words_10':         qualifies = (conditions.words_learned  || 0) >= 10;   break;
      case 'words_100':        qualifies = (conditions.words_learned  || 0) >= 100;  break;
      case 'words_500':        qualifies = (conditions.words_learned  || 0) >= 500;  break;
      case 'words_1000':       qualifies = (conditions.words_learned  || 0) >= 1000; break;
      case 'first_grammar':    qualifies = (conditions.grammar_completions || 0) >= 1;  break;
      case 'grammar_perfect':  qualifies = !!conditions.grammar_perfect;              break;
      case 'grammar_10':       qualifies = (conditions.grammar_completions || 0) >= 10; break;
      case 'grammar_30':       qualifies = (conditions.grammar_completions || 0) >= 30; break;
      case 'first_toeic':      qualifies = conditions.toeic_score !== undefined;      break;
      case 'toeic_300':        qualifies = (conditions.toeic_score || 0) >= 300;     break;
      case 'toeic_500':        qualifies = (conditions.toeic_score || 0) >= 500;     break;
      case 'toeic_700':        qualifies = (conditions.toeic_score || 0) >= 700;     break;
      case 'toeic_900':        qualifies = (conditions.toeic_score || 0) >= 900;     break;
      case 'streak_3':         qualifies = (conditions.streak || 0) >= 3;            break;
      case 'streak_7':         qualifies = (conditions.streak || 0) >= 7;            break;
      case 'streak_30':        qualifies = (conditions.streak || 0) >= 30;           break;
    }

    if (!qualifies) continue;

    await pool.query(
      'INSERT INTO user_achievements (user_id, achievement_id) VALUES (?,?) ON CONFLICT DO NOTHING',
      [userId, ach.id]
    );
    if (ach.exp_reward > 0) await awardExp(userId, ach.exp_reward);

    newlyUnlocked.push({
      code: ach.code,
      name: ach.name,
      icon: ach.icon,
      rarity: ach.rarity,
      exp_reward: ach.exp_reward,
    });
  }

  return newlyUnlocked;
}

// Get all achievements with unlock status for a user.
async function getUserAchievements(userId) {
  const [rows] = await pool.query(
    `SELECT a.*, ua.unlocked_at
     FROM achievements a
     LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
     ORDER BY a.category, a.id`,
    [userId]
  );
  return rows;
}

module.exports = { checkAndUnlock, getUserAchievements };
