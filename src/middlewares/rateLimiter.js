const rateLimit = require('express-rate-limit');
const { config } = require('../config');

/**
 * General API rate limiter.
 */
const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
  skip: () => config.isTest, // Disable rate limiting in tests
});

/**
 * Stricter rate limiter for auth endpoints (login, register, etc.).
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
  },
  skip: () => config.isTest,
});

module.exports = { apiLimiter, authLimiter };
