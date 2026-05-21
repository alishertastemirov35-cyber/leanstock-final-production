const router = require('express').Router();
const c = require('../controllers/user.controller');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const s = require('../validators/business.schemas');

router.get('/', auth, rbac('OWNER', 'MANAGER'), asyncHandler(c.list));
router.post('/', auth, rbac('OWNER'), validate(s.createUser), asyncHandler(c.create));

module.exports = router;
