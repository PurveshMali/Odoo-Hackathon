const service         = require('./dashboard.service');
const { sendSuccess } = require('../../utils/apiResponse');

const getAdminDashboard = async (req, res, next) => {
  try {
    const data = await service.getAdminDashboard(req.user.companyId);
    return sendSuccess(res, 'Dashboard data fetched.', data);
  } catch (err) { next(err); }
};

const getManagerDashboard = async (req, res, next) => {
  try {
    const data = await service.getManagerDashboard(req.user.userId, req.user.companyId);
    return sendSuccess(res, 'Dashboard data fetched.', data);
  } catch (err) { next(err); }
};

const getEmployeeDashboard = async (req, res, next) => {
  try {
    const data = await service.getEmployeeDashboard(req.user.userId, req.user.companyId);
    return sendSuccess(res, 'Dashboard data fetched.', data);
  } catch (err) { next(err); }
};

module.exports = { getAdminDashboard, getManagerDashboard, getEmployeeDashboard };
