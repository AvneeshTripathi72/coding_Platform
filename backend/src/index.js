import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
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
dotenv.config();
const app = express();
app.use(express.json());
app.use(cookieParser());
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:3000'];
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(null, true);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
};

app.use(cors(corsOptions));

app.use('/auth', userAuth);
app.use('/solve', submitRouter);
app.use('/problems', problemRouter);
app.use('/contests', contestRouter);
app.use('/leaderboard', leaderboardRouter);
app.use('/stats', statsRouter);
app.use('/users', userManagementRouter);
app.use('/ai', aiChatRouter);
app.use('/videos', videoRouter);
app.use('/payment', paymentRouter);

console.log('AI Chat router mounted at /ai');

console.log('Registered routes:');
console.log('  GET  /users/test - Test route');
console.log('  GET  /users/all - Get all users (admin)');
console.log('  POST /users/create - Create user (admin)');
console.log('  GET  /users/:id - Get user by ID (admin)');
console.log('  PATCH /users/update/:id - Update user (admin)');
console.log('  DELETE /users/delete/:id - Delete user (admin)');
console.log('  GET  /ai/test - AI Chat test route');
console.log('  POST /ai/chat - AI Chat endpoint');

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.get('/debug/routes', (req, res) => {
    const routes = [];
    app._router.stack.forEach((middleware) => {
        if (middleware.route) {
            routes.push({
                path: middleware.route.path,
                methods: Object.keys(middleware.route.methods)
            });
        } else if (middleware.name === 'router') {
            middleware.handle.stack.forEach((handler) => {
                if (handler.route) {
                    routes.push({
                        path: handler.route.path,
                        methods: Object.keys(handler.route.methods)
                    });
                }
            });
        }
    });
    res.json({ routes });
});

async function startServer() {
    try {
        await Promise.all([connectDB(), connectRedis()]);
        const PORT = process.env.PORT || 8080;
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

        console.log("Starting server...");
    } catch (error) {
        console.error("Error starting server:", error);
        process.exit(1);
    }
}

startServer();
