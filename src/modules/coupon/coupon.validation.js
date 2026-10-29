const Joi = require('joi');
const { COUPON_TYPE } = require('../../shared/constants');
const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({ 'string.pattern.base': 'Invalid ID format' });

const couponValidation = {
  validateCoupon: {
    body: Joi.object({
      code: Joi.string().trim().required(),
      subtotal: Joi.number().min(0).required(),
    }),
  },

  createCoupon: {
    body: Joi.object({
      code: Joi.string().trim().uppercase().max(30).required(),
      type: Joi.string().valid(...Object.values(COUPON_TYPE)).required(),
      value: Joi.number().min(0).required(),
      minOrderAmount: Joi.number().min(0).default(0),
      maxDiscount: Joi.number().min(0).allow(null),
      usageLimit: Joi.number().integer().min(1).allow(null),
      startDate: Joi.date(),
      endDate: Joi.date().required(),
      isActive: Joi.boolean(),
    }),
  },

  updateCoupon: {
    params: Joi.object({ id: objectId.required() }),
    body: Joi.object({
      code: Joi.string().trim().uppercase().max(30),
      type: Joi.string().valid(...Object.values(COUPON_TYPE)),
      value: Joi.number().min(0),
      minOrderAmount: Joi.number().min(0),
      maxDiscount: Joi.number().min(0).allow(null),
      usageLimit: Joi.number().integer().min(1).allow(null),
      startDate: Joi.date(),
      endDate: Joi.date(),
      isActive: Joi.boolean(),
    }).min(1),
  },

  getCoupon: {
    params: Joi.object({ id: objectId.required() }),
  },

  deleteCoupon: {
    params: Joi.object({ id: objectId.required() }),
  },
};

module.exports = couponValidation;
