const expensesService = require('./expenses.service');
const { sendSuccess } = require('../../utils/apiResponse');

const extractOCR = async (req, res, next) => {
  try {
    if (!req.file) { const e = new Error('Receipt file is required.'); e.statusCode = 400; throw e; }
    const ocrData = await expensesService.extractOCR(req.file.path);
    return sendSuccess(res, 'OCR extraction complete', { ocrData, filePath: req.file.filename });
  } catch (err) { next(err); }
};

const submitExpense = async (req, res, next) => {
  try {
    const expense = await expensesService.submitExpense(
      req.body, req.user.userId, req.user.companyId, req.file || null
    );
    const isFlagged = expense.isFlaggedForReview;
    return res.status(201).json({
      success: true,
      message: isFlagged
        ? 'Expense submitted but flagged for review due to suspicious patterns.'
        : 'Expense submitted successfully.',
      data: { expense },
    });
  } catch (err) { next(err); }
};

const getMyExpenses = async (req, res, next) => {
  try {
    const result = await expensesService.getMyExpenses(
      req.user.userId, req.user.companyId, req.query
    );
    return sendSuccess(res, 'Expenses fetched successfully.', result);
  } catch (err) { next(err); }
};

const getExpenseById = async (req, res, next) => {
  try {
    const expense = await expensesService.getExpenseById(
      req.params.expenseId, req.user.companyId, req.user
    );
    return sendSuccess(res, 'Expense fetched successfully.', { expense });
  } catch (err) { next(err); }
};

const cancelExpense = async (req, res, next) => {
  try {
    const result = await expensesService.cancelExpense(
      req.params.expenseId, req.user.userId, req.user.companyId
    );
    return sendSuccess(res, result.message, null);
  } catch (err) { next(err); }
};

module.exports = { extractOCR, submitExpense, getMyExpenses, getExpenseById, cancelExpense };
