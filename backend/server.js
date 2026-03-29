require('dotenv').config();

const app = require('./src/app');
const { testConnection } = require('./src/config/db');

const PORT = process.env.PORT || 3000;

async function startServer() {
  // Verify DB connection before accepting traffic
  await testConnection();

  app.listen(PORT, () => {
    console.log(`[SERVER] Running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

startServer().catch((err) => {
  console.error('[SERVER] Failed to start:', err.message);
  process.exit(1);
});
