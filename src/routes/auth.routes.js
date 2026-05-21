const router = require('express').Router();
const c = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const { authLimiter } = require('../middleware/rateLimiter');
const s = require('../validators/auth.schemas');

router.post('/register-owner', authLimiter, validate(s.registerOwner), asyncHandler(c.registerOwner));
router.post('/verify-email', authLimiter, validate(s.verifyEmail), asyncHandler(c.verifyEmail));
router.post('/login', authLimiter, validate(s.login), asyncHandler(c.login));
router.post('/refresh', validate(s.refresh), asyncHandler(c.refresh));
router.post('/logout', asyncHandler(c.logout));
router.post('/forgot-password', authLimiter, validate(s.forgotPassword), asyncHandler(c.forgotPassword));
router.post('/reset-password', authLimiter, validate(s.resetPassword), asyncHandler(c.resetPassword));

module.exports = router;
