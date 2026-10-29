const Joi = require('joi');

/**
 * Joi validation schemas for User endpoints.
 * Used with the validate() middleware.
 */
const userValidation = {
  getUsers: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(20),
      sort: Joi.string().valid('createdAt', '-createdAt', 'name', '-name', 'email', '-email'),
      role: Joi.string().valid('user', 'admin'),
      search: Joi.string().max(100).trim(),
    }),
  },

  getUser: {
    params: Joi.object({
      id: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({ 'string.pattern.base': 'Invalid user ID format' }),
    }),
  },

  updateUser: {
    params: Joi.object({
      id: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({ 'string.pattern.base': 'Invalid user ID format' }),
    }),
    body: Joi.object({
      name: Joi.string().trim().min(2).max(50),
      email: Joi.string().email().lowercase().trim(),
    }).min(1), // At least one field must be provided
  },

  deleteUser: {
    params: Joi.object({
      id: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({ 'string.pattern.base': 'Invalid user ID format' }),
    }),
  },
};

module.exports = userValidation;
