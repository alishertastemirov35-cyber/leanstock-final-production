const router = require('express').Router();
const c = require('../controllers/product.controller');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const s = require('../validators/business.schemas');

router.get('/', auth, asyncHandler(c.list));
router.post('/', auth, rbac('OWNER', 'MANAGER'), validate(s.createProduct), asyncHandler(c.create));
router.get('/:id', auth, validate(s.idParam), asyncHandler(c.get));
router.patch('/:id', auth, rbac('OWNER', 'MANAGER'), validate(s.updateProduct), asyncHandler(c.update));
router.delete('/:id', auth, rbac('OWNER', 'MANAGER'), validate(s.idParam), asyncHandler(c.archive));

module.exports = router;
