import mongoose from 'mongoose';
import config from './default.js';

const LOCAL_FALLBACK_URI = 'mongodb://127.0.0.1:27017/devhubai';

/**
 * Connect to MongoDB with automatic fallback to local MongoDB if Atlas cluster is unreachable
 */
const connectDB = async () => {
  const primaryUri = process.env.MONGODB_URI || config.mongoUri || LOCAL_FALLBACK_URI;

  // 1. Try primary connection URI
  try {
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 6000,
    });

    console.log(`🍃 MongoDB Connected: ${conn.connection.host} [Database: ${conn.connection.name}]`);
    return conn;
  } catch (error) {
    console.warn(`⚠️  Primary MongoDB connection failed (${primaryUri.includes('mongodb+srv') ? 'Atlas cluster' : primaryUri}): ${error.message}`);

    // If primary was an Atlas cluster and failed (e.g. IP whitelist / network issue), attempt fallback to local MongoDB
    if (primaryUri !== LOCAL_FALLBACK_URI) {
      console.log(`🔄 Attempting automatic fallback to local MongoDB (${LOCAL_FALLBACK_URI})...`);
      try {
        const localConn = await mongoose.connect(LOCAL_FALLBACK_URI, {
          serverSelectionTimeoutMS: 3000,
        });
        console.log(`🍃 Local MongoDB Connected: ${localConn.connection.host} [Database: ${localConn.connection.name}]`);
        return localConn;
      } catch (localError) {
        console.error(`❌ Local MongoDB Fallback Error: ${localError.message}`);
      }
    }

    if (error.name === 'MongooseServerSelectionError') {
      console.error('💡 Hint: Check your MongoDB Atlas IP Access List (Network Access 0.0.0.0/0) or ensure local MongoDB is running.');
    }
    return null;
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ MongoDB runtime error: ${err.message}`);
});

export default connectDB;

