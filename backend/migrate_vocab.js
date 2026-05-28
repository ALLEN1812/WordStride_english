require('dotenv').config();
const { pool } = require('./src/config/db');

async function migrate() {
  const [vt] = await pool.query('SHOW COLUMNS FROM vocab_topics');
  const vtNames = vt.map(c => c.Field);

  if (!vtNames.includes('difficulty')) {
    await pool.query("ALTER TABLE vocab_topics ADD COLUMN difficulty ENUM('beginner','intermediate','advanced') DEFAULT 'beginner'");
    console.log('+ vocab_topics.difficulty');
  }
  if (!vtNames.includes('status')) {
    await pool.query("ALTER TABLE vocab_topics ADD COLUMN status ENUM('draft','published','hidden','archived') DEFAULT 'published'");
    console.log('+ vocab_topics.status');
  }

  const [fc] = await pool.query('SHOW COLUMNS FROM flashcards');
  const fcNames = fc.map(c => c.Field);

  if (!fcNames.includes('word_type')) {
    await pool.query('ALTER TABLE flashcards ADD COLUMN word_type VARCHAR(50) DEFAULT NULL');
    console.log('+ flashcards.word_type');
  }
  if (!fcNames.includes('notes')) {
    await pool.query('ALTER TABLE flashcards ADD COLUMN notes TEXT DEFAULT NULL');
    console.log('+ flashcards.notes');
  }

  console.log('Migration complete!');
  process.exit(0);
}

migrate().catch(err => { console.error(err.message); process.exit(1); });
