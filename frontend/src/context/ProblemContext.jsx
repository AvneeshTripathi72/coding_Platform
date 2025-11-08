import { createContext, useContext, useState } from 'react'

const ProblemContext = createContext(null)

export function ProblemProvider({ children }){
  const [problem, setProblem] = useState(null)
  const [language, setLanguage] = useState('cpp')
  const [code, setCode] = useState('')
  return (
    <ProblemContext.Provider value={{ problem, setProblem, language, setLanguage, code, setCode }}>
      {children}
    </ProblemContext.Provider>
  )
}

export function useProblem(){ return useContext(ProblemContext) }

export default ProblemContext
