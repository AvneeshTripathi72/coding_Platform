import { useEffect, useState } from 'react'
import axiosClient from '../api/axiosClient.js'

function Submissions(){
  const [items, setItems] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axiosClient.get('/solve/submissions/user?limit=50')
        setItems(Array.isArray(data.submissions) ? data.submissions : [])
      } catch(e){
        setError('Require auth to view submissions')
      }
    }
    load()
  }, [])

  return (
    <div>
      <h2 style={{fontWeight:700}}>Submissions</h2>
      {error && <div style={{marginTop:12, color:'#f99'}}>{error}</div>}
      <div style={{marginTop:12, border:'1px solid #222', borderRadius:12, overflow:'hidden'}}>
        <div style={{display:'grid', gridTemplateColumns:'1fr 120px 120px 120px 200px', padding:'10px 12px', background:'#101114', color:'#bbb'}}>
          <div>Problem</div>
          <div>Language</div>
          <div>Status</div>
          <div>Passed</div>
          <div>Created</div>
        </div>
        {items.map((s, i) => (
          <div key={i} style={{display:'grid', gridTemplateColumns:'1fr 120px 120px 120px 200px', padding:'10px 12px', borderTop:'1px solid #222'}}>
            <div>{s.problemId?.title || s.problemId}</div>
            <div>{s.language}</div>
            <div style={{textTransform:'capitalize'}}>{s.status}</div>
            <div>{s.testcasePassed}/{s.totalTestcases}</div>
            <div>{new Date(s.createdAt).toLocaleString()}</div>
          </div>
        ))}
        {items.length === 0 && <div style={{padding:'16px', color:'#bbb'}}>No data.</div>}
      </div>
    </div>
  )
}

export default Submissions
