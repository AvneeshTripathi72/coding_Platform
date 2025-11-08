import express from 'express';
import aiChat from '../controllers/aiChatController.js';
import { userMiddleware } from '../middleware/userMiddleware.js';

const aiChatRouter = express.Router();

// Test route to verify the router is working
aiChatRouter.get('/test', (req, res) => {
  console.log('AI Chat test route hit');
  res.json({ message: 'AI Chat router is working' });
});

// AI chat endpoint
aiChatRouter.post('/chat', userMiddleware, aiChat);

export default aiChatRouter;

