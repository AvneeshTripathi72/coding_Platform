import axiosClient from '../api/axiosClient.js'

export const api = {
  auth: {
    profile: () => axiosClient.get('/auth/profile'),
    login: (payload) => axiosClient.post('/auth/login', payload),
    logout: () => axiosClient.post('/auth/logout'),
  },
  problems: {
    list: (params) => axiosClient.get('/problems/getAllProblems', { params }),
    get: (id) => axiosClient.get(`/problems/problemById/${id}`),
    create: (payload) => axiosClient.post('/problems/create', payload),
    update: (id, payload) => axiosClient.patch(`/problems/update/${id}`, payload),
    remove: (id) => axiosClient.delete(`/problems/delete/${id}`),
  },
  submissions: {
    listMine: (params) => axiosClient.get('/solve/submissions/user', { params }),
  },
  leaderboard: {
    top: (params) => axiosClient.get('/leaderboard/top', { params }),
  },
  admin: {
    users: {
      list: (params) => axiosClient.get('/users/all', { params }),
      get: (id) => axiosClient.get(`/users/${id}`),
      update: (id, data) => axiosClient.patch(`/users/update/${id}`, data),
      delete: (id) => axiosClient.delete(`/users/delete/${id}`),
    },
    subscriptions: {
      toggleLock: (userId, lock) => axiosClient.patch(`/users/${userId}/subscription/lock`, { lock }),
      update: (userId, data) => axiosClient.patch(`/users/${userId}/subscription`, data),
    }
  }
}

export default api
