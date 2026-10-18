require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { logger } = require('./utils/logger');

const required = ['MONGODB_URI', 'JWT_SECRET'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  logger.error('missing required environment variables', { missing });
  process.exit(1);
}
if (process.env.JWT_SECRET.length < 32) {
  logger.warn('JWT_SECRET is shorter than 32 characters; use a longer secret');
}

const PORT = process.env.PORT || 8081;

connectDB()
  .then(() => {
    app.listen(PORT, () => logger.info('server started', { port: PORT }));
  })
  .catch((err) => {
    logger.error('database connection failed', { error: err.message });
    process.exit(1);
  });
