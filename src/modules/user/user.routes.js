const express = require('express');
const userController = require('./user.controller');
const userValidation = require('./user.validation');
const { authenticate, authorize, validate } = require('../../middlewares');

const router = express.Router();

/**
 * User Routes
 *
 * GET    /api/v1/users         → List users (admin only)
 * GET    /api/v1/users/me      → Get current user profile
 * GET    /api/v1/users/:id     → Get user by ID (admin only)
 * PATCH  /api/v1/users/:id     → Update user (admin only)
 * DELETE /api/v1/users/:id     → Soft-delete user (admin only)
 */

// Protected routes — require authentication
router.use(authenticate);

// Current user
router.get('/me', userController.getMe);

// Admin-only routes
router.get('/', authorize('admin'), validate(userValidation.getUsers), userController.getUsers);
router.get('/:id', authorize('admin'), validate(userValidation.getUser), userController.getUser);
router.patch('/:id', authorize('admin'), validate(userValidation.updateUser), userController.updateUser);
router.delete('/:id', authorize('admin'), validate(userValidation.deleteUser), userController.deleteUser);

module.exports = router;
