const Coupon = require('./coupon.model');
const { ApiError } = require('../../shared/utils');
const { PAGINATION } = require('../../shared/constants');

const couponService = {
  /**
   * Get all coupons (admin).
   */
  async getCoupons({ page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT, isActive } = {}) {
    const filter = {};
    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    const safePage = Math.max(1, parseInt(page, 10));
    const safeLimit = Math.min(parseInt(limit, 10), PAGINATION.MAX_LIMIT);
    const skip = (safePage - 1) * safeLimit;

    const [coupons, total] = await Promise.all([
      Coupon.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .lean({ virtuals: true }),
      Coupon.countDocuments(filter),
    ]);

    return {
      coupons,
      pagination: { page: safePage, limit: safeLimit, total, pages: Math.ceil(total / safeLimit) },
    };
  },

  /**
   * Get a single coupon by ID.
   */
  async getCouponById(couponId) {
    const coupon = await Coupon.findById(couponId).lean({ virtuals: true });
    if (!coupon) {
      throw ApiError.notFound('Coupon not found');
    }
    return coupon;
  },

  /**
   * Validate a coupon code (public — used at checkout).
   */
  async validateCoupon(code, subtotal) {
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) {
      throw ApiError.notFound('Coupon not found');
    }
    if (!coupon.isUsable) {
      throw ApiError.badRequest('This coupon is no longer valid');
    }
    if (subtotal < coupon.minOrderAmount) {
      throw ApiError.badRequest(
        `Minimum order amount for this coupon is ${coupon.minOrderAmount}`,
      );
    }

    const discount = coupon.calculateDiscount(subtotal);

    return {
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discount,
      minOrderAmount: coupon.minOrderAmount,
    };
  },

  /**
   * Create a new coupon (admin).
   */
  async createCoupon(data) {
    const existing = await Coupon.findOne({ code: data.code.toUpperCase() });
    if (existing) {
      throw ApiError.conflict('A coupon with this code already exists');
    }
    return Coupon.create({ ...data, code: data.code.toUpperCase() });
  },

  /**
   * Update a coupon (admin).
   */
  async updateCoupon(couponId, updateData) {
    if (updateData.code) {
      const existing = await Coupon.findOne({
        code: updateData.code.toUpperCase(),
        _id: { $ne: couponId },
      });
      if (existing) {
        throw ApiError.conflict('A coupon with this code already exists');
      }
      updateData.code = updateData.code.toUpperCase();
    }

    const coupon = await Coupon.findByIdAndUpdate(couponId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!coupon) {
      throw ApiError.notFound('Coupon not found');
    }
    return coupon;
  },

  /**
   * Delete a coupon (admin).
   */
  async deleteCoupon(couponId) {
    const coupon = await Coupon.findByIdAndDelete(couponId);
    if (!coupon) {
      throw ApiError.notFound('Coupon not found');
    }
    return coupon;
  },
};

module.exports = couponService;
