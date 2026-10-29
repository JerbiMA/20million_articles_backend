const express = require('express');
const orderController = require('./order.controller');
const orderValidation = require('./order.validation');
const { authenticate, validate } = require('../../middlewares');

const router = express.Router();

/**
 * Order Routes
 *
 * POST /api/v1/orders       → Place order (guest or user)
 * POST /api/v1/orders/track → Track order by number (public)
 * GET  /api/v1/orders       → My orders (auth required)
 * GET  /api/v1/orders/:id   → My order detail (auth required)
 */

// Public
router.post('/', validate(orderValidation.createOrder), orderController.createOrder);
router.post('/track', validate(orderValidation.trackOrder), orderController.trackOrder);

// Authenticated user
router.get('/', authenticate, orderController.getMyOrders);
router.get('/:id', authenticate, validate(orderValidation.getOrder), orderController.getMyOrder);

module.exports = router;
