import express from 'express';
import aiChat from '../controllers/aiChatController.js';
import { userMiddleware } from '../middleware/userMiddleware.js';

const aiChatRouter = express.Router();

aiChatRouter.get('/test', (req, res) => {
  console.log('AI Chat test route hit');
  res.json({ message: 'AI Chat router is working' });
});

aiChatRouter.post('/chat', userMiddleware, aiChat);

export default aiChatRouter;
