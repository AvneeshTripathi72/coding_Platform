import Problem from '../models/problem.js'
import Submission from '../models/submission.js'
import User from '../models/user.js'

export async function getOverviewStats(req, res){
  try{
    const userId = req.user._id
    const [totalProblems, userSubs, user] = await Promise.all([
      Problem.countDocuments({}),
      Submission.find({ userId }).select('status createdAt').limit(500),
      User.findById(userId).select('problemsSolved')
    ])
    const solved = Array.isArray(user?.problemsSolved) ? user.problemsSolved.length : 0
    const total = userSubs.length || 1
    const accepted = userSubs.filter(s=>s.status==='accepted').length
    const acceptanceAvg = Math.round((accepted/total)*100)
    res.json({ totalProblems, solvedCount: solved, acceptanceAvg })
  }catch(err){
    res.status(500).json({ message: 'Error getting stats: ' + err.message })
  }
}

export async function getUserStreak(req, res){
  try{
    const userId = req.user._id
    const subs = await Submission.find({ userId }).select('createdAt status').sort({ createdAt: -1 }).limit(1000)
    const days = new Set(subs.map(s=> new Date(s.createdAt).toISOString().slice(0,10)))
    let streak = 0
    let d = new Date()
    for(;;){
      const dayStr = d.toISOString().slice(0,10)
      if(days.has(dayStr)) { streak++; d.setDate(d.getDate()-1); }
      else break
    }
    res.json({ streakDays: streak })
  }catch(err){
    res.status(500).json({ message: 'Error getting streak: ' + err.message })
  }
}
