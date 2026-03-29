require('dotenv').config();
const { db } = require('./src/config/db');

async function test() {
  try {
    const res = await db.raw(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='users' AND column_name='must_change_password';
    `);
    
    if (res.rows.length > 0) {
      console.log('✅ Column must_change_password EXISTS');
    } else {
      console.log('❌ Column must_change_password MISSING');
    }
  } catch(e) {
    console.error('Error connecting to DB:', e.message);
  } finally {
    process.exit(0);
  }
}

test();
