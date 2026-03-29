const express    = require('express');
const { verifyToken }    = require('../../middlewares/auth.middleware');
const { requireRole }    = require('../../middlewares/role.middleware');
const controller         = require('./approvalRules.controller');
const { createRuleValidator, updateRuleValidator, ruleIdValidator } = require('./approvalRules.validators');

const router = express.Router();

router.use(verifyToken, requireRole('admin'));

router.post('/',           createRuleValidator, controller.createRule);
router.get('/',                                 controller.getAllRules);
router.get('/:ruleId',    ruleIdValidator,      controller.getRuleById);
router.patch('/:ruleId',  [...ruleIdValidator, ...updateRuleValidator], controller.updateRule);
router.delete('/:ruleId', ruleIdValidator,      controller.deactivateRule);

module.exports = router;
