import { Edit2, Eye, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import axiosClient from '../api/axiosClient.js'

function Users(){
  const [users, setUsers] = useState([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('create') // create | edit | view
  const [selectedUser, setSelectedUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const limit = 20

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    emailId: '',
    password: '',
    age: '',
    role: 'user'
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [tableMessage, setTableMessage] = useState('')

  const load = async () => {
    setLoading(true)
    setTableMessage('')
    const params = { page, limit }
    if (search.trim()) params.search = search.trim()
    try {
      const url = `/users/all?${new URLSearchParams(params).toString()}`
      const { data } = await axiosClient.get(url)
      setUsers(Array.isArray(data.users) ? data.users : [])
      setTotal(data.total || 0)
      if (data.users && data.users.length === 0 && !search.trim()) {
        setTableMessage('No users found in database')
        setTimeout(() => setTableMessage(''), 3000)
      }
    } catch(e){
      console.error('Error loading users:', e)
      const errorMsg = e.response?.data?.message || e.response?.statusText || e.message || 'Failed to load users'
      const statusCode = e.response?.status
      setTableMessage(`Error ${statusCode || ''}: ${errorMsg}`)
      setUsers([])
      setTotal(0)
      setTimeout(() => setTableMessage(''), 5000)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [page])

  const openModal = async (mode, user = null) => {
    setModalMode(mode)
    setSelectedUser(user)
    setError('')
    setSuccess('')
    
    if (mode === 'create') {
      setFormData({
        firstName: '',
        lastName: '',
        emailId: '',
        password: '',
        age: '',
        role: 'user'
      })
      setShowModal(true)
    } else if (user && user._id) {
      try {
        const { data } = await axiosClient.get(`/users/${user._id}`)
        const fullUser = data.user || data
        setSelectedUser(fullUser)
        setFormData({
          firstName: fullUser.firstName || '',
          lastName: fullUser.lastName || '',
          emailId: fullUser.emailId || '',
          password: '',
          age: fullUser.age || '',
          role: fullUser.role || 'user'
        })
        setShowModal(true)
      } catch (e) {
        setError('Failed to load user details')
      }
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedUser(null)
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
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        emailId: formData.emailId,
        password: formData.password,
        age: formData.age ? Number(formData.age) : undefined,
        role: formData.role
      }
      await axiosClient.post('/users/create', payload)
      setSuccess('User created successfully!')
      load()
      setTimeout(() => closeModal(), 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user')
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
      const payload = {}
      if (formData.firstName) payload.firstName = formData.firstName
      if (formData.lastName !== undefined) payload.lastName = formData.lastName
      if (formData.age !== undefined) payload.age = formData.age ? Number(formData.age) : undefined
      if (formData.role) payload.role = formData.role
      if (formData.password) payload.password = formData.password

      await axiosClient.patch(`/users/update/${selectedUser._id}`, payload)
      setSuccess('User updated successfully!')
      load()
      setTimeout(() => closeModal(), 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (user = null) => {
    const userToDelete = user || selectedUser
    if (!userToDelete) return
    if (!confirm(`Delete user "${userToDelete.firstName} (${userToDelete.emailId})"?`)) return
    
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      await axiosClient.delete(`/users/delete/${userToDelete._id}`)
      const message = 'User deleted successfully!'
      if (showModal) {
        setSuccess(message)
        setTimeout(() => closeModal(), 1500)
      } else {
        setTableMessage(message)
        setTimeout(() => setTableMessage(''), 3000)
      }
      load()
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to delete user'
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

  const onSearch = (e) => {
    e.preventDefault()
    setPage(1)
    // Load will be triggered by the page change in useEffect
    setTimeout(() => load(), 0)
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">Users</h2>
        <button
          onClick={() => openModal('create')}
          className="px-3 py-2 rounded-xl text-sm border border-white/15 hover:bg-white/10 transition"
        >
          Create User
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
          placeholder="Search by name or email..."
          className="bg-black border border-white/15 rounded px-3 py-2 w-full"
        />
        <button className="px-3 py-2 rounded-xl text-sm border border-white/15 hover:bg-white/10 transition">
          Search
        </button>
      </form>

      <div className="mt-4 rounded-2xl border border-white/10 overflow-hidden bg-black/40">
        <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-white/5 text-sm text-white/70 font-medium">
          <div className="col-span-3 min-w-0">Name</div>
          <div className="col-span-4 min-w-0">Email</div>
          <div className="col-span-2 min-w-0">Role</div>
          <div className="col-span-1 min-w-0 text-center">Solved</div>
          <div className="col-span-2 min-w-0 text-right">Actions</div>
        </div>
        {loading && users.length === 0 && (
          <div className="px-4 py-8 text-white/60 text-sm text-center">Loading...</div>
        )}
        {!loading && users.map((u) => (
          <div key={u._id} className="grid grid-cols-12 gap-4 px-4 py-3 border-t border-white/10 text-sm hover:bg-white/5 transition items-center">
            <div className="col-span-3 min-w-0 truncate" title={`${u.firstName} ${u.lastName || ''}`}>
              {u.firstName} {u.lastName || ''}
            </div>
            <div className="col-span-4 min-w-0 truncate text-white/70" title={u.emailId}>
              {u.emailId}
            </div>
            <div className="col-span-2 min-w-0 capitalize truncate">{u.role || 'user'}</div>
            <div className="col-span-1 min-w-0 text-center text-white/70">{u.solvedCount || 0}</div>
            <div className="col-span-2 min-w-0 flex items-center justify-end gap-2">
              <button
                onClick={() => openModal('view', u)}
                className="p-2 rounded-lg bg-emerald-400/10 hover:bg-emerald-400/20 border border-emerald-400/30 hover:border-emerald-400/50 text-emerald-400 transition-all group"
                title="View User"
              >
                <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
              <button
                onClick={() => openModal('edit', u)}
                className="p-2 rounded-lg bg-blue-400/10 hover:bg-blue-400/20 border border-blue-400/30 hover:border-blue-400/50 text-blue-400 transition-all group"
                title="Edit User"
              >
                <Edit2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
              <button
                onClick={() => handleDelete(u)}
                className="p-2 rounded-lg bg-rose-400/10 hover:bg-rose-400/20 border border-rose-400/30 hover:border-rose-400/50 text-rose-400 transition-all group"
                title="Delete User"
              >
                <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        ))}
        {!loading && users.length === 0 && <div className="px-4 py-8 text-white/60 text-sm text-center">No users found.</div>}
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
          <div className="bg-black border border-white/20 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-black border-b border-white/10 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {modalMode === 'create' && 'Create User'}
                {modalMode === 'edit' && 'Update User'}
                {modalMode === 'view' && 'View User'}
              </h3>
              <div className="flex items-center gap-2">
                {modalMode === 'edit' && selectedUser && (
                  <button
                    onClick={() => handleDelete()}
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
                    <label className="text-white/70">Name</label>
                    <div className="mt-1 text-white">{formData.firstName} {formData.lastName || ''}</div>
                  </div>
                  <div>
                    <label className="text-white/70">Email</label>
                    <div className="mt-1 text-white">{formData.emailId}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-white/70">Role</label>
                      <div className="mt-1 text-white capitalize">{formData.role}</div>
                    </div>
                    <div>
                      <label className="text-white/70">Age</label>
                      <div className="mt-1 text-white">{formData.age || 'N/A'}</div>
                    </div>
                  </div>
                  {selectedUser && (
                    <div>
                      <label className="text-white/70">Problems Solved</label>
                      <div className="mt-1 text-white">{selectedUser.solvedCount || 0}</div>
                    </div>
                  )}
                  <div className="pt-4 border-t border-white/10">
                    <button
                      onClick={() => {
                        if (selectedUser) {
                          openModal('edit', selectedUser)
                        }
                      }}
                      className="px-4 py-2 rounded-lg text-sm bg-white text-black hover:opacity-90 transition"
                    >
                      Edit User
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={modalMode === 'create' ? handleCreate : handleUpdate} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-white/70 mb-1">First Name *</label>
                      <input
                        required
                        className="w-full bg-black border border-white/15 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-400/50"
                        value={formData.firstName}
                        onChange={(e)=>handleChange('firstName', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white/70 mb-1">Last Name</label>
                      <input
                        className="w-full bg-black border border-white/15 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-400/50"
                        value={formData.lastName}
                        onChange={(e)=>handleChange('lastName', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-white/70 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      disabled={modalMode === 'edit'}
                      className="w-full bg-black border border-white/15 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-400/50 disabled:opacity-50"
                      value={formData.emailId}
                      onChange={(e)=>handleChange('emailId', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-white/70 mb-1">Password {modalMode === 'create' ? '*' : '(leave empty to keep current)'}</label>
                      <input
                        type="password"
                        required={modalMode === 'create'}
                        className="w-full bg-black border border-white/15 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-400/50"
                        value={formData.password}
                        onChange={(e)=>handleChange('password', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white/70 mb-1">Age</label>
                      <input
                        type="number"
                        min="5"
                        className="w-full bg-black border border-white/15 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-400/50"
                        value={formData.age}
                        onChange={(e)=>handleChange('age', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-white/70 mb-1">Role</label>
                    <select
                      className="w-full bg-black border border-white/15 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-400/50"
                      value={formData.role}
                      onChange={(e)=>handleChange('role', e.target.value)}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
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

export default Users




