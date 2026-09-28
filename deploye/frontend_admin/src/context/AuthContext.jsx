import { createContext, useContext, useEffect, useState } from 'react'
import axiosClient from '../api/axiosClient.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }){
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axiosClient.get('/auth/profile')
        const userData = data?.user || data || null

        if (userData && userData.role === 'admin') {
          setUser(userData)
        } else {
          setUser(null)

          if (userData) {
            try {
              await axiosClient.post('/auth/logout')
            } catch {}
          }
        }
      } catch { 
        setUser(null) 
      }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const login = async (emailId, password) => {
    const response = await axiosClient.post('/auth/login', { emailId, password })
    const { data } = await axiosClient.get('/auth/profile')
    const userData = data?.user || data || null
    
    if (userData && userData.role === 'admin') {
      setUser(userData)
    } else {
      setUser(null)

      if (userData) {
        try {
          await axiosClient.post('/auth/logout')
        } catch {}
      }
      throw new Error('Access denied. Only administrators can access this panel.')
    }
    
    return response
  }

  const logout = async () => {
    try { await axiosClient.post('/auth/logout') } catch {}
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(){ return useContext(AuthContext) }

export default AuthContext
