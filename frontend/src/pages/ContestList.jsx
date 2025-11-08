import { ArrowRight, Calendar, Clock, Play, Plus, Trophy, Users, X, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api.js'

function ContestList(){
  const navigate = useNavigate()
  const [contests, setContests] = useState([])
  const [myContests, setMyContests] = useState([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewMode, setViewMode] = useState('all')
  const [loading, setLoading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [availableProblems, setAvailableProblems] = useState([])
  const [loadingProblems, setLoadingProblems] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    problems: []
  })
  const [submitting, setSubmitting] = useState(false)
  const [creationCount, setCreationCount] = useState(null)
  const [loadingCount, setLoadingCount] = useState(false)
  const limit = 12

  const loadContests = async () => {
    setLoading(true)
    try {
      const params = { page, limit }
      if (statusFilter !== 'all') params.status = statusFilter
      
      const { data } = await api.contests.list(params)
      setContests(Array.isArray(data.contests) ? data.contests : [])
      setTotal(data.total || 0)
    } catch (e) {
      console.error('Failed to load contests:', e)

      if (e.response?.status === 404) {
        console.error('Contest endpoint not found. Please ensure the backend server is running and the route is registered.')
      }
      setContests([])
    } finally {
      setLoading(false)
    }
  }

  const loadMyContests = async () => {
    try {
      const params = {}
      if (statusFilter !== 'all') params.status = statusFilter
      
      const { data } = await api.contests.myContests(params)
      setMyContests(Array.isArray(data.contests) ? data.contests : [])
    } catch (e) {
      console.error('Failed to load my contests:', e)
      setMyContests([])
    }
  }

  const loadCreationCount = async () => {
    setLoadingCount(true)
    try {
      const { data } = await api.contests.creationCount()
      setCreationCount(data)
    } catch (e) {
      console.error('Failed to load creation count:', e)
      setCreationCount(null)
    } finally {
      setLoadingCount(false)
    }
  }

  useEffect(() => {
    if (viewMode === 'all') {
      loadContests()
    } else {
      loadMyContests()
    }
    loadCreationCount()
  }, [page, statusFilter, viewMode])

  const loadProblems = async () => {
    setLoadingProblems(true)
    try {
      const { data } = await api.problems.list({ limit: 1000 })

      setAvailableProblems(
        Array.isArray(data.items) 
          ? data.items 
          : (Array.isArray(data.problems) ? data.problems : [])
      )
    } catch (e) {
      console.error('Failed to load problems:', e)
      setAvailableProblems([])
    } finally {
      setLoadingProblems(false)
    }
  }

  const handleOpenModal = async () => {

    try {
      const { data: countData } = await api.contests.creationCount()
      setCreationCount(countData)
      
      if (!countData.canCreateMore) {
        alert(`You have reached the monthly limit of ${countData.maxContests} contests. Please wait until next month to create more contests.`)
        return
      }
      
      if (countData.requiresSubscription) {
        const shouldProceed = confirm(
          `You have created ${countData.count} contests this month. To create more contests (up to ${countData.maxContests} per month), you need a premium subscription.\n\nWould you like to proceed to subscription?`
        )
        if (shouldProceed) {

          alert('Please use the payment option in your profile or contact support to subscribe to create more contests.')
          return
        }
        return
      }
    } catch (e) {
      console.error('Failed to check creation count:', e)

    }
    
    setShowCreateModal(true)
    setFormData({ title: '', description: '', problems: [] })
    loadProblems()
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
    setFormData({ title: '', description: '', problems: [] })
  }

  const handleProblemToggle = (problemId) => {
    setFormData(prev => {
      const currentProblems = prev.problems || []
      if (currentProblems.includes(problemId)) {
        return { ...prev, problems: currentProblems.filter(id => id !== problemId) }
      } else if (currentProblems.length < 4) {
        return { ...prev, problems: [...currentProblems, problemId] }
      }
      return prev
    })
  }

  const handleCreateContest = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Please fill in title and description')
      return
    }

    if (formData.problems.length !== 4) {
      alert('Please select exactly 4 problems')
      return
    }

    setSubmitting(true)
    try {
      const { data } = await api.contests.createPersonal({
        title: formData.title,
        description: formData.description,
        problems: formData.problems
      })
      handleCloseModal()
      loadContests()
      loadMyContests()
      loadCreationCount()
      
      if (data.contest && data.contest._id) {
        const contestId = data.contest._id
        const firstProblemId = formData.problems[0]
        const solveUrl = `${window.location.origin}/contest/${contestId}/solve/${firstProblemId}`
        const newWindow = window.open(
          solveUrl,
          'ContestSolving',
          'width=1400,height=900,resizable=yes,scrollbars=yes'
        )
        
        if (newWindow) {
          alert('Contest created successfully! Opening contest window...')
        } else {
          alert('Contest created successfully! Please allow popups to open the contest window.')
        }
      } else {
        alert('Contest created successfully!')
      }
    } catch (e) {
      console.error('Error creating contest:', e)
      const errorData = e.response?.data
      const errorMessage = errorData?.message || e.message || 'Failed to create contest'
      
      if (errorData?.requiresSubscription) {
        const shouldSubscribe = confirm(
          `${errorMessage}\n\nWould you like to subscribe now?`
        )
        if (shouldSubscribe) {

          alert('Please use the payment option in your profile or contact support to subscribe.')
        }
      } else if (errorData?.limitReached) {
        alert(errorMessage)
      } else {
        alert(`Error: ${errorMessage}`)
      }
      
      loadCreationCount()
    } finally {
      setSubmitting(false)
    }
  }

  const handleJoin = async (contestId) => {
    try {
      await api.contests.join(contestId)
      loadContests()
      loadMyContests()
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to join contest')
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

  const getTimeRemaining = (startTime, endTime) => {
    const now = new Date()
    const start = new Date(startTime)
    const end = new Date(endTime)
    
    if (now < start) {
      const diff = start - now
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      if (days > 0) return `${days}d ${hours}h`
      if (hours > 0) return `${hours}h ${minutes}m`
      return `${minutes}m`
    } else if (now < end) {
      const diff = end - now
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60)) / (1000 * 60))
      return `Ends in ${hours}h ${minutes}m`
    }
    return 'Ended'
  }

  const getStatusBadge = (status) => {
    const styles = {
      upcoming: 'bg-blue-400/10 border-blue-400/30 text-blue-400',
      ongoing: 'bg-emerald-400/10 border-emerald-400/30 text-emerald-400',
      ended: 'bg-gray-400/10 border-gray-400/30 text-gray-400'
    }
    return styles[status] || styles.ended
  }

  const displayContests = viewMode === 'all' ? contests : myContests

  return (
    <div className="text-white space-y-6">
      {}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-400" />
            Contests
          </h2>
          <p className="text-white/60 text-sm">Compete with others and improve your skills</p>
        </div>
        <div className="flex items-center gap-3">
          {creationCount && (
            <div className="text-sm text-white/60">
              <span className="text-white/80 font-medium">{creationCount.remaining}</span> contests remaining this month
              {creationCount.requiresSubscription && (
                <span className="ml-2 text-amber-400">(Subscription required)</span>
              )}
            </div>
          )}
          <button
            onClick={handleOpenModal}
            disabled={creationCount && !creationCount.canCreateMore}
            className="px-4 py-2 rounded-xl bg-emerald-400/20 border border-emerald-400/50 text-emerald-400 hover:bg-emerald-400/30 transition flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            Create Contest
          </button>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-white/10 bg-black/40 p-4 hover:bg-black/60 transition relative overflow-hidden group">
          <div className="absolute top-3 left-3">
            <div className="relative">
              <div className="absolute inset-0 w-8 h-8 rounded-lg bg-blue-400/20 blur-sm group-hover:bg-blue-400/30 transition"></div>
              <Calendar className="relative w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="mt-10">
            <div className="text-xs text-white/70 mb-2 font-medium">Total Contests</div>
            <div className="text-3xl font-bold text-white tracking-tight">{total}</div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/40 p-4 hover:bg-black/60 transition relative overflow-hidden group">
          <div className="absolute top-3 left-3">
            <div className="relative">
              <div className="absolute inset-0 w-8 h-8 rounded-lg bg-emerald-400/20 blur-sm group-hover:bg-emerald-400/30 transition"></div>
              <Zap className="relative w-8 h-8 text-emerald-400" />
            </div>
          </div>
          <div className="mt-10">
            <div className="text-xs text-white/70 mb-2 font-medium">My Contests</div>
            <div className="text-3xl font-bold text-white tracking-tight">{myContests.length}</div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/40 p-4 hover:bg-black/60 transition relative overflow-hidden group">
          <div className="absolute top-3 left-3">
            <div className="relative">
              <div className="absolute inset-0 w-8 h-8 rounded-lg bg-amber-400/20 blur-sm group-hover:bg-amber-400/30 transition"></div>
              <Users className="relative w-8 h-8 text-amber-400" />
            </div>
          </div>
          <div className="mt-10">
            <div className="text-xs text-white/70 mb-2 font-medium">Active Now</div>
            <div className="text-3xl font-bold text-white tracking-tight">
              {displayContests.filter(c => c.status === 'ongoing').length}
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              viewMode === 'all'
                ? 'bg-white text-black hover:bg-white/90'
                : 'bg-white/5 border border-white/10 hover:bg-white/10 text-white'
            }`}
          >
            All Contests
          </button>
          <button
            onClick={() => setViewMode('my')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              viewMode === 'my'
                ? 'bg-white text-black hover:bg-white/90'
                : 'bg-white/5 border border-white/10 hover:bg-white/10 text-white'
            }`}
          >
            My Contests
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => { setStatusFilter('all'); setPage(1) }}
            className={`px-4 py-2 rounded-xl text-sm transition ${
              statusFilter === 'all'
                ? 'bg-emerald-400/20 border border-emerald-400/50 text-emerald-400'
                : 'bg-white/5 border border-white/10 hover:bg-white/10 text-white/70'
            }`}
          >
            All
          </button>
          <button
            onClick={() => { setStatusFilter('upcoming'); setPage(1) }}
            className={`px-4 py-2 rounded-xl text-sm transition ${
              statusFilter === 'upcoming'
                ? 'bg-blue-400/20 border border-blue-400/50 text-blue-400'
                : 'bg-white/5 border border-white/10 hover:bg-white/10 text-white/70'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => { setStatusFilter('ongoing'); setPage(1) }}
            className={`px-4 py-2 rounded-xl text-sm transition ${
              statusFilter === 'ongoing'
                ? 'bg-emerald-400/20 border border-emerald-400/50 text-emerald-400'
                : 'bg-white/5 border border-white/10 hover:bg-white/10 text-white/70'
            }`}
          >
            Ongoing
          </button>
          <button
            onClick={() => { setStatusFilter('ended'); setPage(1) }}
            className={`px-4 py-2 rounded-xl text-sm transition ${
              statusFilter === 'ended'
                ? 'bg-gray-400/20 border border-gray-400/50 text-gray-400'
                : 'bg-white/5 border border-white/10 hover:bg-white/10 text-white/70'
            }`}
          >
            Ended
          </button>
        </div>
      </div>

      {}
      {loading ? (
        <div className="text-center py-12 text-white/60">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <p className="mt-2">Loading contests...</p>
        </div>
      ) : displayContests.length === 0 ? (
        <div className="text-center py-16 text-white/60">
          <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">No contests available yet</p>
          <p className="text-sm">Check back later for new contests!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayContests.map((contest) => (
            <div
              key={contest._id}
              className="group rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition p-5 cursor-pointer relative overflow-hidden"
            >
              {}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="relative z-10">
                {}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-1 group-hover:text-emerald-400 transition truncate">
                      {contest.title}
                    </h3>
                    <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium border ${getStatusBadge(contest.status)}`}>
                      {contest.status.charAt(0).toUpperCase() + contest.status.slice(1)}
                    </span>
                  </div>
                </div>

                {}
                <p className="text-white/70 text-sm mb-4 line-clamp-2">
                  {contest.description}
                </p>

                {}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <Calendar className="w-4 h-4" />
                    <span>Starts: {formatDate(contest.startTime)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <Clock className="w-4 h-4" />
                    <span>{getTimeRemaining(contest.startTime, contest.endTime)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <Trophy className="w-4 h-4" />
                    <span>{contest.problems?.length || 0} Problems</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <Users className="w-4 h-4" />
                    <span>{contest.participants?.length || 0} Participants</span>
                  </div>
                </div>

                {}
                <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                  {contest.status === 'upcoming' && !contest.isParticipant && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleJoin(contest._id)
                      }}
                      className="flex-1 px-4 py-2 rounded-lg bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/20 transition text-sm font-medium"
                    >
                      Join Contest
                    </button>
                  )}
                  {contest.status !== 'ended' && contest.isParticipant && contest.problems && contest.problems.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        const firstProblemId = contest.problems[0]._id || contest.problems[0]
                        navigate(`/contest/${contest._id}/solve/${firstProblemId}`)
                      }}
                      className="flex-1 px-4 py-2 rounded-lg bg-blue-400/20 border border-blue-400/50 text-blue-400 hover:bg-blue-400/30 transition text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Resume
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/contest/${contest._id}`)
                    }}
                    className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition text-sm font-medium flex items-center justify-center gap-2"
                  >
                    View Details
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {}
      {viewMode === 'all' && total > limit && (
        <div className="flex items-center justify-end gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="px-4 py-2 border border-white/15 rounded-xl text-sm disabled:opacity-40 hover:bg-white/10 transition"
          >
            Prev
          </button>
          <span className="text-white/60 text-sm">Page {page}</span>
          <button
            disabled={page * limit >= total}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 border border-white/15 rounded-xl text-sm disabled:opacity-40 hover:bg-white/10 transition"
          >
            Next
          </button>
        </div>
      )}

      {}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-black/90 border border-white/10 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Create Personal Contest</h3>
              <button
                onClick={handleCloseModal}
                className="text-white/60 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Contest Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter contest title"
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-emerald-400/50 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter contest description"
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-emerald-400/50 transition resize-none"
                  />
                </div>

                <div className="p-4 rounded-lg bg-blue-400/10 border border-blue-400/30">
                  <div className="flex items-center gap-2 text-blue-400 text-sm font-medium mb-1">
                    <Clock className="w-4 h-4" />
                    Contest Duration
                  </div>
                  <p className="text-white/70 text-sm">Fixed at 1 hour 30 minutes (90 minutes)</p>
                </div>
              </div>

              {}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Select Problems * (Exactly 4 required)
                </label>
                <div className="text-xs text-white/60 mb-3">
                  Selected: {formData.problems.length} / 4
                </div>

                {loadingProblems ? (
                  <div className="text-center py-8 text-white/60">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <p className="mt-2 text-sm">Loading problems...</p>
                  </div>
                ) : availableProblems.length === 0 ? (
                  <div className="text-center py-8 text-white/60 text-sm">
                    No problems available
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto space-y-2 border border-white/10 rounded-lg p-3">
                    {availableProblems.map((problem) => {
                      const isSelected = formData.problems.includes(problem._id)
                      const isDisabled = !isSelected && formData.problems.length >= 4
                      
                      return (
                        <div
                          key={problem._id}
                          onClick={() => !isDisabled && handleProblemToggle(problem._id)}
                          className={`p-3 rounded-lg border cursor-pointer transition ${
                            isSelected
                              ? 'bg-emerald-400/20 border-emerald-400/50'
                              : isDisabled
                              ? 'bg-white/5 border-white/5 opacity-50 cursor-not-allowed'
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
                              {(() => {
                                const tags = Array.isArray(problem.tags) 
                                  ? problem.tags 
                                  : (typeof problem.tags === 'string' && problem.tags.trim() 
                                      ? problem.tags.split(',').map(t => t.trim()).filter(Boolean)
                                      : []);
                                return tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {tags.slice(0, 3).map((tag, idx) => (
                                      <span key={idx} className="text-xs text-white/50 px-1.5 py-0.5 bg-white/5 rounded">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                );
                              })()}
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
            </div>

            <div className="p-6 border-t border-white/10 flex items-center justify-end gap-3">
              <button
                onClick={handleCloseModal}
                disabled={submitting}
                className="px-4 py-2 rounded-lg border border-white/10 text-white/70 hover:bg-white/10 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateContest}
                disabled={submitting || formData.problems.length !== 4 || !formData.title.trim() || !formData.description.trim()}
                className="px-6 py-2 rounded-lg bg-emerald-400/20 border border-emerald-400/50 text-emerald-400 hover:bg-emerald-400/30 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {submitting ? 'Creating...' : 'Create Contest'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ContestList
