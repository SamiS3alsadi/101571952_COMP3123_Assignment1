const { logger } = require('../utils/logger');

// Logs method, path, status and duration for every request. Bodies and headers are NOT logged.
module.exports = function requestLogger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    logger.info('request', {
      method: req.method,
      path: req.originalUrl.split('?')[0],
      status: res.statusCode,
      duration_ms: Date.now() - start,
      user: req.user ? req.user.id : undefined,
    });
  });
  next();
};
