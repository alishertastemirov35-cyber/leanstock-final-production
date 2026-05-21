const router = require('express').Router();
const c = require('../controllers/audit.controller');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');
const asyncHandler = require('../utils/asyncHandler');

router.get('/', auth, rbac('OWNER', 'PLATFORM_ADMIN'), asyncHandler(c.list));

module.exports = router;
