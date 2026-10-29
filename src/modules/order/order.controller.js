const orderService = require('./order.service');
const { ApiResponse, catchAsync } = require('../../shared/utils');

const orderController = {
  // ─── Client / Guest ───────────────────────────

  /**
   * POST /api/v1/orders
   */
  createOrder: catchAsync(async (req, res) => {
    const userId = req.user?.id || null;
    const sessionId = req.cookies?.sessionId || req.headers['x-session-id'] || null;
    const { shippingAddress, couponCode, guestEmail, notes } = req.body;

    const order = await orderService.createOrder({
      userId,
      sessionId,
      shippingAddress,
      couponCode,
      guestEmail,
      notes,
    });

    ApiResponse.created(res, 'Order placed successfully', order);
  }),

  /**
   * GET /api/v1/orders
   * Get current user's orders.
   */
  getMyOrders: catchAsync(async (req, res) => {
    const result = await orderService.getUserOrders(req.user.id, req.query);
    ApiResponse.ok(res, 'Orders retrieved', result.orders, result.pagination);
  }),

  /**
   * GET /api/v1/orders/:id
   * Get a specific order (user can only see their own).
   */
  getMyOrder: catchAsync(async (req, res) => {
    const order = await orderService.getOrderById(req.params.id, req.user.id);
    ApiResponse.ok(res, 'Order retrieved', order);
  }),

  /**
   * POST /api/v1/orders/track
   * Track an order by order number (public — for guests).
   */
  trackOrder: catchAsync(async (req, res) => {
    const { orderNumber, email } = req.body;
    const tracking = await orderService.trackOrder(orderNumber, email);
    ApiResponse.ok(res, 'Order tracking info', tracking);
  }),

  // ─── Admin ────────────────────────────────────

  /**
   * GET /api/v1/admin/orders
   */
  adminGetOrders: catchAsync(async (req, res) => {
    const result = await orderService.getAllOrders(req.query);
    ApiResponse.ok(res, 'Orders retrieved', result.orders, result.pagination);
  }),

  /**
   * GET /api/v1/admin/orders/:id
   */
  adminGetOrder: catchAsync(async (req, res) => {
    const order = await orderService.getOrderById(req.params.id);
    ApiResponse.ok(res, 'Order retrieved', order);
  }),

  /**
   * PATCH /api/v1/admin/orders/:id/status
   */
  updateOrderStatus: catchAsync(async (req, res) => {
    const { status, note } = req.body;
    const order = await orderService.updateOrderStatus(req.params.id, status, note);
    ApiResponse.ok(res, 'Order status updated', order);
  }),

  /**
   * GET /api/v1/admin/orders/stats
   */
  getOrderStats: catchAsync(async (_req, res) => {
    const stats = await orderService.getOrderStats();
    ApiResponse.ok(res, 'Order statistics', stats);
  }),
};

module.exports = orderController;
