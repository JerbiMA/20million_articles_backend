const morgan = require('morgan');
const { logger } = require('../config');

/**
 * HTTP request logger using Morgan, piped through Winston.
 * - Development: concise colored output
 * - Production: structured Apache-combined format
 */
const stream = {
  write: (message) => logger.http(message.trim()),
};

const skip = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'test';
};

const httpLogger =
  process.env.NODE_ENV === 'production'
    ? morgan('combined', { stream, skip })
    : morgan('dev', { stream, skip });

module.exports = httpLogger;
