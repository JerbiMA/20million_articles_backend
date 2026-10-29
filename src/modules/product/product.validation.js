const Joi = require('joi');
const { SIZES } = require('../../shared/constants');
const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({ 'string.pattern.base': 'Invalid ID format' });

const sizeVariant = Joi.object({
  size: Joi.string().valid(...SIZES).required(),
  stock: Joi.number().integer().min(0).required(),
});

const productValidation = {
  getProducts: {
    query: Joi.object({
      page: Joi.number().integer().min(1),
      limit: Joi.number().integer().min(1).max(100),
      sort: Joi.string(),
      category: objectId,
      team: objectId,
      minPrice: Joi.number().min(0),
      maxPrice: Joi.number().min(0),
      size: Joi.string().valid(...SIZES),
      search: Joi.string().max(200).trim(),
      isFeatured: Joi.boolean(),
      isActive: Joi.boolean(),
      tag: Joi.string().trim(),
    }),
  },

  getProduct: {
    params: Joi.object({ identifier: Joi.string().required() }),
  },

  createProduct: {
    body: Joi.object({
      name: Joi.string().trim().max(200).required(),
      description: Joi.string().trim().max(2000).allow(''),
      price: Joi.number().min(0).required(),
      salePrice: Joi.number().min(0).allow(null),
      category: objectId.required(),
      team: objectId.allow(null, ''),
      sizes: Joi.alternatives().try(
        Joi.array().items(sizeVariant).min(1),
        Joi.string(), // Accepts JSON string from multipart form
      ).required(),
      season: Joi.string().trim().allow(''),
      isFeatured: Joi.boolean(),
      isActive: Joi.boolean(),
      tags: Joi.alternatives().try(
        Joi.array().items(Joi.string().trim()),
        Joi.string(),
      ),
    }),
  },

  updateProduct: {
    params: Joi.object({ id: objectId.required() }),
    body: Joi.object({
      name: Joi.string().trim().max(200),
      description: Joi.string().trim().max(2000).allow(''),
      price: Joi.number().min(0),
      salePrice: Joi.number().min(0).allow(null),
      category: objectId,
      team: objectId.allow(null, ''),
      sizes: Joi.alternatives().try(
        Joi.array().items(sizeVariant).min(1),
        Joi.string(),
      ),
      season: Joi.string().trim().allow(''),
      isFeatured: Joi.boolean(),
      isActive: Joi.boolean(),
      tags: Joi.alternatives().try(
        Joi.array().items(Joi.string().trim()),
        Joi.string(),
      ),
    }).min(1),
  },

  updateStock: {
    params: Joi.object({ id: objectId.required() }),
    body: Joi.object({
      size: Joi.string().valid(...SIZES).required(),
      stock: Joi.number().integer().min(0).required(),
    }),
  },

  deleteProduct: {
    params: Joi.object({ id: objectId.required() }),
  },

  addImages: {
    params: Joi.object({ id: objectId.required() }),
  },

  removeImage: {
    params: Joi.object({
      id: objectId.required(),
      imageId: objectId.required(),
    }),
  },
};

module.exports = productValidation;
