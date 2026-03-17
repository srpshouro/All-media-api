const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(`${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
};

module.exports = errorHandler;
