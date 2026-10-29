const Joi = require('joi');
const { ORDER_STATUS } = require('../../shared/constants');
const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({ 'string.pattern.base': 'Invalid ID format' });

const shippingAddress = Joi.object({
  fullName: Joi.string().trim().required(),
  phone: Joi.string().trim().required(),
  address: Joi.string().trim().required(),
  city: Joi.string().trim().required(),
  zipCode: Joi.string().trim().allow(''),
});

const orderValidation = {
  createOrder: {
    body: Joi.object({
      shippingAddress: shippingAddress.required(),
      couponCode: Joi.string().trim().uppercase().allow('', null),
      guestEmail: Joi.string().email().lowercase().trim().allow(null),
      notes: Joi.string().trim().max(500).allow(''),
    }),
  },

  getOrder: {
    params: Joi.object({ id: objectId.required() }),
  },

  trackOrder: {
    body: Joi.object({
      orderNumber: Joi.string().trim().required(),
      email: Joi.string().email().lowercase().trim().required(),
    }),
  },

  updateOrderStatus: {
    params: Joi.object({ id: objectId.required() }),
    body: Joi.object({
      status: Joi.string()
        .valid(...Object.values(ORDER_STATUS))
        .required(),
      note: Joi.string().trim().max(200).allow(''),
    }),
  },

  adminGetOrders: {
    query: Joi.object({
      page: Joi.number().integer().min(1),
      limit: Joi.number().integer().min(1).max(100),
      status: Joi.string().valid(...Object.values(ORDER_STATUS)),
      sort: Joi.string(),
    }),
  },
};

module.exports = orderValidation;
