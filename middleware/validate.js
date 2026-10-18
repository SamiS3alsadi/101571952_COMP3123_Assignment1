const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

// Runs after express-validator chains and turns failures into a 400 response with field details.
module.exports = function validate(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  next(new AppError(400, 'Validation failed', errors.array().map((e) => ({ field: e.path, message: e.msg }))));
};
