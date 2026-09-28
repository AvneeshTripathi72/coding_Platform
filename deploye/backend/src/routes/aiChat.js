import express from 'express';
import aiChat from '../controllers/aiChatController.js';
import { optionalAuthMiddleware } from '../middleware/userMiddleware.js';

const aiChatRouter = express.Router();

aiChatRouter.get('/test', (req, res) => {
  res.json({ message: 'AI Chat router is working' });
});

aiChatRouter.post('/chat', optionalAuthMiddleware, aiChat);

export default aiChatRouter;
