const router = require('express').Router();
const c = require('../controllers/reservation.controller');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const s = require('../validators/business.schemas');

router.post('/', auth, rbac('OWNER', 'MANAGER', 'CASHIER'), validate(s.reservation), asyncHandler(c.create));
router.post('/:id/cancel', auth, rbac('OWNER', 'MANAGER', 'CASHIER'), asyncHandler(c.cancel));

module.exports = router;
