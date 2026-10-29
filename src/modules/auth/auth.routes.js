const express = require('express');
const authController = require('./auth.controller');
const authValidation = require('./auth.validation');
const { authenticate, validate, authLimiter } = require('../../middlewares');

const router = express.Router();

/**
 * Auth Routes
 *
 * POST /api/v1/auth/register  → Register new user
 * POST /api/v1/auth/login     → Login
 * POST /api/v1/auth/refresh   → Refresh access token
 * POST /api/v1/auth/logout    → Logout (clear cookies)
 * POST /api/v1/auth/change-password → Change password (auth required)
 */

// Apply stricter rate limiting to auth routes
router.use(authLimiter);

router.post('/register', validate(authValidation.register), authController.register);
router.post('/login', validate(authValidation.login), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.post('/change-password', authenticate, validate(authValidation.changePassword), authController.changePassword);

module.exports = router;
