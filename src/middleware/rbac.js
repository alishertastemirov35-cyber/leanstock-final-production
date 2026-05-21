const { forbidden } = require('../utils/errors');

module.exports = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(forbidden('Your role cannot perform this action'));
    }
    next();
  };
};
