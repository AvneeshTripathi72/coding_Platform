import express from 'express'
import { createUser, deleteUser, getAllUsers, getUserById, removeUserSubscription, toggleSubscriptionLock, updateUser, updateUserSubscription } from '../controllers/userManagement.js'
import adminMiddleware from '../middleware/adminMiddleware.js'

const userManagementRouter = express.Router()

userManagementRouter.get('/test', (req, res) => {
  res.json({ message: 'User management router is working', timestamp: new Date().toISOString() })
})

userManagementRouter.get('/all', adminMiddleware, getAllUsers)
userManagementRouter.post('/create', adminMiddleware, createUser)
// Subscription routes (more specific, should come before generic /:id route)
userManagementRouter.patch('/:id/subscription/lock', adminMiddleware, toggleSubscriptionLock)
userManagementRouter.patch('/:id/subscription', adminMiddleware, updateUserSubscription)
// DELETE subscription route - must be before GET /:id to avoid route conflicts
userManagementRouter.delete('/:id/subscription', adminMiddleware, async (req, res, next) => {
  console.log('DELETE subscription route matched:', req.params.id, req.path, req.method)
  return removeUserSubscription(req, res, next)
})
// Generic user routes
userManagementRouter.get('/:id', adminMiddleware, getUserById)
userManagementRouter.patch('/update/:id', adminMiddleware, updateUser)
userManagementRouter.delete('/delete/:id', adminMiddleware, deleteUser)

export default userManagementRouter
