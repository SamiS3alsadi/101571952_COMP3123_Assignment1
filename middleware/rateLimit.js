const rateLimit = require('express-rate-limit');
const { logger } = require('../utils/logger');

const tooMany = (name) => (req, res) => {
  logger.warn('rate limit exceeded', { limiter: name, path: req.originalUrl });
  res.status(429).json({ success: false, message: 'Too many requests. Please try again later.' });
};

// Strict limit for signup and login to slow down brute-force and credential-stuffing attacks.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: tooMany('auth'),
});

// General limit for all API routes.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: tooMany('api'),
});

module.exports = { authLimiter, apiLimiter };
