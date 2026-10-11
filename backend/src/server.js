const express = require('express');
const cors = require('cors');
const requestLogger = require('./middleware/requestLoggerMiddleware');
const { apiLimiter, authLimiter } = require('./middleware/rateLimitMiddleware');
require('dotenv').config();

const pool = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const stationRoutes = require('./routes/stationRoutes');
const trainRoutes = require('./routes/trainRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const env = require('./config/env');
const adminMiddleware = require('./middleware/adminMiddleware');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();

app.use(cors());
app.use(express.json());

app.use(requestLogger);
app.use('/api/', apiLimiter);

// Auth & User routes
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/users', userRoutes);

// Team 7 - Admin Routes
app.use('/api/v1/admin', authMiddleware, adminMiddleware, adminRoutes);

// Team 2 - Railway Search & Station Discovery routes
app.use('/api/v1/stations', stationRoutes);
app.use('/stations', stationRoutes);

app.use('/api/v1/trains', trainRoutes);
app.use('/trains', trainRoutes);

// Team 5 - Payment & Transactions
app.use('/api/v1/payments', paymentRoutes);

// Service health. Reports whether the database is reachable and whether
// payment is configured, without revealing credentials.
app.get('/api/v1/health', async (req, res) => {
  const health = {
    status: 'ok',
    razorpay: env.isMockRazorpay ? 'unconfigured' : 'configured',
    database: 'unknown',
  };

  try {
    const [rows] = await pool.query('SELECT 1 AS ok');
    health.database = rows[0].ok === 1 ? 'connected' : 'unreachable';
  } catch (err) {
    health.status = 'degraded';
    health.database = 'unreachable';
  }

  res.json(health);
});

app.get('/', (req, res) => {
  res.json({
    message: 'RailSetu / Yatrio Backend is Running!',
    team2Endpoints: [
      'GET /stations',
      'GET /stations/search?q=:query',
      'GET /trains/search?q=:query',
      'GET /trains/between?from=:from&to=:to&date=:date',
      'GET /trains/:trainNo',
    ],
    team5Endpoints: [
      'POST /api/v1/payments/create-order',
      'POST /api/v1/payments/verify',
      'POST /api/v1/payments/refund',
      'GET /api/v1/payments/status/:orderId',
      'GET /api/v1/payments/history',
    ],
  });
});

// Global 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Cannot ${req.method} ${req.originalUrl}`,
    },
  });
});

// Global error handler
//
// Team 5's payment routes reject with an HttpError carrying a deliberate
// status and code (404 NOT_FOUND, 409 SIGNATURE_MISMATCH, 409 ALREADY_REFUNDED),
// so honour them instead of flattening everything to a 500. Anything without a
// status is a genuine fault and still gets the generic message, because a 500
// must never leak internals to a client.
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;

  if (status >= 500) {
    console.error('Unhandled server error:', err);
  }

  res.status(status).json({
    success: false,
    error: {
      code: status >= 500 ? 'INTERNAL_ERROR' : err.code || 'REQUEST_FAILED',
      message:
        status >= 500 ? 'An unexpected internal error occurred' : err.message,
      field: err.field ?? null,
    },
});
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
