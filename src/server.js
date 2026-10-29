const app = require('./app');
const { config, connectDB, logger } = require('./config');

const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  const server = app.listen(config.port, () => {
    logger.info(`🚀 Server running in ${config.env} mode on port ${config.port}`);
    logger.info(`📡 Health check: http://localhost:${config.port}/health`);
    logger.info(`📖 Swagger Docs: http://localhost:${config.port}/api-docs`);
    logger.info(`📚 API base:     http://localhost:${config.port}/api/v1`);
  });

  // ─── Graceful Shutdown ──────────────────────────
  const gracefulShutdown = (signal) => {
    logger.info(`\n${signal} received. Starting graceful shutdown...`);

    server.close(async () => {
      logger.info('HTTP server closed.');

      try {
        const mongoose = require('mongoose');
        await mongoose.connection.close();
        logger.info('MongoDB connection closed.');
      } catch (err) {
        logger.error('Error during MongoDB disconnect:', err);
      }

      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      logger.error('Graceful shutdown timed out. Forcing exit.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection:', reason);
    gracefulShutdown('UNHANDLED_REJECTION');
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    gracefulShutdown('UNCAUGHT_EXCEPTION');
  });
};

startServer();
