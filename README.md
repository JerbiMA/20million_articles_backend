# MRIWL Backend API

Production-ready MERN backend built with **Node.js**, **Express**, and **MongoDB**.

---

## Architecture

```
src/
├── config/              # Environment, DB, Logger configuration
│   ├── db.js            # MongoDB connection with retry & events
│   ├── env.js           # Joi-validated environment variables
│   ├── logger.js        # Winston structured logging
│   └── index.js         # Barrel export
│
├── middlewares/          # Express middleware layer
│   ├── auth.js          # JWT authentication + role authorization
│   ├── errorHandler.js  # Global error converter + handler
│   ├── httpLogger.js    # Morgan → Winston HTTP logging
│   ├── rateLimiter.js   # General + auth-specific rate limiters
│   ├── validate.js      # Joi request validation middleware
│   └── index.js
│
├── modules/             # Feature modules (domain-driven design)
│   └── user/            # Example module with full pattern
│       ├── user.model.js
│       ├── user.service.js
│       ├── user.controller.js
│       ├── user.routes.js
│       ├── user.validation.js
│       └── index.js
│
├── shared/              # Cross-cutting concerns
│   ├── constants/       # HTTP codes, roles, pagination defaults
│   └── utils/           # ApiError, ApiResponse, catchAsync, pick
│
├── scripts/             # DB seeding, migrations
│   └── seed.js
│
├── app.js               # Express app (middleware + routes)
├── server.js            # Entry point (boot + graceful shutdown)
└── routes.js            # Central API router
```

## Module Pattern

Each feature module follows the same 5-file pattern:

| File            | Responsibility                           |
|-----------------|------------------------------------------|
| `*.model.js`    | Mongoose schema, indexes, methods        |
| `*.service.js`  | Business logic, DB queries               |
| `*.controller.js` | HTTP layer (thin — delegates to service) |
| `*.validation.js`  | Joi schemas for request validation     |
| `*.routes.js`      | Express router with middleware chain   |

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env    # then edit as needed

# Development
npm run dev

# Seed database
npm run seed

# Run tests
npm test

# Production
npm start
```

## Security

- **Helmet** — HTTP security headers
- **CORS** — Configurable origin whitelist
- **Rate Limiting** — General API + stricter auth limits
- **mongo-sanitize** — NoSQL injection prevention
- **hpp** — HTTP parameter pollution protection
- **bcryptjs** — Password hashing (12 rounds)
- **JWT** — Access + refresh token authentication
- **Joi** — Input validation on every endpoint

## Scripts

| Command             | Description                            |
|---------------------|----------------------------------------|
| `npm run dev`       | Start dev server with hot-reload       |
| `npm start`         | Start production server                |
| `npm test`          | Run Jest test suite                    |
| `npm run test:coverage` | Run tests with coverage report    |
| `npm run lint`      | Lint source files                      |
| `npm run lint:fix`  | Auto-fix lint issues                   |
| `npm run format`    | Format with Prettier                   |
| `npm run seed`      | Seed the database                      |
| `npm run pm2:start` | Start with PM2 cluster mode            |
