require('dotenv').config();
const { pool } = require('./src/config/db');

async function migrate() {
  console.log('🔄 Thêm cột email_verified...');
  try {
    // Add columns one by one, ignore if already exists
    for (const col of [
      "ALTER TABLE users ADD COLUMN email_verified  TINYINT(1)  NOT NULL DEFAULT 0",
      "ALTER TABLE users ADD COLUMN email_token      VARCHAR(64) DEFAULT NULL",
      "ALTER TABLE users ADD COLUMN email_token_exp  DATETIME    DEFAULT NULL",
    ]) {
      try { await pool.query(col); } catch(e) { if (!e.message.includes('Duplicate column')) throw e; }
    }
    // Existing users → auto verified
    await pool.query(`UPDATE users SET email_verified = 1`);
    console.log('✅ Xong! Tất cả user cũ đã được đánh dấu verified.');
  } catch (err) {
    console.error('❌', err.message);
  }
  process.exit(0);
}

migrate();
