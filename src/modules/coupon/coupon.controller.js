const couponService = require('./coupon.service');
const { ApiResponse, catchAsync } = require('../../shared/utils');

const couponController = {
  // ─── Public ───────────────────────────────────

  /**
   * POST /api/v1/coupons/validate
   * Validate a coupon code and get discount preview.
   */
  validateCoupon: catchAsync(async (req, res) => {
    const { code, subtotal } = req.body;
    const result = await couponService.validateCoupon(code, subtotal);
    ApiResponse.ok(res, 'Coupon is valid', result);
  }),

  // ─── Admin ────────────────────────────────────

  /**
   * GET /api/v1/admin/coupons
   */
  getCoupons: catchAsync(async (req, res) => {
    const result = await couponService.getCoupons(req.query);
    ApiResponse.ok(res, 'Coupons retrieved', result.coupons, result.pagination);
  }),

  /**
   * GET /api/v1/admin/coupons/:id
   */
  getCoupon: catchAsync(async (req, res) => {
    const coupon = await couponService.getCouponById(req.params.id);
    ApiResponse.ok(res, 'Coupon retrieved', coupon);
  }),

  /**
   * POST /api/v1/admin/coupons
   */
  createCoupon: catchAsync(async (req, res) => {
    const coupon = await couponService.createCoupon(req.body);
    ApiResponse.created(res, 'Coupon created', coupon);
  }),

  /**
   * PUT /api/v1/admin/coupons/:id
   */
  updateCoupon: catchAsync(async (req, res) => {
    const coupon = await couponService.updateCoupon(req.params.id, req.body);
    ApiResponse.ok(res, 'Coupon updated', coupon);
  }),

  /**
   * DELETE /api/v1/admin/coupons/:id
   */
  deleteCoupon: catchAsync(async (req, res) => {
    await couponService.deleteCoupon(req.params.id);
    ApiResponse.ok(res, 'Coupon deleted');
  }),
};

module.exports = couponController;
