import { NavLink } from 'react-router-dom'
import DifficultyBadge from './DifficultyBadge.jsx'

function ProblemCard({ problem }){
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white">
      <div className="flex items-center justify-between">
        <NavLink to={`/problem/${problem._id}`} className="font-medium hover:underline">{problem.title}</NavLink>
        <DifficultyBadge level={problem.difficulty} />
      </div>
      <div className="mt-2 text-xs text-white/60">{(problem.tags||[]).join(', ')}</div>
    </div>
  )
}

export default ProblemCard
