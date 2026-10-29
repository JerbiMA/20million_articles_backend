const mongoose = require('mongoose');
const { logger } = require('../config');
const ApiError = require('../shared/utils/ApiError');

/**
 * Convert non-ApiError errors into ApiError instances.
 */
const errorConverter = (err, _req, _res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    // Mongoose validation error → 400
    if (error instanceof mongoose.Error.ValidationError) {
      const errors = Object.values(error.errors).map((e) => ({
        field: e.path,
        message: e.message,
      }));
      error = ApiError.badRequest('Validation failed', errors);
    }
    // Mongoose cast error (invalid ObjectId, etc.) → 400
    else if (error instanceof mongoose.Error.CastError) {
      error = ApiError.badRequest(`Invalid ${error.path}: ${error.value}`);
    }
    // Mongoose duplicate key error → 409
    else if (error.code === 11000) {
      const field = Object.keys(error.keyValue || {})[0];
      error = ApiError.conflict(
        `Duplicate value for "${field}". This ${field} already exists.`,
      );
    }
    // JWT errors
    else if (error.name === 'JsonWebTokenError') {
      error = ApiError.unauthorized('Invalid token');
    } else if (error.name === 'TokenExpiredError') {
      error = ApiError.unauthorized('Token expired');
    }
    // Generic fallback
    else {
      const statusCode = error.statusCode || 500;
      const message = error.message || 'Internal Server Error';
      error = new ApiError(statusCode, message, { isOperational: false, stack: err.stack });
    }
  }

  next(error);
};

/**
 * Final error handler — sends the JSON response.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, _req, res, _next) => {
  const { statusCode = 500, message } = err;

  // Log server errors
  if (statusCode >= 500) {
    logger.error(err.stack || err.message);
  } else {
    logger.warn(`${statusCode} - ${message}`);
  }

  const response = {
    success: false,
    message,
    ...(err.errors?.length && { errors: err.errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  res.status(statusCode).json(response);
};

module.exports = { errorConverter, errorHandler };
