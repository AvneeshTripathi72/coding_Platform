import {
    Activity,
    BarChart3,
    CheckCircle2,
    Code,
    CreditCard,
    FileText,
    Key,
    Loader2,
    MessageSquare,
    Search,
    Server,
    Trophy,
    Users,
    Video,
    XCircle
} from 'lucide-react'
import { useState } from 'react'
import axiosClient from '../api/axiosClient.js'

const endpointCategories = {
  'General': [
    { method: 'GET', path: '/', category: 'General', icon: Server }
  ],
  'Authentication': [
    { method: 'POST', path: '/auth/register', category: 'Authentication', icon: Key },
    { method: 'POST', path: '/auth/login', category: 'Authentication', icon: Key },
    { method: 'GET', path: '/auth/profile', category: 'Authentication', icon: Key },
    { method: 'GET', path: '/auth/checkAuth', category: 'Authentication', icon: Key },
    { method: 'POST', path: '/auth/admin/register', category: 'Authentication', icon: Key, admin: true },
    { method: 'POST', path: '/auth/logout', category: 'Authentication', icon: Key }
  ],
  'Problems': [
    { method: 'GET', path: '/problems/getAllProblems', category: 'Problems', icon: FileText },
    { method: 'GET', path: '/problems/problemById/:id', sample: '/problems/problemById/ID_HERE', category: 'Problems', icon: FileText },
    { method: 'GET', path: '/problems/admin/problemById/:id', sample: '/problems/admin/problemById/ID_HERE', category: 'Problems', icon: FileText, admin: true },
    { method: 'POST', path: '/problems/create', category: 'Problems', icon: FileText, admin: true },
    { method: 'PATCH', path: '/problems/update/:id', sample: '/problems/update/ID_HERE', category: 'Problems', icon: FileText, admin: true },
    { method: 'DELETE', path: '/problems/delete/:id', sample: '/problems/delete/ID_HERE', category: 'Problems', icon: FileText, admin: true },
    { method: 'GET', path: '/problems/topics', category: 'Problems', icon: FileText },
    { method: 'GET', path: '/problems/problemSolved/user', category: 'Problems', icon: FileText }
  ],
  'Contests': [
    { method: 'GET', path: '/contests/getAllContests', category: 'Contests', icon: Trophy },
    { method: 'GET', path: '/contests/contestById/:id', sample: '/contests/contestById/ID_HERE', category: 'Contests', icon: Trophy },
    { method: 'GET', path: '/contests/myContests', category: 'Contests', icon: Trophy },
    { method: 'GET', path: '/contests/creationCount', category: 'Contests', icon: Trophy },
    { method: 'POST', path: '/contests/join/:id', sample: '/contests/join/ID_HERE', category: 'Contests', icon: Trophy },
    { method: 'POST', path: '/contests/createPersonal', category: 'Contests', icon: Trophy },
    { method: 'POST', path: '/contests/create', category: 'Contests', icon: Trophy, admin: true },
    { method: 'PATCH', path: '/contests/update/:id', sample: '/contests/update/ID_HERE', category: 'Contests', icon: Trophy, admin: true },
    { method: 'DELETE', path: '/contests/delete/:id', sample: '/contests/delete/ID_HERE', category: 'Contests', icon: Trophy, admin: true }
  ],
  'Submissions': [
    { method: 'POST', path: '/solve/run/:id', sample: '/solve/run/ID_HERE', category: 'Submissions', icon: Code },
    { method: 'POST', path: '/solve/submit/:id', sample: '/solve/submit/ID_HERE', category: 'Submissions', icon: Code },
    { method: 'POST', path: '/solve/run-custom', category: 'Submissions', icon: Code },
    { method: 'GET', path: '/solve/submissions/user', category: 'Submissions', icon: Code },
    { method: 'GET', path: '/solve/submissions/problem/:id', sample: '/solve/submissions/problem/ID_HERE', category: 'Submissions', icon: Code }
  ],
  'Leaderboard': [
    { method: 'GET', path: '/leaderboard/top', category: 'Leaderboard', icon: BarChart3 }
  ],
  'Stats': [
    { method: 'GET', path: '/stats/overview', category: 'Stats', icon: Activity },
    { method: 'GET', path: '/stats/streak', category: 'Stats', icon: Activity }
  ],
  'Videos': [
    { method: 'POST', path: '/videos/upload-token', category: 'Videos', icon: Video, admin: true },
    { method: 'POST', path: '/videos/save', category: 'Videos', icon: Video, admin: true },
    { method: 'GET', path: '/videos/all', category: 'Videos', icon: Video, admin: true },
    { method: 'GET', path: '/videos/problem/:problemId', sample: '/videos/problem/ID_HERE', category: 'Videos', icon: Video },
    { method: 'GET', path: '/videos/:videoId', sample: '/videos/ID_HERE', category: 'Videos', icon: Video },
    { method: 'PATCH', path: '/videos/:videoId', sample: '/videos/ID_HERE', category: 'Videos', icon: Video, admin: true },
    { method: 'DELETE', path: '/videos/:videoId', sample: '/videos/ID_HERE', category: 'Videos', icon: Video, admin: true }
  ],
  'Users': [
    { method: 'GET', path: '/user-management/all', category: 'Users', icon: Users, admin: true },
    { method: 'POST', path: '/user-management/create', category: 'Users', icon: Users, admin: true },
    { method: 'GET', path: '/user-management/:id', sample: '/user-management/ID_HERE', category: 'Users', icon: Users, admin: true },
    { method: 'PATCH', path: '/user-management/update/:id', sample: '/user-management/update/ID_HERE', category: 'Users', icon: Users, admin: true },
    { method: 'DELETE', path: '/user-management/delete/:id', sample: '/user-management/delete/ID_HERE', category: 'Users', icon: Users, admin: true }
  ],
  'Payments': [
    { method: 'POST', path: '/payment/create-order', category: 'Payments', icon: CreditCard },
    { method: 'POST', path: '/payment/verify', category: 'Payments', icon: CreditCard },
    { method: 'GET', path: '/payment/subscription-status', category: 'Payments', icon: CreditCard }
  ],
  'AI Chat': [
    { method: 'POST', path: '/ai-chat/message', category: 'AI Chat', icon: MessageSquare }
  ]
}

