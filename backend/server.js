/**
 * Lets-Go-WorkSpace Backend Server
 * Main entry point for the Express.js API
 */

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
require('express-async-errors');

const logger = require('./src/utils/logger');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Routes
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// TODO: Add API routes
// app.use('/api/users', require('./src/routes/userRoutes'));
// app.use('/api/rooms', require('./src/routes/roomRoutes'));
// app.use('/api/bookings', require('./src/routes/bookingRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.message);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
    path: req.path
  });
});

// Start server
const server = app.listen(PORT, () => {
  logger.info(`Lets-Go-WorkSpace Backend Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

module.exports = app;
