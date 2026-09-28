import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/db.js';
import { connectRedis } from './config/redis.js';

dotenv.config();

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await Promise.all([connectDB(), connectRedis()]);
    app.listen(PORT, () => {
      console.log(`Local development server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error starting local development server:', error);
    process.exit(1);
  }
}

startServer();
