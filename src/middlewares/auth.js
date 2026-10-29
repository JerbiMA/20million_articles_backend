const jwt = require('jsonwebtoken');
const { config } = require('../config');
const ApiError = require('../shared/utils/ApiError');

/**
 * JWT authentication middleware.
 * Extracts the token from the Authorization header (Bearer <token>),
 * verifies it, and attaches the decoded payload to `req.user`.
 */
const authenticate = (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('Access token is missing'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret);
    req.user = decoded;
    next();
  } catch (error) {
    next(error); // Will be caught by errorConverter (JWT errors)
  }
};

/**
 * Role-based authorization middleware.
 * Must be used AFTER `authenticate`.
 *
 * Usage:
 *   router.get('/admin', authenticate, authorize('admin'), controller);
 *   router.get('/both', authenticate, authorize('admin', 'user'), controller);
 *
 * @param  {...string} allowedRoles - Roles permitted to access the route
 */
const authorize = (...allowedRoles) => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden('You do not have permission to access this resource'));
    }

    next();
  };
};

module.exports = { authenticate, authorize };
