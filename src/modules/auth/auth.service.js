const jwt = require('jsonwebtoken');
const User = require('../user/user.model');
const { ApiError } = require('../../shared/utils');
const { config } = require('../../config');
const cartService = require('../cart/cart.service');

/**
 * Generate JWT access and refresh tokens.
 */
const generateTokens = (user) => {
  const payload = { id: user._id, email: user.email, role: user.role };

  const accessToken = jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiration,
  });

  const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiration,
  });

  return { accessToken, refreshToken };
};

const authService = {
  /**
   * Register a new user.
   */
  async register({ name, email, password }, sessionId) {
    const emailTaken = await User.isEmailTaken(email);
    if (emailTaken) {
      throw ApiError.conflict('Email is already registered');
    }

    const user = await User.create({ name, email, password });
    const tokens = generateTokens(user);

    // Merge guest cart into the new user's cart
    if (sessionId) {
      await cartService.mergeGuestCart(user._id, sessionId);
    }

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      tokens,
    };
  },

  /**
   * Login with email and password.
   */
  async login({ email, password }, sessionId) {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Your account has been deactivated');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const tokens = generateTokens(user);

    // Merge guest cart into user's cart
    if (sessionId) {
      await cartService.mergeGuestCart(user._id, sessionId);
    }

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      tokens,
    };
  },

  /**
   * Refresh the access token using a valid refresh token.
   */
  async refreshToken(refreshToken) {
    if (!refreshToken) {
      throw ApiError.unauthorized('Refresh token is required');
    }

    try {
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
      const user = await User.findById(decoded.id);

      if (!user || !user.isActive) {
        throw ApiError.unauthorized('Invalid refresh token');
      }

      const tokens = generateTokens(user);
      return { tokens };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }
  },

  /**
   * Change password.
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw ApiError.unauthorized('Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();
  },
};

module.exports = authService;
