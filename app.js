const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const { apiLimiter } = require('./middleware/rateLimit');
const requestLogger = require('./middleware/requestLogger');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Required when running behind a proxy (e.g. Vercel/Render) so rate limiting uses the client IP.
app.set('trust proxy', 1);

// Helmet sets security-related HTTP headers (CSP, HSTS, X-Content-Type-Options, etc.)
app.use(helmet());

// Small body limit protects against oversized payloads.
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

app.use(requestLogger);

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime_seconds: Math.round(process.uptime()),
  });
});

app.use('/api/v1', apiLimiter);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/emp', employeeRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
