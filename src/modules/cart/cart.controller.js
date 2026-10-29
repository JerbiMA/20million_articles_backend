const cartService = require('./cart.service');
const { ApiResponse, catchAsync } = require('../../shared/utils');

/**
 * Helper to extract user ID or session ID from request.
 */
const getCartOwner = (req) => {
  const userId = req.user?.id || null;
  const sessionId = req.cookies?.sessionId || req.headers['x-session-id'] || null;
  return { userId, sessionId };
};

const cartController = {
  /**
   * GET /api/v1/cart
   */
  getCart: catchAsync(async (req, res) => {
    const { userId, sessionId } = getCartOwner(req);
    const cart = await cartService.getCart(userId, sessionId);
    ApiResponse.ok(res, 'Cart retrieved', cart);
  }),

  /**
   * POST /api/v1/cart/items
   */
  addItem: catchAsync(async (req, res) => {
    const { userId, sessionId } = getCartOwner(req);
    const { productId, size, quantity } = req.body;
    const cart = await cartService.addItem(userId, sessionId, { productId, size, quantity });
    ApiResponse.ok(res, 'Item added to cart', cart);
  }),

  /**
   * PATCH /api/v1/cart/items/:itemId
   */
  updateItem: catchAsync(async (req, res) => {
    const { userId, sessionId } = getCartOwner(req);
    const { quantity } = req.body;
    const cart = await cartService.updateItem(userId, sessionId, req.params.itemId, quantity);
    ApiResponse.ok(res, 'Cart item updated', cart);
  }),

  /**
   * DELETE /api/v1/cart/items/:itemId
   */
  removeItem: catchAsync(async (req, res) => {
    const { userId, sessionId } = getCartOwner(req);
    const cart = await cartService.removeItem(userId, sessionId, req.params.itemId);
    ApiResponse.ok(res, 'Item removed from cart', cart);
  }),

  /**
   * DELETE /api/v1/cart
   */
  clearCart: catchAsync(async (req, res) => {
    const { userId, sessionId } = getCartOwner(req);
    await cartService.clearCart(userId, sessionId);
    ApiResponse.ok(res, 'Cart cleared');
  }),
};

module.exports = cartController;
