const User = require('./user.model');
const { ApiError } = require('../../shared/utils');
const { PAGINATION } = require('../../shared/constants');

/**
 * User Service — contains all business logic for User operations.
 * Controllers delegate to this layer; this layer talks to the model.
 */
const userService = {
  /**
   * Get paginated list of users.
   */
  async getUsers({ page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT, sort = '-createdAt', role, search } = {}) {
    const filter = {};

    if (role) {
      filter.role = role;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const safePage = Math.max(1, parseInt(page, 10));
    const safeLimit = Math.min(parseInt(limit, 10), PAGINATION.MAX_LIMIT);
    const skip = (safePage - 1) * safeLimit;

    const [users, total] = await Promise.all([
      User.find(filter).sort(sort).skip(skip).limit(safeLimit).lean(),
      User.countDocuments(filter),
    ]);

    return {
      users,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        pages: Math.ceil(total / safeLimit),
      },
    };
  },

  /**
   * Get a single user by ID.
   */
  async getUserById(userId) {
    const user = await User.findById(userId).lean();
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    return user;
  },

  /**
   * Update a user by ID.
   */
  async updateUser(userId, updateData) {
    // Check email uniqueness if email is being changed
    if (updateData.email) {
      const emailTaken = await User.isEmailTaken(updateData.email, userId);
      if (emailTaken) {
        throw ApiError.conflict('Email is already taken');
      }
    }

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).lean();

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return user;
  },

  /**
   * Delete a user by ID (soft delete by setting isActive to false).
   */
  async deleteUser(userId) {
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true },
    ).lean();

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return user;
  },
};

module.exports = userService;
