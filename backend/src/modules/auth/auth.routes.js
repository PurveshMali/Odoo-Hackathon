const express    = require('express');
const rateLimit  = require('express-rate-limit');

const authController = require('./auth.controller');
const { verifyToken } = require('../../middlewares/auth.middleware');
const { auditLogger } = require('../../middlewares/audit.middleware');
const {
  signupValidators,
  loginValidators,
  changePasswordValidators,
} = require('../../middlewares/validate.middleware');

const router = express.Router();

/* ─────────────────────────────────────────────────────────
   Rate limiter — 10 requests per 15 minutes per IP
───────────────────────────────────────────────────────── */
const authLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             10,
  message:         { success: false, message: 'Too many attempts. Try after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders:   false,
});

/* ─────────────────────────────────────────────────────────
   Change-password limiter — 5 per 15 minutes per IP
───────────────────────────────────────────────────────── */
const changePasswordLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             5,
  message:         { success: false, message: 'Too many password change attempts. Try again later.' },
  standardHeaders: true,
  legacyHeaders:   false,
});

/* ─────────────────────────────────────────────────────────
   Public routes (rate limited)
───────────────────────────────────────────────────────── */
router.post('/signup',  authLimiter, signupValidators, authController.signup);
router.post('/login',   authLimiter, loginValidators,  authController.login);
router.post('/refresh', authLimiter, authController.refresh);
router.post('/logout',  authController.logout);

/* ─────────────────────────────────────────────────────────
   Protected routes
───────────────────────────────────────────────────────── */
router.get(
  '/me',
  verifyToken,
  auditLogger('AUTH_ME'),
  authController.getMe
);

router.post(
  '/change-password',
  changePasswordLimiter,
  verifyToken,
  changePasswordValidators,
  authController.changePassword
);

module.exports = router;
