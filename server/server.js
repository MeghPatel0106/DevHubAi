import app from './app.js';
import config from './config/default.js';
import connectDB from './config/db.js';

const PORT = config.port || 5001;

/**
 * Initialize database connection and start Express server
 */
const startServer = async () => {
  // 1. Establish MongoDB connection
  await connectDB();

  // 2. Start HTTP listener
  const server = app.listen(PORT, () => {
    console.log(`🚀 DevHub AI Backend Server running in [${config.nodeEnv}] mode on http://localhost:${PORT}`);
    console.log(`🩺 Health Check endpoint: http://localhost:${PORT}/api/health`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error(`❌ Unhandled Error: ${err.message}`);
    server.close(() => process.exit(1));
  });

  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received. Shutting down gracefully...');
    server.close(() => {
      console.log('💤 Process terminated.');
    });
  });
};

startServer();
