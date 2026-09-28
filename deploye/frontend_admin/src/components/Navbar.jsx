import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function Navbar(){
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="h-16 border-b border-white/10 bg-black/40 flex items-center justify-end px-6">
      <div className="flex items-center gap-3 text-sm">
        {user ? (
          <>
            <span className="text-white/70">Welcome, <span className="text-white font-medium">{user.firstName || user.name || 'Admin'}</span></span>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 border border-white/15 rounded-xl hover:bg-white/10 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <NavLink to="/login" className="px-3 py-1.5 border border-white/15 rounded-xl hover:bg-white/10 transition">
            Login
          </NavLink>
        )}
      </div>
    </header>
  )
}

export default Navbar
