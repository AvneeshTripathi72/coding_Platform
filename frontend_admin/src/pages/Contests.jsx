import { Edit2, Eye, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import axiosClient from '../api/axiosClient.js'

function Contests(){
  const [contests, setContests] = useState([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('create') // create | edit | view
  const [selectedContest, setSelectedContest] = useState(null)
  const [availableProblems, setAvailableProblems] = useState([])
  const [loadingProblems, setLoadingProblems] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const limit = 20

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    problems: [],
    isPublic: true
  })

  const loadContests = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', String(limit))
      const { data } = await axiosClient.get(`/contests/getAllContests?${params.toString()}`)
      setContests(Array.isArray(data.contests) ? data.contests : [])
      setTotal(data.total || 0)
    } catch (e) {
      console.error('Error loading contests:', e)
      setContests([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  const loadProblems = async () => {
    setLoadingProblems(true)
    try {
      const { data } = await axiosClient.get('/problems/getAllProblems?limit=1000')
      setAvailableProblems(Array.isArray(data.items) ? data.items : [])
    } catch (e) {
      console.error('Failed to load problems:', e)
      setAvailableProblems([])
    } finally {
      setLoadingProblems(false)
    }
  }

  useEffect(() => { loadContests() }, [page])

  const openModal = async (mode, contest = null) => {
    setModalMode(mode)
    setSelectedContest(contest)
    setError('')
    setSuccess('')
    
    if (mode === 'create') {
      const now = new Date()
      const startTime = new Date(now.getTime() + 60 * 60 * 1000) // 1 hour from now
      const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000) // 2 hours after start
      
      setFormData({
        title: '',
        description: '',
        startTime: startTime.toISOString().slice(0, 16),
        endTime: endTime.toISOString().slice(0, 16),
        problems: [],
        isPublic: true
      })
      await loadProblems()
      setShowModal(true)
    } else if (contest && contest._id) {
      try {
        const { data } = await axiosClient.get(`/contests/contestById/${contest._id}`)
        const fullContest = data.contest || data
        setSelectedContest(fullContest)
        setFormData({
          title: fullContest.title || '',
          description: fullContest.description || '',
          startTime: new Date(fullContest.startTime).toISOString().slice(0, 16),
          endTime: new Date(fullContest.endTime).toISOString().slice(0, 16),
          problems: (fullContest.problems || []).map(p => p._id || p),
          isPublic: fullContest.isPublic !== false
        })
        await loadProblems()
        setShowModal(true)
      } catch (e) {
        setError('Failed to load contest details')
      }
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedContest(null)
    setError('')
    setSuccess('')
  }

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
    setError('')
  }

  const handleProblemToggle = (problemId) => {
    setFormData(prev => {
      const currentProblems = prev.problems || []
      if (currentProblems.includes(problemId)) {
        return { ...prev, problems: currentProblems.filter(id => id !== problemId) }
      }
      return { ...prev, problems: [...currentProblems, problemId] }
    })
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (!formData.title.trim() || !formData.description.trim()) {
        setError('Title and description are required')
        setLoading(false)
        return
      }

      if (new Date(formData.startTime) >= new Date(formData.endTime)) {
        setError('End time must be after start time')
        setLoading(false)
        return
      }

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        problems: formData.problems,
        isPublic: formData.isPublic
      }

      await axiosClient.post('/contests/create', payload)
      setSuccess('Contest created successfully!')
      loadContests()
      setTimeout(() => closeModal(), 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create contest')
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
      if (!formData.title.trim() || !formData.description.trim()) {
        setError('Title and description are required')
        setLoading(false)
        return
      }

      if (new Date(formData.startTime) >= new Date(formData.endTime)) {
        setError('End time must be after start time')
        setLoading(false)
        return
      }

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        problems: formData.problems,
        isPublic: formData.isPublic
      }

      await axiosClient.patch(`/contests/update/${selectedContest._id}`, payload)
      setSuccess('Contest updated successfully!')
      loadContests()
      setTimeout(() => closeModal(), 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update contest')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (contest = null) => {
    const contestToDelete = contest || selectedContest
    if (!contestToDelete) return
    if (!confirm(`Delete contest "${contestToDelete.title}"?`)) return
    
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      await axiosClient.delete(`/contests/delete/${contestToDelete._id}`)
      const message = 'Contest deleted successfully!'
      if (showModal) {
        setSuccess(message)
        setTimeout(() => closeModal(), 1500)
      }
      loadContests()
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to delete contest'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatus = (contest) => {
    const now = new Date()
    const start = new Date(contest.startTime)
    const end = new Date(contest.endTime)
    
    if (now < start) return 'upcoming'
    if (now >= start && now <= end) return 'ongoing'
    return 'ended'
  }

  const getStatusBadge = (status) => {
    const styles = {
      upcoming: 'bg-blue-400/10 border-blue-400/30 text-blue-400',
      ongoing: 'bg-emerald-400/10 border-emerald-400/30 text-emerald-400',
      ended: 'bg-gray-400/10 border-gray-400/30 text-gray-400'
    }
    return styles[status] || styles.ended
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">Contests</h2>
        <button
          onClick={() => openModal('create')}
          className="px-3 py-1.5 rounded-lg text-sm bg-gray-700 text-white font-semibold hover:bg-gray-600 transition flex items-center gap-1.5 border border-gray-600"
        >
          <Plus className="w-4 h-4" />
          Create Contest
        </button>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 overflow-hidden bg-black/40">
        <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-white/5 text-sm text-white/70 font-medium">
          <div className="col-span-4 min-w-0">Title</div>
          <div className="col-span-2 min-w-0">Status</div>
          <div className="col-span-2 min-w-0">Start Time</div>
          <div className="col-span-2 min-w-0">Problems</div>
          <div className="col-span-2 min-w-0 text-right">Actions</div>
        </div>
        {loading && contests.length === 0 && (
          <div className="px-4 py-8 text-white/60 text-sm text-center">Loading...</div>
        )}
        {!loading && contests.map((contest) => {
          const status = getStatus(contest)
          return (
            <div key={contest._id} className="grid grid-cols-12 gap-4 px-4 py-3 border-t border-white/10 text-sm hover:bg-white/5 transition items-center">
              <div className="col-span-4 min-w-0 truncate" title={contest.title}>
                {contest.title}
              </div>
              <div className="col-span-2 min-w-0">
                <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium border ${getStatusBadge(status)}`}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              </div>
              <div className="col-span-2 min-w-0 text-white/70 truncate" title={formatDate(contest.startTime)}>
                {formatDate(contest.startTime)}
              </div>
              <div className="col-span-2 min-w-0 text-white/70">
                {contest.problems?.length || 0}
              </div>
              <div className="col-span-2 min-w-0 flex items-center justify-end gap-2">
                <button
                  onClick={() => openModal('view', contest)}
                  className="p-2 rounded-lg bg-emerald-400/10 hover:bg-emerald-400/20 border border-emerald-400/30 hover:border-emerald-400/50 text-emerald-400 transition-all group"
                  title="View Contest"
                >
                  <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </button>
                <button
                  onClick={() => openModal('edit', contest)}
                  className="p-2 rounded-lg bg-blue-400/10 hover:bg-blue-400/20 border border-blue-400/30 hover:border-blue-400/50 text-blue-400 transition-all group"
                  title="Edit Contest"
                >
                  <Edit2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </button>
                <button
                  onClick={() => handleDelete(contest)}
                  className="p-2 rounded-lg bg-rose-400/10 hover:bg-rose-400/20 border border-rose-400/30 hover:border-rose-400/50 text-rose-400 transition-all group"
                  title="Delete Contest"
                >
                  <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>
          )
        })}
        {!loading && contests.length === 0 && (
          <div className="px-4 py-8 text-white/60 text-sm text-center">No contests found.</div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-end gap-2">
        <button
          disabled={page === 1}
          onClick={() => setPage(p => Math.max(1, p - 1))}
          className="px-3 py-1.5 border border-white/15 rounded-xl text-sm disabled:opacity-40 hover:bg-white/10 transition"
        >
          Prev
        </button>
        <span className="text-white/60 text-sm">Page {page}</span>
        <button
          disabled={page * limit >= total}
          onClick={() => setPage(p => p + 1)}
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
                {modalMode === 'create' && 'Create Contest'}
                {modalMode === 'edit' && 'Update Contest'}
                {modalMode === 'view' && 'View Contest'}
              </h3>
              <div className="flex items-center gap-2">
                {modalMode === 'edit' && selectedContest && (
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
                      <label className="text-white/70">Start Time</label>
                      <div className="mt-1 text-white">{formatDate(formData.startTime)}</div>
                    </div>
                    <div>
                      <label className="text-white/70">End Time</label>
                      <div className="mt-1 text-white">{formatDate(formData.endTime)}</div>
                    </div>
                  </div>
                  <div>
                    <label className="text-white/70">Public</label>
                    <div className="mt-1 text-white">{formData.isPublic ? 'Yes' : 'No'}</div>
                  </div>
                  <div>
                    <label className="text-white/70">Problems ({formData.problems.length})</label>
                    <div className="mt-2 space-y-2">
                      {availableProblems
                        .filter(p => formData.problems.includes(p._id))
                        .map(problem => (
                          <div key={problem._id} className="p-2 bg-white/5 rounded-lg text-white text-xs">
                            {problem.title} ({problem.difficulty})
                          </div>
                        ))}
                    </div>
                  </div>
                  <div className="pt-4 border-t border-white/10">
                    <button
                      onClick={() => {
                        if (selectedContest) {
                          openModal('edit', selectedContest)
                        }
                      }}
                      className="px-4 py-2 rounded-lg text-sm bg-white text-black hover:opacity-90 transition"
                    >
                      Edit Contest
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={modalMode === 'create' ? handleCreate : handleUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm text-white/70 mb-1">Title *</label>
                    <input
                      required
                      className="w-full bg-black border border-white/15 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-400/50"
                      value={formData.title}
                      onChange={(e) => handleChange('title', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-white/70 mb-1">Description *</label>
                    <textarea
                      rows={4}
                      required
                      className="w-full bg-black border border-white/15 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-400/50"
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-white/70 mb-1">Start Time *</label>
                      <input
                        type="datetime-local"
                        required
                        className="w-full bg-black border border-white/15 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-400/50"
                        value={formData.startTime}
                        onChange={(e) => handleChange('startTime', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white/70 mb-1">End Time *</label>
                      <input
                        type="datetime-local"
                        required
                        className="w-full bg-black border border-white/15 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-400/50"
                        value={formData.endTime}
                        onChange={(e) => handleChange('endTime', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-white/70 mb-1">
                      <input
                        type="checkbox"
                        checked={formData.isPublic}
                        onChange={(e) => handleChange('isPublic', e.target.checked)}
                        className="mr-2"
                      />
                      Public Contest (visible to all users)
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm text-white/70 mb-2">
                      Select Problems ({formData.problems.length} selected)
                    </label>
                    {loadingProblems ? (
                      <div className="text-center py-8 text-white/60 text-sm">Loading problems...</div>
                    ) : availableProblems.length === 0 ? (
                      <div className="text-center py-8 text-white/60 text-sm">No problems available</div>
                    ) : (
                      <div className="max-h-64 overflow-y-auto space-y-2 border border-white/10 rounded-lg p-3">
                        {availableProblems.map((problem) => {
                          const isSelected = formData.problems.includes(problem._id)
                          return (
                            <div
                              key={problem._id}
                              onClick={() => handleProblemToggle(problem._id)}
                              className={`p-3 rounded-lg border cursor-pointer transition ${
                                isSelected
                                  ? 'bg-emerald-400/20 border-emerald-400/50'
                                  : 'bg-white/5 border-white/10 hover:bg-white/10'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-white text-sm">{problem.title}</span>
                                    <span className={`px-2 py-0.5 rounded text-xs ${
                                      problem.difficulty === 'Easy' ? 'bg-green-400/20 text-green-400' :
                                      problem.difficulty === 'Medium' ? 'bg-yellow-400/20 text-yellow-400' :
                                      'bg-red-400/20 text-red-400'
                                    }`}>
                                      {problem.difficulty}
                                    </span>
                                  </div>
                                </div>
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ml-3 ${
                                  isSelected
                                    ? 'bg-emerald-400 border-emerald-400'
                                    : 'border-white/30'
                                }`}>
                                  {isSelected && (
                                    <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

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

export default Contests

