const { body, param }      = require('express-validator');
const { sendError }        = require('../../utils/apiResponse');
const { validationResult } = require('express-validator');
const { EXPENSE_CATEGORIES } = require('../expenses/expenses.validators');

const handleErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendError(res, errors.array()[0].msg, 422, null);
  next();
};

const createRuleValidator = [
  body('name').trim().notEmpty().withMessage('Rule name is required.')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters.'),

  body('approval_type')
    .notEmpty().withMessage('Approval type is required.')
    .isIn(['sequential','percentage','specific','hybrid'])
    .withMessage('Approval type must be: sequential, percentage, specific, or hybrid.'),

  body('percentage_threshold')
    .if(body('approval_type').isIn(['percentage','hybrid']))
    .notEmpty().withMessage('Percentage threshold is required for percentage/hybrid rules.')
    .isInt({ min: 1, max: 100 }).withMessage('Percentage threshold must be between 1 and 100.').toInt(),

  body('specific_approver_id')
    .if(body('approval_type').isIn(['specific','hybrid']))
    .notEmpty().withMessage('Specific approver ID is required for specific/hybrid rules.')
    .isUUID().withMessage('Specific approver ID must be a valid UUID.'),

  body('min_amount').optional({ nullable: true })
    .isFloat({ min: 0 }).withMessage('Min amount must be a non-negative number.').toFloat(),

  body('max_amount').optional({ nullable: true })
    .isFloat({ min: 0 }).withMessage('Max amount must be a non-negative number.').toFloat()
    .custom((max, { req }) => {
      if (req.body.min_amount !== undefined && max !== null && max <= req.body.min_amount) {
        throw new Error('Max amount must be greater than min amount.');
      }
      return true;
    }),

  body('category').optional({ nullable: true })
    .isIn(EXPENSE_CATEGORIES).withMessage(`Category must be one of: ${EXPENSE_CATEGORIES.join(', ')}.`),

  body('is_manager_first').optional().isBoolean().toBoolean(),

  body('steps').optional().isArray().withMessage('Steps must be an array.'),
  body('steps.*.approver_id').if(body('steps').exists()).notEmpty().isUUID()
    .withMessage('Each step approver_id must be a valid UUID.'),
  body('steps.*.step_order').if(body('steps').exists()).isInt({ min: 1 })
    .withMessage('Each step_order must be a positive integer.').toInt(),

  handleErrors,
];

const updateRuleValidator = [
  body('name').optional().trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters.'),
  body('is_manager_first').optional().isBoolean().toBoolean(),
  body('min_amount').optional({ nullable: true }).isFloat({ min: 0 }).toFloat(),
  body('max_amount').optional({ nullable: true }).isFloat({ min: 0 }).toFloat(),
  body('category').optional({ nullable: true }).isIn(EXPENSE_CATEGORIES),
  body('steps').optional().isArray(),
  body('steps.*.approver_id').if(body('steps').exists()).notEmpty().isUUID(),
  body('steps.*.step_order').if(body('steps').exists()).isInt({ min: 1 }).toInt(),
  handleErrors,
];

const ruleIdValidator = [
  param('ruleId').notEmpty().isUUID().withMessage('Rule ID must be a valid UUID.'),
  handleErrors,
];

module.exports = { createRuleValidator, updateRuleValidator, ruleIdValidator };
