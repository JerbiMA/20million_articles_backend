/**
 * Custom API Error class.
 * Extends native Error with HTTP status codes, operational flag,
 * and optional error details for validation errors.
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Error message
   * @param {object} [options]
   * @param {boolean} [options.isOperational=true] - Operational vs programmer error
   * @param {Array}  [options.errors=[]] - Detailed validation errors
   * @param {string} [options.stack] - Custom stack trace
   */
  constructor(statusCode, message, { isOperational = true, errors = [], stack = '' } = {}) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  // ── Factory methods ──────────────────────────
  static badRequest(message = 'Bad Request', errors = []) {
    return new ApiError(400, message, { errors });
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, message);
  }

  static conflict(message = 'Conflict') {
    return new ApiError(409, message);
  }

  static tooMany(message = 'Too many requests') {
    return new ApiError(429, message);
  }

  static internal(message = 'Internal Server Error') {
    return new ApiError(500, message, { isOperational: false });
  }
}

module.exports = ApiError;
