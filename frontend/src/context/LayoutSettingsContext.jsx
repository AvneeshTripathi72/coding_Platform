import { createContext, useContext, useState } from 'react'

const LayoutSettingsContext = createContext({ 
  showLayoutSettings: false, 
  setShowLayoutSettings: () => {} 
})

export function LayoutSettingsProvider({ children }){
  const [showLayoutSettings, setShowLayoutSettings] = useState(false)

  return (
    <LayoutSettingsContext.Provider value={{ showLayoutSettings, setShowLayoutSettings }}>
      {children}
    </LayoutSettingsContext.Provider>
  )
}

export function useLayoutSettings(){ 
  return useContext(LayoutSettingsContext) 
}

export default LayoutSettingsContext


