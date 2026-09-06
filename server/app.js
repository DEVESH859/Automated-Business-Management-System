const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { connectDatabase } = require('./database');

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Origin is not allowed by CORS'));
  },
}));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', async (_req, res) => {
  try {
    if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
      return res.status(503).json({
        status: 'error',
        database: 'unknown',
        msg: 'JWT_SECRET is not configured in the deployment settings.',
      });
    }
    await connectDatabase();
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('Health check failed:', error.message);
    res.status(503).json({
      status: 'error',
      database: 'disconnected',
      msg: 'The database is not available. Check the MONGODB_URI deployment setting.',
    });
  }
});

app.use('/api', async (_req, res, next) => {
  try {
    await connectDatabase();
    next();
  } catch (error) {
    console.error('Database connection failed:', error.message);
    res.status(503).json({
      msg: 'The service cannot connect to its database. Check the deployment settings.',
    });
  }
});

app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/dashboard', require('./routes/dashboard'));

app.use('/api', (_req, res) => {
  res.status(404).json({ msg: 'API endpoint not found' });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ msg: 'An unexpected server error occurred' });
});

module.exports = app;
