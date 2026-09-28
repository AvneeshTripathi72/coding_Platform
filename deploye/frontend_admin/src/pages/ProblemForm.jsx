import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axiosClient from '../api/axiosClient.js'

function ProblemForm({ mode }){
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = mode === 'edit'

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [difficulty, setDifficulty] = useState('easy')
  const [tags, setTags] = useState('')
  const [visibleTestCases, setVisible] = useState('[]')
  const [hiddenTestCases, setHidden] = useState('[]')
  const [starterCode, setStarterCode] = useState('[]')
  const [constraints, setConstraints] = useState('[]')
  const [referenceSolutions, setReferenceSolutions] = useState('[]')
  const [acceptanceRate, setAcceptance] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      if (!isEdit || !id) return
      try {
        const { data } = await axiosClient.get(`/problems/problemById/${id}`)
        const p = data.problem || data
        setTitle(p.title || '')
        setDescription(p.description || '')
        setDifficulty((p.difficulty || 'easy').toLowerCase())
        setTags((p.tags || []).join(', '))
        setVisible(JSON.stringify(p.visibleTestCases || [], null, 2))
        setHidden(JSON.stringify(p.hiddenTestCases || [], null, 2))
        setStarterCode(JSON.stringify(p.starterCode || [], null, 2))
        setConstraints(JSON.stringify(p.constraints || [], null, 2))
        setReferenceSolutions(JSON.stringify(p.referenceSolutions || [], null, 2))
        setAcceptance(String(p.acceptanceRate ?? ''))
      } catch(e) {
        setError('Failed to load problem')
      }
    }
    load()
  }, [id, isEdit])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const payload = {
        title,
        description,
        difficulty,
        tags: tags.split(',').map(t=>t.trim()).filter(Boolean),
        visibleTestCases: JSON.parse(visibleTestCases || '[]'),
        hiddenTestCases: JSON.parse(hiddenTestCases || '[]'),
        starterCode: JSON.parse(starterCode || '[]'),
        constraints: JSON.parse(constraints || '[]'),
        referenceSolutions: JSON.parse(referenceSolutions || '[]'),
        acceptanceRate: acceptanceRate ? Number(acceptanceRate) : undefined,
      }
      if (isEdit) {
        await axiosClient.patch(`/problems/update/${id}`, payload)
      } else {
        await axiosClient.post(`/problems/create`, payload)
      }
      navigate('/problems')
    } catch (err) {
      setError('Save failed: ensure JSON is valid and you are authorized')
    }
  }

  const onDelete = async () => {
    if (!isEdit) return
    if (!confirm('Delete this problem?')) return
    try {
      await axiosClient.delete(`/problems/delete/${id}`)
      navigate('/problems')
    } catch (e) {
      setError('Delete failed')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">{isEdit ? 'Edit Problem' : 'New Problem'}</h2>
        {isEdit && <button onClick={onDelete} className="px-3 py-2 rounded-xl text-sm border border-white/15">Delete</button>}
      </div>
      {error && <div className="mt-3 text-red-400 text-sm">{error}</div>}
      <form onSubmit={submit} className="mt-4 grid gap-4">
        <div>
          <label className="text-sm">Title</label>
          <input className="w-full mt-1 bg-black border border-white/15 rounded px-3 py-2" value={title} onChange={(e)=>setTitle(e.target.value)} />
        </div>
        <div>
          <label className="text-sm">Description</label>
          <textarea rows={6} className="w-full mt-1 bg-black border border-white/15 rounded px-3 py-2" value={description} onChange={(e)=>setDescription(e.target.value)} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-sm">Difficulty</label>
            <select className="w-full mt-1 bg-black border border-white/15 rounded px-3 py-2" value={difficulty} onChange={(e)=>setDifficulty(e.target.value)}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm">Tags (comma-separated)</label>
            <input className="w-full mt-1 bg-black border border-white/15 rounded px-3 py-2" value={tags} onChange={(e)=>setTags(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-sm">Visible Testcases (JSON array)</label>
            <textarea rows={6} className="w-full mt-1 bg-black border border-white/15 rounded px-3 py-2 font-mono text-xs" value={visibleTestCases} onChange={(e)=>setVisible(e.target.value)} />
          </div>
          <div>
            <label className="text-sm">Hidden Testcases (JSON array)</label>
            <textarea rows={6} className="w-full mt-1 bg-black border border-white/15 rounded px-3 py-2 font-mono text-xs" value={hiddenTestCases} onChange={(e)=>setHidden(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-sm">Starter Code (JSON array)</label>
            <textarea rows={4} className="w-full mt-1 bg-black border border-white/15 rounded px-3 py-2 font-mono text-xs" value={starterCode} onChange={(e)=>setStarterCode(e.target.value)} />
          </div>
          <div>
            <label className="text-sm">Constraints (JSON array)</label>
            <textarea rows={4} className="w-full mt-1 bg-black border border-white/15 rounded px-3 py-2 font-mono text-xs" value={constraints} onChange={(e)=>setConstraints(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="text-sm">Reference Solutions (JSON array)</label>
          <textarea rows={4} className="w-full mt-1 bg-black border border-white/15 rounded px-3 py-2 font-mono text-xs" value={referenceSolutions} onChange={(e)=>setReferenceSolutions(e.target.value)} />
        </div>
        <div>
          <label className="text-sm">Acceptance Rate (optional)</label>
          <input className="w-full mt-1 bg-black border border-white/15 rounded px-3 py-2" value={acceptanceRate} onChange={(e)=>setAcceptance(e.target.value)} />
        </div>
        <div className="flex items-center justify-end gap-2">
          <button type="button" onClick={()=>navigate('/problems')} className="px-3 py-2 rounded-xl text-sm border border-white/15">Cancel</button>
          <button className="px-3 py-2 rounded-xl text-sm bg-white text-black">Save</button>
        </div>
      </form>
    </div>
  )
}

export default ProblemForm
