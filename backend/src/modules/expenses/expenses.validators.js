const { body, param, query } = require('express-validator');
const { sendError }          = require('../../utils/apiResponse');
const { validationResult }   = require('express-validator');

const EXPENSE_CATEGORIES = [
  'travel', 'food', 'accommodation', 'office_supplies',
  'medical', 'training', 'entertainment', 'miscellaneous',
];

const handleErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendError(res, errors.array()[0].msg, 422, null);
  next();
};

/* ── Submit expense ───────────────────────────────────────── */
const submitExpenseValidator = [
  body('amount')
    .notEmpty().withMessage('Amount is required.')
    .isFloat({ min: 0.01 }).withMessage('Amount must be a positive number.').toFloat(),

  body('currency_code')
    .trim().notEmpty().withMessage('Currency code is required.')
    .isLength({ min: 3, max: 5 }).withMessage('Currency code must be 3–5 characters.')
    .customSanitizer((v) => v.toUpperCase()),

  body('category')
    .trim().notEmpty().withMessage('Category is required.')
    .isIn(EXPENSE_CATEGORIES).withMessage(`Category must be one of: ${EXPENSE_CATEGORIES.join(', ')}.`),

  body('description')
    .trim().notEmpty().withMessage('Description is required.')
    .isLength({ min: 5, max: 500 }).withMessage('Description must be 5–500 characters.'),

  body('expense_date')
    .notEmpty().withMessage('Expense date is required.')
    .isDate().withMessage('Expense date must be a valid date (YYYY-MM-DD).')
    .custom((value) => {
      const date     = new Date(value);
      const today    = new Date();
      const yearAgo  = new Date();
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      today.setHours(23, 59, 59, 999);
      if (date > today)   throw new Error('Expense date cannot be in the future.');
      if (date < yearAgo) throw new Error('Expense date cannot be more than 1 year in the past.');
      return true;
    }),

  body('employee_note')
    .optional()
    .isString()
    .isLength({ max: 300 }).withMessage('Note must be max 300 characters.'),

  handleErrors,
];

/* ── List expenses (query filters) ───────────────────────── */
const listExpensesValidator = [
  query('status').optional().isIn(['draft','pending','in_review','approved','rejected','cancelled']),
  query('category').optional().isIn(EXPENSE_CATEGORIES),
  query('startDate').optional().isDate(),
  query('endDate').optional().isDate(),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  handleErrors,
];

/* ── expenseId param ──────────────────────────────────────── */
const expenseIdValidator = [
  param('expenseId').notEmpty().isUUID().withMessage('Expense ID must be a valid UUID.'),
  handleErrors,
];

module.exports = {
  submitExpenseValidator,
  listExpensesValidator,
  expenseIdValidator,
  EXPENSE_CATEGORIES,
};
