import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import api from '../utils/api.js'

function Profile(){
  const { user } = useSelector((s)=>s.auth)
  const [stats, setStats] = useState({ totalProblems: 0, solvedCount: 0, acceptanceAvg: 0, streakDays: 0 })
  const [solved, setSolved] = useState([])
  const [subs, setSubs] = useState([])

  useEffect(() => {
    const load = async () => {
      try{
        const [overview, streak, solvedMine, submissions] = await Promise.all([
          api.stats.overview(),
          api.stats.streak(),
          api.problems.solvedMine(),
          api.submissions.mine({ limit: 200 })
        ])
        setStats({ ...(overview.data||{}), streakDays: (streak.data?.streakDays)||0 })
        setSolved(Array.isArray(solvedMine.data?.problemsSolved) ? solvedMine.data.problemsSolved : [])
        setSubs(Array.isArray(submissions.data?.submissions) ? submissions.data.submissions : [])
      }catch{}
    }
    load()
  }, [])

  const byDifficulty = useMemo(() => {
    const c = { easy:0, medium:0, hard:0 }
    solved.forEach(p => { const d=(p.difficulty||'').toLowerCase(); if(c[d]!=null) c[d]++ })
    return c
  }, [solved])

  const daysHeat = useMemo(() => {
    const map = new Map()
    subs.forEach(s => { const day=new Date(s.createdAt).toISOString().slice(0,10); map.set(day, (map.get(day)||0)+1) })
    const list = []
    for(let i=0;i<7*20;i++){ // ~20 weeks
      const d = new Date(); d.setDate(d.getDate()-i)
      const key = d.toISOString().slice(0,10)
      list.push({ day:key, count: map.get(key)||0 })
    }
    return list.reverse()
  }, [subs])

  return (
    <div className="text-white">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left card: profile */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 border border-white/15 flex items-center justify-center text-2xl font-bold text-black">
              {(user?.firstName || user?.name || 'U')[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <div className="font-bold">{user?.firstName || user?.name || 'User'}</div>
              <div className="text-white/60 text-sm">Role: {user?.role || 'user'}</div>
              <div className="text-emerald-300 text-sm">Rank {stats.solvedCount || 0}</div>
            </div>
          </div>
          <button className="mt-4 w-full px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-sm">Edit Profile</button>
        </div>

        {/* Center: rating / solved & difficulty */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Solved" value={stats.solvedCount} />
            <Stat label="Acceptance" value={`${stats.acceptanceAvg||0}%`} />
            <Stat label="Streak" value={`${stats.streakDays||0} days`} />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
            <BadgeBox label="Easy" value={byDifficulty.easy} color="text-emerald-300" />
            <BadgeBox label="Medium" value={byDifficulty.medium} color="text-amber-300" />
            <BadgeBox label="Hard" value={byDifficulty.hard} color="text-rose-300" />
          </div>
        </div>
      </div>

      {/* Activity heatmap */}
      <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-sm text-white/60">Submissions in the past weeks</div>
        <div className="mt-3 grid grid-cols-20 gap-1">
          {daysHeat.map((d,i)=> (
            <div key={i} className="w-3 h-3 rounded" style={{background: heatColor(d.count)}} />
          ))}
        </div>
      </div>

      {/* Settings removed as requested */}
    </div>
  )
}

function Stat({ label, value }){
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-3">
      <div className="text-white/60 text-sm">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  )
}

function BadgeBox({ label, value, color }){
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-3">
      <div className={`text-sm ${color}`}>{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  )
}

function heatColor(n){
  if(n>=8) return '#22c55e'
  if(n>=4) return '#86efac'
  if(n>=1) return '#bbf7d0'
  return '#0b0b0f'
}

export default Profile
