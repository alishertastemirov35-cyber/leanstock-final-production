const jwt = require('jsonwebtoken');
const env = require('../config/env');
const prisma = require('../config/database');
const { unauthorized, forbidden } = require('../utils/errors');

module.exports = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(unauthorized('Missing Bearer token'));
  }

  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { tenant: true }
    });

    if (!user || user.status === 'DISABLED') {
      return next(unauthorized('User is not active'));
    }

    if (user.status !== 'ACTIVE' || !user.emailVerifiedAt) {
      return next(forbidden('Email is not verified'));
    }

    if (user.tenant && user.tenant.status !== 'ACTIVE') {
      return next(forbidden('Tenant is suspended'));
    }

    req.user = {
      id: user.id,
      tenantId: user.tenantId,
      role: user.role,
      email: user.email
    };

    next();
  } catch (err) {
    next(unauthorized('Invalid or expired token'));
  }
};
