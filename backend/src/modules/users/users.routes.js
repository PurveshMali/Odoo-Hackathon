const express   = require('express');
const rateLimit = require('express-rate-limit');

const usersController = require('./users.controller');
const { verifyToken } = require('../../middlewares/auth.middleware');
const { requireRole } = require('../../middlewares/role.middleware');
const {
  createUserValidator,
  getAllUsersValidator,
  userIdValidator,
  updateUserValidator,
} = require('./users.validators');

const router = express.Router();

/* ─────────────────────────────────────────────────────────
   Global middleware — every users route requires
   a valid access token AND must be an admin.
───────────────────────────────────────────────────────── */
router.use(verifyToken);
router.use(requireRole('admin'));

/* ─────────────────────────────────────────────────────────
   Rate limiter for credential send (3 per minute)
───────────────────────────────────────────────────────── */
const credentialSendLimiter = rateLimit({
  windowMs:        1 * 60 * 1000,
  max:             3,
  message:         { success: false, message: 'Too many send requests. Please wait a minute.' },
  standardHeaders: true,
  legacyHeaders:   false,
});

/* ─────────────────────────────────────────────────────────
   POST /api/users
   Create a new employee or manager in the company.
───────────────────────────────────────────────────────── */
router.post('/', createUserValidator, usersController.createUser);

/* ─────────────────────────────────────────────────────────
   GET /api/users
   List all users in the company (paginated, filterable).
───────────────────────────────────────────────────────── */
router.get('/', getAllUsersValidator, usersController.getAllUsers);

/* ─────────────────────────────────────────────────────────
   GET /api/users/managers
   Return all active managers — for assignment dropdown.
   MUST be before /:userId to avoid route conflict.
───────────────────────────────────────────────────────── */
router.get('/managers', usersController.getManagers);

/* ─────────────────────────────────────────────────────────
   GET /api/users/:userId
   Get a single user's full profile.
───────────────────────────────────────────────────────── */
router.get('/:userId', userIdValidator, usersController.getUserById);

/* ─────────────────────────────────────────────────────────
   PATCH /api/users/:userId
   Update name, role, or manager assignment.
───────────────────────────────────────────────────────── */
router.patch('/:userId', updateUserValidator, usersController.updateUser);

/* ─────────────────────────────────────────────────────────
   PATCH /api/users/:userId/deactivate
   Soft-delete — sets is_active=false + revokes tokens.
───────────────────────────────────────────────────────── */
router.patch('/:userId/deactivate', userIdValidator, usersController.deactivateUser);

/* ─────────────────────────────────────────────────────────
   PATCH /api/users/:userId/reactivate
   Re-enables a deactivated user account.
───────────────────────────────────────────────────────── */
router.patch('/:userId/reactivate', userIdValidator, usersController.reactivateUser);

/* ─────────────────────────────────────────────────────────
   POST /api/users/:userId/send-credentials
   Generate + email a new random password to the user.
───────────────────────────────────────────────────────── */
router.post(
  '/:userId/send-credentials',
  credentialSendLimiter,
  userIdValidator,
  usersController.sendCredentials
);

module.exports = router;
