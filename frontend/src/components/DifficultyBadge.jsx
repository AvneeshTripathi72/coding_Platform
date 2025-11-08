function DifficultyBadge({ level }){
  const l = (level||'').toLowerCase()
  const cls = l==='easy' ? 'text-emerald-300' : l==='medium' ? 'text-amber-300' : l==='hard' ? 'text-rose-300' : 'text-white/70'
  return <span className={`text-sm ${cls}`}>{level}</span>
}

export default DifficultyBadge
