const router = require('express').Router();
const c = require('../controllers/location.controller');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const s = require('../validators/business.schemas');

router.get('/', auth, asyncHandler(c.list));
router.post('/', auth, rbac('OWNER', 'MANAGER'), validate(s.createLocation), asyncHandler(c.create));
router.get('/:id', auth, validate(s.idParam), asyncHandler(c.get));

module.exports = router;