const methodColors = {
  'GET': 'bg-blue-400/20 text-blue-400 border-blue-400/30',
  'POST': 'bg-emerald-400/20 text-emerald-400 border-emerald-400/30',
  'PATCH': 'bg-amber-400/20 text-amber-400 border-amber-400/30',
  'DELETE': 'bg-rose-400/20 text-rose-400 border-rose-400/30',
  'PUT': 'bg-purple-400/20 text-purple-400 border-purple-400/30'
}

const categoryIcons = {
  'General': Server,
  'Authentication': Key,
  'Problems': FileText,
  'Contests': Trophy,
  'Submissions': Code,
  'Leaderboard': BarChart3,
  'Stats': Activity,
  'Videos': Video,
  'Users': Users,
  'Payments': CreditCard,
  'AI Chat': MessageSquare
}

function Endpoints(){
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [expandedCategories, setExpandedCategories] = useState(Object.keys(endpointCategories))

  const allEndpoints = Object.values(endpointCategories).flat()

  const filteredEndpoints = allEndpoints.filter(endpoint => {
    const matchesSearch = endpoint.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         endpoint.method.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || endpoint.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const groupedFiltered = filteredEndpoints.reduce((acc, endpoint) => {
    if (!acc[endpoint.category]) {
      acc[endpoint.category] = []
    }
    acc[endpoint.category].push(endpoint)
    return acc
  }, {})

  const probe = async (endpoint) => {
    const url = endpoint.sample || endpoint.path
    const key = endpoint.path
    
    setLoading(prev => ({ ...prev, [key]: true }))
    
    const startTime = Date.now()
    
    try {
      const res = await axiosClient({ 
        method: endpoint.method.toLowerCase(), 
        url,
        validateStatus: () => true
      })
      const responseTime = Date.now() - startTime
      setResults(prev => ({ 
        ...prev, 
        [key]: { 
          status: res.status, 
          success: res.status >= 200 && res.status < 300,
          time: responseTime
        } 
      }))
    } catch (err) {
      const responseTime = Date.now() - startTime
      setResults(prev => ({ 
        ...prev, 
        [key]: { 
          status: err.response?.status || 'ERR', 
          success: false,
          time: responseTime
        } 
      }))
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }))
    }
  }

  const toggleCategory = (category) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const getStatusBadge = (endpoint) => {
    const result = results[endpoint.path]
    if (!result) return null

    if (result.success) {
      return (
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-emerald-400 font-medium">{result.status}</span>
          <span className="text-white/40 text-xs">({result.time}ms)</span>
        </div>
      )
    } else {
      return (
        <div className="flex items-center gap-2">
          <XCircle className="w-4 h-4 text-rose-400" />
          <span className="text-rose-400 font-medium">{result.status}</span>
          <span className="text-white/40 text-xs">({result.time}ms)</span>
        </div>
      )
    }
  }

  return (
    <div className="space-y-6">
      {}
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Server className="w-6 h-6 text-emerald-400" />
          API Endpoints
        </h2>
        <p className="text-white/60 text-sm">Test and monitor all available API endpoints</p>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-white/10 bg-black/40 p-4 hover:bg-black/60 transition">
          <div className="text-xs text-white/70 mb-2 font-medium">Total Endpoints</div>
          <div className="text-3xl font-bold text-white">{allEndpoints.length}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/40 p-4 hover:bg-black/60 transition">
          <div className="text-xs text-white/70 mb-2 font-medium">Tested</div>
          <div className="text-3xl font-bold text-emerald-400">{Object.keys(results).length}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/40 p-4 hover:bg-black/60 transition">
          <div className="text-xs text-white/70 mb-2 font-medium">Successful</div>
          <div className="text-3xl font-bold text-emerald-400">
            {Object.values(results).filter(r => r.success).length}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/40 p-4 hover:bg-black/60 transition">
          <div className="text-xs text-white/70 mb-2 font-medium">Failed</div>
          <div className="text-3xl font-bold text-rose-400">
            {Object.values(results).filter(r => !r.success).length}
          </div>
        </div>
      </div>

      {}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Search endpoints..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-emerald-400/50 transition"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-emerald-400/50 transition"
        >
          <option value="all">All Categories</option>
          {Object.keys(endpointCategories).map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {}
      <div className="space-y-4">
        {Object.entries(endpointCategories).map(([category, endpoints]) => {
          const categoryEndpoints = selectedCategory === 'all' || selectedCategory === category
            ? endpoints.filter(e => 
                e.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
                e.method.toLowerCase().includes(searchQuery.toLowerCase())
              )
            : []
          
          if (categoryEndpoints.length === 0 && selectedCategory !== 'all') return null
          
          const isExpanded = expandedCategories.includes(category)
          const CategoryIcon = categoryIcons[category] || Server

          return (
            <div key={category} className="rounded-xl border border-white/10 bg-black/40 overflow-hidden">
              {}
              <button
                onClick={() => toggleCategory(category)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-400/10 border border-emerald-400/30 group-hover:bg-emerald-400/20 transition">
                    <CategoryIcon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-white">{category}</div>
                    <div className="text-xs text-white/60">{categoryEndpoints.length} endpoints</div>
                  </div>
                </div>
                <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                  <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {}
              {isExpanded && (
                <div className="border-t border-white/10 divide-y divide-white/10">
                  {categoryEndpoints.map((endpoint, idx) => {
                    const EndpointIcon = endpoint.icon || Server
                    const isLoading = loading[endpoint.path]
                    const result = results[endpoint.path]

                    return (
                      <div
                        key={idx}
                        className="px-6 py-4 hover:bg-white/5 transition group"
                      >
                        <div className="flex items-center gap-4">
                          {}
                          <div className={`px-3 py-1.5 rounded-lg border font-semibold text-xs min-w-[70px] text-center ${methodColors[endpoint.method] || methodColors.GET}`}>
                            {endpoint.method}
                          </div>

                          {}
                          <div className="p-2 rounded-lg bg-white/5 border border-white/10 group-hover:bg-white/10 transition">
                            <EndpointIcon className="w-4 h-4 text-white/60" />
                          </div>

                          {}
                          <div className="flex-1 min-w-0">
                            <div className="font-mono text-sm text-white truncate">
                              {endpoint.sample || endpoint.path}
                            </div>
                            {endpoint.admin && (
                              <div className="text-xs text-amber-400 mt-1">Admin Only</div>
                            )}
                          </div>

                          {}
                          <div className="min-w-[120px] text-right">
                            {isLoading ? (
                              <div className="flex items-center justify-end gap-2">
                                <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                                <span className="text-white/60 text-sm">Testing...</span>
                              </div>
                            ) : result ? (
                              getStatusBadge(endpoint)
                            ) : (
                              <span className="text-white/40 text-sm">-</span>
                            )}
                          </div>

                          {}
                          <button
                            onClick={() => probe(endpoint)}
                            disabled={isLoading}
                            className="px-4 py-2 rounded-lg bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/20 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                          >
                            {isLoading ? 'Testing...' : 'Test'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {}
      {filteredEndpoints.length === 0 && (
        <div className="text-center py-16 text-white/60">
          <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">No endpoints found</p>
          <p className="text-sm">Try adjusting your search or filter</p>
        </div>
      )}
    </div>
  )
}

export default Endpoints
