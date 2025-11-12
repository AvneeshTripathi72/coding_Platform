import express from 'express'
import { githubAuth, githubCallback, googleAuth, googleCallback } from '../controllers/oauthController.js'
import { adminRegister, deleteUserProfile, getUserProfile, login, logout, register } from '../controllers/userAuthent.js'
import adminMiddleware from '../middleware/adminMiddleware.js'
import { userMiddleware } from '../middleware/userMiddleware.js'
const authRouter = express.Router()

// Health check endpoint
authRouter.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Auth routes are working' });
});

authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.post('/logout', userMiddleware, logout)

authRouter.get('/profile', userMiddleware, getUserProfile)
authRouter.delete("/profile/delete", userMiddleware, deleteUserProfile)
authRouter.post("/admin/register",adminMiddleware,adminRegister);

authRouter.get('/checkAuth', userMiddleware, getUserProfile)

// OAuth routes
authRouter.get('/google', googleAuth)
authRouter.get('/google/callback', googleCallback)
authRouter.get('/github', githubAuth)
authRouter.get('/github/callback', githubCallback)

export default authRouter
