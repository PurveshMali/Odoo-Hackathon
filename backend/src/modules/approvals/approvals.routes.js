const express    = require('express');
const { verifyToken }    = require('../../middlewares/auth.middleware');
const { requireRole }    = require('../../middlewares/role.middleware');
const controller         = require('./approvals.controller');
const {
  approveValidator, rejectValidator, listPendingValidator, timelineValidator,
} = require('./approvals.validators');

const router = express.Router();

router.use(verifyToken);

// GET /api/approvals/pending — see my pending approvals (manager + admin)
router.get('/pending',
  requireRole('manager', 'admin'),
  listPendingValidator,
  controller.getPendingApprovals
);

// POST /api/approvals/:expenseId/approve
router.post('/:expenseId/approve',
  requireRole('manager', 'admin'),
  approveValidator,
  controller.approveExpense
);

// POST /api/approvals/:expenseId/reject
router.post('/:expenseId/reject',
  requireRole('manager', 'admin'),
  rejectValidator,
  controller.rejectExpense
);

// GET /api/approvals/:expenseId/timeline — all roles
router.get('/:expenseId/timeline', timelineValidator, controller.getTimeline);

module.exports = router;
