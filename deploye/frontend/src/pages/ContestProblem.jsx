import { ArrowLeft, Calendar, CheckCircle2, Clock, Trophy, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../utils/api.js'

function ContestProblem(){
  const { id } = useParams()
  const navigate = useNavigate()
  const [contest, setContest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    const loadContest = async () => {
      try {
        const { data } = await api.contests.get(id)
        setContest(data.contest)
      } catch (e) {
        console.error('Failed to load contest:', e)
      } finally {
        setLoading(false)
      }
    }
    if (id) loadContest()
  }, [id])

  const handleJoin = async () => {
    setJoining(true)
    try {
      await api.contests.join(id)
      const { data } = await api.contests.get(id)
      setContest(data.contest)
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to join contest')
    } finally {
      setJoining(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
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
      if (days > 0) return `${days} days ${hours} hours`
      if (hours > 0) return `${hours} hours ${minutes} minutes`
      return `${minutes} minutes`
    } else if (now < end) {
      const diff = end - now
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60)) / (1000 * 60))
      return `Ends in ${hours} hours ${minutes} minutes`
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

  const getDifficultyColor = (diff) => {
    if (!diff) return 'text-white/60'
    const d = diff.toLowerCase()
    if (d === 'easy') return 'text-emerald-400'
    if (d === 'medium') return 'text-amber-400'
    if (d === 'hard') return 'text-rose-400'
    return 'text-white/60'
  }

  if (loading) {
    return (
      <div className="text-center py-12 text-white/60">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        <p className="mt-2">Loading contest...</p>
      </div>
    )
  }

  if (!contest) {
    return (
      <div className="text-center py-12 text-white/60">
        <p>Contest not found</p>
        <button
          onClick={() => navigate('/contests')}
          className="mt-4 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition"
        >
          Back to Contests
        </button>
      </div>
    )
  }

  return (
    <div className="text-white space-y-6">
      {}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/contests')}
          className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold">{contest.title}</h1>
            <span className={`px-3 py-1 rounded-lg text-sm font-medium border ${getStatusBadge(contest.status)}`}>
              {contest.status.charAt(0).toUpperCase() + contest.status.slice(1)}
            </span>
          </div>
          <p className="text-white/70">{contest.description}</p>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-white/10 bg-black/40 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-white/70">Start Time</span>
          </div>
          <p className="text-sm font-medium">{formatDate(contest.startTime)}</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/40 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            <span className="text-sm text-white/70">Time Remaining</span>
          </div>
          <p className="text-sm font-medium">{getTimeRemaining(contest.startTime, contest.endTime)}</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/40 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span className="text-sm text-white/70">Problems</span>
          </div>
          <p className="text-sm font-medium">{contest.problems?.length || 0}</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/40 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-white/70">Participants</span>
          </div>
          <p className="text-sm font-medium">{contest.participants?.length || 0}</p>
        </div>
      </div>

      {}
      {contest.status === 'upcoming' && !contest.isParticipant && (
        <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold mb-1 text-emerald-400">Join this contest</h3>
              <p className="text-sm text-white/70">Participate and compete with others!</p>
            </div>
            <button
              onClick={handleJoin}
              disabled={joining}
              className="px-6 py-3 rounded-lg bg-emerald-400 text-black font-semibold hover:bg-emerald-500 transition disabled:opacity-50"
            >
              {joining ? 'Joining...' : 'Join Contest'}
            </button>
          </div>
        </div>
      )}

      {contest.isParticipant && (
        <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-emerald-400 font-medium">You are participating in this contest</span>
        </div>
      )}

      {}
      <div>
        <h2 className="text-xl font-semibold mb-4">Problems</h2>
        {contest.problems && contest.problems.length > 0 ? (
          <div className="space-y-3">
            {contest.problems.map((problem, index) => (
              <div
                key={problem._id}
                className="group rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center font-semibold text-emerald-400">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <div>
                      <h3 className="font-semibold group-hover:text-emerald-400 transition">
                        {problem.title}
                      </h3>
                      <span className={`text-sm font-medium ${getDifficultyColor(problem.difficulty)}`}>
                        {problem.difficulty}
                      </span>
                    </div>
                  </div>
                  {contest.status === 'ongoing' || contest.isParticipant ? (
                    <button
                      onClick={() => {
                        const solveUrl = `/contest/${id}/solve/${problem._id}`
                        window.open(solveUrl, 'ContestSolving', 'width=1400,height=900,resizable=yes,scrollbars=yes')
                      }}
                      className="px-4 py-2 rounded-lg bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/20 transition text-sm font-medium"
                    >
                      Solve
                    </button>
                  ) : (
                    <span className="text-white/40 text-sm">Locked</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-white/60 rounded-xl border border-white/10 bg-black/40">
            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No problems added yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ContestProblem
