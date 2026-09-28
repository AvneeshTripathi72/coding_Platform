import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import passport from 'passport';

import connectDB from './config/db.js';
import { connectRedis } from './config/redis.js';

import aiChatRouter from './routes/aiChat.js';
import contestRouter from './routes/contest.js';
import leaderboardRouter from './routes/leaderboard.js';
import paymentRouter from './routes/payment.js';
import problemRouter from './routes/problemCreater.js';
import statsRouter from './routes/stats.js';
import submitRouter from './routes/submit.js';
import userAuth from './routes/userAuth.js';
import userManagementRouter from './routes/userManagement.js';
import videoRouter from './routes/video.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const app = express();

const isProduction = process.env.NODE_ENV === 'production';

// Non-blocking database connection middleware (seamless in-memory fallback)
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.warn('Database connection warning (running with in-memory fallback):', err.message);
  }
  next();
});

// Middleware
app.use(express.json());
app.use(cookieParser());

// Session configuration for OAuth
app.use(session({
  secret: process.env.SESSION_SECRET || process.env.JWT_SECRET || 'codeverse-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction,
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Dynamic CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
  process.env.ADMIN_FRONTEND_URL,
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim()) : [])
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    // Allow vercel preview deployments matching domain pattern
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(null, true); // Fallback allow in flexible environments
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range', 'Retry-After'],
};

app.use(cors(corsOptions));

// Health check endpoint
const healthHandler = (req, res) => {
  res.status(200).json({ 
    success: true, 
    status: 'ok', 
    message: 'Code Verse Serverless API is running...',
    timestamp: new Date().toISOString() 
  });
};

app.get('/', healthHandler);
app.get('/api', healthHandler);
app.get('/api/health', healthHandler);
app.get('/health', healthHandler);

// Helper function to mount routes with and without /api prefix
const mountRoutes = (prefix = '') => {
  app.use(`${prefix}/auth`, userAuth);
  app.use(`${prefix}/solve`, submitRouter);
  app.use(`${prefix}/problems`, problemRouter);
  app.use(`${prefix}/contests`, contestRouter);
  app.use(`${prefix}/leaderboard`, leaderboardRouter);
  app.use(`${prefix}/stats`, statsRouter);
  app.use(`${prefix}/users`, userManagementRouter);
  app.use(`${prefix}/ai`, aiChatRouter);
  app.use(`${prefix}/videos`, videoRouter);
  app.use(`${prefix}/payment`, paymentRouter);
};

// Mount both prefixed (/api/...) and non-prefixed (/...) routes
mountRoutes('/api');
mountRoutes('');

// Debug routes endpoint
app.get('/api/debug/routes', (req, res) => {
  const routes = [];
  const stack = app.router?.stack || app._router?.stack || [];
  stack.forEach((middleware) => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods || {})
      });
    } else if (middleware.name === 'router' && middleware.handle?.stack) {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          routes.push({
            path: handler.route.path,
            methods: Object.keys(handler.route.methods || {})
          });
        }
      });
    }
  });
  res.json({ total: routes.length, routes });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(isProduction ? {} : { stack: err.stack })
  });
});

export default app;
