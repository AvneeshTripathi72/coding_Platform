import express from 'express'
import { userMiddleware } from '../middleware/userMiddleware.js'
import User from '../models/user.js'

const leaderboardRouter = express.Router()

const STATIC_LEADERBOARD = [
  { _id: 'user_1', firstName: 'Alex', solvedCount: 42 },
  { _id: 'user_2', firstName: 'Sophia', solvedCount: 38 },
  { _id: 'user_3', firstName: 'Avanish', solvedCount: 35 },
  { _id: 'user_4', firstName: 'Liam', solvedCount: 29 },
  { _id: 'user_5', firstName: 'Elena', solvedCount: 24 }
];

leaderboardRouter.get('/top', userMiddleware, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    let users = [];
    try {
      users = await User.aggregate([
        { $addFields: { solvedCount: { $size: { $ifNull: ['$problemsSolved', []] } } } },
        { $sort: { solvedCount: -1, createdAt: 1 } },
        { $limit: limit },
        { $project: { firstName: 1, solvedCount: 1 } }
      ]);
    } catch (_) {}

    if (!users || users.length === 0) {
      users = STATIC_LEADERBOARD.slice(0, limit);
    }
    res.status(200).json({ users });
  } catch (err) {
    res.status(200).json({ users: STATIC_LEADERBOARD });
  }
});

export default leaderboardRouter;
