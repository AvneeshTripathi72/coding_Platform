import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

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
  success: '#10B981',
  error: '#EF4444',
}

const algorithmCategories = [
  {
    id: 'two-pointer',
    title: 'Two Pointer Technique',
    icon: '👆',
    color: COLORS.primary,
    problems: [
      { id: 'two-sum-sorted', title: 'Two Sum (sorted array)', icon: '🎯' },
      { id: 'remove-duplicates', title: 'Remove Duplicates from Sorted Array', icon: '🗑️' },
      { id: 'move-zeroes', title: 'Move Zeroes to End', icon: '↔️' },
      { id: '3sum', title: '3Sum', icon: '🔢' },
    ]
  },
  {
    id: 'sliding-window',
    title: 'Sliding Window Technique',
    icon: '🪟',
    color: COLORS.accent,
    problems: [
      { id: 'max-sum-subarray-k', title: 'Maximum Sum Subarray of Size K (Fixed Window)', icon: '📊' },
      { id: 'longest-substring-no-repeat', title: 'Longest Substring Without Repeating Characters (Variable Window)', icon: '📝' },
      { id: 'min-window-substring', title: 'Minimum Window Substring (Variable Window)', icon: '🔍' },
      { id: 'longest-1s-flip-k', title: 'Longest Subarray of 1s After Flipping K Zeroes', icon: '🔄' },
    ]
  },
  {
    id: 'kadane',
    title: "Kadane's Algorithm Group",
    icon: '⚡',
    color: COLORS.accentDark,
    problems: [
      { id: 'max-subarray-sum', title: 'Maximum Subarray Sum', icon: '📈' },
      { id: 'best-time-buy-sell', title: 'Best Time to Buy and Sell Stock', icon: '💰' },
    ]
  },
  {
    id: 'hashing-prefix',
    title: 'Hashing / Prefix Sum',
    icon: '🔑',
    color: COLORS.success,
    problems: [
      { id: 'two-sum-unsorted', title: 'Two Sum (unsorted)', icon: '🎯' },
      { id: 'subarray-sum-k', title: 'Subarray with Sum = K', icon: '➕' },
      { id: 'majority-element', title: "Majority Element (Moore's Voting)", icon: '🗳️' },
    ]
  },
  {
    id: 'sorting-tricks',
    title: 'Sorting Tricks',
    icon: '🔄',
    color: COLORS.primary,
    problems: [
      { id: 'sort-colors', title: 'Sort Colors (Dutch National Flag Algorithm)', icon: '🎨' },
      { id: 'kth-largest-smallest', title: 'Kth Largest / Smallest (Quickselect / Heap)', icon: '🔢' },
    ]
  },
]

const top10Problems = [
  { id: 'two-sum', title: 'Two Sum', icon: '1️⃣' },
  { id: 'max-subarray-kadane', title: 'Maximum Subarray (Kadane)', icon: '2️⃣' },
  { id: 'best-time-buy-sell-stock', title: 'Best Time to Buy and Sell Stock', icon: '3️⃣' },
  { id: 'sort-colors-dnf', title: 'Sort Colors (DNF)', icon: '4️⃣' },
  { id: 'majority-element-moore', title: 'Majority Element', icon: '5️⃣' },
  { id: 'move-zeroes-end', title: 'Move Zeroes', icon: '6️⃣' },
  { id: 'remove-duplicates-sorted', title: 'Remove Duplicates', icon: '7️⃣' },
  { id: '3sum-problem', title: '3Sum', icon: '8️⃣' },
  { id: 'subarray-sum-equals-k', title: 'Subarray Sum = K', icon: '9️⃣' },
  { id: 'longest-substring-no-repeat-char', title: 'Longest Substring Without Repeating Characters', icon: '🔟' },
]

function MostFamousAlgorithms() {
  const navigate = useNavigate()

  const handleProblemClick = (problemId) => {
    navigate(`/algo-visualization/array/${problemId}`)
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.bg, color: COLORS.text }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <button
          onClick={() => navigate('/algo-visualization')}
          className="flex items-center gap-2 mb-6 text-white/80 hover:text-white transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Algorithms</span>
        </button>

        {/* Title */}
        <h1 className="text-4xl font-bold mb-2">Most Famous Algorithms</h1>
        <p className="text-lg mb-8" style={{ color: COLORS.textSecondary }}>
          Topic-wise most famous array problems and techniques
        </p>

        {/* Top 10 Must Solve Problems */}
        <div className="mb-12">
          <div className="rounded-2xl border p-6 mb-6" style={{ backgroundColor: COLORS.card, borderColor: COLORS.border }}>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">⭐</span>
              <h2 className="text-2xl font-bold" style={{ color: COLORS.accent }}>Top 10 Must Solve Problems</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {top10Problems.map((problem) => (
                <button
                  key={problem.id}
                  onClick={() => handleProblemClick(problem.id)}
                  className="group rounded-xl border p-4 text-center hover:scale-105 hover:shadow-lg transition-all duration-300 relative overflow-hidden"
                  style={{
                    backgroundColor: COLORS.cardHover,
                    borderColor: COLORS.border,
                  }}
                >
                  {/* Gradient overlay on hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity"
                    style={{
                      background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.accent} 100%)`,
                    }}
                  ></div>

                  <div className="relative z-10">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center text-xl font-bold" style={{ backgroundColor: COLORS.primary + '20', color: COLORS.primary }}>
                      {problem.icon.replace('️⃣', '')}
                    </div>
                    <h3 className="text-sm font-bold group-hover:text-blue-400 transition" style={{ color: COLORS.text }}>
                      {problem.title}
                    </h3>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Algorithm Categories */}
        <div className="space-y-6">
          {algorithmCategories.map((category) => (
            <div
              key={category.id}
              className="rounded-2xl border p-6"
              style={{ backgroundColor: COLORS.card, borderColor: COLORS.border }}
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">{category.icon}</span>
                <h2 className="text-2xl font-bold" style={{ color: category.color }}>
                  {category.title}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {category.problems.map((problem) => (
                  <button
                    key={problem.id}
                    onClick={() => handleProblemClick(problem.id)}
                    className="group rounded-xl border p-4 text-center hover:scale-105 hover:shadow-lg transition-all duration-300 relative overflow-hidden"
                    style={{
                      backgroundColor: COLORS.cardHover,
                      borderColor: COLORS.border,
                    }}
                  >
                    {/* Gradient overlay on hover */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity"
                      style={{
                        background: `linear-gradient(135deg, ${category.color} 0%, ${COLORS.accent} 100%)`,
                      }}
                    ></div>

                    <div className="relative z-10">
                      <div className="text-3xl mb-2">{problem.icon}</div>
                      <h3 className="text-sm font-bold group-hover:text-blue-400 transition" style={{ color: COLORS.text }}>
                        {problem.title}
                      </h3>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MostFamousAlgorithms

