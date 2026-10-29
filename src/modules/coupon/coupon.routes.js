const express = require('express');
const couponController = require('./coupon.controller');
const couponValidation = require('./coupon.validation');
const { validate } = require('../../middlewares');

const router = express.Router();

/**
 * Public Coupon Routes
 *
 * POST /api/v1/coupons/validate → Validate coupon code at checkout
 */

router.post('/validate', validate(couponValidation.validateCoupon), couponController.validateCoupon);

module.exports = router;
