const logger = require('../config/logger');
const CustomError = require('../utils/CustomError');

const errorHandler = (err, req, res, next) => {
  let statusCode = 500;
  let errorCode = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected error occurred';

  if (err instanceof CustomError) {
    statusCode = err.statusCode;
    errorCode = err.errorCode;
    message = err.message;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = err.message;
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    errorCode = 'UNAUTHORIZED';
    message = 'Invalid token';
  }

  logger.error(`${errorCode}: ${message}`, {
    error: err,
    requestBody: req.body,
    requestParams: req.params,
    requestQuery: req.query,
    url: req.originalUrl,
    method: req.method,
  });

  res.status(statusCode).json({
    error: {
      code: errorCode,
      message: message,
    },
  });
};

module.exports = errorHandler;