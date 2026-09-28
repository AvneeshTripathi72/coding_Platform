import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../utils/api.js'

function ProblemList(){
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [difficulty, setDifficulty] = useState('all')
  const [tag, setTag] = useState('')
  const [topics, setTopics] = useState([])
  const limit = 20
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const capitalizeFirst = (str) => {
    if (!str) return ''
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  }

  useEffect(() => {
    const loadTopics = async () => {
      try {
        const { data } = await api.problems.topics()
        setTopics(Array.isArray(data.topics) ? data.topics : [])
      } catch (e) {
        console.error('Failed to load topics:', e)
      }
    }
    loadTopics()
  }, [])

  useEffect(() => {
    const tagParam = searchParams.get('tag')
    if (tagParam) {
      setTag(tagParam)
    }
  }, [searchParams])

  const load = async () => {
    const params = { page, limit }
    if (search.trim()) params.search = search.trim()
    if (difficulty !== 'all') params.difficulty = difficulty
    if (tag && tag.trim()) params.tags = tag.trim()
    const { data } = await api.problems.list(params)
    setItems(Array.isArray(data.items) ? data.items : (Array.isArray(data.problems)? data.problems: []))
    setTotal(data.total || 0)
  }

  useEffect(()=>{ load() }, [page])

  useEffect(()=>{ setPage(1); load() }, [difficulty, tag])

  const onSearch = (e) => { e.preventDefault(); setPage(1); load() }

  const getDifficultyScore = (diff) => {
    if (!diff) return null
    const d = diff.toLowerCase()
    if (d === 'easy') return { score: 800, color: 'text-emerald-400' }
    if (d === 'medium') return { score: 1699, color: 'text-amber-400' }
    if (d === 'hard') return { score: 2400, color: 'text-rose-400' }
    return { score: 0, color: 'text-white/60' }
  }

  const getProgressBars = (acceptance) => {
    const bars = []
    const level = Math.min(10, Math.floor((acceptance || 0) / 10))
    for (let i = 0; i < 10; i++) {
      bars.push(
        <div
          key={i}
          className={`h-3 w-1 ${i < level ? 'bg-white/60' : 'bg-white/10'}`}
        />
      )
    }
    return bars
  }

  return (
    <div>
      <h2 className="text-base font-semibold mb-3">Problems</h2>
      <form onSubmit={onSearch} className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-2">
        <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search title..." className="bg-black border border-white/15 rounded px-3 py-2" />
        <select value={difficulty} onChange={(e)=>setDifficulty(e.target.value)} className="bg-black border border-white/15 rounded px-3 py-2">
          <option value="all">All Difficulty</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <select value={tag} onChange={(e)=>setTag(e.target.value)} className="bg-black border border-white/15 rounded px-3 py-2">
          <option value="">All Topics</option>
          {topics.map(t=> (
            <option key={t.topic} value={t.topic.toLowerCase()}>
              {capitalizeFirst(t.topic)}
            </option>
          ))}
        </select>
      </form>

      <div className="mt-4 rounded-2xl border border-white/10 overflow-hidden bg-black/40">
        {items.map((p, i) => {
          const problemNum = (page - 1) * limit + i + 1
          const diffScore = getDifficultyScore(p.difficulty)
          const acceptance = p.acceptanceRate || 0
          return (
            <div
              key={p._id || i}
              className="flex items-center gap-4 px-4 py-3 border-b border-white/10 hover:bg-white/5 cursor-pointer transition"
              onClick={()=>navigate(`/problem/${p._id}`)}
            >
              {}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white/60 text-sm">{problemNum}.</span>
                  <span className="text-white hover:underline">{p.title}</span>
                </div>
              </div>

              {}
              <div className="text-white text-sm whitespace-nowrap">
                {acceptance.toFixed(1)}%
              </div>

              {}
              {diffScore && (
                <div className={`text-sm font-medium whitespace-nowrap ${diffScore.color}`}>
                  {diffScore.score}
                </div>
              )}

              {}
              <div className="flex items-center gap-0.5">
                {getProgressBars(acceptance)}
              </div>
            </div>
          )
        })}
        {items.length === 0 && (
          <div className="px-4 py-8 text-white/60 text-sm text-center">No problems found.</div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-end gap-2">
        <button disabled={page===1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="px-3 py-1.5 border border-white/15 rounded-xl text-sm disabled:opacity-40">Prev</button>
        <span className="text-white/60 text-sm">Page {page}</span>
        <button disabled={page*limit>=total} onClick={()=>setPage(p=>p+1)} className="px-3 py-1.5 border border-white/15 rounded-xl text-sm disabled:opacity-40">Next</button>
      </div>
    </div>
  )
}

export default ProblemList
