import { useEffect, useState } from 'react'
import axiosClient from '../api/axiosClient.js'
import DashboardCard from '../components/DashboardCard.jsx'

function Dashboard(){
  const [stats, setStats] = useState({ problems: 0, users: 0, submissions: 0 })
  const [showAdminForm, setShowAdminForm] = useState(false)
  const [adminForm, setAdminForm] = useState({
    firstName: '',
    lastName: '',
    emailId: '',
    password: '',
    age: ''
  })
  const [adminError, setAdminError] = useState('')
  const [adminSuccess, setAdminSuccess] = useState('')
  const [adminLoading, setAdminLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const [problems, leaderboard, mySubs] = await Promise.all([
          axiosClient.get('/problems/getAllProblems?limit=1'),
          axiosClient.get('/leaderboard/top?limit=1'),
          axiosClient.get('/solve/submissions/user?limit=1').catch(()=>({data:{submissions:[]}}))
        ])
        setStats({
          problems: problems.data.total || 0,
          users: leaderboard.data.users?.length || 0,
          submissions: mySubs.data.submissions?.length || 0,
        })
      } catch (e) { 
        console.error('Error loading dashboard stats:', e)
        // Set defaults on error
        setStats({ problems: 0, users: 0, submissions: 0 })
      }
    }
    load()
  }, [])

  const handleAdminChange = (e) => {
    setAdminForm({ ...adminForm, [e.target.name]: e.target.value })
    setAdminError('')
    setAdminSuccess('')
  }

  const createAdmin = async (e) => {
    e.preventDefault()
    setAdminError('')
    setAdminSuccess('')
    setAdminLoading(true)

    try {
      const { firstName, lastName, emailId, password, age } = adminForm
      await axiosClient.post('/auth/admin/register', {
        firstName,
        lastName,
        emailId,
        password,
        age: age ? Number(age) : undefined
      })
      setAdminSuccess('Admin created successfully!')
      setAdminForm({ firstName: '', lastName: '', emailId: '', password: '', age: '' })
      setShowAdminForm(false)
    } catch (err) {
      setAdminError(err.response?.data?.message || 'Failed to create admin')
    } finally {
      setAdminLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
        <DashboardCard title="Problems" value={stats.problems} />
        <DashboardCard title="Users (top list)" value={stats.users} />
        <DashboardCard title="Your Submissions (recent)" value={stats.submissions} />
      </div>

      {/* Create New Admin Section */}
      <div className="mt-6 border border-white/10 rounded-xl p-4 bg-black/40">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold">Create New Admin</h3>
          <button
            onClick={() => {
              setShowAdminForm(!showAdminForm)
              setAdminError('')
              setAdminSuccess('')
            }}
            className="px-3 py-1.5 text-sm border border-white/15 rounded-xl hover:bg-white/10 transition"
          >
            {showAdminForm ? 'Cancel' : 'Add Admin'}
          </button>
        </div>

        {showAdminForm && (
          <form onSubmit={createAdmin} className="space-y-3">
            {adminError && (
              <div className="p-2 bg-rose-400/10 border border-rose-400/20 rounded text-rose-300 text-sm">
                {adminError}
              </div>
            )}
            {adminSuccess && (
              <div className="p-2 bg-emerald-400/10 border border-emerald-400/20 rounded text-emerald-300 text-sm">
                {adminSuccess}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-white/70 mb-1">First Name</label>
                <input
                  type="text"
                  required
                  name="firstName"
                  className="w-full bg-black border border-white/15 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-400/50"
                  value={adminForm.firstName}
                  onChange={handleAdminChange}
                />
              </div>
              <div>
                <label className="block text-xs text-white/70 mb-1">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  className="w-full bg-black border border-white/15 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-400/50"
                  value={adminForm.lastName}
                  onChange={handleAdminChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-white/70 mb-1">Email</label>
              <input
                type="email"
                required
                name="emailId"
                className="w-full bg-black border border-white/15 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-400/50"
                value={adminForm.emailId}
                onChange={handleAdminChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-white/70 mb-1">Password</label>
                <input
                  type="password"
                  required
                  name="password"
                  minLength={8}
                  className="w-full bg-black border border-white/15 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-400/50"
                  value={adminForm.password}
                  onChange={handleAdminChange}
                />
              </div>
              <div>
                <label className="block text-xs text-white/70 mb-1">Age (optional)</label>
                <input
                  type="number"
                  name="age"
                  min="5"
                  className="w-full bg-black border border-white/15 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-400/50"
                  value={adminForm.age}
                  onChange={handleAdminChange}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={adminLoading}
              className="w-full mt-3 px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {adminLoading ? 'Creating...' : 'Create Admin'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default Dashboard
