import express from 'express'
import { userMiddleware } from '../middleware/userMiddleware.js'
import User from '../models/user.js'

const leaderboardRouter = express.Router()

leaderboardRouter.get('/top', userMiddleware, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100)
    const users = await User.aggregate([
      { $addFields: { solvedCount: { $size: { $ifNull: ['$problemsSolved', []] } } } },
      { $sort: { solvedCount: -1, createdAt: 1 } },
      { $limit: limit },
      { $project: { firstName: 1, solvedCount: 1 } }
    ])
    res.status(200).json({ users })
  } catch (err) {
    res.status(500).json({ message: 'Error fetching leaderboard: ' + err.message })
  }
})

export default leaderboardRouter


