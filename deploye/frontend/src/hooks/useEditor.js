import { useEffect, useState } from 'react'

export default function useEditor(storageKey='editor'){ 
  const [language, setLanguage] = useState('cpp')
  const [code, setCode] = useState('')
  useEffect(()=>{
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '{}')
      if (saved.language) setLanguage(saved.language)
      if (saved.code) setCode(saved.code)
    } catch {}
  }, [storageKey])
  useEffect(()=>{
    localStorage.setItem(storageKey, JSON.stringify({ language, code }))
  }, [language, code, storageKey])
  return { language, setLanguage, code, setCode }
}
