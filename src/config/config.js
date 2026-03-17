require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW) || 15,
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 20,
  maxTimeout: parseInt(process.env.MAX_DOWNLOAD_TIMEOUT) || 300000,
  allowedOrigins: process.env.ALLOWED_ORIGINS || '*'
};
