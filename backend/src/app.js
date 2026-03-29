require('dotenv').config();

const express      = require('express');
const helmet       = require('helmet');
const cors         = require('cors');
const cookieParser = require('cookie-parser');

const { sendError } = require('./utils/apiResponse');
const authRoutes    = require('./modules/auth/auth.routes');
const usersRoutes   = require('./modules/users/users.routes');

const app = express();

/* ─────────────────────────────────────────────────────────
   Security headers
───────────────────────────────────────────────────────── */
app.use(helmet());

/* ─────────────────────────────────────────────────────────
   CORS — only allow the configured client origin
───────────────────────────────────────────────────────── */
app.use(cors({
  origin:      process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true, // Required for httpOnly cookies to be sent cross-origin
}));

/* ─────────────────────────────────────────────────────────
   Body parsers & cookie parser
───────────────────────────────────────────────────────── */
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ─────────────────────────────────────────────────────────
   Health check — useful for deployment probes
───────────────────────────────────────────────────────── */
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is healthy.' });
});

/* ─────────────────────────────────────────────────────────
   API routes
───────────────────────────────────────────────────────── */
app.use('/api/auth',  authRoutes);
app.use('/api/users', usersRoutes);

/* ─────────────────────────────────────────────────────────
   404 handler
───────────────────────────────────────────────────────── */
app.use((req, res) => {
  sendError(res, `Route ${req.method} ${req.originalUrl} not found.`, 404, null);
});

/* ─────────────────────────────────────────────────────────
   Global error handler
   Must have exactly 4 params for Express to treat as error middleware.
───────────────────────────────────────────────────────── */
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message    = err.message    || 'An unexpected error occurred.';

  // Never expose stack trace in production
  const errDetail = process.env.NODE_ENV === 'production' ? null : err.stack;

  console.error(`[ERROR] ${statusCode} — ${message}`);

  sendError(res, message, statusCode, errDetail);
});

module.exports = app;
