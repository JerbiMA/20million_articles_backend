const Joi = require('joi');
const { SIZES } = require('../../shared/constants');
const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({ 'string.pattern.base': 'Invalid ID format' });

const cartValidation = {
  addItem: {
    body: Joi.object({
      productId: objectId.required(),
      size: Joi.string().valid(...SIZES).required(),
      quantity: Joi.number().integer().min(1).default(1),
    }),
  },

  updateItem: {
    params: Joi.object({ itemId: objectId.required() }),
    body: Joi.object({
      quantity: Joi.number().integer().min(0).required(),
    }),
  },

  removeItem: {
    params: Joi.object({ itemId: objectId.required() }),
  },
};

module.exports = cartValidation;
