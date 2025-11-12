import { Lock, Mail, RefreshCw, Search, Trash2, Unlock, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import axiosClient from '../api/axiosClient.js'

function SubscriptionManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setMessage({ type: '', text: '' })
      const response = await axiosClient.get('/users/all', {
        params: { limit: 100 }
      })
      setUsers(response.data.users || [])
      if (response.data.users?.length === 0) {
        setMessage({ type: 'info', text: 'No users found' })
      }
    } catch (error) {
      console.error('Error loading users:', error)
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to load users. Please check your connection and try again.'
      setMessage({ type: 'error', text: errorMessage })
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const toggleLock = async (userId, currentStatus) => {
    try {
      setUpdating(true)
      setMessage({ type: '', text: '' })
      const lock = !currentStatus
      const response = await axiosClient.patch(
        `/users/${userId}/subscription/lock`,
        { lock }
      )
      setMessage({
        type: 'success',
        text: lock ? 'Subscription locked successfully' : 'Subscription unlocked successfully'
      })
      await loadUsers()
      if (selectedUser?._id === userId) {
        setSelectedUser(response.data.subscription ? { ...selectedUser, subscription: response.data.subscription } : selectedUser)
      }
    } catch (error) {
      console.error('Error toggling lock:', error)
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update subscription'
      })
    } finally {
      setUpdating(false)
    }
  }

  const updateSubscription = async (userId, updates) => {
    try {
      setUpdating(true)
      setMessage({ type: '', text: '' })
      await axiosClient.patch(`/users/${userId}/subscription`, updates)
      setMessage({ type: 'success', text: 'Subscription updated successfully' })
      await loadUsers()
    } catch (error) {
      console.error('Error updating subscription:', error)
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update subscription'
      })
    } finally {
      setUpdating(false)
    }
  }

  const removeSubscription = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this user\'s subscription? This will revert them to the free plan.')) {
      return
    }

    try {
      setUpdating(true)
      setMessage({ type: '', text: '' })
      const response = await axiosClient.delete(`/users/${userId}/subscription`)
      setMessage({ 
        type: 'success', 
        text: response.data?.message || 'Subscription removed successfully. User reverted to free plan.' 
      })
      await loadUsers()
      if (selectedUser?._id === userId) {
        setSelectedUser({ ...selectedUser, subscription: response.data.subscription })
      }
    } catch (error) {
      console.error('Error removing subscription:', error)
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          `Failed to remove subscription${error.response?.status ? ` (Status: ${error.response.status})` : ''}`
      setMessage({
        type: 'error',
        text: errorMessage
      })
    } finally {
      setUpdating(false)
    }
  }

  const filteredUsers = users.filter((u) => {
    const search = searchTerm.toLowerCase()
    return (
      u.firstName?.toLowerCase().includes(search) ||
      u.emailId?.toLowerCase().includes(search) ||
      u._id?.toString().includes(search)
    )
  })

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="text-white p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Subscription Management</h1>
        <p className="text-white/60">Manage user subscriptions - Lock, unlock, and update subscriptions</p>
      </div>

      {message.text && (
        <div
          className={`mb-4 p-3 rounded-lg ${
            message.type === 'error'
              ? 'bg-red-500/20 border border-red-500/50 text-red-300'
              : message.type === 'success'
              ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300'
              : 'bg-blue-500/20 border border-blue-500/50 text-blue-300'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/30 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-emerald-400/50"
              />
            </div>
            <button
              onClick={loadUsers}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 hover:bg-emerald-500/30 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8 text-white/60">Loading users...</div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredUsers.map((u) => (
                <div
                  key={u._id}
                  onClick={() => setSelectedUser(u)}
                  className={`p-3 rounded-xl border cursor-pointer transition ${
                    selectedUser?._id === u._id
                      ? 'border-emerald-400/50 bg-emerald-500/10'
                      : 'border-white/10 bg-black/30 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 border border-white/15 flex items-center justify-center text-sm font-bold text-black">
                        {u.firstName?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="font-semibold">{u.firstName || 'User'}</div>
                        <div className="text-white/60 text-sm">{u.emailId}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-xs px-2 py-1 rounded ${
                          u.subscription?.isActive
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-red-500/20 text-red-300'
                        }`}
                      >
                        {u.subscription?.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-white/60">No users found</div>
              )}
            </div>
          )}
        </div>

        {}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          {selectedUser ? (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold mb-4">User Details</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-white/60" />
                    <span className="text-white/60">Name:</span>
                    <span className="font-semibold">{selectedUser.firstName || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-white/60" />
                    <span className="text-white/60">Email:</span>
                    <span className="font-semibold">{selectedUser.emailId}</span>
                  </div>
                  <div className="pt-2 border-t border-white/10">
                    <div className="text-sm text-white/60 mb-2">Subscription Status</div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Status:</span>
                        <span
                          className={`font-semibold ${
                            selectedUser.subscription?.isActive
                              ? 'text-emerald-300'
                              : 'text-red-300'
                          }`}
                        >
                          {selectedUser.subscription?.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Plan:</span>
                        <span className="font-semibold">
                          {selectedUser.subscription?.planType || 'free'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Expiry:</span>
                        <span className="font-semibold">
                          {formatDate(selectedUser.subscription?.expiryDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-3">
                <h3 className="font-semibold">Actions</h3>
                <button
                  onClick={() => toggleLock(selectedUser._id, selectedUser.subscription?.isActive)}
                  disabled={updating}
                  className={`w-full px-4 py-2 rounded-xl border transition disabled:opacity-50 flex items-center justify-center gap-2 ${
                    selectedUser.subscription?.isActive
                      ? 'bg-red-500/20 border-red-400/30 text-red-300 hover:bg-red-500/30'
                      : 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300 hover:bg-emerald-500/30'
                  }`}
                >
                  {selectedUser.subscription?.isActive ? (
                    <>
                      <Lock className="w-4 h-4" />
                      Lock Subscription
                    </>
                  ) : (
                    <>
                      <Unlock className="w-4 h-4" />
                      Unlock Subscription
                    </>
                  )}
                </button>
                <button
                  onClick={() => removeSubscription(selectedUser._id)}
                  disabled={updating}
                  className="w-full px-4 py-2 rounded-xl border transition disabled:opacity-50 flex items-center justify-center gap-2 bg-orange-500/20 border-orange-400/30 text-orange-300 hover:bg-orange-500/30"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove Subscription
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-white/60">
              Select a user to view details and manage subscription
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SubscriptionManagement
