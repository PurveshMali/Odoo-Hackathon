const express    = require('express');
const { verifyToken } = require('../../middlewares/auth.middleware');
const { requireRole } = require('../../middlewares/role.middleware');
const controller      = require('./dashboard.controller');

const router = express.Router();

router.use(verifyToken);

router.get('/admin',    requireRole('admin'),            controller.getAdminDashboard);
router.get('/manager',  requireRole('manager', 'admin'), controller.getManagerDashboard);
router.get('/employee', controller.getEmployeeDashboard);

module.exports = router;
