const mongoose = require('mongoose');
const { COUPON_TYPE } = require('../../shared/constants');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(COUPON_TYPE),
      required: [true, 'Coupon type is required'],
    },
    value: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [0, 'Value cannot be negative'],
    },
    /**
     * Minimum order subtotal required to use this coupon.
     */
    minOrderAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    /**
     * Maximum discount amount (only relevant for percentage coupons).
     */
    maxDiscount: {
      type: Number,
      default: null,
    },
    usageLimit: {
      type: Number,
      default: null, // null = unlimited
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: [true, 'Coupon expiry date is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ─── Virtuals ───────────────────────────────────
couponSchema.virtual('isExpired').get(function () {
  return new Date() > this.endDate;
});

couponSchema.virtual('isUsable').get(function () {
  const notExpired = new Date() >= this.startDate && new Date() <= this.endDate;
  const notExhausted = this.usageLimit === null || this.usedCount < this.usageLimit;
  return this.isActive && notExpired && notExhausted;
});

// ─── Instance methods ───────────────────────────
/**
 * Calculate discount amount for a given subtotal.
 * @param {number} subtotal - Cart subtotal before discount
 * @returns {number} Discount amount
 */
couponSchema.methods.calculateDiscount = function (subtotal) {
  if (subtotal < this.minOrderAmount) {
    return 0;
  }

  let discount;
  if (this.type === COUPON_TYPE.PERCENTAGE) {
    discount = (subtotal * this.value) / 100;
    if (this.maxDiscount !== null) {
      discount = Math.min(discount, this.maxDiscount);
    }
  } else {
    discount = Math.min(this.value, subtotal); // Fixed amount, can't exceed subtotal
  }

  return Math.round(discount * 100) / 100; // Round to 2 decimal places
};

// ─── Validation ─────────────────────────────────
couponSchema.pre('validate', function () {
  if (this.type === COUPON_TYPE.PERCENTAGE && this.value > 100) {
    throw new Error('Percentage discount cannot exceed 100%');
  }
});

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
