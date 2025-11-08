import { LayoutGrid } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { useLayoutSettings } from '../context/LayoutSettingsContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import UserAvatarMenu from './UserAvatarMenu.jsx'

function Navbar(){
  const { mode, toggle } = useTheme()
  const { showLayoutSettings, setShowLayoutSettings } = useLayoutSettings()
  const location = useLocation()
  const isProblemPage = location.pathname.startsWith('/problem/')

  return (
    <header className="h-16 sticky top-0 z-40 backdrop-blur border-b border-white/10 bg-black/60">
      <div className="w-full px-8 h-full flex items-center justify-between text-white">
        <NavLink to="/" className="font-black text-xl">Code<span className="text-emerald-400">Arena</span></NavLink>
        <nav className="hidden md:flex items-center gap-8 text-base text-white/80">
          <NavLink to="/" end className={({isActive})=>isActive? 'text-white font-medium' : 'hover:text-white transition'}>Home</NavLink>
          <NavLink to="/problems" className={({isActive})=>isActive? 'text-white font-medium' : 'hover:text-white transition'}>Problems</NavLink>
          <NavLink to="/contests" className={({isActive})=>isActive? 'text-white font-medium' : 'hover:text-white transition'}>Contests</NavLink>
          <NavLink to="/algo-visualization" className={({isActive})=>isActive? 'text-white font-medium' : 'hover:text-white transition'}>Algo Visualization</NavLink>
        </nav>
        <div className="flex items-center gap-4">
          {isProblemPage && (
            <button
              onClick={() => setShowLayoutSettings(!showLayoutSettings)}
              className={`px-3 py-1.5 rounded text-sm font-medium flex items-center gap-1.5 transition-all ${
                showLayoutSettings 
                  ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400' 
                  : 'bg-white/10 hover:bg-white/20 border border-white/20'
              }`}
              title="Layout Settings"
              type="button"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          )}
          <button onClick={toggle} className="px-4 py-2 border border-white/15 rounded-xl text-sm font-medium">
            {mode === 'dark' ? 'Light' : 'Dark'}
          </button>
          <UserAvatarMenu />
        </div>
      </div>
    </header>
  )
}

export default Navbar
