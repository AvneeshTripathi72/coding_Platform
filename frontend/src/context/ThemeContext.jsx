import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const ThemeContext = createContext({ mode: 'dark', toggle: () => {} })

export function ThemeProvider({ children }){
  const [mode, setMode] = useState(() => localStorage.getItem('theme') || 'dark')

  useEffect(() => {
    localStorage.setItem('theme', mode)
    const el = document.documentElement
    if (mode === 'light') el.classList.add('light')
    else el.classList.remove('light')
  }, [mode])

  const api = useMemo(() => ({
    mode,
    toggle: () => setMode((m) => (m === 'dark' ? 'light' : 'dark')),
    set: (m) => setMode(m),
  }), [mode])

  return <ThemeContext.Provider value={api}>{children}</ThemeContext.Provider>
}

export function useTheme(){ return useContext(ThemeContext) }

export default ThemeContext


