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

const sortingAlgorithms = [
  {
    id: 'bubble-sort',
    title: 'Bubble Sort',
    icon: '🫧',
    description: 'Simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.',
    difficulty: 'Easy',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    bestUseCase: 'Educational or very small data',
    color: COLORS.primary,
  },
  {
    id: 'selection-sort',
    title: 'Selection Sort',
    icon: '🎯',
    description: 'Finds the minimum element from the unsorted portion and places it at the beginning. Repeats until the array is sorted.',
    difficulty: 'Easy',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    bestUseCase: 'When swaps are expensive',
    color: COLORS.accentDark,
  },
  {
    id: 'insertion-sort',
    title: 'Insertion Sort',
    icon: '📝',
    description: 'Builds the sorted array one item at a time by taking each element and inserting it into its correct position.',
    difficulty: 'Easy',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    bestUseCase: 'Nearly-sorted lists',
    color: COLORS.accent,
  },
  {
    id: 'merge-sort',
    title: 'Merge Sort',
    icon: '🔀',
    description: 'Divide and conquer algorithm that divides the array into halves, sorts them, and merges them back together.',
    difficulty: 'Medium',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    bestUseCase: 'Stable sorting on large data',
    color: COLORS.primary,
  },
  {
    id: 'quick-sort',
    title: 'Quick Sort',
    icon: '⚡',
    description: 'Efficient divide and conquer algorithm that picks a pivot and partitions the array around the pivot.',
    difficulty: 'Medium',
    timeComplexity: 'O(n log n) avg, O(n²) worst',
    spaceComplexity: 'O(log n)',
    bestUseCase: 'Fastest in most cases',
    color: COLORS.accentDark,
  },
  {
    id: 'heap-sort',
    title: 'Heap Sort',
    icon: '📊',
    description: 'Comparison-based sorting algorithm that uses a binary heap data structure to sort elements.',
    difficulty: 'Hard',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(1)',
    bestUseCase: 'No extra memory needed',
    color: COLORS.accent,
  },
  {
    id: 'counting-sort',
    title: 'Counting Sort',
    icon: '🔢',
    description: 'Non-comparison based sorting algorithm that counts the number of occurrences of each unique element in the array.',
    difficulty: 'Medium',
    timeComplexity: 'O(n + k)',
    spaceComplexity: 'O(k)',
    bestUseCase: 'When numbers have a small range',
    color: COLORS.primary,
  },
  {
    id: 'radix-sort',
    title: 'Radix Sort',
    icon: '🔣',
    description: 'Non-comparison based sorting algorithm that sorts numbers by processing individual digits or characters from least to most significant.',
    difficulty: 'Hard',
    timeComplexity: 'O(nk)',
    spaceComplexity: 'O(n + k)',
    bestUseCase: 'Sorting integers or strings',
    color: COLORS.accentDark,
  },
]

function Sorting() {
  const navigate = useNavigate()

  const handleAlgorithmClick = (algorithmId) => {
    navigate(`/algo-visualization/array/${algorithmId}`)
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
        <h1 className="text-4xl font-bold mb-8">Sorting</h1>

        {/* Sorting Algorithms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortingAlgorithms.map((algorithm) => (
            <button
              key={algorithm.id}
              onClick={() => handleAlgorithmClick(algorithm.id)}
              className="group rounded-xl border p-6 text-center hover:scale-105 hover:shadow-lg transition-all duration-300 relative overflow-hidden"
              style={{
                backgroundColor: COLORS.card,
                borderColor: COLORS.border,
              }}
            >
              {/* Gradient overlay on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity"
                style={{
                  background: `linear-gradient(135deg, ${algorithm.color} 0%, ${COLORS.accent} 100%)`,
                }}
              ></div>

              <div className="relative z-10">
                <div className="text-4xl mb-3">{algorithm.icon}</div>
                <h3 className="text-lg font-bold group-hover:text-blue-400 transition" style={{ color: COLORS.text }}>
                  {algorithm.title}
                </h3>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Sorting

