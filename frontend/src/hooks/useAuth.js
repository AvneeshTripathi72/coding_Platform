import { useAuth as useCtx } from '../context/AuthContext.jsx'

export default function useAuth(){
  return useCtx()
}
