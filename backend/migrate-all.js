require('dotenv').config();
const { db } = require('./src/config/db');
const fs = require('fs');
const path = require('path');

async function runAllMigrations() {
  try {
    const migrationsDir = path.join(__dirname, 'src', 'migrations');
    const files = fs.readdirSync(migrationsDir).sort(); // Sort by number (001, 002...)

    console.log('--- Started running all migrations automatically ---');
    
    for (const file of files) {
      if (file.endsWith('.sql')) {
        console.log(`Executing ${file}...`);
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
        try {
          await db.raw(sql);
          console.log(`✅ Success: ${file}`);
        } catch (e) {
          // If the error isn't about something already existing, warn
          if (e.message.includes('already exists')) {
            console.log(`⏭️ Skipped (already exists): ${file}`);
          } else {
            console.log(`⚠️ Warning on ${file}: ${e.message}`);
          }
        }
      }
    }
    
    console.log('--- Finished running all migrations! ---');
  } catch (err) {
    console.error('Fatal error during migrations:', err.message);
  } finally {
    process.exit(0);
  }
}

runAllMigrations();
