import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Global cache for MongoDB connection across serverless invocations.
 * In Vercel serverless environments, module scope persists between invocations within the same container.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.DB_URL || 'mongodb://127.0.0.1:27017/code_verse';

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 15000,
    };

    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      console.log('MongoDB connected successfully');
      return mongooseInstance;
    }).catch((err) => {
      console.warn('MongoDB connection failed, running in in-memory mode:', err.message);
      cached.promise = null;
      return null;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    return null;
  }
};

export default connectDB;
