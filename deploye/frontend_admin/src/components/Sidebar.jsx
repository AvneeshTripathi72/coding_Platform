import { Plus } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'

function Sidebar(){
  const navigate = useNavigate()

  return (
    <aside className="w-64 shrink-0 h-screen border-r border-white/10 bg-black/40 flex flex-col">
      <div className="p-6 border-b border-white/10">
        <h1 className="font-black text-xl">Admin<span className="text-emerald-400">Panel</span></h1>
      </div>
      
      {}
      <div className="p-3 border-b border-white/10">
        <button
          onClick={() => navigate('/problems/create')}
          className="w-full px-3 py-2 rounded-lg bg-gray-700 text-white font-semibold hover:bg-gray-600 transition flex items-center justify-center gap-1.5 text-sm border border-gray-600"
        >
          <Plus className="w-4 h-4" />
          Create Problem
        </button>
      </div>

      <nav className="flex-1 p-3 text-sm text-white/75 space-y-1 overflow-y-auto">
        <NavLink to="/" end className={({isActive})=>`block px-3 py-2 rounded-lg transition ${isActive? 'bg-white/10 text-white font-medium':'hover:bg-white/5'}`}>Dashboard</NavLink>
        <NavLink to="/courses" className={({isActive})=>`block px-3 py-2 rounded-lg transition ${isActive? 'bg-white/10 text-white font-medium':'hover:bg-white/5'}`}>Courses</NavLink>
        <NavLink to="/users" className={({isActive})=>`block px-3 py-2 rounded-lg transition ${isActive? 'bg-white/10 text-white font-medium':'hover:bg-white/5'}`}>Users</NavLink>
        <NavLink to="/settings" className={({isActive})=>`block px-3 py-2 rounded-lg transition ${isActive? 'bg-white/10 text-white font-medium':'hover:bg-white/5'}`}>Settings</NavLink>
        <NavLink to="/endpoints" className={({isActive})=>`block px-3 py-2 rounded-lg transition ${isActive? 'bg-white/10 text-white font-medium':'hover:bg-white/5'}`}>Endpoints</NavLink>
        <NavLink to="/problems" className={({isActive})=>`block px-3 py-2 rounded-lg transition ${isActive? 'bg-white/10 text-white font-medium':'hover:bg-white/5'}`}>Problems</NavLink>
        <NavLink to="/contests" className={({isActive})=>`block px-3 py-2 rounded-lg transition ${isActive? 'bg-white/10 text-white font-medium':'hover:bg-white/5'}`}>Contests</NavLink>
        <NavLink to="/videos" className={({isActive})=>`block px-3 py-2 rounded-lg transition ${isActive? 'bg-white/10 text-white font-medium':'hover:bg-white/5'}`}>Videos</NavLink>
        <NavLink to="/submissions" className={({isActive})=>`block px-3 py-2 rounded-lg transition ${isActive? 'bg-white/10 text-white font-medium':'hover:bg-white/5'}`}>Submissions</NavLink>
        <NavLink to="/subscriptions" className={({isActive})=>`block px-3 py-2 rounded-lg transition ${isActive? 'bg-white/10 text-white font-medium':'hover:bg-white/5'}`}>Subscriptions</NavLink>
      </nav>
    </aside>
  )
}

export default Sidebar
