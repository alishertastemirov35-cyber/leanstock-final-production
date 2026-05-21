const router = require('express').Router();
const c = require('../controllers/sale.controller');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const s = require('../validators/business.schemas');

router.get('/', auth, rbac('OWNER', 'MANAGER'), asyncHandler(c.list));
router.post('/confirm', auth, rbac('OWNER', 'MANAGER', 'CASHIER'), validate(s.confirmSale), asyncHandler(c.confirm));

module.exports = router;
