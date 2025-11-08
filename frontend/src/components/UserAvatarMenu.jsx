import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { NavLink, useNavigate } from 'react-router-dom'
import { logoutUser } from '../authslice.js'

function UserAvatarMenu(){
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((s)=>s.auth)
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    window.addEventListener('click', onClick)
    return () => window.removeEventListener('click', onClick)
  }, [])

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap()
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
      // Navigate anyway even if logout fails
      navigate('/login')
    }
  }

  // Get user display name - prioritize firstName, then name, fallback to email or 'User'
  const getUserDisplayName = () => {
    if (user?.firstName) return user.firstName;
    if (user?.name) return user.name;
    if (user?.emailId) return user.emailId.split('@')[0]; // Use email prefix as fallback
    return 'User';
  };

  const displayName = getUserDisplayName();
  const initial = displayName[0]?.toUpperCase() || 'U';

  return (
    <div className="relative" ref={ref}>
      <button onClick={()=>setOpen(v=>!v)} className="flex items-center gap-2 text-sm text-white/80">
        {/* User Initial Avatar */}
        <span className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 border border-white/15 flex items-center justify-center text-sm font-bold text-black">
          {initial}
        </span>
        <span className="hidden sm:block text-emerald-400 font-semibold">{displayName}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 rounded-xl border border-white/10 bg-black p-2 text-sm shadow-xl z-50">
          <div className="px-3 py-2 text-white/60">Signed in as <span className="text-white">{displayName}</span></div>
          <NavLink 
            to="/profile" 
            onClick={() => setOpen(false)}
            className="block px-3 py-2 rounded-lg hover:bg-white/5"
          >
            Profile
          </NavLink>
          <NavLink 
            to="/settings" 
            onClick={() => setOpen(false)}
            className="block px-3 py-2 rounded-lg hover:bg-white/5"
          >
            Settings
          </NavLink>
          <NavLink 
            to="/algo-visualization" 
            onClick={() => setOpen(false)}
            className="block px-3 py-2 rounded-lg hover:bg-white/5"
          >
            Algo Visualization
          </NavLink>
          <div className="h-px my-1 bg-white/10" />
          <button 
            onClick={handleLogout} 
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 text-rose-300"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  )
}

export default UserAvatarMenu
