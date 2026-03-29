const { body, param, query } = require('express-validator');
const { sendError }          = require('../../utils/apiResponse');
const { validationResult }   = require('express-validator');

const handleErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendError(res, errors.array()[0].msg, 422, null);
  next();
};

const approveValidator = [
  param('expenseId').notEmpty().isUUID().withMessage('Expense ID must be a valid UUID.'),
  body('comment').optional().isString().isLength({ max: 500 }),
  handleErrors,
];

const rejectValidator = [
  param('expenseId').notEmpty().isUUID().withMessage('Expense ID must be a valid UUID.'),
  body('comment')
    .notEmpty().withMessage('A reason is required when rejecting an expense.')
    .isString().isLength({ min: 3, max: 500 }).withMessage('Comment must be 3–500 characters.'),
  handleErrors,
];

const listPendingValidator = [
  query('category').optional(),
  query('minAmount').optional().isFloat({ min: 0 }).toFloat(),
  query('maxAmount').optional().isFloat({ min: 0 }).toFloat(),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  handleErrors,
];

const timelineValidator = [
  param('expenseId').notEmpty().isUUID().withMessage('Expense ID must be a valid UUID.'),
  handleErrors,
];

module.exports = { approveValidator, rejectValidator, listPendingValidator, timelineValidator };
