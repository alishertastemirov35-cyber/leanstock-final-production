const router = require('express').Router();
const c = require('../controllers/transfer.controller');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const s = require('../validators/business.schemas');

router.post('/', auth, rbac('OWNER', 'MANAGER'), validate(s.transfer), asyncHandler(c.create));

module.exports = router;
