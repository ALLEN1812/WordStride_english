require('dotenv').config();
const { pool } = require('./src/config/db');

const ACHIEVEMENTS = [
  // Vocab
  { code: 'first_word',      name: 'First Steps',        icon: '🌱', desc: 'Học từ vựng đầu tiên',           cat: 'vocab',   exp: 20,  rarity: 'common'    },
  { code: 'words_10',        name: 'Budding Scholar',    icon: '📖', desc: 'Học 10 từ vựng',                 cat: 'vocab',   exp: 30,  rarity: 'common'    },
  { code: 'words_100',       name: 'Word Collector',     icon: '📚', desc: 'Học 100 từ vựng',                cat: 'vocab',   exp: 100, rarity: 'rare'      },
  { code: 'words_500',       name: 'Lexicon Keeper',     icon: '🗝️', desc: 'Học 500 từ vựng',                cat: 'vocab',   exp: 300, rarity: 'epic'      },
  { code: 'words_1000',      name: 'Archivist',          icon: '🏛️', desc: 'Học 1000 từ vựng',               cat: 'vocab',   exp: 700, rarity: 'legendary' },
  // Grammar
  { code: 'first_grammar',   name: 'Grammar Initiate',   icon: '✏️', desc: 'Hoàn thành bài ngữ pháp đầu tiên', cat: 'grammar', exp: 30, rarity: 'common'   },
  { code: 'grammar_perfect', name: 'Perfect Grammarian', icon: '⭐', desc: 'Đạt 100% một bài ngữ pháp',      cat: 'grammar', exp: 80,  rarity: 'rare'      },
  { code: 'grammar_10',      name: 'Scholar',            icon: '🎓', desc: 'Hoàn thành 10 bài ngữ pháp',     cat: 'grammar', exp: 150, rarity: 'rare'      },
  { code: 'grammar_30',      name: 'Grand Scholar',      icon: '🧙', desc: 'Hoàn thành 30 bài ngữ pháp',     cat: 'grammar', exp: 400, rarity: 'epic'      },
  // TOEIC
  { code: 'first_toeic',     name: 'Test Taker',         icon: '📝', desc: 'Hoàn thành đề thi đầu tiên',     cat: 'toeic',   exp: 50,  rarity: 'common'    },
  { code: 'toeic_300',       name: 'Bronze Candidate',   icon: '🥉', desc: 'Đạt 300+ điểm TOEIC',            cat: 'toeic',   exp: 100, rarity: 'common'    },
  { code: 'toeic_500',       name: 'Silver Candidate',   icon: '🥈', desc: 'Đạt 500+ điểm TOEIC',            cat: 'toeic',   exp: 200, rarity: 'rare'      },
  { code: 'toeic_700',       name: 'Gold Candidate',     icon: '🥇', desc: 'Đạt 700+ điểm TOEIC',            cat: 'toeic',   exp: 400, rarity: 'epic'      },
  { code: 'toeic_900',       name: 'Celestia Expert',    icon: '💎', desc: 'Đạt 900+ điểm TOEIC',            cat: 'toeic',   exp: 800, rarity: 'legendary' },
  // Streak
  { code: 'streak_3',        name: 'Warming Up',         icon: '🔥', desc: 'Học 3 ngày liên tục',             cat: 'streak',  exp: 50,  rarity: 'common'    },
  { code: 'streak_7',        name: 'Week Warrior',       icon: '⚡', desc: 'Học 7 ngày liên tục',             cat: 'streak',  exp: 150, rarity: 'rare'      },
  { code: 'streak_30',       name: 'Monthly Champion',   icon: '👑', desc: 'Học 30 ngày liên tục',            cat: 'streak',  exp: 600, rarity: 'legendary' },
];

async function migrate() {
  // user_streaks
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_streaks (
      user_id           INT PRIMARY KEY,
      current_streak    INT DEFAULT 0,
      longest_streak    INT DEFAULT 0,
      last_activity_date DATE DEFAULT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  console.log('✓ user_streaks');

  // achievements
  await pool.query(`
    CREATE TABLE IF NOT EXISTS achievements (
      id      INT AUTO_INCREMENT PRIMARY KEY,
      code    VARCHAR(50)  UNIQUE NOT NULL,
      name    VARCHAR(100) NOT NULL,
      description VARCHAR(255),
      icon    VARCHAR(20),
      category ENUM('vocab','grammar','toeic','streak','general') DEFAULT 'general',
      exp_reward INT DEFAULT 0,
      rarity  ENUM('common','rare','epic','legendary') DEFAULT 'common'
    )
  `);
  console.log('✓ achievements');

  // user_achievements
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_achievements (
      id             INT AUTO_INCREMENT PRIMARY KEY,
      user_id        INT NOT NULL,
      achievement_id INT NOT NULL,
      unlocked_at    DATETIME DEFAULT NOW(),
      UNIQUE KEY uq_user_ach (user_id, achievement_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (achievement_id) REFERENCES achievements(id)
    )
  `);
  console.log('✓ user_achievements');

  // user_daily_first_bonus
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_daily_first_bonus (
      user_id       INT NOT NULL,
      activity_date DATE NOT NULL,
      activity_type VARCHAR(20) NOT NULL,
      PRIMARY KEY (user_id, activity_date, activity_type),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  console.log('✓ user_daily_first_bonus');

  // Seed achievements
  for (const a of ACHIEVEMENTS) {
    await pool.query(
      `INSERT INTO achievements (code, name, description, icon, category, exp_reward, rarity)
       VALUES (?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description),
         icon=VALUES(icon), exp_reward=VALUES(exp_reward)`,
      [a.code, a.name, a.desc, a.icon, a.cat, a.exp, a.rarity]
    );
  }
  console.log(`✓ seeded ${ACHIEVEMENTS.length} achievements`);

  console.log('\nMigration complete!');
  process.exit(0);
}

migrate().catch(err => { console.error(err.message); process.exit(1); });
