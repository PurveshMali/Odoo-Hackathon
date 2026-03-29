const express    = require('express');
const { verifyToken } = require('../../middlewares/auth.middleware');
const { upload }       = require('../../utils/fileUpload');
const controller       = require('./expenses.controller');
const {
  submitExpenseValidator,
  listExpensesValidator,
  expenseIdValidator,
} = require('./expenses.validators');

const router = express.Router();

router.use(verifyToken);

// POST /api/expenses/ocr — upload receipt, get OCR auto-fill data
router.post('/ocr', upload.single('receipt'), controller.extractOCR);

// POST /api/expenses — submit new expense (with optional receipt)
router.post('/', upload.single('receipt'), submitExpenseValidator, controller.submitExpense);

// GET /api/expenses — list my expenses
router.get('/', listExpensesValidator, controller.getMyExpenses);

// GET /api/expenses/:expenseId — view single expense
router.get('/:expenseId', expenseIdValidator, controller.getExpenseById);

// PATCH /api/expenses/:expenseId/cancel — cancel my expense
router.patch('/:expenseId/cancel', expenseIdValidator, controller.cancelExpense);

module.exports = router;
