const { body, query, param, validationResult } = require('express-validator');
const { sendError } = require('../../utils/apiResponse');

/** Centralized error handler — plugs into every validator array */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, errors.array()[0].msg, 422, null);
  }
  next();
};

/* ─────────────────────────────────────────────────────────
   Re-usable userId param rule
───────────────────────────────────────────────────────── */
const userIdParam = param('userId')
  .notEmpty().withMessage('User ID is required.')
  .isUUID().withMessage('User ID must be a valid UUID.');

/* ─────────────────────────────────────────────────────────
   POST /api/users — createUser
───────────────────────────────────────────────────────── */
const createUserValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isString().withMessage('Name must be a string.')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters.'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Must be a valid email address.')
    .normalizeEmail(),

  body('role')
    .trim()
    .notEmpty().withMessage('Role is required.')
    .isIn(['employee', 'manager']).withMessage('Role must be "employee" or "manager".'),

  body('managerId')
    .optional({ nullable: true })
    .isUUID().withMessage('Manager ID must be a valid UUID.'),

  handleValidationErrors,
];

/* ─────────────────────────────────────────────────────────
   GET /api/users — getAllUsers (query param filters)
───────────────────────────────────────────────────────── */
const getAllUsersValidator = [
  query('role')
    .optional()
    .isIn(['employee', 'manager', 'admin']).withMessage('role must be employee, manager, or admin.'),

  query('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be true or false.'),

  query('search')
    .optional()
    .trim()
    .isString()
    .isLength({ max: 100 }).withMessage('Search query must be max 100 characters.'),

  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('page must be a positive integer.')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage('limit must be between 1 and 50.')
    .toInt(),

  handleValidationErrors,
];

/* ─────────────────────────────────────────────────────────
   GET/PATCH /api/users/:userId — userId param only
───────────────────────────────────────────────────────── */
const userIdValidator = [
  userIdParam,
  handleValidationErrors,
];

/* ─────────────────────────────────────────────────────────
   PATCH /api/users/:userId — updateUser
───────────────────────────────────────────────────────── */
const updateUserValidator = [
  userIdParam,

  body('name')
    .optional()
    .trim()
    .isString().withMessage('Name must be a string.')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters.'),

  body('role')
    .optional()
    .isIn(['employee', 'manager']).withMessage('Role must be "employee" or "manager".'),

  body('managerId')
    .optional({ nullable: true })
    .custom((value) => {
      if (value !== null && value !== undefined && value !== '') {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(value)) throw new Error('Manager ID must be a valid UUID.');
      }
      return true;
    }),

  // At least one updatable field must be present
  body().custom((body) => {
    const hasName      = body.name      !== undefined;
    const hasRole      = body.role      !== undefined;
    const hasManagerId = body.managerId !== undefined;
    if (!hasName && !hasRole && !hasManagerId) {
      throw new Error('At least one field (name, role, managerId) must be provided.');
    }
    return true;
  }),

  handleValidationErrors,
];

module.exports = {
  createUserValidator,
  getAllUsersValidator,
  userIdValidator,
  updateUserValidator,
};
