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

function LinearSearch() {
  const navigate = useNavigate()
  const { categoryId, algorithmId } = useParams()
  const [arraySize, setArraySize] = useState(5)
  const [arrayElements, setArrayElements] = useState([3, 1, 4, 1, 5])
  const [targetElement, setTargetElement] = useState(4)
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [foundIndex, setFoundIndex] = useState(-1)
  const [isSearching, setIsSearching] = useState(false)
  const [codeCopied, setCodeCopied] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('javascript')
  const [highlightedLine, setHighlightedLine] = useState(-1)
  const [currentStep, setCurrentStep] = useState('')
  const [comparisons, setComparisons] = useState(0)
  const [viewMode, setViewMode] = useState('iterative') // 'iterative' or 'recursive'
  const [recursionStack, setRecursionStack] = useState([])
  const [currentRecursionIndex, setCurrentRecursionIndex] = useState(-1)

  const updateArraySize = (newSize) => {
    const size = Math.max(3, Math.min(15, newSize)) // Limit between 3 and 15
    setArraySize(size)
    if (size > arrayElements.length) {
      // Add random elements
      const newElements = [...arrayElements]
      while (newElements.length < size) {
        newElements.push(Math.floor(Math.random() * 10) + 1)
      }
      setArrayElements(newElements)
    } else if (size < arrayElements.length) {
      // Remove elements
      setArrayElements(arrayElements.slice(0, size))
    }
    setCurrentIndex(-1)
    setFoundIndex(-1)
    setHighlightedLine(-1)
    setCurrentStep('')
    setComparisons(0)
  }

  const generateRandomArray = () => {
    const randomArray = Array.from({ length: arraySize }, () => Math.floor(Math.random() * 10) + 1)
    setArrayElements(randomArray)
    setCurrentIndex(-1)
    setFoundIndex(-1)
    setHighlightedLine(-1)
    setCurrentStep('')
    setComparisons(0)
    setRecursionStack([])
    setCurrentRecursionIndex(-1)
  }

  const startSearch = () => {
    setIsSearching(true)
    setCurrentIndex(-1)
    setFoundIndex(-1)
    setHighlightedLine(-1)
    setCurrentStep('')
    setComparisons(0)
    
    let index = 0
    let step = 0
    
    const interval = setInterval(() => {
      if (index < arrayElements.length) {
        // Highlight: for loop line
        setHighlightedLine(2)
        setCurrentIndex(index)
        setCurrentStep(`Checking index ${index}...`)
        
        setTimeout(() => {
          // Highlight: comparison line
          setHighlightedLine(3)
          setComparisons(prev => prev + 1)
          
          if (arrayElements[index] === targetElement) {
            setFoundIndex(index)
            setHighlightedLine(4) // return statement
            setCurrentStep(`Found! Element ${targetElement} is at index ${index}`)
            clearInterval(interval)
            setTimeout(() => {
              setIsSearching(false)
              setHighlightedLine(-1)
            }, 1500)
          } else {
            setCurrentStep(`Element ${arrayElements[index]} ≠ ${targetElement}, moving to next...`)
            index++
            setTimeout(() => {
              if (index >= arrayElements.length) {
                setHighlightedLine(6) // return -1
                setCurrentStep('Element not found in array')
                clearInterval(interval)
                setTimeout(() => {
                  setIsSearching(false)
                  setCurrentIndex(-1)
                  setHighlightedLine(-1)
                }, 1500)
              }
            }, 500)
          }
        }, 800)
      } else {
        clearInterval(interval)
        setIsSearching(false)
        setCurrentIndex(-1)
        setHighlightedLine(6)
        setCurrentStep('Element not found')
        setTimeout(() => setHighlightedLine(-1), 1500)
      }
    }, 2000)
  }

  const resetSearch = () => {
    setIsSearching(false)
    setCurrentIndex(-1)
    setFoundIndex(-1)
    setHighlightedLine(-1)
    setCurrentStep('')
    setComparisons(0)
    setRecursionStack([])
    setCurrentRecursionIndex(-1)
  }

  const startRecursiveSearch = () => {
    setIsSearching(true)
    setCurrentIndex(-1)
    setFoundIndex(-1)
    setHighlightedLine(-1)
    setCurrentStep('')
    setComparisons(0)
    setRecursionStack([])
    setCurrentRecursionIndex(-1)

    const simulateRecursion = (index, stackDepth) => {
      if (index >= arrayElements.length) {
        setHighlightedLine(6) // return -1
        setCurrentStep('Element not found - reached end of array')
        setIsSearching(false)
        setRecursionStack([])
        setCurrentRecursionIndex(-1)
        return
      }

      // Add to recursion stack
      const newStack = [...recursionStack, { index, stackDepth, checking: true }]
      setRecursionStack(newStack)
      setCurrentRecursionIndex(newStack.length - 1)
      setCurrentIndex(index)
      setHighlightedLine(2) // recursive call line
      setCurrentStep(`Recursive call: Checking index ${index} (Stack depth: ${stackDepth})`)

      setTimeout(() => {
        setHighlightedLine(3) // comparison line
        setComparisons(prev => prev + 1)

        if (arrayElements[index] === targetElement) {
          setFoundIndex(index)
          setHighlightedLine(4) // return index
          setCurrentStep(`Found! Element ${targetElement} at index ${index}`)
          
          // Update stack to show found
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
        } else {
          setCurrentStep(`Element ${arrayElements[index]} ≠ ${targetElement}, recursing to next index...`)
          
          setTimeout(() => {
            // Update current stack item
            const updatedStack = newStack.map((item, i) => 
              i === newStack.length - 1 ? { ...item, checking: false, notFound: true } : item
            )
            setRecursionStack(updatedStack)
            
            // Recursive call
            simulateRecursion(index + 1, stackDepth + 1)
          }, 1000)
        }
      }, 1000)
    }

    simulateRecursion(0, 0)
  }

  const copyCode = (code) => {
    navigator.clipboard.writeText(code)
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 2000)
  }

  const codeExamples = {
    javascript: `// Linear Search in JavaScript
function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) {
      return i; // Return index if found
    }
  }
  return -1; // Return -1 if not found
}

// Usage example
const numbers = [10, 20, 30, 40, 50];
const target = 30;
const result = linearSearch(numbers, target);
if (result !== -1) {
  console.log(\`Element found at index: \${result}\`);
} else {
  console.log("Element not found");
}`,
    python: `# Linear Search in Python
def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i  # Return index if found
    return -1  # Return -1 if not found

# Usage example
numbers = [10, 20, 30, 40, 50]
target = 30
result = linear_search(numbers, target)
if result != -1:
    print(f"Element found at index: {result}")
else:
    print("Element not found")`,
    java: `// Linear Search in Java
public class LinearSearch {
    public static int linearSearch(int[] arr, int target) {
        for (int i = 0; i < arr.length; i++) {
            if (arr[i] == target) {
                return i; // Return index if found
            }
        }
        return -1; // Return -1 if not found
    }
    
    public static void main(String[] args) {
        int[] numbers = {10, 20, 30, 40, 50};
        int target = 30;
        int result = linearSearch(numbers, target);
        if (result != -1) {
            System.out.println("Element found at index: " + result);
        } else {
            System.out.println("Element not found");
        }
    }
}`,
    c: `// Linear Search in C
#include <stdio.h>

int linearSearch(int arr[], int n, int target) {
    for (int i = 0; i < n; i++) {
        if (arr[i] == target) {
            return i; // Return index if found
        }
    }
    return -1; // Return -1 if not found
}

int main() {
    int numbers[] = {10, 20, 30, 40, 50};
    int target = 30;
    int n = sizeof(numbers) / sizeof(numbers[0]);
    int result = linearSearch(numbers, n, target);
    if (result != -1) {
        printf("Element found at index: %d\\n", result);
    } else {
        printf("Element not found\\n");
    }
    return 0;
}`,
    cpp: `// Linear Search in C++
#include <iostream>
using namespace std;

int linearSearch(int arr[], int n, int target) {
    for (int i = 0; i < n; i++) {
        if (arr[i] == target) {
            return i; // Return index if found
        }
    }
    return -1; // Return -1 if not found
}

int main() {
    int numbers[] = {10, 20, 30, 40, 50};
    int target = 30;
    int n = sizeof(numbers) / sizeof(numbers[0]);
    int result = linearSearch(numbers, n, target);
    if (result != -1) {
        cout << "Element found at index: " << result << endl;
    } else {
        cout << "Element not found" << endl;
    }
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
        <h1 className="text-4xl font-bold mb-2">Linear Search</h1>
        <p className="text-lg mb-8" style={{ color: COLORS.textSecondary }}>
          Learn how Linear Search works step by step
        </p>

        {/* Info Sections - Collapsible */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {/* What is Linear Search */}
          <div className="rounded-xl border p-4" style={{ backgroundColor: COLORS.card, borderColor: COLORS.border }}>
            <h2 className="text-xl font-bold mb-3">What is Linear Search?</h2>
            <p className="text-sm" style={{ color: COLORS.textSecondary }}>
              Linear Search is a simple method to find a particular value in a list. It checks each element one by one from the start until it finds the target value.
            </p>
          </div>

          {/* Time Complexity */}
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
                <span className="font-semibold">Worst Case:</span>
                <span className="ml-2" style={{ color: COLORS.textSecondary }}>
                  <code className="px-2 py-1 rounded bg-black/50">O(n)</code>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Visualization */}
        <section className="mb-8">
          <div className="rounded-2xl border p-6" style={{ backgroundColor: COLORS.card, borderColor: COLORS.border }}>
            <h2 className="text-2xl font-bold mb-6">Visualize how Linear Search works</h2>
            
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
                      min="3"
                      max="15"
                      value={arraySize}
                      onChange={(e) => updateArraySize(Number(e.target.value))}
                      className="flex-1"
                      disabled={isSearching}
                    />
                    <input
                      type="number"
                      min="3"
                      max="15"
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
                      const isCurrent = currentIndex === index
                      const isFound = foundIndex === index
                      const isChecked = currentIndex > index
                      const barWidth = arraySize <= 8 ? 60 : arraySize <= 12 ? 50 : 40
                      
                      return (
                        <div key={index} className="flex flex-col items-center gap-1">
                          <div
                            className="rounded-t-lg transition-all duration-500 relative"
                            style={{
                              width: `${barWidth}px`,
                              height: `${height}px`,
                              backgroundColor: isFound
                                ? COLORS.success
                                : isCurrent
                                ? COLORS.primary
                                : isChecked
                                ? COLORS.textSecondary + '40'
                                : COLORS.cardHover,
                              border: `2px solid ${
                                isFound
                                  ? COLORS.success
                                  : isCurrent
                                  ? COLORS.primary
                                  : COLORS.border
                              }`,
                              boxShadow: isCurrent || isFound ? `0 0 15px ${isFound ? COLORS.success : COLORS.primary}` : 'none',
                              transform: isCurrent ? 'scale(1.1)' : 'scale(1)',
                            }}
                          >
                            {isCurrent && (
                              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold whitespace-nowrap" style={{ color: COLORS.primary }}>
                                Checking...
                              </div>
                            )}
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-sm">{element}</div>
                            <div className="text-xs" style={{ color: COLORS.textSecondary }}>Idx {index}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  
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
                  <label className="block mb-2 font-semibold text-sm">Array Elements</label>
                  <div className="flex gap-2 flex-wrap mb-2 max-h-24 overflow-y-auto p-2">
                    {arrayElements.map((element, index) => (
                      <input
                        key={index}
                        type="number"
                        value={element}
                        onChange={(e) => {
                          const newArray = [...arrayElements]
                          newArray[index] = Number(e.target.value) || 0
                          setArrayElements(newArray)
                        }}
                        className="w-14 px-2 py-1 rounded text-center text-white text-sm"
                        style={{ backgroundColor: COLORS.cardHover, border: `1px solid ${COLORS.border}` }}
                        disabled={isSearching}
                      />
                    ))}
                  </div>
                  <button
                    onClick={generateRandomArray}
                    disabled={isSearching}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
                    style={{ backgroundColor: COLORS.cardHover, border: `1px solid ${COLORS.border}` }}
                  >
                    Random Array
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
                    <label className="block mb-3 font-semibold text-sm">Recursion Stack</label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {recursionStack.map((frame, idx) => (
                        <div
                          key={idx}
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
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-xs font-semibold" style={{ color: COLORS.textSecondary }}>
                                Stack Level {frame.stackDepth + 1}:
                              </span>
                              <span className="ml-2 font-semibold">
                                linearSearch(arr, {targetElement}, index={frame.index})
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
                            {frame.notFound && (
                              <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: COLORS.textSecondary, color: 'white' }}>
                                No match
                              </span>
                            )}
                          </div>
                          <div className="mt-1 text-xs" style={{ color: COLORS.textSecondary }}>
                            Checking: arr[{frame.index}] = {arrayElements[frame.index]}
                          </div>
                        </div>
                      ))}
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
                            <span style={{ color: '#D2A8FF' }}>linearSearch</span>
                            <span style={{ color: '#C9D1D9' }}>(arr, target)</span> {'{'}
                          </div>
                          <div className={highlightedLine === 2 ? 'bg-blue-500/30 px-2 py-1 rounded' : ''}>
                            {'  '}
                            <span style={{ color: '#79C0FF' }}>for</span>
                            <span style={{ color: '#C9D1D9' }}> (</span>
                            <span style={{ color: '#79C0FF' }}>let</span>{' '}
                            <span style={{ color: '#FF7B72' }}>i</span>
                            <span style={{ color: '#C9D1D9' }}> = </span>
                            <span style={{ color: '#A5D6FF' }}>0</span>
                            <span style={{ color: '#C9D1D9' }}>; </span>
                            <span style={{ color: '#FF7B72' }}>i</span>
                            <span style={{ color: '#C9D1D9' }}> {'<'} arr.length; </span>
                            <span style={{ color: '#FF7B72' }}>i</span>
                            <span style={{ color: '#C9D1D9' }}>++)</span> {'{'}
                            {currentIndex >= 0 && (
                              <span className="ml-2 text-xs" style={{ color: COLORS.primary }}>
                                // i = {currentIndex}
                              </span>
                            )}
                          </div>
                          <div className={highlightedLine === 3 ? 'bg-blue-500/30 px-2 py-1 rounded' : ''}>
                            {'    '}
                            <span style={{ color: '#79C0FF' }}>if</span>
                            <span style={{ color: '#C9D1D9' }}> (arr[</span>
                            <span style={{ color: '#FF7B72' }}>i</span>
                            <span style={{ color: '#C9D1D9' }}>] === target)</span> {'{'}
                            {currentIndex >= 0 && (
                              <span className="ml-2 text-xs" style={{ color: COLORS.accent }}>
                                // arr[{currentIndex}] = {arrayElements[currentIndex]} === {targetElement}?
                              </span>
                            )}
                          </div>
                          <div className={highlightedLine === 4 ? 'bg-green-500/30 px-2 py-1 rounded' : ''}>
                            {'      '}
                            <span style={{ color: '#79C0FF' }}>return</span>{' '}
                            <span style={{ color: '#FF7B72' }}>i</span>
                            <span style={{ color: '#C9D1D9' }}>;</span>
                            <span className="ml-2 text-xs" style={{ color: '#7EE787' }}>
                              // Found!
                            </span>
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
                            <span style={{ color: '#D2A8FF' }}>linearSearch</span>
                            <span style={{ color: '#C9D1D9' }}>(arr, target, index = 0)</span> {'{'}
                          </div>
                          <div className={highlightedLine === 2 ? 'bg-blue-500/30 px-2 py-1 rounded' : ''}>
                            {'  '}
                            <span style={{ color: '#79C0FF' }}>if</span>
                            <span style={{ color: '#C9D1D9' }}> (index {'>='} arr.length)</span> {'{'}
                            {currentIndex >= 0 && (
                              <span className="ml-2 text-xs" style={{ color: COLORS.primary }}>
                                // index = {currentIndex}
                              </span>
                            )}
                          </div>
                          <div className={highlightedLine === 6 ? 'bg-red-500/30 px-2 py-1 rounded' : ''}>
                            {'    '}
                            <span style={{ color: '#79C0FF' }}>return</span>{' '}
                            <span style={{ color: '#A5D6FF' }}>-1</span>
                            <span style={{ color: '#C9D1D9' }}>;</span>
                            <span className="ml-2 text-xs" style={{ color: '#FF7B72' }}>
                              // Base case: not found
                            </span>
                          </div>
                          <div>
                            {'  '}
                            <span style={{ color: '#C9D1D9' }}>{'}'}</span>
                          </div>
                          <div className={highlightedLine === 3 ? 'bg-blue-500/30 px-2 py-1 rounded' : ''}>
                            {'  '}
                            <span style={{ color: '#79C0FF' }}>if</span>
                            <span style={{ color: '#C9D1D9' }}> (arr[index] === target)</span> {'{'}
                            {currentIndex >= 0 && (
                              <span className="ml-2 text-xs" style={{ color: COLORS.accent }}>
                                // arr[{currentIndex}] = {arrayElements[currentIndex]} === {targetElement}?
                              </span>
                            )}
                          </div>
                          <div className={highlightedLine === 4 ? 'bg-green-500/30 px-2 py-1 rounded' : ''}>
                            {'    '}
                            <span style={{ color: '#79C0FF' }}>return</span>{' '}
                            <span style={{ color: '#FF7B72' }}>index</span>
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
                            <span style={{ color: '#79C0FF' }}>return</span>{' '}
                            <span style={{ color: '#D2A8FF' }}>linearSearch</span>
                            <span style={{ color: '#C9D1D9' }}>(arr, target, index + 1);</span>
                            <span className="ml-2 text-xs" style={{ color: '#D2A8FF' }}>
                              // Recursive call
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
              <h2 className="text-xl font-bold">Linear Search Implementation</h2>
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
            <h2 className="text-2xl font-bold mb-6">Detailed Explanation of Linear Search Algorithm</h2>
            
            {/* How Does It Work */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3" style={{ color: COLORS.primary }}>How Does It Work?</h3>
              <p className="mb-4" style={{ color: COLORS.textSecondary }}>
                Linear Search, also known as Sequential Search, is the simplest searching algorithm. It works by checking each element in the array one by one, starting from the first element, until it finds the target value or reaches the end of the array.
              </p>
              <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: COLORS.bg, border: `1px solid ${COLORS.border}` }}>
                <p className="mb-3 font-semibold">Example:</p>
                <p className="mb-2" style={{ color: COLORS.textSecondary }}>
                  Let's say we have an array: <code className="px-2 py-1 rounded bg-black/50">[5, 3, 8, 1, 9]</code> and we want to find the number <code className="px-2 py-1 rounded bg-black/50">8</code>.
                </p>
                <ol className="list-decimal list-inside space-y-2 ml-2" style={{ color: COLORS.textSecondary }}>
                  <li>Start from index 0: Check if <code className="px-1 py-0.5 rounded bg-black/50">arr[0] = 5</code> equals 8? <span style={{ color: COLORS.error }}>No</span></li>
                  <li>Move to index 1: Check if <code className="px-1 py-0.5 rounded bg-black/50">arr[1] = 3</code> equals 8? <span style={{ color: COLORS.error }}>No</span></li>
                  <li>Move to index 2: Check if <code className="px-1 py-0.5 rounded bg-black/50">arr[2] = 8</code> equals 8? <span style={{ color: COLORS.success }}>Yes! Found at index 2</span></li>
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
                      <p className="text-sm" style={{ color: COLORS.textSecondary }}>Start from the first element (index 0) of the array.</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: COLORS.cardHover, border: `1px solid ${COLORS.border}` }}>
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: COLORS.primary, color: 'white' }}>2</span>
                    <div>
                      <p className="font-semibold mb-1">Compare</p>
                      <p className="text-sm" style={{ color: COLORS.textSecondary }}>Compare the current element with the target value.</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: COLORS.cardHover, border: `1px solid ${COLORS.border}` }}>
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: COLORS.primary, color: 'white' }}>3</span>
                    <div>
                      <p className="font-semibold mb-1">Check Match</p>
                      <p className="text-sm" style={{ color: COLORS.textSecondary }}>If the current element matches the target, return its index (success).</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: COLORS.cardHover, border: `1px solid ${COLORS.border}` }}>
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: COLORS.primary, color: 'white' }}>4</span>
                    <div>
                      <p className="font-semibold mb-1">Move Forward</p>
                      <p className="text-sm" style={{ color: COLORS.textSecondary }}>If no match, move to the next element and repeat step 2.</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: COLORS.cardHover, border: `1px solid ${COLORS.border}` }}>
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: COLORS.primary, color: 'white' }}>5</span>
                    <div>
                      <p className="font-semibold mb-1">End Condition</p>
                      <p className="text-sm" style={{ color: COLORS.textSecondary }}>If all elements are checked and no match is found, return -1 (not found).</p>
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
                  <p className="text-sm" style={{ color: COLORS.textSecondary }}>When the target element is at the first position. Only one comparison is needed.</p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: COLORS.error + '20', border: `1px solid ${COLORS.error}` }}>
                  <p className="font-semibold mb-2" style={{ color: COLORS.error }}>Worst Case: O(n)</p>
                  <p className="text-sm" style={{ color: COLORS.textSecondary }}>When the target is at the last position or not present. All n elements need to be checked.</p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: COLORS.accent + '20', border: `1px solid ${COLORS.accent}` }}>
                  <p className="font-semibold mb-2" style={{ color: COLORS.accent }}>Average Case: O(n/2)</p>
                  <p className="text-sm" style={{ color: COLORS.textSecondary }}>On average, the target is found in the middle of the array.</p>
                </div>
              </div>
              <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: COLORS.cardHover, border: `1px solid ${COLORS.border}` }}>
                <p className="font-semibold mb-2">Space Complexity: O(1)</p>
                <p className="text-sm" style={{ color: COLORS.textSecondary }}>Linear Search uses constant extra space. It only requires a few variables (index, target) regardless of the array size.</p>
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
                      <span>Simple and easy to understand and implement</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>Works on unsorted arrays (unlike Binary Search)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>No additional data structure required</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>Efficient for small datasets</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>Can be used on linked lists and other linear data structures</span>
                    </li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: COLORS.error + '20', border: `1px solid ${COLORS.error}` }}>
                  <h4 className="font-semibold mb-3" style={{ color: COLORS.error }}>✗ Disadvantages</h4>
                  <ul className="space-y-2 text-sm" style={{ color: COLORS.textSecondary }}>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>Inefficient for large datasets (O(n) time complexity)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>Must check every element in worst case</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>Slower than Binary Search for sorted arrays</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>Not suitable for frequently searched large datasets</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* When to Use */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3" style={{ color: COLORS.primary }}>When to Use Linear Search?</h3>
              <div className="p-4 rounded-lg" style={{ backgroundColor: COLORS.cardHover, border: `1px solid ${COLORS.border}` }}>
                <ul className="space-y-2 text-sm" style={{ color: COLORS.textSecondary }}>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">→</span>
                    <span><strong>Small datasets:</strong> When the array size is small (less than 50-100 elements), the overhead of more complex algorithms isn't worth it.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">→</span>
                    <span><strong>Unsorted data:</strong> When the array is not sorted and you don't want to sort it first.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">→</span>
                    <span><strong>Single search:</strong> When you only need to search once or very infrequently.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">→</span>
                    <span><strong>Linked lists:</strong> When working with linked lists where random access isn't possible.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">→</span>
                    <span><strong>Simple implementation:</strong> When you need a quick, simple solution without worrying about optimization.</span>
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
                    <span><strong>Searching in small lists:</strong> Finding a name in a small contact list, searching for a product in a small inventory.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">•</span>
                    <span><strong>Database queries:</strong> Some simple database queries use linear search for unsorted data.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">•</span>
                    <span><strong>File systems:</strong> Searching for files in a directory when the list is small.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">•</span>
                    <span><strong>Text processing:</strong> Finding a character or substring in a string (though specialized algorithms exist).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">•</span>
                    <span><strong>Validation:</strong> Checking if a value exists in a small validation list.</span>
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

export default LinearSearch

