import { Edit2, Eye, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosClient from '../api/axiosClient.js'
import TestCaseManager from '../components/TestCaseManager.jsx'
import VideoUpload from '../components/VideoUpload.jsx'

function Problems(){
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('create') // create | edit | view
  const [selectedProblem, setSelectedProblem] = useState(null)
  const [loading, setLoading] = useState(false)
  const limit = 20

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'easy',
    tags: '',
    starterCode: '[]',
    constraints: '[]',
    referenceSolutions: '[]',
    acceptanceRate: ''
  })
  const [visibleTestCases, setVisibleTestCases] = useState([])
  const [hiddenTestCases, setHiddenTestCases] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [tableMessage, setTableMessage] = useState('')

  const load = async () => {
    setLoading(true)
    setTableMessage('')
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('limit', String(limit))
    if (search.trim()) params.set('search', search.trim())
    try {
      const { data } = await axiosClient.get(`/problems/getAllProblems?${params.toString()}`)
      setItems(Array.isArray(data.items) ? data.items : [])
      setTotal(data.total || 0)
      if (data.items && data.items.length === 0) {
        setTableMessage('No problems found')
        setTimeout(() => setTableMessage(''), 3000)
      }
    } catch(e){
      console.error('Error loading problems:', e)
      setTableMessage(e.response?.data?.message || 'Failed to load problems')
      setItems([])
      setTotal(0)
      setTimeout(() => setTableMessage(''), 5000)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [page])

  const onSearch = (e) => {
    e.preventDefault()
    setPage(1)
    // Load will be triggered by the page change in useEffect
    setTimeout(() => load(), 0)
  }

  const capitalizeFirst = (str) => {
    if (!str) return ''
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  }

  const openModal = async (mode, problem = null) => {
    setModalMode(mode)
    setSelectedProblem(problem)
    setError('')
    setSuccess('')
    
    if (mode === 'create') {
      setFormData({
        title: '',
        description: '',
        difficulty: 'easy',
        tags: '',
        starterCode: '[]',
        constraints: '[]',
        referenceSolutions: '[]',
        acceptanceRate: ''
      })
      setVisibleTestCases([])
      setHiddenTestCases([])
      setShowModal(true)
    } else if (problem && problem._id) {
      // Fetch full problem data for edit/view mode (admin endpoint includes hiddenTestCases)
      try {
        const { data } = await axiosClient.get(`/problems/admin/problemById/${problem._id}`)
        const fullProblem = data.problem || data
        setSelectedProblem(fullProblem)
        setFormData({
          title: fullProblem.title || '',
          description: fullProblem.description || '',
          difficulty: (fullProblem.difficulty || 'easy').toLowerCase(),
          tags: (fullProblem.tags || []).join(', '),
          starterCode: JSON.stringify(fullProblem.starterCode || [], null, 2),
          constraints: JSON.stringify(fullProblem.constraints || [], null, 2),
          referenceSolutions: JSON.stringify(fullProblem.referenceSolutions || [], null, 2),
          acceptanceRate: String(fullProblem.acceptanceRate ?? '')
        })
        setVisibleTestCases(fullProblem.visibleTestCases || [])
        setHiddenTestCases(fullProblem.hiddenTestCases || [])
        setShowModal(true)
      } catch (e) {
        setError('Failed to load problem details')
      }
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedProblem(null)
    setError('')
    setSuccess('')
  }

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
    setError('')
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      // Validate test cases
      if (visibleTestCases.length === 0) {
        setError('At least one visible test case is required')
        setLoading(false)
        return
      }
      if (hiddenTestCases.length === 0) {
        setError('At least one hidden test case is required')
        setLoading(false)
        return
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        difficulty: formData.difficulty,
        tags: formData.tags.split(',').map(t=>t.trim()).filter(Boolean),
        visibleTestCases: visibleTestCases,
        hiddenTestCases: hiddenTestCases,
        starterCode: JSON.parse(formData.starterCode || '[]'),
        constraints: JSON.parse(formData.constraints || '[]'),
        referenceSolutions: JSON.parse(formData.referenceSolutions || '[]'),
        acceptanceRate: formData.acceptanceRate ? Number(formData.acceptanceRate) : undefined,
      }
      await axiosClient.post('/problems/create', payload)
      setSuccess('Problem created successfully!')
      load()
      setTimeout(() => closeModal(), 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create problem')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      // Validate test cases
      if (visibleTestCases.length === 0) {
        setError('At least one visible test case is required')
        setLoading(false)
        return
      }
      if (hiddenTestCases.length === 0) {
        setError('At least one hidden test case is required')
        setLoading(false)
        return
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        difficulty: formData.difficulty,
        tags: formData.tags.split(',').map(t=>t.trim()).filter(Boolean),
        visibleTestCases: visibleTestCases,
        hiddenTestCases: hiddenTestCases,
        starterCode: JSON.parse(formData.starterCode || '[]'),
        constraints: JSON.parse(formData.constraints || '[]'),
        referenceSolutions: JSON.parse(formData.referenceSolutions || '[]'),
        acceptanceRate: formData.acceptanceRate ? Number(formData.acceptanceRate) : undefined,
      }
      await axiosClient.patch(`/problems/update/${selectedProblem._id}`, payload)
      setSuccess('Problem updated successfully!')
      load()
      setTimeout(() => closeModal(), 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update problem')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (problem = null) => {
    const problemToDelete = problem || selectedProblem
    if (!problemToDelete) return
    if (!confirm(`Delete problem "${problemToDelete.title}"?`)) return
    
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      await axiosClient.delete(`/problems/delete/${problemToDelete._id}`)
      const message = 'Problem deleted successfully!'
      if (showModal) {
        setSuccess(message)
        setTimeout(() => closeModal(), 1500)
      } else {
        setTableMessage(message)
        setTimeout(() => setTableMessage(''), 3000)
      }
      load()
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to delete problem'
      if (showModal) {
        setError(errorMsg)
      } else {
        setTableMessage(errorMsg)
        setTimeout(() => setTableMessage(''), 3000)
      }
    } finally {
      setLoading(false)
    }
  }

  const loadProblemForView = async (id) => {
    try {
      const { data } = await axiosClient.get(`/problems/admin/problemById/${id}`)
      await openModal('view', data.problem || data)
    } catch (e) {
      setTableMessage('Failed to load problem')
      setTimeout(() => setTableMessage(''), 3000)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">Problems</h2>
        <button
          onClick={() => navigate('/problems/create')}
          className="px-3 py-1.5 rounded-lg text-sm bg-gray-700 text-white font-semibold hover:bg-gray-600 transition flex items-center gap-1.5 border border-gray-600"
        >
          <Plus className="w-4 h-4" />
          Create
        </button>
      </div>

      {tableMessage && (
        <div className={`mt-4 p-3 rounded-lg text-sm ${
          tableMessage.includes('successfully') 
            ? 'bg-emerald-400/10 border border-emerald-400/20 text-emerald-300'
            : 'bg-rose-400/10 border border-rose-400/20 text-rose-300'
        }`}>
          {tableMessage}
        </div>
      )}

      <form onSubmit={onSearch} className="mt-4 flex gap-2">
        <input
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
          placeholder="Search title..."
          className="bg-black border border-white/15 rounded px-3 py-2 w-full"
        />
        <button className="px-3 py-2 rounded-xl text-sm border border-white/15 hover:bg-white/10 transition">
          Search
        </button>
      </form>

      <div className="mt-4 rounded-2xl border border-white/10 overflow-hidden bg-black/40">
        <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-white/5 text-sm text-white/70 font-medium">
          <div className="col-span-5 min-w-0">Title</div>
          <div className="col-span-2 min-w-0">Difficulty</div>
          <div className="col-span-3 min-w-0">Tags</div>
          <div className="col-span-2 min-w-0 text-right">Actions</div>
        </div>
        {loading && items.length === 0 && (
          <div className="px-4 py-8 text-white/60 text-sm text-center">Loading...</div>
        )}
        {!loading && items.map((p) => (
          <div key={p._id} className="grid grid-cols-12 gap-4 px-4 py-3 border-t border-white/10 text-sm hover:bg-white/5 transition items-center">
            <div className="col-span-5 min-w-0 truncate" title={p.title}>
              {p.title}
            </div>
            <div className="col-span-2 min-w-0 capitalize truncate">{p.difficulty}</div>
            <div className="col-span-3 min-w-0 text-white/70 truncate" title={(p.tags||[]).map(capitalizeFirst).join(', ')}>
              {(p.tags||[]).map(capitalizeFirst).join(', ')}
            </div>
            <div className="col-span-2 min-w-0 flex items-center justify-end gap-2">
              <button
                onClick={() => loadProblemForView(p._id)}
                className="p-2 rounded-lg bg-emerald-400/10 hover:bg-emerald-400/20 border border-emerald-400/30 hover:border-emerald-400/50 text-emerald-400 transition-all group"
                title="View Problem"
              >
                <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
              <button
                onClick={() => openModal('edit', p)}
                className="p-2 rounded-lg bg-blue-400/10 hover:bg-blue-400/20 border border-blue-400/30 hover:border-blue-400/50 text-blue-400 transition-all group"
                title="Edit Problem"
              >
                <Edit2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
              <button
                onClick={() => handleDelete(p)}
                className="p-2 rounded-lg bg-rose-400/10 hover:bg-rose-400/20 border border-rose-400/30 hover:border-rose-400/50 text-rose-400 transition-all group"
                title="Delete Problem"
              >
                <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        ))}
        {!loading && items.length === 0 && <div className="px-4 py-8 text-white/60 text-sm text-center">No problems found.</div>}
      </div>

      <div className="mt-3 flex items-center justify-end gap-2">
        <button
          disabled={page===1}
          onClick={()=>setPage(p=>Math.max(1,p-1))}
          className="px-3 py-1.5 border border-white/15 rounded-xl text-sm disabled:opacity-40 hover:bg-white/10 transition"
        >
          Prev
        </button>
        <span className="text-white/60 text-sm">Page {page}</span>
        <button
          disabled={page*limit>=total}
          onClick={()=>setPage(p=>p+1)}
          className="px-3 py-1.5 border border-white/15 rounded-xl text-sm disabled:opacity-40 hover:bg-white/10 transition"
        >
          Next
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-black border border-white/20 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-black border-b border-white/10 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {modalMode === 'create' && 'Create Problem'}
                {modalMode === 'edit' && 'Update Problem'}
                {modalMode === 'view' && 'View Problem'}
              </h3>
              <div className="flex items-center gap-2">
                {modalMode === 'edit' && selectedProblem && (
                  <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="px-3 py-1.5 text-sm border border-rose-400/30 text-rose-400 rounded-lg hover:bg-rose-400/10 transition disabled:opacity-50"
                  >
                    Delete
                  </button>
                )}
                <button
                  onClick={closeModal}
                  className="px-3 py-1.5 text-sm border border-white/15 rounded-lg hover:bg-white/10 transition"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-rose-400/10 border border-rose-400/20 rounded-lg text-rose-300 text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-4 p-3 bg-emerald-400/10 border border-emerald-400/20 rounded-lg text-emerald-300 text-sm">
                  {success}
                </div>
              )}

              {modalMode === 'view' ? (
                <div className="space-y-4 text-sm">
                  <div>
                    <label className="text-white/70">Title</label>
                    <div className="mt-1 text-white">{formData.title}</div>
                  </div>
                  <div>
                    <label className="text-white/70">Description</label>
                    <div className="mt-1 text-white whitespace-pre-wrap">{formData.description}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-white/70">Difficulty</label>
                      <div className="mt-1 text-white capitalize">{formData.difficulty}</div>
                    </div>
                    <div>
                      <label className="text-white/70">Tags</label>
                      <div className="mt-1 text-white">{formData.tags}</div>
                    </div>
                  </div>
                  <div>
                    <label className="text-white/70">Acceptance Rate</label>
                    <div className="mt-1 text-white">{formData.acceptanceRate || 'N/A'}%</div>
                  </div>
                  <div className="pt-4 border-t border-white/10">
                    <button
                      onClick={() => {
                        if (selectedProblem) {
                          openModal('edit', selectedProblem)
                        }
                      }}
                      className="px-4 py-2 rounded-lg text-sm bg-white text-black hover:opacity-90 transition"
                    >
                      Edit Problem
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={modalMode === 'create' ? handleCreate : handleUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm text-white/70 mb-1">Title</label>
                    <input
                      required
                      className="w-full bg-black border border-white/15 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-400/50"
                      value={formData.title}
                      onChange={(e)=>handleChange('title', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-white/70 mb-1">Description</label>
                    <textarea
                      rows={6}
                      required
                      className="w-full bg-black border border-white/15 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-400/50"
                      value={formData.description}
                      onChange={(e)=>handleChange('description', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm text-white/70 mb-1">Difficulty</label>
                      <select
                        className="w-full bg-black border border-white/15 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-400/50"
                        value={formData.difficulty}
                        onChange={(e)=>handleChange('difficulty', e.target.value)}
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm text-white/70 mb-1">Tags (comma-separated)</label>
                      <input
                        className="w-full bg-black border border-white/15 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-400/50"
                        value={formData.tags}
                        onChange={(e)=>handleChange('tags', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Test Cases Section */}
                  <div>
                    <label className="block text-sm text-white/70 mb-4">Test Cases *</label>
                    <TestCaseManager
                      visibleTestCases={visibleTestCases}
                      hiddenTestCases={hiddenTestCases}
                      onVisibleChange={setVisibleTestCases}
                      onHiddenChange={setHiddenTestCases}
                      mode="both"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-white/70 mb-1">Starter Code (JSON)</label>
                      <textarea
                        rows={4}
                        className="w-full bg-black border border-white/15 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:border-emerald-400/50"
                        value={formData.starterCode}
                        onChange={(e)=>handleChange('starterCode', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white/70 mb-1">Constraints (JSON)</label>
                      <textarea
                        rows={4}
                        className="w-full bg-black border border-white/15 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:border-emerald-400/50"
                        value={formData.constraints}
                        onChange={(e)=>handleChange('constraints', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-white/70 mb-1">Reference Solutions (JSON)</label>
                    <textarea
                      rows={4}
                      className="w-full bg-black border border-white/15 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:border-emerald-400/50"
                      value={formData.referenceSolutions}
                      onChange={(e)=>handleChange('referenceSolutions', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-white/70 mb-1">Acceptance Rate (optional)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="w-full bg-black border border-white/15 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-400/50"
                      value={formData.acceptanceRate}
                      onChange={(e)=>handleChange('acceptanceRate', e.target.value)}
                    />
                  </div>

                  {/* Video Upload Section - Only show when editing existing problem */}
                  {modalMode === 'edit' && selectedProblem && selectedProblem._id && (
                    <div className="pt-4 border-t border-white/10">
                      <VideoUpload
                        problemId={selectedProblem._id}
                        onVideoSaved={() => {
                          setSuccess('Video uploaded successfully!');
                          setTimeout(() => setSuccess(''), 3000);
                        }}
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 rounded-lg text-sm border border-white/15 hover:bg-white/10 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 rounded-lg text-sm bg-white text-black hover:opacity-90 transition disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : modalMode === 'create' ? 'Create' : 'Update'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Problems


