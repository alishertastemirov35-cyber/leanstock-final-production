const router = require('express').Router();
const c = require('../controllers/forecast.controller');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');
const asyncHandler = require('../utils/asyncHandler');

router.get('/reorder', auth, rbac('OWNER', 'MANAGER', 'INVENTORY_CLERK'), asyncHandler(c.reorder));

module.exports = router;
