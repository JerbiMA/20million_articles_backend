const Order = require('./order.model');
const Cart = require('../cart/cart.model');
const Product = require('../product/product.model');
const Coupon = require('../coupon/coupon.model');
const { ApiError } = require('../../shared/utils');
const { PAGINATION, ORDER_STATUS } = require('../../shared/constants');
const { config } = require('../../config');

const orderService = {
  /**
   * Place a new order from the cart.
   */
  async createOrder({ userId, sessionId, shippingAddress, couponCode, guestEmail, notes }) {
    // 1. Get the cart
    const filter = userId ? { user: userId } : { sessionId };
    const cart = await Cart.findOne(filter).populate({
      path: 'items.product',
      select: 'name price salePrice images sizes isActive',
    });

    if (!cart || cart.items.length === 0) {
      throw ApiError.badRequest('Cart is empty');
    }

    // 2. Validate all items and build order items with snapshots
    const orderItems = [];
    for (const item of cart.items) {
      const product = item.product;

      if (!product || !product.isActive) {
        throw ApiError.badRequest(`Product "${item.product?.name || 'Unknown'}" is no longer available`);
      }

      const sizeVariant = product.sizes.find((s) => s.size === item.size);
      if (!sizeVariant || sizeVariant.stock < item.quantity) {
        throw ApiError.badRequest(
          `Insufficient stock for "${product.name}" in size ${item.size}. Available: ${sizeVariant?.stock || 0}`,
        );
      }

      const effectivePrice =
        product.salePrice != null && product.salePrice < product.price
          ? product.salePrice
          : product.price;

      // Get main image for snapshot
      const mainImg = product.images.find((img) => img.isMain) || product.images[0];

      orderItems.push({
        product: product._id,
        name: product.name,
        price: effectivePrice,
        size: item.size,
        quantity: item.quantity,
        image: mainImg?.url || '',
      });
    }

    // 3. Calculate subtotal
    const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // 4. Apply coupon if provided
    let discount = 0;
    let couponData = { code: null, discountAmount: 0 };

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (!coupon || !coupon.isUsable) {
        throw ApiError.badRequest('Invalid or expired coupon code');
      }

      discount = coupon.calculateDiscount(subtotal);
      couponData = { code: coupon.code, discountAmount: discount };

      // Increment usage count
      coupon.usedCount += 1;
      await coupon.save();
    }

    // 5. Calculate shipping and total
    const shippingCost = config.shipping.flatRate;
    const total = Math.max(0, subtotal - discount + shippingCost);

    // 6. Create the order
    const order = await Order.create({
      user: userId || null,
      guestEmail: userId ? null : guestEmail,
      items: orderItems,
      shippingAddress,
      subtotal,
      shippingCost,
      discount,
      total: Math.round(total * 100) / 100,
      coupon: couponData,
      paymentMethod: 'cod',
      notes: notes || '',
    });

    // 7. Deduct stock
    for (const item of orderItems) {
      await Product.updateOne(
        { _id: item.product, 'sizes.size': item.size },
        { $inc: { 'sizes.$.stock': -item.quantity } },
      );
    }

    // 8. Clear the cart
    cart.items = [];
    await cart.save();

    return order;
  },

  /**
   * Get orders for a specific user.
   */
  async getUserOrders(userId, { page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT } = {}) {
    const safePage = Math.max(1, parseInt(page, 10));
    const safeLimit = Math.min(parseInt(limit, 10), PAGINATION.MAX_LIMIT);
    const skip = (safePage - 1) * safeLimit;

    const [orders, total] = await Promise.all([
      Order.find({ user: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .lean(),
      Order.countDocuments({ user: userId }),
    ]);

    return {
      orders,
      pagination: { page: safePage, limit: safeLimit, total, pages: Math.ceil(total / safeLimit) },
    };
  },

  /**
   * Get a single order by ID.
   */
  async getOrderById(orderId, userId = null) {
    const filter = { _id: orderId };
    if (userId) {
      filter.user = userId; // Ensure user can only see their own orders
    }

    const order = await Order.findOne(filter).lean();
    if (!order) {
      throw ApiError.notFound('Order not found');
    }
    return order;
  },

  /**
   * Track order by order number (public — for guests).
   */
  async trackOrder(orderNumber, guestEmail) {
    const order = await Order.findOne({ orderNumber }).lean();
    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    // For guest orders, verify email
    if (!order.user && order.guestEmail !== guestEmail) {
      throw ApiError.forbidden('Email does not match the order');
    }

    return {
      orderNumber: order.orderNumber,
      status: order.status,
      statusHistory: order.statusHistory,
      total: order.total,
      createdAt: order.createdAt,
    };
  },

  // ─── Admin Methods ────────────────────────────

  /**
   * Get all orders (admin).
   */
  async getAllOrders({ page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT, status, sort = '-createdAt' } = {}) {
    const filter = {};
    if (status) {
      filter.status = status;
    }

    const safePage = Math.max(1, parseInt(page, 10));
    const safeLimit = Math.min(parseInt(limit, 10), PAGINATION.MAX_LIMIT);
    const skip = (safePage - 1) * safeLimit;

    const sortField = sort.startsWith('-') ? sort.substring(1) : sort;
    const sortOrder = sort.startsWith('-') ? -1 : 1;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(safeLimit)
        .populate('user', 'name email')
        .lean(),
      Order.countDocuments(filter),
    ]);

    return {
      orders,
      pagination: { page: safePage, limit: safeLimit, total, pages: Math.ceil(total / safeLimit) },
    };
  },

  /**
   * Update order status (admin).
   */
  async updateOrderStatus(orderId, newStatus, note = '') {
    const order = await Order.findById(orderId);
    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    // Validate status transition
    const validTransitions = {
      [ORDER_STATUS.PENDING]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
      [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.PROCESSING, ORDER_STATUS.CANCELLED],
      [ORDER_STATUS.PROCESSING]: [ORDER_STATUS.SHIPPED, ORDER_STATUS.CANCELLED],
      [ORDER_STATUS.SHIPPED]: [ORDER_STATUS.DELIVERED],
      [ORDER_STATUS.DELIVERED]: [],
      [ORDER_STATUS.CANCELLED]: [],
    };

    if (!validTransitions[order.status]?.includes(newStatus)) {
      throw ApiError.badRequest(
        `Cannot transition from "${order.status}" to "${newStatus}"`,
      );
    }

    // If cancelling, restore stock
    if (newStatus === ORDER_STATUS.CANCELLED) {
      for (const item of order.items) {
        await Product.updateOne(
          { _id: item.product, 'sizes.size': item.size },
          { $inc: { 'sizes.$.stock': item.quantity } },
        );
      }
    }

    order.status = newStatus;
    order.statusHistory.push({
      status: newStatus,
      changedAt: new Date(),
      note,
    });

    await order.save();
    return order;
  },

  /**
   * Get order statistics (admin dashboard).
   */
  async getOrderStats() {
    const [statusCounts, revenueResult, todayOrders] = await Promise.all([
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $match: { status: { $ne: ORDER_STATUS.CANCELLED } } },
        { $group: { _id: null, totalRevenue: { $sum: '$total' }, totalOrders: { $sum: 1 } } },
      ]),
      Order.countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      }),
    ]);

    const statusMap = {};
    for (const s of statusCounts) {
      statusMap[s._id] = s.count;
    }

    return {
      statusCounts: statusMap,
      totalRevenue: revenueResult[0]?.totalRevenue || 0,
      totalOrders: revenueResult[0]?.totalOrders || 0,
      todayOrders,
    };
  },
};

module.exports = orderService;
