const Joi = require('joi');

const authValidation = {
  register: {
    body: Joi.object({
      name: Joi.string().trim().min(2).max(50).required(),
      email: Joi.string().email().lowercase().trim().required(),
      password: Joi.string().min(8).max(128).required()
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .messages({
          'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        }),
    }),
  },

  login: {
    body: Joi.object({
      email: Joi.string().email().lowercase().trim().required(),
      password: Joi.string().required(),
    }),
  },

  changePassword: {
    body: Joi.object({
      currentPassword: Joi.string().required(),
      newPassword: Joi.string().min(8).max(128).required()
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .messages({
          'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        }),
    }),
  },
};

module.exports = authValidation;
