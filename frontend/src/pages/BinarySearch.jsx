import { useState } from 'react'
import { ArrowLeft, Play, RotateCcw, Copy, Check } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'

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

function BinarySearch() {
  const navigate = useNavigate()
  const { categoryId, algorithmId } = useParams()
  const [arraySize, setArraySize] = useState(10)
  const [arrayElements, setArrayElements] = useState([1, 3, 5, 7, 9, 11, 13, 15, 17, 19])
  const [targetElement, setTargetElement] = useState(11)
  const [left, setLeft] = useState(-1)
  const [right, setRight] = useState(-1)
  const [mid, setMid] = useState(-1)
  const [foundIndex, setFoundIndex] = useState(-1)
  const [isSearching, setIsSearching] = useState(false)
  const [codeCopied, setCodeCopied] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('javascript')
  const [highlightedLine, setHighlightedLine] = useState(-1)
  const [currentStep, setCurrentStep] = useState('')
  const [comparisons, setComparisons] = useState(0)
  const [viewMode, setViewMode] = useState('iterative')
  const [recursionStack, setRecursionStack] = useState([])
  const [currentRecursionIndex, setCurrentRecursionIndex] = useState(-1)

  const updateArraySize = (newSize) => {
    const size = Math.max(5, Math.min(20, newSize))
    setArraySize(size)
    if (size > arrayElements.length) {
      const newElements = [...arrayElements]
      let last = newElements[newElements.length - 1] || 1
      while (newElements.length < size) {
        newElements.push(last + 2)
        last += 2
      }
      setArrayElements(newElements)
    } else if (size < arrayElements.length) {
      setArrayElements(arrayElements.slice(0, size))
    }
    resetSearch()
  }

  const generateSortedArray = () => {
    const sortedArray = []
    let start = Math.floor(Math.random() * 10) + 1
    for (let i = 0; i < arraySize; i++) {
      sortedArray.push(start + i * 2)
    }
    setArrayElements(sortedArray)
    resetSearch()
  }

  const resetSearch = () => {
    setIsSearching(false)
    setLeft(-1)
    setRight(-1)
    setMid(-1)
    setFoundIndex(-1)
    setHighlightedLine(-1)
    setCurrentStep('')
    setComparisons(0)
    setRecursionStack([])
    setCurrentRecursionIndex(-1)
  }

  const startSearch = () => {
    setIsSearching(true)
    setLeft(0)
    setRight(arrayElements.length - 1)
    setMid(-1)
    setFoundIndex(-1)
    setHighlightedLine(-1)
    setCurrentStep('')
    setComparisons(0)

    let leftIdx = 0
    let rightIdx = arrayElements.length - 1

    const searchStep = () => {
      if (leftIdx > rightIdx) {
        setHighlightedLine(6)
        setCurrentStep('Element not found - search space exhausted')
        setIsSearching(false)
        setLeft(-1)
        setRight(-1)
        setMid(-1)
        return
      }

      const midIdx = Math.floor((leftIdx + rightIdx) / 2)
      setLeft(leftIdx)
      setRight(rightIdx)
      setMid(midIdx)
      setHighlightedLine(2)
      setCurrentStep(`Calculating mid: (${leftIdx} + ${rightIdx}) / 2 = ${midIdx}`)

      setTimeout(() => {
        setHighlightedLine(3)
        setComparisons(prev => prev + 1)
        setCurrentStep(`Comparing arr[${midIdx}] = ${arrayElements[midIdx]} with target ${targetElement}`)

        setTimeout(() => {
          if (arrayElements[midIdx] === targetElement) {
            setFoundIndex(midIdx)
            setHighlightedLine(4)
            setCurrentStep(`Found! Element ${targetElement} at index ${midIdx}`)
            setIsSearching(false)
            setTimeout(() => setHighlightedLine(-1), 2000)
          } else if (arrayElements[midIdx] > targetElement) {
            setHighlightedLine(5)
            setCurrentStep(`arr[${midIdx}] = ${arrayElements[midIdx]} > ${targetElement}, search left half`)
            rightIdx = midIdx - 1
            setTimeout(searchStep, 1500)
          } else {
            setHighlightedLine(5)
            setCurrentStep(`arr[${midIdx}] = ${arrayElements[midIdx]} < ${targetElement}, search right half`)
            leftIdx = midIdx + 1
            setTimeout(searchStep, 1500)
          }
        }, 1000)
      }, 1000)
    }

    searchStep()
  }

  const startRecursiveSearch = () => {
    setIsSearching(true)
    setLeft(0)
    setRight(arrayElements.length - 1)
    setMid(-1)
    setFoundIndex(-1)
    setHighlightedLine(-1)
    setCurrentStep('')
    setComparisons(0)
    setRecursionStack([])
    setCurrentRecursionIndex(-1)

    const simulateRecursion = (leftIdx, rightIdx, stackDepth) => {
      if (leftIdx > rightIdx) {
        setHighlightedLine(2)
        setCurrentStep('Base case: left > right, element not found')
        setIsSearching(false)
        setRecursionStack([])
        setCurrentRecursionIndex(-1)
        return
      }

      const midIdx = Math.floor((leftIdx + rightIdx) / 2)
      const newStack = [...recursionStack, { left: leftIdx, right: rightIdx, mid: midIdx, stackDepth, checking: true }]
      setRecursionStack(newStack)
      setCurrentRecursionIndex(newStack.length - 1)
      setLeft(leftIdx)
      setRight(rightIdx)
      setMid(midIdx)
      setHighlightedLine(3)
      setCurrentStep(`Recursive call: binarySearch(arr, ${targetElement}, ${leftIdx}, ${rightIdx}) - Stack depth: ${stackDepth}`)

      setTimeout(() => {
        setHighlightedLine(4)
        setComparisons(prev => prev + 1)

        if (arrayElements[midIdx] === targetElement) {
          setFoundIndex(midIdx)
          setHighlightedLine(5)
          setCurrentStep(`Found! Element ${targetElement} at index ${midIdx}`)
          const updatedStack = newStack.map((item, i) =>
            i === newStack.length - 1 ? { ...item, checking: false, found: true } : item
          )
          setRecursionStack(updatedStack)
          setTimeout(() => {
            setIsSearching(false)
            setHighlightedLine(-1)
            setRecursionStack([])
            setCurrentRecursionIndex(-1)
          }, 2000)
        } else if (arrayElements[midIdx] > targetElement) {
          setCurrentStep(`arr[${midIdx}] = ${arrayElements[midIdx]} > ${targetElement}, recursing left`)
          setTimeout(() => {
            const updatedStack = newStack.map((item, i) =>
              i === newStack.length - 1 ? { ...item, checking: false, goLeft: true } : item
            )
            setRecursionStack(updatedStack)
            simulateRecursion(leftIdx, midIdx - 1, stackDepth + 1)
          }, 1000)
        } else {
          setCurrentStep(`arr[${midIdx}] = ${arrayElements[midIdx]} < ${targetElement}, recursing right`)
          setTimeout(() => {
            const updatedStack = newStack.map((item, i) =>
              i === newStack.length - 1 ? { ...item, checking: false, goRight: true } : item
            )
            setRecursionStack(updatedStack)
            simulateRecursion(midIdx + 1, rightIdx, stackDepth + 1)
          }, 1000)
        }
      }, 1000)
    }

    simulateRecursion(0, arrayElements.length - 1, 0)
  }

  const copyCode = (code) => {
    navigator.clipboard.writeText(code)
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 2000)
  }

  const codeExamples = {
    javascript: `// Binary Search in JavaScript (Iterative)
function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    let mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) {
      return mid; // Found!
    } else if (arr[mid] > target) {
      right = mid - 1; // Search left half
    } else {
      left = mid + 1; // Search right half
    }
  }
  return -1; // Not found
}

// Usage
const numbers = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
const target = 11;
const result = binarySearch(numbers, target);
console.log(result !== -1 ? \`Found at index: \${result}\` : "Not found");`,
    python: `# Binary Search in Python (Iterative)
def binary_search(arr, target):
    left = 0
    right = len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        
        if arr[mid] == target:
            return mid  # Found!
        elif arr[mid] > target:
            right = mid - 1  # Search left half
        else:
            left = mid + 1  # Search right half
    
    return -1  # Not found

# Usage
numbers = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19]
target = 11
result = binary_search(numbers, target)
print(f"Found at index: {result}" if result != -1 else "Not found")`,
    java: `// Binary Search in Java (Iterative)
public class BinarySearch {
    public static int binarySearch(int[] arr, int target) {
        int left = 0;
        int right = arr.length - 1;
        
        while (left <= right) {
            int mid = left + (right - left) / 2;
            
            if (arr[mid] == target) {
                return mid; // Found!
            } else if (arr[mid] > target) {
                right = mid - 1; // Search left half
            } else {
                left = mid + 1; // Search right half
            }
        }
        return -1; // Not found
    }
    
    public static void main(String[] args) {
        int[] numbers = {1, 3, 5, 7, 9, 11, 13, 15, 17, 19};
        int target = 11;
        int result = binarySearch(numbers, target);
        System.out.println(result != -1 ? "Found at index: " + result : "Not found");
    }
}`,
    c: `// Binary Search in C (Iterative)
#include <stdio.h>

int binarySearch(int arr[], int n, int target) {
    int left = 0;
    int right = n - 1;
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        
        if (arr[mid] == target) {
            return mid; // Found!
        } else if (arr[mid] > target) {
            right = mid - 1; // Search left half
        } else {
            left = mid + 1; // Search right half
        }
    }
    return -1; // Not found
}

int main() {
    int numbers[] = {1, 3, 5, 7, 9, 11, 13, 15, 17, 19};
    int target = 11;
    int n = sizeof(numbers) / sizeof(numbers[0]);
    int result = binarySearch(numbers, n, target);
    printf(result != -1 ? "Found at index: %d\\n" : "Not found\\n", result);
    return 0;
}`,
    cpp: `// Binary Search in C++ (Iterative)
#include <iostream>
using namespace std;

int binarySearch(int arr[], int n, int target) {
    int left = 0;
    int right = n - 1;
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        
        if (arr[mid] == target) {
            return mid; // Found!
        } else if (arr[mid] > target) {
            right = mid - 1; // Search left half
        } else {
            left = mid + 1; // Search right half
        }
    }
    return -1; // Not found
}

int main() {
    int numbers[] = {1, 3, 5, 7, 9, 11, 13, 15, 17, 19};
    int target = 11;
    int n = sizeof(numbers) / sizeof(numbers[0]);
    int result = binarySearch(numbers, n, target);
    cout << (result != -1 ? "Found at index: " + to_string(result) : "Not found") << endl;
    return 0;
}`
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
        <h1 className="text-4xl font-bold mb-2">Binary Search</h1>
        <p className="text-lg mb-8" style={{ color: COLORS.textSecondary }}>
          Learn how Binary Search works step by step (Array must be sorted!)
        </p>

        {/* Info Sections */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="rounded-xl border p-4" style={{ backgroundColor: COLORS.card, borderColor: COLORS.border }}>
            <h2 className="text-xl font-bold mb-3">What is Binary Search?</h2>
            <p className="text-sm" style={{ color: COLORS.textSecondary }}>
              Binary Search is an efficient algorithm for finding an item in a sorted array. It works by repeatedly dividing the search space in half.
            </p>
          </div>

          <div className="rounded-xl border p-4" style={{ backgroundColor: COLORS.card, borderColor: COLORS.border }}>
            <h2 className="text-xl font-bold mb-3">Time Complexity</h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-semibold">Best Case:</span>
                <span className="ml-2" style={{ color: COLORS.textSecondary }}>
                  <code className="px-2 py-1 rounded bg-black/50">O(1)</code>
                </span>
              </div>
              <div>
                <span className="font-semibold">Worst/Avg Case:</span>
                <span className="ml-2" style={{ color: COLORS.textSecondary }}>
                  <code className="px-2 py-1 rounded bg-black/50">O(log n)</code>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Visualization */}
        <section className="mb-8">
          <div className="rounded-2xl border p-6" style={{ backgroundColor: COLORS.card, borderColor: COLORS.border }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Visualize how Binary Search works</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setViewMode('iterative')
                    resetSearch()
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    viewMode === 'iterative' ? 'text-white' : 'text-white/60'
                  }`}
                  style={{
                    backgroundColor: viewMode === 'iterative' ? COLORS.primary : COLORS.cardHover,
                    border: `1px solid ${viewMode === 'iterative' ? COLORS.primary : COLORS.border}`
                  }}
                >
                  Iterative
                </button>
                <button
                  onClick={() => {
                    setViewMode('recursive')
                    resetSearch()
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    viewMode === 'recursive' ? 'text-white' : 'text-white/60'
                  }`}
                  style={{
                    backgroundColor: viewMode === 'recursive' ? COLORS.primary : COLORS.cardHover,
                    border: `1px solid ${viewMode === 'recursive' ? COLORS.primary : COLORS.border}`
                  }}
                >
                  Recursive
                </button>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Left: Bar Chart Visualization */}
              <div>
                <label className="block mb-4 font-semibold">Array Visualization (Bar Chart)</label>

                {/* Array Size Control */}
                <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: COLORS.cardHover, border: `1px solid ${COLORS.border}` }}>
                  <label className="block mb-2 text-sm font-semibold">Array Size</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="5"
                      max="20"
                      value={arraySize}
                      onChange={(e) => updateArraySize(Number(e.target.value))}
                      className="flex-1"
                      disabled={isSearching}
                    />
                    <input
                      type="number"
                      min="5"
                      max="20"
                      value={arraySize}
                      onChange={(e) => updateArraySize(Number(e.target.value))}
                      className="w-20 px-2 py-1 rounded text-center text-white"
                      style={{ backgroundColor: COLORS.bg, border: `1px solid ${COLORS.border}` }}
                      disabled={isSearching}
                    />
                  </div>
                </div>

                {/* Bar Chart */}
                <div className="mb-4 p-4 rounded-lg overflow-x-auto" style={{ backgroundColor: COLORS.bg, minHeight: '250px' }}>
                  <div className="flex items-end justify-center gap-2 min-w-max">
                    {arrayElements.map((element, index) => {
                      const maxValue = Math.max(...arrayElements, targetElement, 1)
                      const height = (element / maxValue) * 180
                      const isLeft = left >= 0 && index === left
                      const isRight = right >= 0 && index === right
                      const isMid = mid === index
                      const isFound = foundIndex === index
                      const inRange = left >= 0 && right >= 0 && index >= left && index <= right
                      const outOfRange = left >= 0 && right >= 0 && (index < left || index > right)
                      const barWidth = arraySize <= 10 ? 50 : arraySize <= 15 ? 40 : 35
                      
                      // Determine if this element is eliminated
                      let eliminated = false
                      let eliminatedReason = ''
                      if (mid >= 0 && left >= 0 && right >= 0) {
                        if (arrayElements[mid] > targetElement && index > mid) {
                          eliminated = true
                          eliminatedReason = 'Too large'
                        } else if (arrayElements[mid] < targetElement && index < mid) {
                          eliminated = true
                          eliminatedReason = 'Too small'
                        }
                      }

                      return (
                        <div key={index} className="flex flex-col items-center gap-1 relative">
                          {/* Eliminated overlay */}
                          {eliminated && (
                            <div 
                              className="absolute inset-0 rounded-lg flex items-center justify-center z-10"
                              style={{
                                backgroundColor: COLORS.error + '60',
                                backdropFilter: 'blur(2px)',
                              }}
                            >
                              <div className="text-xs font-bold rotate-[-45deg]" style={{ color: COLORS.error }}>
                                ✕
                              </div>
                            </div>
                          )}
                          
                          <div
                            className={`rounded-t-lg transition-all duration-500 relative ${
                              eliminated ? 'opacity-40' : ''
                            }`}
                            style={{
                              width: `${barWidth}px`,
                              height: `${height}px`,
                              backgroundColor: isFound
                                ? COLORS.success
                                : isMid
                                ? COLORS.primary
                                : eliminated
                                ? COLORS.error + '30'
                                : outOfRange
                                ? COLORS.textSecondary + '20'
                                : inRange
                                ? COLORS.accent + '40'
                                : COLORS.cardHover,
                              border: `2px solid ${
                                isFound
                                  ? COLORS.success
                                  : isMid
                                  ? COLORS.primary
                                  : eliminated
                                  ? COLORS.error
                                  : isLeft || isRight
                                  ? COLORS.accent
                                  : COLORS.border
                              }`,
                              boxShadow: isMid || isFound ? `0 0 15px ${isFound ? COLORS.success : COLORS.primary}` : 'none',
                              transform: isMid ? 'scale(1.1)' : eliminated ? 'scale(0.9)' : 'scale(1)',
                            }}
                          >
                            {isMid && (
                              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold whitespace-nowrap" style={{ color: COLORS.primary }}>
                                MID
                              </div>
                            )}
                            {eliminated && !isMid && (
                              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold whitespace-nowrap" style={{ color: COLORS.error }}>
                                {eliminatedReason}
                              </div>
                            )}
                          </div>
                          <div className="text-center">
                            <div className={`font-bold text-sm ${eliminated ? 'line-through' : ''}`}>{element}</div>
                            <div className="text-xs" style={{ color: COLORS.textSecondary }}>Idx {index}</div>
                            {isLeft && <div className="text-xs font-bold" style={{ color: COLORS.accent }}>L</div>}
                            {isRight && <div className="text-xs font-bold" style={{ color: COLORS.accent }}>R</div>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  
                  {/* Search Space Indicator */}
                  {left >= 0 && right >= 0 && (
                    <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: COLORS.cardHover, border: `1px solid ${COLORS.border}` }}>
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <span className="font-semibold" style={{ color: COLORS.accent }}>Search Space: </span>
                          <span style={{ color: COLORS.textSecondary }}>
                            Indices {left} to {right} ({right - left + 1} elements)
                          </span>
                        </div>
                        {mid >= 0 && (
                          <div>
                            <span className="font-semibold" style={{ color: COLORS.primary }}>Mid: </span>
                            <span style={{ color: COLORS.textSecondary }}>Index {mid} (value: {arrayElements[mid]})</span>
                          </div>
                        )}
                      </div>
                      {mid >= 0 && arrayElements[mid] !== targetElement && (
                        <div className="mt-2 text-xs" style={{ color: COLORS.textSecondary }}>
                          {arrayElements[mid] > targetElement 
                            ? `Eliminating right half (indices ${mid + 1} to ${right}) - values are too large`
                            : `Eliminating left half (indices ${left} to ${mid - 1}) - values are too small`
                          }
                        </div>
                      )}
                    </div>
                  )}

                  {/* Target Element Indicator */}
                  <div className="mt-3 flex items-center justify-center gap-2">
                    <span className="text-sm" style={{ color: COLORS.textSecondary }}>Target:</span>
                    <div
                      className="px-3 py-1 rounded-lg font-bold text-sm"
                      style={{
                        backgroundColor: COLORS.accent + '30',
                        border: `2px solid ${COLORS.accent}`,
                        color: COLORS.accent,
                      }}
                    >
                      {targetElement}
                    </div>
                  </div>
                </div>

                {/* Array Elements Input */}
                <div className="mb-4">
                  <label className="block mb-2 font-semibold text-sm">Array Elements (Must be sorted!)</label>
                  <div className="flex gap-2 flex-wrap mb-2 max-h-24 overflow-y-auto p-2">
                    {arrayElements.map((element, index) => (
                      <input
                        key={index}
                        type="number"
                        value={element}
                        onChange={(e) => {
                          const newArray = [...arrayElements]
                          newArray[index] = Number(e.target.value) || 0
                          setArrayElements(newArray.sort((a, b) => a - b))
                        }}
                        className="w-14 px-2 py-1 rounded text-center text-white text-sm"
                        style={{ backgroundColor: COLORS.cardHover, border: `1px solid ${COLORS.border}` }}
                        disabled={isSearching}
                      />
                    ))}
                  </div>
                  <button
                    onClick={generateSortedArray}
                    disabled={isSearching}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
                    style={{ backgroundColor: COLORS.cardHover, border: `1px solid ${COLORS.border}` }}
                  >
                    Generate Sorted Array
                  </button>
                </div>

                {/* Target Element Input */}
                <div className="mb-4">
                  <label className="block mb-2 font-semibold text-sm">Target Element</label>
                  <input
                    type="number"
                    value={targetElement}
                    onChange={(e) => setTargetElement(Number(e.target.value))}
                    className="px-4 py-2 rounded-lg text-white w-full"
                    style={{ backgroundColor: COLORS.cardHover, border: `1px solid ${COLORS.border}` }}
                  />
                </div>

                {/* Control Buttons */}
                <div className="flex gap-3 mb-4">
                  <button
                    onClick={viewMode === 'iterative' ? startSearch : startRecursiveSearch}
                    disabled={isSearching}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50 flex-1"
                    style={{ backgroundColor: COLORS.primary, color: 'white' }}
                  >
                    <Play className="w-5 h-5" />
                    {isSearching ? 'Searching...' : 'Start Search'}
                  </button>
                  <button
                    onClick={resetSearch}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition"
                    style={{ backgroundColor: COLORS.cardHover, border: `1px solid ${COLORS.border}` }}
                  >
                    <RotateCcw className="w-5 h-5" />
                    Reset
                  </button>
                </div>

                {/* Recursion Stack Visualization */}
                {viewMode === 'recursive' && recursionStack.length > 0 && (
                  <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: COLORS.bg, border: `1px solid ${COLORS.border}` }}>
                    <label className="block mb-3 font-semibold text-sm">Recursion Stack & Search Space</label>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {recursionStack.map((frame, idx) => {
                        const searchSpaceSize = frame.right - frame.left + 1
                        const eliminatedLeft = frame.goLeft ? frame.left : frame.mid + 1
                        const eliminatedRight = frame.goRight ? frame.right : frame.mid - 1
                        
                        return (
                          <div key={idx}>
                            <div
                              className={`p-3 rounded-lg transition-all ${
                                idx === currentRecursionIndex ? 'scale-105' : ''
                              }`}
                              style={{
                                backgroundColor: frame.found
                                  ? COLORS.success + '30'
                                  : frame.checking
                                  ? COLORS.primary + '30'
                                  : COLORS.cardHover,
                                border: `2px solid ${
                                  frame.found
                                    ? COLORS.success
                                    : frame.checking
                                    ? COLORS.primary
                                    : COLORS.border
                                }`,
                                marginLeft: `${frame.stackDepth * 20}px`,
                              }}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <span className="text-xs font-semibold" style={{ color: COLORS.textSecondary }}>
                                    Level {frame.stackDepth + 1}:
                                  </span>
                                  <span className="ml-2 font-semibold text-xs">
                                    binarySearch(arr, {targetElement}, {frame.left}, {frame.right})
                                  </span>
                                </div>
                                {frame.checking && (
                                  <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: COLORS.primary, color: 'white' }}>
                                    Active
                                  </span>
                                )}
                                {frame.found && (
                                  <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: COLORS.success, color: 'white' }}>
                                    Found!
                                  </span>
                                )}
                              </div>
                              
                              {/* Search Space Visualization */}
                              <div className="mt-2 mb-2">
                                <div className="flex items-center gap-1 text-xs mb-1">
                                  <span style={{ color: COLORS.textSecondary }}>Search Space:</span>
                                  <div className="flex gap-0.5">
                                    {arrayElements.map((el, i) => {
                                      const inRange = i >= frame.left && i <= frame.right
                                      const isMid = i === frame.mid
                                      const isEliminated = frame.goLeft ? i > frame.mid : frame.goRight ? i < frame.mid : false
                                      
                                      return (
                                        <div
                                          key={i}
                                          className="w-3 h-3 rounded text-[8px] flex items-center justify-center font-bold"
                                          style={{
                                            backgroundColor: isMid
                                              ? COLORS.primary
                                              : isEliminated
                                              ? COLORS.error + '40'
                                              : inRange
                                              ? COLORS.accent + '60'
                                              : COLORS.textSecondary + '20',
                                            border: `1px solid ${
                                              isMid
                                                ? COLORS.primary
                                                : isEliminated
                                                ? COLORS.error
                                                : inRange
                                                ? COLORS.accent
                                                : COLORS.border
                                            }`,
                                            color: isMid ? 'white' : COLORS.text,
                                            textDecoration: isEliminated ? 'line-through' : 'none',
                                            opacity: isEliminated ? 0.5 : 1,
                                          }}
                                          title={`Index ${i}: ${el}`}
                                        >
                                          {i}
                                        </div>
                                      )
                                    })}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="mt-1 text-xs space-y-1" style={{ color: COLORS.textSecondary }}>
                                <div>
                                  <span className="font-semibold">Mid:</span> {frame.mid}, arr[{frame.mid}] = {arrayElements[frame.mid]}
                                </div>
                                {frame.goLeft && (
                                  <div className="text-xs" style={{ color: COLORS.error }}>
                                    ✕ Eliminating right half (indices {frame.mid + 1} to {frame.right}) - {frame.right - frame.mid} elements removed
                                  </div>
                                )}
                                {frame.goRight && (
                                  <div className="text-xs" style={{ color: COLORS.error }}>
                                    ✕ Eliminating left half (indices {frame.left} to {frame.mid - 1}) - {frame.mid - frame.left} elements removed
                                  </div>
                                )}
                                {!frame.found && !frame.checking && (
                                  <div className="text-xs" style={{ color: COLORS.accent }}>
                                    → New search space: {frame.goLeft ? `${frame.left} to ${frame.mid - 1}` : `${frame.mid + 1} to ${frame.right}`} ({frame.goLeft ? frame.mid - frame.left : frame.right - frame.mid} elements)
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Connection line to next level */}
                            {idx < recursionStack.length - 1 && (
                              <div className="flex justify-center my-1" style={{ marginLeft: `${frame.stackDepth * 20}px` }}>
                                <div className="w-0.5 h-4" style={{ backgroundColor: COLORS.primary }}></div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Status */}
                {currentStep && (
                  <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: COLORS.primary + '20', border: `1px solid ${COLORS.primary}` }}>
                    <p className="font-semibold text-sm" style={{ color: COLORS.primary }}>
                      {currentStep}
                    </p>
                    {comparisons > 0 && (
                      <p className="text-xs mt-1" style={{ color: COLORS.textSecondary }}>
                        Comparisons: {comparisons}
                      </p>
                    )}
                  </div>
                )}

                {foundIndex !== -1 && (
                  <div className="p-4 rounded-lg" style={{ backgroundColor: COLORS.success + '20', border: `1px solid ${COLORS.success}` }}>
                    <p className="font-semibold" style={{ color: COLORS.success }}>
                      ✓ Element found at index: {foundIndex}
                    </p>
                  </div>
                )}
              </div>

              {/* Right: Code Execution */}
              <div>
                <label className="block mb-4 font-semibold">Code Execution</label>
                <div className="p-4 rounded-lg" style={{ backgroundColor: '#0D1117', border: `1px solid ${COLORS.border}` }}>
                  <pre className="text-sm">
                    <code>
                      {viewMode === 'iterative' ? (
                        <>
                          <div className={highlightedLine === 1 ? 'bg-blue-500/30 px-2 py-1 rounded' : ''}>
                            <span style={{ color: '#79C0FF' }}>function</span>{' '}
                            <span style={{ color: '#D2A8FF' }}>binarySearch</span>
                            <span style={{ color: '#C9D1D9' }}>(arr, target)</span> {'{'}
                          </div>
                          <div>
                            {'  '}
                            <span style={{ color: '#79C0FF' }}>let</span>{' '}
                            <span style={{ color: '#FF7B72' }}>left</span>
                            <span style={{ color: '#C9D1D9' }}> = </span>
                            <span style={{ color: '#A5D6FF' }}>0</span>
                            <span style={{ color: '#C9D1D9' }}>;</span>
                          </div>
                          <div>
                            {'  '}
                            <span style={{ color: '#79C0FF' }}>let</span>{' '}
                            <span style={{ color: '#FF7B72' }}>right</span>
                            <span style={{ color: '#C9D1D9' }}> = arr.length - </span>
                            <span style={{ color: '#A5D6FF' }}>1</span>
                            <span style={{ color: '#C9D1D9' }}>;</span>
                          </div>
                          <div className={highlightedLine === 2 ? 'bg-blue-500/30 px-2 py-1 rounded' : ''}>
                            {'  '}
                            <span style={{ color: '#79C0FF' }}>while</span>
                            <span style={{ color: '#C9D1D9' }}> (left {'<='} right)</span> {'{'}
                            {left >= 0 && right >= 0 && (
                              <span className="ml-2 text-xs" style={{ color: COLORS.primary }}>
                                // left={left}, right={right}
                              </span>
                            )}
                          </div>
                          <div className={highlightedLine === 2 ? 'bg-blue-500/30 px-2 py-1 rounded' : ''}>
                            {'    '}
                            <span style={{ color: '#79C0FF' }}>let</span>{' '}
                            <span style={{ color: '#FF7B72' }}>mid</span>
                            <span style={{ color: '#C9D1D9' }}> = Math.floor((left + right) / </span>
                            <span style={{ color: '#A5D6FF' }}>2</span>
                            <span style={{ color: '#C9D1D9' }}>);</span>
                            {mid >= 0 && (
                              <span className="ml-2 text-xs" style={{ color: COLORS.primary }}>
                                // mid = {mid}
                              </span>
                            )}
                          </div>
                          <div className={highlightedLine === 3 ? 'bg-blue-500/30 px-2 py-1 rounded' : ''}>
                            {'    '}
                            <span style={{ color: '#79C0FF' }}>if</span>
                            <span style={{ color: '#C9D1D9' }}> (arr[mid] === target)</span> {'{'}
                          </div>
                          <div className={highlightedLine === 4 ? 'bg-green-500/30 px-2 py-1 rounded' : ''}>
                            {'      '}
                            <span style={{ color: '#79C0FF' }}>return</span>{' '}
                            <span style={{ color: '#FF7B72' }}>mid</span>
                            <span style={{ color: '#C9D1D9' }}>;</span>
                            <span className="ml-2 text-xs" style={{ color: '#7EE787' }}>
                              // Found!
                            </span>
                          </div>
                          <div>
                            {'    '}
                            <span style={{ color: '#C9D1D9' }}>{'}'}</span>
                          </div>
                          <div className={highlightedLine === 5 ? 'bg-purple-500/30 px-2 py-1 rounded' : ''}>
                            {'    '}
                            <span style={{ color: '#79C0FF' }}>else if</span>
                            <span style={{ color: '#C9D1D9' }}> (arr[mid] {'>'} target)</span> {'{'}
                          </div>
                          <div>
                            {'      '}
                            <span style={{ color: '#FF7B72' }}>right</span>
                            <span style={{ color: '#C9D1D9' }}> = mid - </span>
                            <span style={{ color: '#A5D6FF' }}>1</span>
                            <span style={{ color: '#C9D1D9' }}>;</span>
                          </div>
                          <div>
                            {'    '}
                            <span style={{ color: '#C9D1D9' }}>{'}'}</span>
                          </div>
                          <div>
                            {'    '}
                            <span style={{ color: '#79C0FF' }}>else</span> {'{'}
                          </div>
                          <div>
                            {'      '}
                            <span style={{ color: '#FF7B72' }}>left</span>
                            <span style={{ color: '#C9D1D9' }}> = mid + </span>
                            <span style={{ color: '#A5D6FF' }}>1</span>
                            <span style={{ color: '#C9D1D9' }}>;</span>
                          </div>
                          <div>
                            {'    '}
                            <span style={{ color: '#C9D1D9' }}>{'}'}</span>
                          </div>
                          <div>
                            {'  '}
                            <span style={{ color: '#C9D1D9' }}>{'}'}</span>
                          </div>
                          <div className={highlightedLine === 6 ? 'bg-red-500/30 px-2 py-1 rounded' : ''}>
                            {'  '}
                            <span style={{ color: '#79C0FF' }}>return</span>{' '}
                            <span style={{ color: '#A5D6FF' }}>-1</span>
                            <span style={{ color: '#C9D1D9' }}>;</span>
                            <span className="ml-2 text-xs" style={{ color: '#FF7B72' }}>
                              // Not found
                            </span>
                          </div>
                          <div>
                            <span style={{ color: '#C9D1D9' }}>{'}'}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className={highlightedLine === 1 ? 'bg-blue-500/30 px-2 py-1 rounded' : ''}>
                            <span style={{ color: '#79C0FF' }}>function</span>{' '}
                            <span style={{ color: '#D2A8FF' }}>binarySearch</span>
                            <span style={{ color: '#C9D1D9' }}>(arr, target, left = 0, right = arr.length - 1)</span> {'{'}
                          </div>
                          <div className={highlightedLine === 2 ? 'bg-blue-500/30 px-2 py-1 rounded' : ''}>
                            {'  '}
                            <span style={{ color: '#79C0FF' }}>if</span>
                            <span style={{ color: '#C9D1D9' }}> (left {'>'} right)</span> {'{'}
                            <span className="ml-2 text-xs" style={{ color: '#FF7B72' }}>
                              // Base case
                            </span>
                          </div>
                          <div className={highlightedLine === 6 ? 'bg-red-500/30 px-2 py-1 rounded' : ''}>
                            {'    '}
                            <span style={{ color: '#79C0FF' }}>return</span>{' '}
                            <span style={{ color: '#A5D6FF' }}>-1</span>
                            <span style={{ color: '#C9D1D9' }}>;</span>
                          </div>
                          <div>
                            {'  '}
                            <span style={{ color: '#C9D1D9' }}>{'}'}</span>
                          </div>
                          <div className={highlightedLine === 3 ? 'bg-blue-500/30 px-2 py-1 rounded' : ''}>
                            {'  '}
                            <span style={{ color: '#79C0FF' }}>let</span>{' '}
                            <span style={{ color: '#FF7B72' }}>mid</span>
                            <span style={{ color: '#C9D1D9' }}> = Math.floor((left + right) / </span>
                            <span style={{ color: '#A5D6FF' }}>2</span>
                            <span style={{ color: '#C9D1D9' }}>);</span>
                          </div>
                          <div className={highlightedLine === 4 ? 'bg-blue-500/30 px-2 py-1 rounded' : ''}>
                            {'  '}
                            <span style={{ color: '#79C0FF' }}>if</span>
                            <span style={{ color: '#C9D1D9' }}> (arr[mid] === target)</span> {'{'}
                          </div>
                          <div className={highlightedLine === 5 ? 'bg-green-500/30 px-2 py-1 rounded' : ''}>
                            {'    '}
                            <span style={{ color: '#79C0FF' }}>return</span>{' '}
                            <span style={{ color: '#FF7B72' }}>mid</span>
                            <span style={{ color: '#C9D1D9' }}>;</span>
                            <span className="ml-2 text-xs" style={{ color: '#7EE787' }}>
                              // Found!
                            </span>
                          </div>
                          <div>
                            {'  '}
                            <span style={{ color: '#C9D1D9' }}>{'}'}</span>
                          </div>
                          <div className={highlightedLine === 2 ? 'bg-purple-500/30 px-2 py-1 rounded' : ''}>
                            {'  '}
                            <span style={{ color: '#79C0FF' }}>if</span>
                            <span style={{ color: '#C9D1D9' }}> (arr[mid] {'>'} target)</span> {'{'}
                          </div>
                          <div>
                            {'    '}
                            <span style={{ color: '#79C0FF' }}>return</span>{' '}
                            <span style={{ color: '#D2A8FF' }}>binarySearch</span>
                            <span style={{ color: '#C9D1D9' }}>(arr, target, left, mid - 1);</span>
                            <span className="ml-2 text-xs" style={{ color: '#D2A8FF' }}>
                              // Recursive left
                            </span>
                          </div>
                          <div>
                            {'  '}
                            <span style={{ color: '#C9D1D9' }}>{'}'}</span>
                          </div>
                          <div>
                            {'  '}
                            <span style={{ color: '#79C0FF' }}>return</span>{' '}
                            <span style={{ color: '#D2A8FF' }}>binarySearch</span>
                            <span style={{ color: '#C9D1D9' }}>(arr, target, mid + 1, right);</span>
                            <span className="ml-2 text-xs" style={{ color: '#D2A8FF' }}>
                              // Recursive right
                            </span>
                          </div>
                          <div>
                            <span style={{ color: '#C9D1D9' }}>{'}'}</span>
                          </div>
                        </>
                      )}
                    </code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Implementation */}
        <section className="mb-8">
          <div className="rounded-2xl border p-6" style={{ backgroundColor: COLORS.card, borderColor: COLORS.border }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Binary Search Implementation</h2>
              <div className="flex items-center gap-2">
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="px-3 py-2 rounded-lg text-sm"
                  style={{ backgroundColor: COLORS.cardHover, border: `1px solid ${COLORS.border}`, color: COLORS.text }}
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="c">C</option>
                  <option value="cpp">C++</option>
                </select>
                <button
                  onClick={() => copyCode(codeExamples[selectedLanguage])}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition"
                  style={{ backgroundColor: COLORS.cardHover, border: `1px solid ${COLORS.border}` }}
                >
                  {codeCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {codeCopied ? 'Copied!' : 'Copy Code'}
                </button>
              </div>
            </div>
            <pre className="p-4 rounded-lg overflow-x-auto" style={{ backgroundColor: '#0D1117', border: `1px solid ${COLORS.border}` }}>
              <code className="text-sm" style={{ color: COLORS.text }}>
                {codeExamples[selectedLanguage]}
              </code>
            </pre>
          </div>
        </section>

        {/* Detailed Explanation */}
        <section className="mb-8">
          <div className="rounded-2xl border p-6" style={{ backgroundColor: COLORS.card, borderColor: COLORS.border }}>
            <h2 className="text-2xl font-bold mb-6">Detailed Explanation of Binary Search Algorithm</h2>

            {/* How Does It Work */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3" style={{ color: COLORS.primary }}>How Does It Work?</h3>
              <p className="mb-4" style={{ color: COLORS.textSecondary }}>
                Binary Search works on sorted arrays by repeatedly dividing the search interval in half. It compares the target value with the middle element and eliminates half of the remaining elements at each step.
              </p>
              <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: COLORS.bg, border: `1px solid ${COLORS.border}` }}>
                <p className="mb-3 font-semibold">Example:</p>
                <p className="mb-2" style={{ color: COLORS.textSecondary }}>
                  Array: <code className="px-2 py-1 rounded bg-black/50">[1, 3, 5, 7, 9, 11, 13, 15, 17, 19]</code>, Target: <code className="px-2 py-1 rounded bg-black/50">11</code>
                </p>
                <ol className="list-decimal list-inside space-y-2 ml-2" style={{ color: COLORS.textSecondary }}>
                  <li>Step 1: Compare with middle (index 4, value 9). 9 {'<'} 11, so search right half.</li>
                  <li>Step 2: Compare with middle of right half (index 7, value 15). 15 {'>'} 11, so search left half.</li>
                  <li>Step 3: Compare with middle (index 5, value 11). 11 === 11, <span style={{ color: COLORS.success }}>Found at index 5!</span></li>
                </ol>
              </div>
            </div>

            {/* Algorithm Steps */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3" style={{ color: COLORS.primary }}>Step-by-Step Algorithm</h3>
              <div className="space-y-3">
                <div className="p-3 rounded-lg" style={{ backgroundColor: COLORS.cardHover, border: `1px solid ${COLORS.border}` }}>
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: COLORS.primary, color: 'white' }}>1</span>
                    <div>
                      <p className="font-semibold mb-1">Initialize</p>
                      <p className="text-sm" style={{ color: COLORS.textSecondary }}>Set left = 0 and right = array.length - 1</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: COLORS.cardHover, border: `1px solid ${COLORS.border}` }}>
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: COLORS.primary, color: 'white' }}>2</span>
                    <div>
                      <p className="font-semibold mb-1">Calculate Mid</p>
                      <p className="text-sm" style={{ color: COLORS.textSecondary }}>mid = (left + right) / 2</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: COLORS.cardHover, border: `1px solid ${COLORS.border}` }}>
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: COLORS.primary, color: 'white' }}>3</span>
                    <div>
                      <p className="font-semibold mb-1">Compare</p>
                      <p className="text-sm" style={{ color: COLORS.textSecondary }}>If arr[mid] === target, return mid (found!)</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: COLORS.cardHover, border: `1px solid ${COLORS.border}` }}>
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: COLORS.primary, color: 'white' }}>4</span>
                    <div>
                      <p className="font-semibold mb-1">Narrow Search</p>
                      <p className="text-sm" style={{ color: COLORS.textSecondary }}>If arr[mid] {'>'} target, search left (right = mid - 1). Otherwise, search right (left = mid + 1).</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: COLORS.cardHover, border: `1px solid ${COLORS.border}` }}>
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: COLORS.primary, color: 'white' }}>5</span>
                    <div>
                      <p className="font-semibold mb-1">Repeat</p>
                      <p className="text-sm" style={{ color: COLORS.textSecondary }}>Repeat steps 2-4 until found or left {'>'} right (not found).</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Time & Space Complexity */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3" style={{ color: COLORS.primary }}>Time & Space Complexity</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: COLORS.success + '20', border: `1px solid ${COLORS.success}` }}>
                  <p className="font-semibold mb-2" style={{ color: COLORS.success }}>Best Case: O(1)</p>
                  <p className="text-sm" style={{ color: COLORS.textSecondary }}>When the target is at the middle position.</p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: COLORS.accent + '20', border: `1px solid ${COLORS.accent}` }}>
                  <p className="font-semibold mb-2" style={{ color: COLORS.accent }}>Worst/Avg Case: O(log n)</p>
                  <p className="text-sm" style={{ color: COLORS.textSecondary }}>Eliminates half the elements at each step.</p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: COLORS.primary + '20', border: `1px solid ${COLORS.primary}` }}>
                  <p className="font-semibold mb-2" style={{ color: COLORS.primary }}>Space: O(1) / O(log n)</p>
                  <p className="text-sm" style={{ color: COLORS.textSecondary }}>Iterative: O(1), Recursive: O(log n) stack space.</p>
                </div>
              </div>
            </div>

            {/* Advantages & Disadvantages */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3" style={{ color: COLORS.primary }}>Advantages & Disadvantages</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: COLORS.success + '20', border: `1px solid ${COLORS.success}` }}>
                  <h4 className="font-semibold mb-3" style={{ color: COLORS.success }}>✓ Advantages</h4>
                  <ul className="space-y-2 text-sm" style={{ color: COLORS.textSecondary }}>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>Very efficient: O(log n) time complexity</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>Eliminates half the search space at each step</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>Much faster than Linear Search for large arrays</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>Simple to implement</span>
                    </li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: COLORS.error + '20', border: `1px solid ${COLORS.error}` }}>
                  <h4 className="font-semibold mb-3" style={{ color: COLORS.error }}>✗ Disadvantages</h4>
                  <ul className="space-y-2 text-sm" style={{ color: COLORS.textSecondary }}>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>Requires the array to be sorted</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>Not suitable for unsorted data</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>Overhead of maintaining sorted order</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>Recursive version uses O(log n) extra space</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* When to Use */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3" style={{ color: COLORS.primary }}>When to Use Binary Search?</h3>
              <div className="p-4 rounded-lg" style={{ backgroundColor: COLORS.cardHover, border: `1px solid ${COLORS.border}` }}>
                <ul className="space-y-2 text-sm" style={{ color: COLORS.textSecondary }}>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">→</span>
                    <span><strong>Sorted arrays:</strong> When you have a sorted array and need to search frequently.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">→</span>
                    <span><strong>Large datasets:</strong> Much more efficient than Linear Search for large arrays.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">→</span>
                    <span><strong>Search operations:</strong> When search operations are more frequent than insertions/deletions.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">→</span>
                    <span><strong>Performance critical:</strong> When you need O(log n) search time.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Real-World Applications */}
            <div>
              <h3 className="text-xl font-semibold mb-3" style={{ color: COLORS.primary }}>Real-World Applications</h3>
              <div className="p-4 rounded-lg" style={{ backgroundColor: COLORS.cardHover, border: `1px solid ${COLORS.border}` }}>
                <ul className="space-y-2 text-sm" style={{ color: COLORS.textSecondary }}>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">•</span>
                    <span><strong>Database indexing:</strong> Used in database systems for fast lookups.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">•</span>
                    <span><strong>Search engines:</strong> Finding words in sorted dictionaries.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">•</span>
                    <span><strong>Game development:</strong> Finding elements in sorted game data structures.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">•</span>
                    <span><strong>Library systems:</strong> Finding books by ISBN in sorted catalogs.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default BinarySearch

