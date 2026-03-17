const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan'); // HTTP request logger

const config = require('./config/config');
const apiRoutes = require('./routes/api');
const rateLimiter = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const cleanupTempFiles = require('./utils/cleanup');

const app = express();

// Security & Utility Middleware
app.use(helmet());
app.use(cors({ origin: config.allowedOrigins }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Setup global rate limiting for API routes
app.use('/api', rateLimiter);

// Routes
app.use('/api', apiRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// Global Error Handler
app.use(errorHandler);

// Background Cleanup Process (Runs periodically to clean any local disk remnants)
setInterval(cleanupTempFiles, config.cleanupInterval);

// Server initialization
const server = app.listen(config.port, () => {
  logger.info(`Server is running on port ${config.port} in ${config.env} mode`);
});

// Apply download timeout logic to Express Server
server.setTimeout(config.downloadTimeout);

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
  });
});
