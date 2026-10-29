const Joi = require('joi');
const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({ 'string.pattern.base': 'Invalid ID format' });

const categoryValidation = {
  createCategory: {
    body: Joi.object({
      name: Joi.string().trim().max(100).required(),
      description: Joi.string().trim().max(500).allow(''),
      isActive: Joi.boolean(),
      sortOrder: Joi.number().integer(),
    }),
  },

  updateCategory: {
    params: Joi.object({ id: objectId.required() }),
    body: Joi.object({
      name: Joi.string().trim().max(100),
      description: Joi.string().trim().max(500).allow(''),
      isActive: Joi.boolean(),
      sortOrder: Joi.number().integer(),
    }).min(1),
  },

  getCategory: {
    params: Joi.object({ identifier: Joi.string().required() }),
  },

  deleteCategory: {
    params: Joi.object({ id: objectId.required() }),
  },
};

module.exports = categoryValidation;
