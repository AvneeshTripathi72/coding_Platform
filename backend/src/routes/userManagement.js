import express from 'express'
import { createUser, deleteUser, getAllUsers, getUserById, toggleSubscriptionLock, updateUser, updateUserSubscription } from '../controllers/userManagement.js'
import adminMiddleware from '../middleware/adminMiddleware.js'

const userManagementRouter = express.Router()

userManagementRouter.get('/test', (req, res) => {
  res.json({ message: 'User management router is working', timestamp: new Date().toISOString() })
})

userManagementRouter.get('/all', adminMiddleware, getAllUsers)
userManagementRouter.post('/create', adminMiddleware, createUser)
userManagementRouter.get('/:id', adminMiddleware, getUserById)
userManagementRouter.patch('/update/:id', adminMiddleware, updateUser)
userManagementRouter.delete('/delete/:id', adminMiddleware, deleteUser)
userManagementRouter.patch('/:id/subscription/lock', adminMiddleware, toggleSubscriptionLock)
userManagementRouter.patch('/:id/subscription', adminMiddleware, updateUserSubscription)

export default userManagementRouter
