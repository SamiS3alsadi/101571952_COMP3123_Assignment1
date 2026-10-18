const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const { logger } = require('../utils/logger');

// Verifies "Authorization: Bearer <token>". The owner identity comes ONLY from the token.
module.exports = function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    logger.warn('auth failed: missing or malformed token', { path: req.originalUrl });
    return next(new AppError(401, 'Missing or malformed Authorization header'));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    req.user = { id: payload.sub, username: payload.username };
    next();
  } catch (err) {
    const message = err.name === 'TokenExpiredError' ? 'Token has expired' : 'Invalid token';
    logger.warn('auth failed: ' + message, { path: req.originalUrl });
    next(new AppError(401, message));
  }
};
