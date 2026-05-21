const { validation } = require('../utils/errors');

module.exports = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params
    });

    if (!result.success) {
      return next(validation(result.error.flatten()));
    }

    req.validated = result.data;
    next();
  };
};
