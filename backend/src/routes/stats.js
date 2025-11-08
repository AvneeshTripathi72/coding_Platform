import express from 'express'
import { userMiddleware } from '../middleware/userMiddleware.js'
import { getOverviewStats, getUserStreak } from '../controllers/statsController.js'

const statsRouter = express.Router()

statsRouter.get('/overview', userMiddleware, getOverviewStats)
statsRouter.get('/streak', userMiddleware, getUserStreak)

export default statsRouter


