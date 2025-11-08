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
    topics: () => axiosClient.get('/problems/topics'),
    solvedMine: () => axiosClient.get('/problems/problemSolved/user'),
  },
  solve: {
    run: (id, payload) => axiosClient.post(`/solve/run/${id}`, payload),
    runCustom: (payload) => axiosClient.post(`/solve/run-custom`, payload),
    submit: (id, payload) => axiosClient.post(`/solve/submit/${id}`, payload),
  },
  submissions: {
    mine: (params) => axiosClient.get('/solve/submissions/user', { params }),
    forProblem: (id, params) => axiosClient.get(`/solve/submissions/problem/${id}`, { params }),
  },
  stats: {
    overview: () => axiosClient.get('/stats/overview'),
    streak: () => axiosClient.get('/stats/streak'),
  },
  contests: {
    list: (params) => axiosClient.get('/contests/getAllContests', { params }),
    get: (id) => axiosClient.get(`/contests/contestById/${id}`),
    myContests: (params) => axiosClient.get('/contests/myContests', { params }),
    join: (id) => axiosClient.post(`/contests/join/${id}`),
    createPersonal: (payload) => axiosClient.post('/contests/createPersonal', payload),
    creationCount: () => axiosClient.get('/contests/creationCount'),
  }
}

export default api
