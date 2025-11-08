import express from 'express'
import { createUser, deleteUser, getAllUsers, getUserById, toggleSubscriptionLock, updateUser, updateUserSubscription } from '../controllers/userManagement.js'
import adminMiddleware from '../middleware/adminMiddleware.js'

const userManagementRouter = express.Router()

// Test route to verify router is working (no auth required for testing)
userManagementRouter.get('/test', (req, res) => {
  res.json({ message: 'User management router is working', timestamp: new Date().toISOString() })
})

// Specific routes must come before parameterized routes
userManagementRouter.get('/all', adminMiddleware, getAllUsers)
userManagementRouter.post('/create', adminMiddleware, createUser)
userManagementRouter.get('/:id', adminMiddleware, getUserById)
userManagementRouter.patch('/update/:id', adminMiddleware, updateUser)
userManagementRouter.delete('/delete/:id', adminMiddleware, deleteUser)
userManagementRouter.patch('/:id/subscription/lock', adminMiddleware, toggleSubscriptionLock)
userManagementRouter.patch('/:id/subscription', adminMiddleware, updateUserSubscription)

export default userManagementRouter

