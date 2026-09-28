import { Boxes, ChevronRight, Code2, Crown, Database, GitBranch, Grid3x3, Layers, Link2, Lock, Network, Search, Target, TreePine, Type } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PaymentModal from '../components/PaymentModal.jsx'
import { useSubscription } from '../hooks/useSubscription.js'

const COLORS = {
  bg: '#000000',
  card: '#1A1A1A',
  cardHover: '#262626',
  text: '#FFFFFF',
  textSecondary: '#A3A3A3',
  primary: '#3B82F6',
  accent: '#FCD34D',
  accentDark: '#F59E0B',
  border: '#2A2A2A',
  gradient1: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
  gradient2: 'linear-gradient(135deg, #F093FB 0%, #F5576C 100%)',
  gradient3: 'linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)',
}

const algorithmCategories = [
  {
    id: 'array',
    title: 'Array',
    icon: <Grid3x3 className="w-8 h-8" style={{ color: COLORS.primary }} />,
    description: 'Most Important / Famous Interview Topics',
    color: COLORS.primary,
    items: [
      { id: 'linear-search', title: 'Linear Search', icon: '🔍' },
      { id: 'binary-search', title: 'Binary Search', icon: '🎯' },
      { id: 'sorting', title: 'Sorting', icon: '🔄' },
      { id: 'most-famous-algorithms', title: 'Most Famous Algorithms', icon: '⭐' },
    ]
  },
  {
    id: 'string',
    title: '2. String',
    icon: <Type className="w-8 h-8" style={{ color: COLORS.accentDark }} />,
    description: 'Most Important / Famous Interview Topics',
    color: COLORS.accentDark,
    items: [
      { id: 'palindrome-check', title: 'Palindrome Check', icon: '🔄' },
      { id: 'kmp', title: 'Pattern Matching (KMP)', icon: '🔎' },
      { id: 'anagram-check', title: 'Anagram Check', icon: '🔤' },
      { id: 'longest-substring', title: 'Longest Substring Without Repeating Characters', icon: '📏' },
    ]
  },
  {
    id: 'linked-list',
    title: '3. Linked List',
    icon: <Link2 className="w-8 h-8" style={{ color: COLORS.primary }} />,
    description: 'Most Important / Famous Interview Topics',
    color: COLORS.primary,
    items: [
      { id: 'reverse-linked-list', title: 'Reverse Linked List', icon: '🔄' },
      { id: 'detect-cycle', title: 'Detect Cycle (Floyd Algorithm)', icon: '🔁' },
      { id: 'remove-cycle', title: 'Remove Cycle', icon: '✂️' },
      { id: 'find-middle', title: 'Find Middle Node', icon: '📍' },
      { id: 'merge-sorted-lists', title: 'Merge Two Sorted Lists', icon: '🔀' },
    ]
  },
  {
    id: 'stack',
    title: '4. Stack',
    icon: <Layers className="w-8 h-8" style={{ color: COLORS.accentDark }} />,
    description: 'Most Important / Famous Interview Topics',
    color: COLORS.accentDark,
    items: [
      { id: 'next-greater-element', title: 'Next Greater Element', icon: '⬆️' },
      { id: 'valid-parentheses', title: 'Valid Parentheses', icon: '()' },
      { id: 'min-stack', title: 'Min Stack', icon: '📊' },
      { id: 'infix-postfix-prefix', title: 'Infix → Postfix → Prefix conversions', icon: '🔄' },
    ]
  },
  {
    id: 'queue',
    title: '5. Queue',
    icon: <Target className="w-8 h-8" style={{ color: COLORS.primary }} />,
    description: 'Most Important / Famous Interview Topics',
    color: COLORS.primary,
    items: [
      { id: 'circular-queue', title: 'Circular Queue', icon: '⭕' },
      { id: 'deque', title: 'Deque', icon: '↔️' },
      { id: 'sliding-window-deque', title: 'Sliding Window Maximum using Deque', icon: '🪟' },
      { id: 'queue-using-stacks', title: 'Implement Queue using Stacks', icon: '📚' },
    ]
  },
  {
    id: 'hashmap-hashset',
    title: '6. HashMap / HashSet',
    icon: <Database className="w-8 h-8" style={{ color: COLORS.accentDark }} />,
    description: 'Most Important / Famous Interview Topics',
    color: COLORS.accentDark,
    items: [
      { id: 'frequency-count', title: 'Frequency Count', icon: '🔢' },
      { id: 'two-sum', title: 'Two Sum', icon: '➕' },
      { id: 'longest-consecutive', title: 'Longest Consecutive Sequence', icon: '📈' },
      { id: 'subarrays-k-sum', title: 'Subarrays with K Sum', icon: '🎯' },
    ]
  },
  {
    id: 'tree',
    title: '7. Tree',
    icon: <TreePine className="w-8 h-8" style={{ color: COLORS.primary }} />,
    description: 'Most Important / Famous Interview Topics',
    color: COLORS.primary,
    items: [
      { id: 'dfs', title: 'DFS', icon: '🔽' },
      { id: 'bfs-level-order', title: 'BFS (Level Order)', icon: '📊' },
      { id: 'height', title: 'Height', icon: '📏' },
      { id: 'diameter', title: 'Diameter of Tree', icon: '📐' },
      { id: 'lca', title: 'Lowest Common Ancestor (LCA)', icon: '🔗' },
    ]
  },
  {
    id: 'binary-tree-bst',
    title: '8. Binary Tree / BST',
    icon: <GitBranch className="w-8 h-8" style={{ color: COLORS.accentDark }} />,
    description: 'Most Important / Famous Interview Topics',
    color: COLORS.accentDark,
    items: [
      { id: 'traversals', title: 'Inorder/Pre/Post Traversal', icon: '🔄' },
      { id: 'validate-bst', title: 'Validate BST', icon: '✅' },
      { id: 'bst-operations', title: 'Search/Insert/Delete in BST', icon: '🔍' },
      { id: 'lca-bst', title: 'LCA in BST', icon: '🔗' },
    ]
  },
  {
    id: 'heap-priority-queue',
    title: '9. Heap / Priority Queue',
    icon: <Boxes className="w-8 h-8" style={{ color: COLORS.primary }} />,
    description: 'Most Important / Famous Interview Topics',
    color: COLORS.primary,
    items: [
      { id: 'k-largest-smallest', title: 'K Largest/Smallest Elements', icon: '🔝' },
      { id: 'heapify', title: 'Heapify', icon: '⚙️' },
      { id: 'build-heap', title: 'Build Min/Max-Heap', icon: '🏗️' },
      { id: 'dijkstra-pq', title: 'Dijkstra uses Priority Queue', icon: '📍' },
    ]
  },
  {
    id: 'graph',
    title: '10. Graph',
    icon: <Network className="w-8 h-8" style={{ color: COLORS.accentDark }} />,
    description: 'Most Important / Famous Interview Topics',
    color: COLORS.accentDark,
    items: [
      { id: 'graph-bfs', title: 'BFS', icon: '🔵' },
      { id: 'graph-dfs', title: 'DFS', icon: '🟢' },
      { id: 'cycle-detection', title: 'Cycle Detection', icon: '🔁' },
      { id: 'topological-sort', title: 'Topological Sort', icon: '📈' },
      { id: 'shortest-path', title: 'Shortest Path (Dijkstra / Floyd)', icon: '📍' },
      { id: 'mst', title: 'Minimum Spanning Tree (Kruskal/Prim)', icon: '🌳' },
    ]
  },
  {
    id: 'trie',
    title: '11. Trie',
    icon: <Code2 className="w-8 h-8" style={{ color: COLORS.primary }} />,
    description: 'Most Important / Famous Interview Topics',
    color: COLORS.primary,
    items: [
      { id: 'trie-insert', title: 'Insert', icon: '➕' },
      { id: 'trie-search', title: 'Search', icon: '🔍' },
      { id: 'autocomplete', title: 'Autocomplete', icon: '💬' },
      { id: 'count-prefix', title: 'Count Prefix Matches', icon: '🔢' },
      { id: 'word-dictionary', title: 'Word Dictionary', icon: '📖' },
    ]
  }
]

