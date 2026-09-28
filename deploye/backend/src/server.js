import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/db.js';
import { connectRedis } from './config/redis.js';

dotenv.config();

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    try {
      await Promise.all([connectDB(), connectRedis()]);
    } catch (dbErr) {
      console.warn('DB/Redis connection warning, running in in-memory mode:', dbErr.message);
    }
    app.listen(PORT, () => {
      console.log(`🚀 CodeVerse Backend Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
  }
}

startServer();
