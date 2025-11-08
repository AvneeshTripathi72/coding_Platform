import { BookOpen, Calendar, Code2, TrendingUp, Trophy, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import api from '../utils/api.js'

function Landing(){
  const [topics, setTopics] = useState([])
  const [stats, setStats] = useState({ totalProblems: 0, solvedCount: 0, acceptanceAvg: 0 })
  const [preview, setPreview] = useState([])
  const [solvedProblems, setSolvedProblems] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      try{
        const [{ data: t }, { data: s }, { data: p }, { data: solvedData }] = await Promise.all([
          api.problems.topics(),
          api.stats.overview(),
          api.problems.list({ page: 1, limit: 8 }),
          api.problems.solvedMine().catch(()=>({data:{problemsSolved:[]}}))
        ])
        setTopics(Array.isArray(t.topics) ? t.topics.slice(0, 12) : [])
        setStats(s || {})
        setPreview(Array.isArray(p.items) ? p.items : (Array.isArray(p.problems)? p.problems: []))
        setSolvedProblems(Array.isArray(solvedData?.problemsSolved) ? solvedData.problemsSolved : [])
      }catch(err){
        console.error('Error loading data:', err)
      }
    }
    load()
  }, [])

  const getDifficultyColor = (diff) => {
    if (!diff) return 'text-white/60'
    const d = diff.toLowerCase()
    if (d === 'easy') return 'text-emerald-400'
    if (d === 'medium') return 'text-amber-400'
    if (d === 'hard') return 'text-rose-400'
    return 'text-white/60'
  }

  const capitalizeFirst = (str) => {
    if (!str) return ''
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  }

  return (
    <div className="text-white space-y-4">
      {/* Hero Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 rounded-2xl bg-gradient-to-br from-amber-500/20 via-orange-500/20 to-pink-500/20 border border-white/10 p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-6 h-6 text-amber-400" />
              <span className="text-amber-400 font-semibold">30 Days Challenge</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">Master Coding Skills</h2>
            <p className="text-white/70 text-sm mb-4">Beginner-friendly daily challenges to build your coding foundation</p>
            <NavLink to="/problems" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black font-semibold hover:opacity-90 transition">
              <Zap className="w-4 h-4" />
              Start Learning
            </NavLink>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-blue-500/20 via-cyan-500/20 to-indigo-500/20 border border-white/10 p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-6 h-6 text-blue-400" />
              <span className="text-blue-400 font-semibold">Interview Prep</span>
            </div>
            <h3 className="text-lg font-bold mb-2">Top Interview Questions</h3>
            <p className="text-white/70 text-xs mb-4">Curated problems from top tech companies</p>
            <NavLink to="/problems" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white font-medium hover:bg-white/20 transition text-sm">
              Get Started
            </NavLink>
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TotalProblemsCard value={stats.totalProblems} />
        <SolvedCard value={stats.solvedCount} solvedProblems={solvedProblems} />
        <AcceptanceCard value={`${stats.acceptanceAvg || 0}%`} />
      </div>

      {/* Topic Tags */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Popular Topics
          </h3>
          <NavLink to="/problems" className="text-sm text-white/60 hover:text-white transition">View all →</NavLink>
        </div>
        <div className="flex flex-wrap gap-2">
          {topics.map((t)=> (
            <button
              key={t.topic}
              onClick={() => navigate(`/problems?tag=${t.topic.toLowerCase()}`)}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition text-sm flex items-center gap-2"
            >
              <span>{capitalizeFirst(t.topic)}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Problems */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <Code2 className="w-4 h-4" />
            Featured Problems
          </h3>
          <NavLink to="/problems" className="text-sm text-white/60 hover:text-white transition">See all →</NavLink>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {preview.map((p, i) => (
            <div
              key={p._id}
              onClick={() => navigate(`/problem/${p._id}`)}
              className="group rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition p-4 cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-white/40 text-sm">#{i + 1}</span>
                  <h4 className="font-semibold group-hover:text-emerald-400 transition">{p.title}</h4>
                </div>
                {p.acceptanceRate && (
                  <span className="text-xs text-white/60">{p.acceptanceRate.toFixed(1)}%</span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-3">
                <span className={`text-xs font-medium ${getDifficultyColor(p.difficulty)}`}>
                  {p.difficulty || 'N/A'}
                </span>
                {p.tags && p.tags.length > 0 && (
                  <div className="flex gap-1.5">
                    {p.tags.slice(0, 2).map((tag, idx) => (
                      <span key={idx} className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        {preview.length === 0 && (
          <div className="text-center py-12 text-white/60">
            <Code2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No problems available yet</p>
          </div>
        )}
      </section>
    </div>
  )
}

function TotalProblemsCard({ value }){
  return (
    <div className="rounded-xl border border-white/10 bg-black/40 p-4 hover:bg-black/60 transition relative overflow-hidden group">
      {/* Blue Code Icon - Top Left with glow effect */}
      <div className="absolute top-3 left-3">
        <div className="relative">
          <div className="absolute inset-0 w-8 h-8 rounded-lg bg-blue-400/20 blur-sm group-hover:bg-blue-400/30 transition"></div>
          <Code2 className="relative w-8 h-8 text-blue-400" />
        </div>
      </div>
      
      {/* Content */}
      <div className="mt-10">
        <div className="text-xs text-white/70 mb-2 font-medium">Total Problems</div>
        <div className="text-4xl font-bold text-white tracking-tight">{value}</div>
      </div>
    </div>
  )
}

function SolvedCard({ value, solvedProblems = [] }){
  // Calculate solved by difficulty
  const solvedByDifficulty = {
    easy: solvedProblems.filter(p => p.difficulty?.toLowerCase() === 'easy').length,
    medium: solvedProblems.filter(p => p.difficulty?.toLowerCase() === 'medium').length,
    hard: solvedProblems.filter(p => p.difficulty?.toLowerCase() === 'hard').length,
  }

  return (
    <div className="rounded-xl border border-white/10 bg-black/40 p-4 hover:bg-black/60 transition relative overflow-hidden group">
      {/* Green Target Icon - Top Left with glow effect */}
      <div className="absolute top-3 left-3">
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute inset-0 w-8 h-8 rounded-full bg-emerald-400/20 blur-sm group-hover:bg-emerald-400/30 transition"></div>
          {/* Outer ring */}
          <div className="relative w-8 h-8 rounded-full border-2 border-emerald-400"></div>
          {/* Middle ring */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 border-emerald-400"></div>
          {/* Inner dot */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50"></div>
        </div>
      </div>
      
      {/* Content */}
      <div className="mt-10">
        <div className="text-xs text-white/70 mb-2 font-medium">Solved</div>
        <div className="text-4xl font-bold text-white tracking-tight mb-2">{value}</div>
        {solvedProblems.length > 0 && (
          <div className="flex gap-2 text-xs mt-2">
            <span className="text-emerald-400">Easy: {solvedByDifficulty.easy}</span>
            <span className="text-amber-400">Medium: {solvedByDifficulty.medium}</span>
            <span className="text-rose-400">Hard: {solvedByDifficulty.hard}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function AcceptanceCard({ value }){
  return (
    <div className="rounded-xl border border-white/10 bg-black/40 p-4 hover:bg-black/60 transition relative overflow-hidden group">
      {/* Amber TrendingUp Icon - Top Left with glow effect */}
      <div className="absolute top-3 left-3">
        <div className="relative">
          <div className="absolute inset-0 w-8 h-8 rounded-lg bg-amber-400/20 blur-sm group-hover:bg-amber-400/30 transition"></div>
          <TrendingUp className="relative w-8 h-8 text-amber-400" />
        </div>
      </div>
      
      {/* Content */}
      <div className="mt-10">
        <div className="text-xs text-white/70 mb-2 font-medium">Acceptance</div>
        <div className="text-4xl font-bold text-white tracking-tight">{value}</div>
      </div>
    </div>
  )
}


export default Landing


