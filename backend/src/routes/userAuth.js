import express from 'express'
import { adminRegister, deleteUserProfile, getUserProfile, login, logout, register } from '../controllers/userAuthent.js'
import adminMiddleware from '../middleware/adminMiddleware.js'
import { userMiddleware } from '../middleware/userMiddleware.js'
const authRouter = express.Router()

authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.post('/logout', userMiddleware, logout)

authRouter.get('/profile', userMiddleware, getUserProfile)
authRouter.delete("/profile/delete", userMiddleware, deleteUserProfile)
authRouter.post("/admin/register",adminMiddleware,adminRegister);

authRouter.get('/checkAuth', userMiddleware, getUserProfile)

export default authRouter
