import {
    AlertCircle,
    Calendar,
    CheckCircle,
    Clock,
    Eye,
    FileVideo,
    Filter,
    Grid3x3,
    List,
    Play,
    Plus,
    Search,
    Trash2,
    TrendingUp,
    Video as VideoIcon
} from 'lucide-react'
import { useEffect, useState } from 'react'
import axiosClient from '../api/axiosClient.js'
import VideoUpload from '../components/VideoUpload.jsx'

function Videos(){
  const [videos, setVideos] = useState([])
  const [problems, setProblems] = useState([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedProblem, setSelectedProblem] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [filterDifficulty, setFilterDifficulty] = useState('all')
  const limit = 12

  const loadVideos = async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', String(limit))
      if (search.trim()) params.set('search', search.trim())
      
      const { data } = await axiosClient.get(`/videos/all?${params.toString()}`)
      const videosWithProblemTitle = (data.videos || []).map(video => ({
        ...video,
        problemTitle: video.problemId?.title || 'Unknown Problem',
        problemDifficulty: video.problemId?.difficulty || 'N/A'
      }))
      
      setVideos(videosWithProblemTitle)
      setTotal(data.total || 0)
    } catch(e){
      console.error('Error loading videos:', e)
      setError(e.response?.data?.message || 'Failed to load videos')
      setVideos([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  const loadProblems = async () => {
    try {
      const { data } = await axiosClient.get('/problems/getAllProblems?limit=1000')
      setProblems(data.items || [])
    } catch(e){
      console.error('Error loading problems:', e)
    }
  }

  useEffect(() => {
    loadVideos()
  }, [page])

  useEffect(() => {
    if (search.trim()) {
      setPage(1)
      setTimeout(() => loadVideos(), 300)
    }
  }, [search])

  useEffect(() => {
    if (showUploadModal) {
      loadProblems()
    }
  }, [showUploadModal])

  const handleDelete = async (video) => {
    if (!confirm(`Delete video "${video.title}"?`)) return
    
    setLoading(true)
    setError('')
    try {
      await axiosClient.delete(`/videos/${video._id}`)
      setSuccess('Video deleted successfully!')
      setTimeout(() => setSuccess(''), 3000)
      loadVideos()
    } catch(err) {
      setError(err.response?.data?.message || 'Failed to delete video')
      setTimeout(() => setError(''), 5000)
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const onSearch = (e) => {
    e.preventDefault()
    setPage(1)
    setTimeout(() => loadVideos(), 0)
  }

  const getDifficultyColor = (difficulty) => {
    const colors = {
      'Easy': 'bg-emerald-400/20 text-emerald-400 border-emerald-400/30',
      'Medium': 'bg-amber-400/20 text-amber-400 border-amber-400/30',
      'Hard': 'bg-rose-400/20 text-rose-400 border-rose-400/30',
      'N/A': 'bg-white/10 text-white/60 border-white/10'
    }
    return colors[difficulty] || colors['N/A']
  }

  const filteredVideos = filterDifficulty === 'all' 
    ? videos 
    : videos.filter(v => v.problemDifficulty === filterDifficulty)

  const totalViews = videos.reduce((sum, v) => sum + (v.views || 0), 0)
  const totalDuration = videos.reduce((sum, v) => sum + (v.duration || 0), 0)
  const avgViews = videos.length > 0 ? Math.round(totalViews / videos.length) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <VideoIcon className="w-6 h-6 text-emerald-400" />
            Videos
          </h2>
          <p className="text-white/60 text-sm">Manage editorial videos for problems</p>
        </div>
        <button
          onClick={() => {
            setShowUploadModal(true)
            setSelectedProblem('')
            setError('')
            setSuccess('')
          }}
          className="px-4 py-2 rounded-xl bg-emerald-400/20 border border-emerald-400/50 text-emerald-400 hover:bg-emerald-400/30 transition flex items-center gap-2 font-medium"
        >
          <Plus className="w-4 h-4" />
          Upload Video
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-white/10 bg-black/40 p-4 hover:bg-black/60 transition relative overflow-hidden group">
          <div className="absolute top-3 left-3">
            <div className="relative">
              <div className="absolute inset-0 w-8 h-8 rounded-lg bg-emerald-400/20 blur-sm group-hover:bg-emerald-400/30 transition"></div>
              <FileVideo className="relative w-8 h-8 text-emerald-400" />
            </div>
          </div>
          <div className="mt-10">
            <div className="text-xs text-white/70 mb-2 font-medium">Total Videos</div>
            <div className="text-3xl font-bold text-white tracking-tight">{total}</div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/40 p-4 hover:bg-black/60 transition relative overflow-hidden group">
          <div className="absolute top-3 left-3">
            <div className="relative">
              <div className="absolute inset-0 w-8 h-8 rounded-lg bg-blue-400/20 blur-sm group-hover:bg-blue-400/30 transition"></div>
              <Eye className="relative w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="mt-10">
            <div className="text-xs text-white/70 mb-2 font-medium">Total Views</div>
            <div className="text-3xl font-bold text-white tracking-tight">{totalViews.toLocaleString()}</div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/40 p-4 hover:bg-black/60 transition relative overflow-hidden group">
          <div className="absolute top-3 left-3">
            <div className="relative">
              <div className="absolute inset-0 w-8 h-8 rounded-lg bg-amber-400/20 blur-sm group-hover:bg-amber-400/30 transition"></div>
              <TrendingUp className="relative w-8 h-8 text-amber-400" />
            </div>
          </div>
          <div className="mt-10">
            <div className="text-xs text-white/70 mb-2 font-medium">Avg Views</div>
            <div className="text-3xl font-bold text-white tracking-tight">{avgViews.toLocaleString()}</div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/40 p-4 hover:bg-black/60 transition relative overflow-hidden group">
          <div className="absolute top-3 left-3">
            <div className="relative">
              <div className="absolute inset-0 w-8 h-8 rounded-lg bg-purple-400/20 blur-sm group-hover:bg-purple-400/30 transition"></div>
              <Clock className="relative w-8 h-8 text-purple-400" />
            </div>
          </div>
          <div className="mt-10">
            <div className="text-xs text-white/70 mb-2 font-medium">Total Duration</div>
            <div className="text-3xl font-bold text-white tracking-tight">{formatDuration(totalDuration)}</div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(error || success) && (
        <div className={`p-4 rounded-xl border text-sm ${
          success 
            ? 'bg-emerald-400/10 border-emerald-400/20 text-emerald-300'
            : 'bg-rose-400/10 border-rose-400/20 text-rose-300'
        }`}>
          <div className="flex items-center gap-2">
            {success ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{error || success}</span>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <form onSubmit={onSearch} className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by video title or problem..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-emerald-400/50 transition"
          />
        </form>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-emerald-400/50 transition appearance-none"
            >
              <option value="all">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-black/40 border border-white/10">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition ${
                viewMode === 'grid'
                  ? 'bg-emerald-400/20 text-emerald-400'
                  : 'text-white/60 hover:text-white'
              }`}
              title="Grid View"
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition ${
                viewMode === 'list'
                  ? 'bg-emerald-400/20 text-emerald-400'
                  : 'text-white/60 hover:text-white'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Videos Display */}
      {loading && videos.length === 0 ? (
        <div className="text-center py-16 text-white/60">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <p className="mt-2">Loading videos...</p>
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="text-center py-16 text-white/60">
          <VideoIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">
            {search ? 'No videos found matching your search.' : 'No videos uploaded yet.'}
          </p>
          <p className="text-sm">Upload your first video to get started!</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVideos.map((video) => (
            <div
              key={video._id}
              className="group rounded-xl border border-white/10 bg-black/40 hover:bg-black/60 hover:border-white/20 transition p-5 relative overflow-hidden"
            >
              {/* Gradient Background Effect */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="relative z-10">
                {/* Video Thumbnail/Icon */}
                <div className="mb-4 relative">
                  <button
                    onClick={() => window.open(video.cloudinaryUrl, '_blank')}
                    className="w-full aspect-video rounded-lg bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center group-hover:border-emerald-400/50 transition hover:from-emerald-500/30 hover:to-blue-500/30 cursor-pointer relative overflow-hidden"
                  >
                    <Play className="w-12 h-12 text-white/60 group-hover:text-emerald-400 transition group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition"></div>
                  </button>
                  <div className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-black/80 backdrop-blur-sm border border-white/10 text-xs text-white pointer-events-none">
                    {formatDuration(video.duration)}
                  </div>
                </div>

                {/* Video Info */}
                <div className="space-y-3">
                  <div>
                    <button
                      onClick={() => window.open(video.cloudinaryUrl, '_blank')}
                      className="w-full text-left"
                    >
                      <h3 className="font-semibold text-lg mb-1 group-hover:text-emerald-400 transition truncate cursor-pointer hover:underline" title={video.title}>
                        {video.title}
                      </h3>
                    </button>
                    <div className="flex items-center gap-2">
                      <span className="text-white/70 text-sm truncate" title={video.problemTitle}>
                        {video.problemTitle}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getDifficultyColor(video.problemDifficulty)}`}>
                        {video.problemDifficulty}
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-white/60">
                    <div className="flex items-center gap-1.5">
                      <Eye className="w-4 h-4" />
                      <span>{video.views || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(video.createdAt)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                    <button
                      onClick={() => window.open(video.cloudinaryUrl, '_blank')}
                      className="flex-1 px-4 py-2 rounded-lg bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/20 transition text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Watch
                    </button>
                    <button
                      onClick={() => handleDelete(video)}
                      className="px-4 py-2 rounded-lg bg-rose-400/10 border border-rose-400/30 text-rose-400 hover:bg-rose-400/20 transition text-sm font-medium"
                      title="Delete Video"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 overflow-hidden bg-black/40">
          <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-white/5 text-sm text-white/70 font-medium">
            <div className="col-span-4 min-w-0">Title</div>
            <div className="col-span-3 min-w-0">Problem</div>
            <div className="col-span-2 min-w-0 text-center">Views</div>
            <div className="col-span-2 min-w-0 text-center">Duration</div>
            <div className="col-span-1 min-w-0 text-right">Actions</div>
          </div>
          {filteredVideos.map((video) => (
            <div key={video._id} className="grid grid-cols-12 gap-4 px-4 py-3 border-t border-white/10 text-sm hover:bg-white/5 transition items-center group">
              <div className="col-span-4 min-w-0 truncate font-medium" title={video.title}>
                {video.title}
              </div>
              <div className="col-span-3 min-w-0 truncate">
                <div className="flex items-center gap-2">
                  <span className="text-white/70 truncate" title={video.problemTitle}>
                    {video.problemTitle}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getDifficultyColor(video.problemDifficulty)}`}>
                    {video.problemDifficulty}
                  </span>
                </div>
              </div>
              <div className="col-span-2 min-w-0 text-center text-white/70 flex items-center justify-center gap-1">
                <Eye className="w-4 h-4" />
                {video.views || 0}
              </div>
              <div className="col-span-2 min-w-0 text-center text-white/70 flex items-center justify-center gap-1">
                <Clock className="w-4 h-4" />
                {formatDuration(video.duration)}
              </div>
              <div className="col-span-1 min-w-0 flex items-center justify-end gap-2">
                <button
                  onClick={() => window.open(video.cloudinaryUrl, '_blank')}
                  className="p-2 rounded-lg bg-emerald-400/10 hover:bg-emerald-400/20 border border-emerald-400/30 hover:border-emerald-400/50 text-emerald-400 transition-all group-hover:scale-110"
                  title="View Video"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(video)}
                  className="p-2 rounded-lg bg-rose-400/10 hover:bg-rose-400/20 border border-rose-400/30 hover:border-rose-400/50 text-rose-400 transition-all group-hover:scale-110"
                  title="Delete Video"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > limit && (
        <div className="flex items-center justify-end gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="px-4 py-2 border border-white/15 rounded-xl text-sm disabled:opacity-40 hover:bg-white/10 transition"
          >
            Prev
          </button>
          <span className="text-white/60 text-sm">Page {page} of {Math.ceil(total / limit)}</span>
          <button
            disabled={page * limit >= total}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 border border-white/15 rounded-xl text-sm disabled:opacity-40 hover:bg-white/10 transition"
          >
            Next
          </button>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-black border border-white/20 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-black border-b border-white/10 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <VideoIcon className="w-5 h-5 text-emerald-400" />
                Upload New Video
              </h3>
              <button
                onClick={() => {
                  setShowUploadModal(false)
                  setSelectedProblem('')
                  setError('')
                  setSuccess('')
                }}
                className="px-3 py-1.5 text-sm border border-white/15 rounded-lg hover:bg-white/10 transition text-white/70"
              >
                Close
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm text-white/80 mb-2 font-medium">Select Problem *</label>
                <select
                  required
                  value={selectedProblem}
                  onChange={(e) => setSelectedProblem(e.target.value)}
                  className="w-full bg-black border border-white/15 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-400/50 transition"
                >
                  <option value="">-- Select a problem --</option>
                  {problems.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.title} ({p.difficulty})
                    </option>
                  ))}
                </select>
              </div>

              {selectedProblem && (
                <VideoUpload
                  problemId={selectedProblem}
                  onVideoSaved={(video) => {
                    setSuccess('Video uploaded successfully!')
                    setTimeout(() => {
                      setShowUploadModal(false)
                      setSelectedProblem('')
                      setSuccess('')
                      loadVideos()
                    }, 2000)
                  }}
                />
              )}

              {!selectedProblem && (
                <div className="p-6 bg-white/5 border border-white/10 rounded-lg text-white/60 text-sm text-center">
                  <VideoIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Please select a problem to upload a video for it.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Videos