function AlgoVisualization() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const { hasAccess, loading: subscriptionLoading } = useSubscription()
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  const handleAlgorithmClick = (categoryId, algorithmId) => {
    if (!hasAccess) {
      setShowPaymentModal(true)
      return
    }
    navigate(`/algo-visualization/${categoryId}/${algorithmId}`)
  }

  const filteredCategories = algorithmCategories.filter(cat =>
    cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.items?.some(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (subscriptionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/60">Loading...</div>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-2xl w-full">
          <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-2xl p-12 text-center">
            <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">Premium Feature</h2>
            <p className="text-white/70 mb-8 text-lg">
              Subscribe to access algorithm visualizations and editorial videos
            </p>
            <button
              onClick={() => setShowPaymentModal(true)}
              className="bg-yellow-400 text-black font-semibold px-8 py-4 rounded-lg hover:bg-yellow-300 transition text-lg"
            >
              <Lock className="w-5 h-5 inline mr-2" />
              Unlock Premium
            </button>
          </div>
          <PaymentModal
            isOpen={showPaymentModal}
            onClose={() => setShowPaymentModal(false)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4" style={{ color: COLORS.text }}>
            Master Data Structures & Algorithms
          </h2>
          <p className="text-xl mb-12" style={{ color: COLORS.textSecondary }}>
            Visualize and learn algorithms step by step
          </p>
          
          {}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: COLORS.textSecondary }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search algorithms..."
              className="w-full pl-12 pr-4 py-4 rounded-xl border text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm text-white placeholder:text-gray-500"
              style={{ borderColor: COLORS.border, backgroundColor: COLORS.card }}
            />
          </div>
        </div>

        {}
        <div className="space-y-8">
          {filteredCategories.map((category) => (
            <div key={category.id} className="space-y-4">
              {}
              <div className="rounded-2xl border p-6 shadow-lg hover:shadow-xl transition-all duration-300" style={{ backgroundColor: COLORS.card, borderColor: COLORS.border }}>
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-3 rounded-xl" style={{ backgroundColor: category.color + '20' }}>
                    {category.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-1" style={{ color: COLORS.text }}>{category.title}</h3>
                    <p className="text-sm" style={{ color: COLORS.textSecondary }}>{category.description}</p>
                  </div>
                </div>
              </div>

              {}
              {category.items && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleAlgorithmClick(category.id, item.id)}
                      className="group rounded-xl border p-6 text-left hover:scale-105 hover:shadow-lg transition-all duration-300 relative overflow-hidden"
                      style={{ 
                        backgroundColor: COLORS.card, 
                        borderColor: COLORS.border 
                      }}
                    >
                      {}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity" style={{ background: `linear-gradient(135deg, ${category.color} 0%, ${COLORS.accent} 100%)` }}></div>
                      
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-3xl">{item.icon}</span>
                        </div>
                        <h4 className="text-lg font-semibold mb-2 group-hover:text-blue-400 transition" style={{ color: COLORS.text }}>
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2 text-sm opacity-0 group-hover:opacity-100 transition" style={{ color: COLORS.primary }}>
                          <span>Learn more</span>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AlgoVisualization
