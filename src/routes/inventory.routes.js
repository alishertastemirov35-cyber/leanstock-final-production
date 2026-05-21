const router = require('express').Router();
const c = require('../controllers/inventory.controller');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const s = require('../validators/business.schemas');

router.get('/stocks', auth, asyncHandler(c.list));
router.post('/receive', auth, rbac('OWNER', 'MANAGER', 'INVENTORY_CLERK'), validate(s.receiveStock), asyncHandler(c.receive));

module.exports = router;
