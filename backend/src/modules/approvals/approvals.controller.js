const service           = require('./approvals.service');
const { sendSuccess }   = require('../../utils/apiResponse');

const getPendingApprovals = async (req, res, next) => {
  try {
    const result = await service.getPendingApprovals(req.user.userId, req.user.companyId, req.query);
    return sendSuccess(res, 'Pending approvals fetched.', result);
  } catch (err) { next(err); }
};

const approveExpense = async (req, res, next) => {
  try {
    const result = await service.approveExpense(
      req.params.expenseId, req.user.userId, req.user.companyId, req.body.comment
    );
    return sendSuccess(res, result.message, { fullyApproved: result.fullyApproved });
  } catch (err) { next(err); }
};

const rejectExpense = async (req, res, next) => {
  try {
    const result = await service.rejectExpense(
      req.params.expenseId, req.user.userId, req.user.companyId, req.body.comment
    );
    return sendSuccess(res, result.message, null);
  } catch (err) { next(err); }
};

const getTimeline = async (req, res, next) => {
  try {
    const result = await service.getTimeline(
      req.params.expenseId, req.user.companyId, req.user
    );
    return sendSuccess(res, 'Timeline fetched.', result);
  } catch (err) { next(err); }
};

module.exports = { getPendingApprovals, approveExpense, rejectExpense, getTimeline };
