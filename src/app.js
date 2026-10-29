const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');

const { config, swaggerSpec } = require('./config');
const { httpLogger, apiLimiter, errorConverter, errorHandler } = require('./middlewares');
const ApiError = require('./shared/utils/ApiError');
const apiRouter = require('./routes');

const app = express();

// ─── Security Headers ───────────────────────────
// Allow Swagger UI inline scripts & styles
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
  }),
);

// ─── CORS ───────────────────────────────────────
const allowedOrigins = config.cors.origin.includes(',')
  ? config.cors.origin.split(',').map((o) => o.trim())
  : [config.cors.origin];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Swagger UI) or matching origins
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin) || config.isDevelopment) {
        return callback(null, true);
      }
      return callback(new Error('Blocked by CORS policy'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-session-id'],
  }),
);

// ─── Body Parsing ───────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Cookie Parser ──────────────────────────────
app.use(cookieParser());

// ─── Data Sanitization ─────────────────────────
// Prevent NoSQL injection by stripping keys starting with $ or containing . (Express 5 safe)
app.use((req, _res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.params) mongoSanitize.sanitize(req.params);
  if (req.query) mongoSanitize.sanitize(req.query);
  next();
});

// ─── HTTP Parameter Pollution Protection ────────
app.use(hpp());

// ─── Gzip Compression ──────────────────────────
app.use(compression());

// ─── HTTP Request Logging ───────────────────────
app.use(httpLogger);

// ─── Rate Limiting ──────────────────────────────
app.use('/api', apiLimiter);

// ─── API Routes ─────────────────────────────────
app.use('/api/v1', apiRouter);

// ─── API Documentation (Swagger) ────────────────
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'MRIWL API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
  }),
);

app.get('/api-docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Root redirect to Swagger UI
app.get('/', (_req, res) => {
  res.redirect('/api-docs');
});

// ─── Health Check ───────────────────────────────
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.env,
  });
});

// ─── 404 Handler ────────────────────────────────
app.use((_req, _res, next) => {
  next(ApiError.notFound('Route not found'));
});

// ─── Error Handling Pipeline ────────────────────
app.use(errorConverter);
app.use(errorHandler);

module.exports = app;
