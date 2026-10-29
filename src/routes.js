const express = require('express');

const router = express.Router();

/**
 * ─── Module Route Registration ─────────────────
 * Public + authenticated routes for the storefront.
 * Admin routes are mounted separately under /admin.
 */

// Auth
const authRoutes = require('./modules/auth/auth.routes');
router.use('/auth', authRoutes);

// Categories (public)
const categoryRoutes = require('./modules/category/category.routes');
router.use('/categories', categoryRoutes);

// Teams (public)
const teamRoutes = require('./modules/team/team.routes');
router.use('/teams', teamRoutes);

// Products (public)
const productRoutes = require('./modules/product/product.routes');
router.use('/products', productRoutes);

// Cart (guest + user)
const cartRoutes = require('./modules/cart/cart.routes');
router.use('/cart', cartRoutes);

// Orders (guest checkout + user history)
const orderRoutes = require('./modules/order/order.routes');
router.use('/orders', orderRoutes);

// Coupons (public validation)
const couponRoutes = require('./modules/coupon/coupon.routes');
router.use('/coupons', couponRoutes);

// Users (authenticated — self-service)
const userRoutes = require('./modules/user/user.routes');
router.use('/users', userRoutes);

// Admin panel (all admin routes under /admin)
const adminRoutes = require('./modules/admin/admin.routes');
router.use('/admin', adminRoutes);

// API info
router.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'MRIWL API v1 — Football Shirts E-Commerce',
    version: '1.0.0',
  });
});

module.exports = router;
