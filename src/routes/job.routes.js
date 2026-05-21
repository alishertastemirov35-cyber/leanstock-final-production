const router = require('express').Router();
const c = require('../controllers/job.controller');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');
const asyncHandler = require('../utils/asyncHandler');

router.post('/dead-stock/run', auth, rbac('OWNER', 'MANAGER'), asyncHandler(c.runDeadStock));

module.exports = router;
