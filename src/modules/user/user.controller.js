const userService = require('./user.service');
const { ApiResponse, catchAsync } = require('../../shared/utils');

/**
 * User Controller — thin layer that handles HTTP concerns
 * and delegates business logic to the service layer.
 */
const userController = {
  /**
   * GET /api/v1/users
   * Get paginated list of users.
   */
  getUsers: catchAsync(async (req, res) => {
    const { page, limit, sort, role, search } = req.query;
    const result = await userService.getUsers({ page, limit, sort, role, search });

    ApiResponse.ok(res, 'Users retrieved successfully', result.users, result.pagination);
  }),

  /**
   * GET /api/v1/users/:id
   * Get a single user by ID.
   */
  getUser: catchAsync(async (req, res) => {
    const user = await userService.getUserById(req.params.id);
    ApiResponse.ok(res, 'User retrieved successfully', user);
  }),

  /**
   * PATCH /api/v1/users/:id
   * Update a user.
   */
  updateUser: catchAsync(async (req, res) => {
    const user = await userService.updateUser(req.params.id, req.body);
    ApiResponse.ok(res, 'User updated successfully', user);
  }),

  /**
   * DELETE /api/v1/users/:id
   * Soft-delete a user.
   */
  deleteUser: catchAsync(async (req, res) => {
    await userService.deleteUser(req.params.id);
    ApiResponse.ok(res, 'User deleted successfully');
  }),

  /**
   * GET /api/v1/users/me
   * Get the currently authenticated user's profile.
   */
  getMe: catchAsync(async (req, res) => {
    const user = await userService.getUserById(req.user.id);
    ApiResponse.ok(res, 'Profile retrieved successfully', user);
  }),
};

module.exports = userController;
