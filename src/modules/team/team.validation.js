const Joi = require('joi');
const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({ 'string.pattern.base': 'Invalid ID format' });

const teamValidation = {
  createTeam: {
    body: Joi.object({
      name: Joi.string().trim().max(100).required(),
      type: Joi.string().valid('club', 'national').required(),
      league: Joi.string().trim().allow(''),
      country: Joi.string().trim().allow(''),
      isActive: Joi.boolean(),
    }),
  },

  updateTeam: {
    params: Joi.object({ id: objectId.required() }),
    body: Joi.object({
      name: Joi.string().trim().max(100),
      type: Joi.string().valid('club', 'national'),
      league: Joi.string().trim().allow(''),
      country: Joi.string().trim().allow(''),
      isActive: Joi.boolean(),
    }).min(1),
  },

  getTeam: {
    params: Joi.object({ identifier: Joi.string().required() }),
  },

  deleteTeam: {
    params: Joi.object({ id: objectId.required() }),
  },
};

module.exports = teamValidation;
