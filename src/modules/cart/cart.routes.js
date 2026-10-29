const express = require('express');
const cartController = require('./cart.controller');
const cartValidation = require('./cart.validation');
const { validate } = require('../../middlewares');

const router = express.Router();

/**
 * Cart Routes (no auth required — works for both guests and users)
 *
 * GET    /api/v1/cart              → Get cart
 * POST   /api/v1/cart/items        → Add item to cart
 * PATCH  /api/v1/cart/items/:itemId → Update item quantity
 * DELETE /api/v1/cart/items/:itemId → Remove item
 * DELETE /api/v1/cart              → Clear cart
 */

router.get('/', cartController.getCart);
router.post('/items', validate(cartValidation.addItem), cartController.addItem);
router.patch('/items/:itemId', validate(cartValidation.updateItem), cartController.updateItem);
router.delete('/items/:itemId', validate(cartValidation.removeItem), cartController.removeItem);
router.delete('/', cartController.clearCart);

module.exports = router;
