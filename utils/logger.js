const fs = require('fs');
const path = require('path');

const LOG_DIR = process.env.LOG_DIR || 'logs';
const LOG_FILE = path.join(LOG_DIR, 'app.log');
fs.mkdirSync(LOG_DIR, { recursive: true });

// Keys that must never reach the log file.
const SENSITIVE = ['password', 'token', 'authorization', 'jwt_secret', 'mongodb_uri'];

function redact(meta = {}) {
  const clean = {};
  for (const [key, value] of Object.entries(meta)) {
    clean[key] = SENSITIVE.some((s) => key.toLowerCase().includes(s)) ? '[REDACTED]' : value;
  }
  return clean;
}

function write(level, message, meta) {
  const line = JSON.stringify({ timestamp: new Date().toISOString(), level, message, ...redact(meta) });
  fs.appendFile(LOG_FILE, line + '\n', () => {});
  console.log(line);
}

const logger = {
  info: (message, meta) => write('info', message, meta),
  warn: (message, meta) => write('warn', message, meta),
  error: (message, meta) => write('error', message, meta),
};

module.exports = { logger };
