const ApiError = require('../shared/utils/ApiError');

/**
 * Creates a validation middleware from a Joi schema.
 * Validates req.body, req.query, and/or req.params.
 *
 * Usage:
 *   const schema = { body: Joi.object({ email: Joi.string().email().required() }) };
 *   router.post('/register', validate(schema), controller);
 *
 * @param {Object} schema - Object with optional `body`, `query`, `params` Joi schemas
 * @returns {Function} Express middleware
 */
const validate = (schema) => (req, _res, next) => {
  const validationErrors = [];

  ['params', 'query', 'body'].forEach((source) => {
    if (schema[source]) {
      const { error, value } = schema[source].validate(req[source], {
        abortEarly: false,
        allowUnknown: false,
        stripUnknown: true,
      });

      if (error) {
        const errors = error.details.map((detail) => ({
          field: detail.path.join('.'),
          message: detail.message.replace(/"/g, ''),
        }));
        validationErrors.push(...errors);
      } else {
        // Replace with sanitized values
        req[source] = value;
      }
    }
  });

  if (validationErrors.length > 0) {
    return next(ApiError.badRequest('Validation failed', validationErrors));
  }

  next();
};

module.exports = validate;
