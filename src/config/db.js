const mongoose = require('mongoose');
const logger = require('./logger');
const config = require('./env');

/**
 * Connect to MongoDB with retry logic and event listeners.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongo.uri, {
      // Modern Mongoose 7+ defaults are solid; these are explicit for clarity
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info(`✅ MongoDB connected: ${conn.connection.host}`);

    // Connection event listeners
    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Attempting reconnection...');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected.');
    });

    return conn;
  } catch (error) {
    logger.error(`❌ MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

/**
 * Gracefully close the MongoDB connection.
 */
const disconnectDB = async () => {
  try {
    mongoose.connection.removeAllListeners();
    await mongoose.connection.close();
    logger.info('MongoDB connection closed gracefully.');
  } catch (error) {
    logger.error(`Error closing MongoDB connection: ${error.message}`);
  }
};

module.exports = { connectDB, disconnectDB };
