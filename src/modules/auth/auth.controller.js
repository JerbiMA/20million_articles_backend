const authService = require('./auth.service');
const { ApiResponse, catchAsync } = require('../../shared/utils');

const authController = {
  /**
   * POST /api/v1/auth/register
   */
  register: catchAsync(async (req, res) => {
    const { name, email, password } = req.body;
    const sessionId = req.cookies?.sessionId || req.headers['x-session-id'];

    const result = await authService.register({ name, email, password }, sessionId);

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    ApiResponse.created(res, 'Registration successful', {
      user: result.user,
      accessToken: result.tokens.accessToken,
    });
  }),

  /**
   * POST /api/v1/auth/login
   */
  login: catchAsync(async (req, res) => {
    const { email, password } = req.body;
    const sessionId = req.cookies?.sessionId || req.headers['x-session-id'];

    const result = await authService.login({ email, password }, sessionId);

    res.cookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    ApiResponse.ok(res, 'Login successful', {
      user: result.user,
      accessToken: result.tokens.accessToken,
    });
  }),

  /**
   * POST /api/v1/auth/refresh
   */
  refresh: catchAsync(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
    const result = await authService.refreshToken(refreshToken);

    res.cookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    ApiResponse.ok(res, 'Token refreshed', {
      accessToken: result.tokens.accessToken,
    });
  }),

  /**
   * POST /api/v1/auth/logout
   */
  logout: catchAsync(async (_req, res) => {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    ApiResponse.ok(res, 'Logged out successfully');
  }),

  /**
   * POST /api/v1/auth/change-password
   */
  changePassword: catchAsync(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.user.id, currentPassword, newPassword);
    ApiResponse.ok(res, 'Password changed successfully');
  }),
};

module.exports = authController;
