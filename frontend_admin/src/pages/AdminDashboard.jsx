import { useEffect, useState } from 'react'
import axiosClient from '../api/axiosClient.js'

function AdminDashboard(){
  const [apiStatus, setApiStatus] = useState('Checking...')

  useEffect(() => {
    const check = async () => {
      try {
        const res = await axiosClient.get('/')
        setApiStatus(res.data || 'OK')
      } catch (e) {
        setApiStatus('Backend unreachable')
      }
    }
    check()
  }, [])

  return (
    <div>
      <h2 style={{fontWeight:700}}>Dashboard</h2>
      <div style={{marginTop:12, padding:12, border:'1px solid #222', borderRadius:12}}>
        <div>Backend status: <span style={{color:'#38f8a5'}}>{String(apiStatus)}</span></div>
      </div>
      <ul style={{marginTop:16, lineHeight:1.9}}>
        <li>Manage problems (create, update, delete)</li>
        <li>Review users and roles</li>
        <li>Monitor submissions</li>
        <li>Inspect backend endpoints</li>
      </ul>
    </div>
  )
}

export default AdminDashboard


