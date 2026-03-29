const knex = require('knex');

const db = knex({
  client: 'pg',
  connection: {
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME     || 'reimbursement_db',
    user:     process.env.DB_USER     || 'postgres',
    password: process.env.DB_PASSWORD || '',
  },
  pool: {
    min: 2,
    max: 10,
  },
  acquireConnectionTimeout: 10000,
});

/**
 * Validates that the DB connection is alive.
 * Called once on app startup.
 */
async function testConnection() {
  try {
    await db.raw('SELECT 1');
    console.log('[DB] PostgreSQL connection established successfully.');
  } catch (err) {
    console.error('[DB] PostgreSQL connection FAILED:', err.message);
    process.exit(1); // Fatal — cannot start without DB
  }
}

module.exports = { db, testConnection };
