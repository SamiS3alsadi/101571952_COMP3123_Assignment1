const mongoose = require('mongoose');

async function connectDB() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: 'comp3123_assignment1' });
  const { logger } = require('../utils/logger');
  logger.info('database connected', { database: 'comp3123_assignment1' });
}

module.exports = connectDB;
