import { useSelector } from 'react-redux'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

function RequireAuth(){
  const { isAuthenticated, loading } = useSelector((s)=>s.auth)
  const location = useLocation()
  
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin"></div>
          <div className="text-white/60 text-sm">Loading...</div>
        </div>
      </div>
    )
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  
  return <Outlet />
}

export default RequireAuth
