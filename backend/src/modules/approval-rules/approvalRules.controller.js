const service      = require('./approvalRules.service');
const { sendSuccess } = require('../../utils/apiResponse');

const createRule = async (req, res, next) => {
  try {
    const rule = await service.createRule(req.body, req.user.companyId, req.user.userId);
    return res.status(201).json({ success: true, message: 'Approval rule created.', data: { rule } });
  } catch (err) { next(err); }
};

const getAllRules = async (req, res, next) => {
  try {
    const rules = await service.getAllRules(req.user.companyId);
    return sendSuccess(res, 'Rules fetched.', { rules });
  } catch (err) { next(err); }
};

const getRuleById = async (req, res, next) => {
  try {
    const rule = await service.getRuleById(req.params.ruleId, req.user.companyId);
    return sendSuccess(res, 'Rule fetched.', { rule });
  } catch (err) { next(err); }
};

const updateRule = async (req, res, next) => {
  try {
    const rule = await service.updateRule(req.params.ruleId, req.body, req.user.companyId, req.user.userId);
    return sendSuccess(res, 'Rule updated.', { rule });
  } catch (err) { next(err); }
};

const deactivateRule = async (req, res, next) => {
  try {
    const result = await service.deactivateRule(req.params.ruleId, req.user.companyId, req.user.userId);
    return sendSuccess(res, result.message, null);
  } catch (err) { next(err); }
};

module.exports = { createRule, getAllRules, getRuleById, updateRule, deactivateRule };
