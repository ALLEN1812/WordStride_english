const { Pool } = require('pg');
require('dotenv').config();

const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('supabase')
    ? { rejectUnauthorized: false }
    : false,
});

// ── MySQL-compatible wrapper ──────────────────────────────────
// Converts ? placeholders → $1,$2,... and returns [rows] like mysql2
const query = async (sql, params = []) => {
  let i = 0;
  let pgSql = sql
    .replace(/\?/g, () => `$${++i}`)       // ? → $n
    .replace(/`/g, '"');                    // backtick → double-quote

  // Auto RETURNING id for INSERT (gives insertId equivalent)
  const isInsert = /^\s*INSERT/i.test(pgSql) && !/RETURNING/i.test(pgSql);
  if (isInsert) pgSql += ' RETURNING id';

  const result = await pgPool.query(pgSql, params.length ? params : undefined);

  if (isInsert) {
    // Simulate mysql2 insert result: [{ insertId, affectedRows }]
    return [{ insertId: result.rows[0]?.id ?? null, affectedRows: result.rowCount }];
  }
  // Simulate mysql2: [rows]
  return [result.rows];
};

// Expose pool.query as the compatibility shim
const pool = { query };

const testConnection = async () => {
  try {
    await pgPool.query('SELECT 1');
    console.log('✅ PostgreSQL (Supabase) connected successfully');
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }
};

module.exports = { pool, testConnection };
