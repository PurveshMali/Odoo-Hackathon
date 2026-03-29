require('dotenv').config();
const { db } = require('./src/config/db');

async function run() {
  try {
    console.log('Running migration to add columns...');
    await db.raw(`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS password_sent_at     TIMESTAMPTZ DEFAULT NULL;
    `);
    console.log('✅ Migration successful! Columns added to users table.');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    process.exit(0);
  }
}

run();
