const rateLimit = require('express-rate-limit');
const env = require('../config/env');

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: env.AUTH_RATE_LIMIT_PER_MINUTE,
  standardHeaders: true,
  legacyHeaders: false
});

const publicLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: env.PUBLIC_RATE_LIMIT_PER_MINUTE,
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = { authLimiter, publicLimiter };
