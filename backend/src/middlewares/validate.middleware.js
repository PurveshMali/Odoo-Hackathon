const { body, validationResult } = require('express-validator');
const { sendError } = require('../utils/apiResponse');

/**
 * Runs express-validator results and short-circuits with 422
 * if any field failed validation. Call this as the LAST item
 * in a validator array, after the field checks.
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    return sendError(res, firstError.msg, 422, null);
  }
  next();
};

/* ────────────── Signup validators ────────────── */
const signupValidators = [
  body('companyName')
    .trim()
    .notEmpty().withMessage('Company name is required.')
    .isLength({ min: 2, max: 100 }).withMessage('Company name must be 2–100 characters.'),

  body('country')
    .trim()
    .notEmpty().withMessage('Country is required.')
    .isString().withMessage('Country must be a valid string.'),

  body('name')
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters.'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Must be a valid email address.')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter.')
    .matches(/[0-9]/).withMessage('Password must contain at least one number.')
    .matches(/[^A-Za-z0-9]/).withMessage('Password must contain at least one special character.'),

  handleValidationErrors,
];

/* ────────────── Login validators ────────────── */
const loginValidators = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Must be a valid email address.')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required.'),

  handleValidationErrors,
];

module.exports = { signupValidators, loginValidators };
