const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');

// Load .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/**
 * Validate and parse all environment variables at boot time.
 * The app will refuse to start if any required variable is missing or invalid.
 */
const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(5000),

  // Database
  MONGO_URI: Joi.string().required().description('MongoDB connection URI'),

  // JWT
  JWT_ACCESS_SECRET: Joi.string().required().min(32).description('JWT access token secret'),
  JWT_REFRESH_SECRET: Joi.string().required().min(32).description('JWT refresh token secret'),
  JWT_ACCESS_EXPIRATION: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRATION: Joi.string().default('7d'),

  // CORS
  CORS_ORIGIN: Joi.string().default('http://localhost:3000'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: Joi.number().default(900000),
  RATE_LIMIT_MAX_REQUESTS: Joi.number().default(100),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: Joi.string().default('dev_cloud_name'),
  CLOUDINARY_API_KEY: Joi.string().default('dev_api_key'),
  CLOUDINARY_API_SECRET: Joi.string().default('dev_api_secret'),

  // Shipping
  SHIPPING_FLAT_RATE: Joi.number().default(0),

  // Logging
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'http', 'debug')
    .default('info'),
})
  .unknown(true); // Allow other env vars (PATH, etc.)

const { error, value: envVars } = envSchema.validate(process.env, {
  abortEarly: false,
  stripUnknown: false,
});

if (error) {
  const messages = error.details.map((d) => `  • ${d.message}`).join('\n');
  throw new Error(`\n❌ Environment validation failed:\n${messages}\n`);
}

const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  isProduction: envVars.NODE_ENV === 'production',
  isDevelopment: envVars.NODE_ENV === 'development',
  isTest: envVars.NODE_ENV === 'test',

  mongo: {
    uri: envVars.MONGO_URI,
  },

  jwt: {
    accessSecret: envVars.JWT_ACCESS_SECRET,
    refreshSecret: envVars.JWT_REFRESH_SECRET,
    accessExpiration: envVars.JWT_ACCESS_EXPIRATION,
    refreshExpiration: envVars.JWT_REFRESH_EXPIRATION,
  },

  cors: {
    origin: envVars.CORS_ORIGIN,
  },

  rateLimit: {
    windowMs: envVars.RATE_LIMIT_WINDOW_MS,
    max: envVars.RATE_LIMIT_MAX_REQUESTS,
  },

  cloudinary: {
    cloudName: envVars.CLOUDINARY_CLOUD_NAME,
    apiKey: envVars.CLOUDINARY_API_KEY,
    apiSecret: envVars.CLOUDINARY_API_SECRET,
  },

  shipping: {
    flatRate: envVars.SHIPPING_FLAT_RATE,
  },

  log: {
    level: envVars.LOG_LEVEL,
  },
};

module.exports = config;
