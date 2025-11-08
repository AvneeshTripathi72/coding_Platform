import { createContext, useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser, logoutUser, checkAuth } from '../authslice.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }){
  const auth = useSelector((s)=>s.auth)
  const dispatch = useDispatch()
  const api = {
    ...auth,
    login: (payload) => dispatch(loginUser(payload)),
    logout: () => dispatch(logoutUser()),
    refresh: () => dispatch(checkAuth()),
  }
  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>
}

export function useAuth(){ return useContext(AuthContext) }

export default AuthContext
