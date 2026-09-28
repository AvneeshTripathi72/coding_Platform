import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/db.js';
import { connectRedis } from './config/redis.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`🚀 CodeVerse Backend Server running on http://localhost:${PORT}`);
});

connectDB().then(() => {
  console.log('MongoDB connection initialized');
}).catch((err) => {
  console.warn('DB initialization error (using in-memory fallback):', err.message);
});

connectRedis().catch((err) => {
  console.warn('Redis initialization error (using in-memory fallback):', err.message);
});
