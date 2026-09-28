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

const sortingAlgorithmsData = {
  'bubble-sort': {
    title: 'Bubble Sort',
    icon: '🫧',
    description: 'Bubble Sort is a simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order. The pass through the list is repeated until the list is sorted.',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    bestUseCase: 'Educational or very small data',
    difficulty: 'Easy',
  },
  'selection-sort': {
    title: 'Selection Sort',
    icon: '🎯',
    description: 'Selection Sort finds the minimum element from the unsorted portion of the array and places it at the beginning. This process is repeated for the remaining unsorted portion until the entire array is sorted.',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    bestUseCase: 'When swaps are expensive',
    difficulty: 'Easy',
  },
  'insertion-sort': {
    title: 'Insertion Sort',
    icon: '📝',
    description: 'Insertion Sort builds the sorted array one item at a time by taking each element and inserting it into its correct position in the already sorted portion of the array.',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    bestUseCase: 'Nearly-sorted lists',
    difficulty: 'Easy',
  },
  'merge-sort': {
    title: 'Merge Sort',
    icon: '🔀',
    description: 'Merge Sort is a divide and conquer algorithm that divides the array into two halves, sorts them recursively, and then merges the two sorted halves back together.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    bestUseCase: 'Stable sorting on large data',
    difficulty: 'Medium',
  },
  'quick-sort': {
    title: 'Quick Sort',
    icon: '⚡',
    description: 'Quick Sort is an efficient divide and conquer algorithm that picks a pivot element and partitions the array around the pivot, placing smaller elements before it and larger elements after it.',
    timeComplexity: 'O(n log n) avg, O(n²) worst',
    spaceComplexity: 'O(log n)',
    bestUseCase: 'Fastest in most cases',
    difficulty: 'Medium',
  },
  'heap-sort': {
    title: 'Heap Sort',
    icon: '📊',
    description: 'Heap Sort is a comparison-based sorting algorithm that uses a binary heap data structure to sort elements. It builds a max heap and repeatedly extracts the maximum element.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(1)',
    bestUseCase: 'No extra memory needed',
    difficulty: 'Hard',
  },
  'counting-sort': {
    title: 'Counting Sort',
    icon: '🔢',
    description: 'Counting Sort is a non-comparison based sorting algorithm that counts the number of occurrences of each unique element in the array and uses this count to determine the position of each element.',
    timeComplexity: 'O(n + k)',
    spaceComplexity: 'O(k)',
    bestUseCase: 'When numbers have a small range',
    difficulty: 'Medium',
  },
  'radix-sort': {
    title: 'Radix Sort',
    icon: '🔣',
    description: 'Radix Sort is a non-comparison based sorting algorithm that sorts numbers by processing individual digits or characters from least significant to most significant digit.',
    timeComplexity: 'O(nk)',
    spaceComplexity: 'O(n + k)',
    bestUseCase: 'Sorting integers or strings',
    difficulty: 'Hard',
  },
}

function SortingAlgorithm() {
  const navigate = useNavigate()
  const { algorithmId } = useParams()
  const algorithm = sortingAlgorithmsData[algorithmId] || sortingAlgorithmsData['bubble-sort']
  const [codeCopied, setCodeCopied] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('javascript')
  const [arraySize, setArraySize] = useState(8)
  const [arrayElements, setArrayElements] = useState([64, 34, 25, 12, 22, 11, 90, 5])
  const [isSorting, setIsSorting] = useState(false)
  const [currentStep, setCurrentStep] = useState('')
  const [comparisons, setComparisons] = useState(0)
  const [swaps, setSwaps] = useState(0)
  const [highlightedIndices, setHighlightedIndices] = useState([])
  const [sortedIndices, setSortedIndices] = useState([])
  const [highlightedLine, setHighlightedLine] = useState(-1)
  const [viewMode, setViewMode] = useState('iterative')
  const [recursionStack, setRecursionStack] = useState([])
  const [currentRecursionIndex, setCurrentRecursionIndex] = useState(-1)

  const copyCode = (code) => {
    navigator.clipboard.writeText(code)
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 2000)
  }

  const getDifficultyColor = (difficulty) => {
    if (difficulty === 'Easy') return COLORS.success
    if (difficulty === 'Medium') return COLORS.accent
    return COLORS.error
  }

  const updateArraySize = (newSize) => {
    const size = Math.max(5, Math.min(15, newSize))
    setArraySize(size)
    if (size > arrayElements.length) {
      const newElements = [...arrayElements]
      while (newElements.length < size) {
        newElements.push(Math.floor(Math.random() * 100) + 1)
      }
      setArrayElements(newElements)
    } else if (size < arrayElements.length) {
      setArrayElements(arrayElements.slice(0, size))
    }
    resetSorting()
  }

  const generateRandomArray = () => {
    const randomArray = Array.from({ length: arraySize }, () => Math.floor(Math.random() * 100) + 1)
    setArrayElements(randomArray)
    resetSorting()
  }

  const resetSorting = () => {
    setIsSorting(false)
    setCurrentStep('')
    setComparisons(0)
    setSwaps(0)
    setHighlightedIndices([])
    setSortedIndices([])
    setHighlightedLine(-1)
    setRecursionStack([])
    setCurrentRecursionIndex(-1)
  }

  const startBubbleSort = () => {
    setIsSorting(true)
    setComparisons(0)
    setSwaps(0)
    setSortedIndices([])
    setHighlightedLine(-1)
    
    const arr = [...arrayElements]
    const n = arr.length
    let i = 0
    let j = 0
    let sortedCount = 0

    const sortStep = () => {
      if (i >= n - 1) {
        setCurrentStep('Array is sorted!')
        setIsSorting(false)
        setHighlightedIndices([])
        setSortedIndices(Array.from({ length: n }, (_, idx) => idx))
        setHighlightedLine(-1)
        return
      }

      if (j >= n - 1 - i) {
        setSortedIndices(prev => [...prev, n - 1 - i])
        i++
        j = 0
        setHighlightedLine(2)
        setCurrentStep(`Pass ${i + 1}: Starting new pass`)
        setTimeout(sortStep, 1000)
        return
      }

      setHighlightedIndices([j, j + 1])
      setHighlightedLine(3)
      setComparisons(prev => prev + 1)
      setCurrentStep(`Comparing arr[${j}] = ${arr[j]} and arr[${j + 1}] = ${arr[j + 1]}`)

      setTimeout(() => {
        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
          setArrayElements([...arr])
          setSwaps(prev => prev + 1)
          setHighlightedLine(4)
          setCurrentStep(`Swapping ${arr[j + 1]} and ${arr[j]}`)
        } else {
          setHighlightedLine(3)
          setCurrentStep(`No swap needed (${arr[j]} <= ${arr[j + 1]})`)
        }
        j++
        setTimeout(sortStep, 1500)
      }, 1000)
    }

    sortStep()
  }

  const startRecursiveBubbleSort = () => {
    setIsSorting(true)
    setComparisons(0)
    setSwaps(0)
    setSortedIndices([])
    setHighlightedLine(-1)
    setRecursionStack([])
    setCurrentRecursionIndex(-1)
    
    const arr = [...arrayElements]
    const n = arr.length

    const simulateRecursion = (size, stackDepth) => {
      if (size <= 1) {
        setHighlightedLine(2)
        setCurrentStep('Base case: n <= 1, returning')
        setIsSorting(false)
        setRecursionStack([])
        setCurrentRecursionIndex(-1)
        setSortedIndices(Array.from({ length: arr.length }, (_, idx) => idx))
        return
      }

      const newStack = [...recursionStack, { n: size, stackDepth, checking: true }]
      setRecursionStack(newStack)
      setCurrentRecursionIndex(newStack.length - 1)
      setHighlightedLine(3)
      setCurrentStep(`Recursive call: bubbleSort(arr, n=${size}) - Stack depth: ${stackDepth}`)

      let swapped = false
      let j = 0

      const processPass = () => {
        if (j >= size - 1) {
          const updatedStack = newStack.map((item, i) =>
            i === newStack.length - 1 ? { ...item, checking: false, completed: true } : item
          )
          setRecursionStack(updatedStack)
          setHighlightedLine(4)
          setCurrentStep(`Pass completed, recursing with n=${size - 1}`)
          setTimeout(() => {
            simulateRecursion(size - 1, stackDepth + 1)
          }, 1000)
          return
        }

        setHighlightedIndices([j, j + 1])
        setHighlightedLine(3)
        setComparisons(prev => prev + 1)
        setCurrentStep(`Comparing arr[${j}] = ${arr[j]} and arr[${j + 1}] = ${arr[j + 1]}`)

        setTimeout(() => {
          if (arr[j] > arr[j + 1]) {
            [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
            setArrayElements([...arr])
            setSwaps(prev => prev + 1)
            setHighlightedLine(4)
            setCurrentStep(`Swapping ${arr[j + 1]} and ${arr[j]}`)
            swapped = true
          }
          j++
          setTimeout(processPass, 1500)
        }, 1000)
      }

      processPass()
    }

    simulateRecursion(n, 0)
  }

  const startSelectionSort = () => {
    setIsSorting(true)
    setComparisons(0)
    setSwaps(0)
    setSortedIndices([])
    setHighlightedLine(-1)
    
    const arr = [...arrayElements]
    const n = arr.length
    let i = 0

    const sortStep = () => {
      if (i >= n - 1) {
        setCurrentStep('Array is sorted!')
        setIsSorting(false)
        setHighlightedIndices([])
        setSortedIndices(Array.from({ length: n }, (_, idx) => idx))
        setHighlightedLine(-1)
        return
      }

      let minIdx = i
      setHighlightedIndices([i])
      setHighlightedLine(2)
      setCurrentStep(`Finding minimum in unsorted portion starting from index ${i}`)

      setTimeout(() => {
        const findMin = (j) => {
          if (j >= n) {
            if (minIdx !== i) {
              [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]]
              setArrayElements([...arr])
              setSwaps(prev => prev + 1)
              setHighlightedLine(3)
              setCurrentStep(`Swapping ${arr[i]} (min) with ${arr[minIdx]} at position ${i}`)
            } else {
              setCurrentStep(`Element at ${i} is already in correct position`)
            }
            setSortedIndices(prev => [...prev, i])
            i++
            setTimeout(sortStep, 1500)
            return
          }

          setHighlightedIndices([i, minIdx, j])
          setComparisons(prev => prev + 1)
          setCurrentStep(`Comparing arr[${j}] = ${arr[j]} with current min arr[${minIdx}] = ${arr[minIdx]}`)

          setTimeout(() => {
            if (arr[j] < arr[minIdx]) {
              minIdx = j
              setCurrentStep(`New minimum found: ${arr[minIdx]} at index ${minIdx}`)
            }
            findMin(j + 1)
          }, 1000)
        }

        findMin(i + 1)
      }, 1000)
    }

    sortStep()
  }

  const startInsertionSort = () => {
    setIsSorting(true)
    setComparisons(0)
    setSwaps(0)
    setSortedIndices([])
    setHighlightedLine(-1)
    
    const arr = [...arrayElements]
    const n = arr.length
    let i = 1

    const sortStep = () => {
      if (i >= n) {
        setCurrentStep('Array is sorted!')
        setIsSorting(false)
        setHighlightedIndices([])
        setSortedIndices(Array.from({ length: n }, (_, idx) => idx))
        setHighlightedLine(-1)
        return
      }

      const key = arr[i]
      let j = i - 1
      setHighlightedIndices([i])
      setHighlightedLine(2)
      setCurrentStep(`Selecting key element: ${key} at index ${i}`)

      setTimeout(() => {
        const insertKey = () => {
          if (j >= 0 && arr[j] > key) {
            setHighlightedIndices([i, j])
            setComparisons(prev => prev + 1)
            setCurrentStep(`Comparing ${arr[j]} > ${key}, shifting ${arr[j]} to the right`)
            setHighlightedLine(3)

            setTimeout(() => {
              arr[j + 1] = arr[j]
              setArrayElements([...arr])
              setSwaps(prev => prev + 1)
              j--
              setTimeout(insertKey, 1000)
            }, 1000)
          } else {
            arr[j + 1] = key
            setArrayElements([...arr])
            setHighlightedLine(4)
            setCurrentStep(`Inserting ${key} at position ${j + 1}`)
            setSortedIndices(prev => [...prev, j + 1])
            i++
            setTimeout(sortStep, 1500)
          }
        }

        insertKey()
      }, 1000)
    }

    sortStep()
  }

  const startMergeSort = () => {
    setIsSorting(true)
    setComparisons(0)
    setSwaps(0)
    setSortedIndices([])
    setHighlightedLine(-1)
    setRecursionStack([])
    setCurrentRecursionIndex(-1)
    
    const arr = [...arrayElements]
    const n = arr.length

    const merge = async (arr, left, mid, right) => {
      const leftArr = arr.slice(left, mid + 1)
      const rightArr = arr.slice(mid + 1, right + 1)
      let i = 0, j = 0, k = left

      setHighlightedIndices(Array.from({ length: right - left + 1 }, (_, idx) => left + idx))
      setCurrentStep(`Merging subarrays [${left}...${mid}] and [${mid + 1}...${right}]`)

      while (i < leftArr.length && j < rightArr.length) {
        setComparisons(prev => prev + 1)
        setCurrentStep(`Comparing ${leftArr[i]} and ${rightArr[j]}`)
        await new Promise(resolve => setTimeout(resolve, 1000))

        if (leftArr[i] <= rightArr[j]) {
          arr[k] = leftArr[i]
          i++
        } else {
          arr[k] = rightArr[j]
          j++
        }
        setArrayElements([...arr])
        k++
        await new Promise(resolve => setTimeout(resolve, 800))
      }

      while (i < leftArr.length) {
        arr[k] = leftArr[i]
        setArrayElements([...arr])
        i++
        k++
        await new Promise(resolve => setTimeout(resolve, 800))
      }

      while (j < rightArr.length) {
        arr[k] = rightArr[j]
        setArrayElements([...arr])
        j++
        k++
        await new Promise(resolve => setTimeout(resolve, 800))
      }
    }

    const mergeSort = async (arr, left, right, stackDepth) => {
      if (left >= right) {
        if (left === right) {
          setSortedIndices(prev => [...prev, left])
        }
        return
      }

      const mid = Math.floor((left + right) / 2)
      const newStack = [...recursionStack, { left, mid, right, stackDepth, checking: true }]
      setRecursionStack(newStack)
      setCurrentRecursionIndex(newStack.length - 1)
      setHighlightedLine(2)
      setCurrentStep(`Dividing array [${left}...${right}] at mid = ${mid}`)

      await new Promise(resolve => setTimeout(resolve, 1000))

      await mergeSort(arr, left, mid, stackDepth + 1)
      await mergeSort(arr, mid + 1, right, stackDepth + 1)

      const updatedStack = newStack.map((item, i) =>
        i === newStack.length - 1 ? { ...item, checking: false, completed: true } : item
      )
      setRecursionStack(updatedStack)
      setHighlightedLine(3)
      await merge(arr, left, mid, right)
    }

    mergeSort(arr, 0, n - 1, 0).then(() => {
      setIsSorting(false)
      setCurrentStep('Array is sorted!')
      setHighlightedIndices([])
      setSortedIndices(Array.from({ length: n }, (_, idx) => idx))
      setRecursionStack([])
      setCurrentRecursionIndex(-1)
    })
  }

  const startQuickSort = async () => {
    setIsSorting(true)
    setComparisons(0)
    setSwaps(0)
    setSortedIndices([])
    setHighlightedLine(-1)
    setRecursionStack([])
    setCurrentRecursionIndex(-1)
    
    const arr = [...arrayElements]
    const n = arr.length

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

    const partition = async (low, high) => {
      const pivot = arr[high]
      let i = low - 1

      setHighlightedIndices([high])
      setCurrentStep(`Pivot selected: ${pivot} at index ${high}`)
      await sleep(1000)

      for (let j = low; j < high; j++) {
        setHighlightedIndices([j, high, i + 1])
        setComparisons(prev => prev + 1)
        setCurrentStep(`Comparing arr[${j}] = ${arr[j]} with pivot ${pivot}`)
        await sleep(800)
        
        if (arr[j] < pivot) {
          i++
          if (i !== j) {
            [arr[i], arr[j]] = [arr[j], arr[i]]
            setArrayElements([...arr])
            setSwaps(prev => prev + 1)
            setCurrentStep(`Swapping arr[${i}] and arr[${j}]`)
            await sleep(800)
          }
        }
      }
      
      [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]]
      setArrayElements([...arr])
      setSwaps(prev => prev + 1)
      setSortedIndices(prev => [...prev, i + 1])
      setCurrentStep(`Pivot ${pivot} placed at position ${i + 1}`)
      await sleep(800)
      
      return i + 1
    }

    const quickSort = async (low, high, stackDepth) => {
      if (low < high) {
        const newStack = [...recursionStack, { 
          low, 
          high, 
          stackDepth, 
          checking: true,
          pivotIndex: -1
        }]
        setRecursionStack(newStack)
        setCurrentRecursionIndex(newStack.length - 1)
        setHighlightedLine(2)
        setCurrentStep(`Processing subarray from index ${low} to ${high}`)
        await sleep(1000)
        
        const pivotIndex = await partition(low, high)
        
        const updatedStack = newStack.map((item, i) =>
          i === newStack.length - 1 ? { ...item, pivotIndex, checking: false } : item
        )
        setRecursionStack(updatedStack)
        setCurrentStep(`Pivot ${arr[pivotIndex]} is in correct position. Dividing array...`)
        setHighlightedLine(3)
        await sleep(1000)
        
        await quickSort(low, pivotIndex - 1, stackDepth + 1)
        
        setHighlightedLine(4)
        await quickSort(pivotIndex + 1, high, stackDepth + 1)
        
        const finalStack = updatedStack.map((item, i) =>
          i === updatedStack.length - 1 ? { ...item, completed: true } : item
        )
        setRecursionStack(finalStack)
      } else {
        if (low === high) {
          setSortedIndices(prev => [...prev, low])
        }
      }
    }

    await quickSort(0, n - 1, 0)
    
    setIsSorting(false)
    setCurrentStep('Array is sorted!')
    setHighlightedIndices([])
    setSortedIndices(Array.from({ length: n }, (_, idx) => idx))
    setRecursionStack([])
  }

  const startHeapSort = async () => {
    setIsSorting(true)
    setComparisons(0)
    setSwaps(0)
    setSortedIndices([])
    setHighlightedLine(-1)
    setRecursionStack([])
    setCurrentRecursionIndex(-1)
    
    const arr = [...arrayElements]
    const n = arr.length

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

    const heapify = async (arr, n, i, stackDepth) => {
      const newStack = [...recursionStack, {
        nodeIndex: i,
        heapSize: n,
        stackDepth,
        checking: true,
        type: 'heapify'
      }]
      setRecursionStack(newStack)
      setCurrentRecursionIndex(newStack.length - 1)
      setHighlightedIndices([i])
      setCurrentStep(`Heapifying node at index ${i}`)
      await sleep(1000)
      
      let largest = i
      const left = 2 * i + 1
      const right = 2 * i + 2

      if (left < n) {
        setComparisons(prev => prev + 1)
        setHighlightedIndices([i, left])
        setCurrentStep(`Comparing left child ${arr[left]} with parent ${arr[i]}`)
        await sleep(800)
        if (arr[left] > arr[largest]) {
          largest = left
        }
      }

      if (right < n) {
        setComparisons(prev => prev + 1)
        setHighlightedIndices([i, left, right])
        setCurrentStep(`Comparing right child ${arr[right]} with largest`)
        await sleep(800)
        if (arr[right] > arr[largest]) {
          largest = right
        }
      }

      if (largest !== i) {
        [arr[i], arr[largest]] = [arr[largest], arr[i]]
        setArrayElements([...arr])
        setSwaps(prev => prev + 1)
        setCurrentStep(`Swapping ${arr[largest]} and ${arr[i]}, recursing to heapify subtree`)
        await sleep(1000)
        
        const updatedStack = newStack.map((item, idx) =>
          idx === newStack.length - 1 ? { ...item, checking: false } : item
        )
        setRecursionStack(updatedStack)
        await heapify(arr, n, largest, stackDepth + 1)
      } else {
        const updatedStack = newStack.map((item, idx) =>
          idx === newStack.length - 1 ? { ...item, checking: false, completed: true } : item
        )
        setRecursionStack(updatedStack)
      }
    }

    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      setCurrentStep(`Building max heap: heapifying node at index ${i}`)
      await heapify(arr, n, i, 0)
    }

    for (let i = n - 1; i > 0; i--) {
      [arr[0], arr[i]] = [arr[i], arr[0]]
      setArrayElements([...arr])
      setSwaps(prev => prev + 1)
      setSortedIndices(prev => [...prev, i])
      setCurrentStep(`Moving max element ${arr[i]} to position ${i}`)
      await sleep(1000)
      
      await heapify(arr, i, 0, 0)
    }

    setIsSorting(false)
    setCurrentStep('Array is sorted!')
    setHighlightedIndices([])
    setSortedIndices(Array.from({ length: n }, (_, idx) => idx))
    setRecursionStack([])
  }

  const startCountingSort = () => {
    setIsSorting(true)
    setComparisons(0)
    setSwaps(0)
    setSortedIndices([])
    setHighlightedLine(-1)
    
    const arr = [...arrayElements]
    const n = arr.length
    const max = Math.max(...arr)
    const count = Array(max + 1).fill(0)
    const output = Array(n).fill(0)

    let step = 0

    const sortStep = () => {
      if (step === 0) {
        setHighlightedLine(1)
        setCurrentStep(`Finding maximum element: ${max}`)
        setTimeout(() => {
          step++
          sortStep()
        }, 1000)
      } else if (step === 1) {
        setHighlightedLine(2)
        setCurrentStep('Counting occurrences of each element')
        arr.forEach((val, idx) => {
          count[val]++
          setHighlightedIndices([idx])
        })
        setArrayElements([...arr])
        setTimeout(() => {
          step++
          sortStep()
        }, 2000)
      } else if (step === 2) {
        setHighlightedLine(3)
        setCurrentStep('Building cumulative count array')
        for (let i = 1; i <= max; i++) {
          count[i] += count[i - 1]
        }
        setTimeout(() => {
          step++
          sortStep()
        }, 2000)
      } else if (step === 3) {
        setHighlightedLine(4)
        let idx = 0
        const placeElements = () => {
          if (idx >= n) {
            setArrayElements([...output])
            setSortedIndices(Array.from({ length: n }, (_, i) => i))
            setIsSorting(false)
            setCurrentStep('Array is sorted!')
            setHighlightedIndices([])
            return
          }

          const val = arr[n - 1 - idx]
          const pos = count[val] - 1
          output[pos] = val
          count[val]--
          setHighlightedIndices([n - 1 - idx, pos])
          setCurrentStep(`Placing ${val} at position ${pos}`)
          setArrayElements([...output])
          idx++
          setTimeout(placeElements, 1000)
        }
        placeElements()
      }
    }

    sortStep()
  }

  const startRadixSort = async () => {
    setIsSorting(true)
    setComparisons(0)
    setSwaps(0)
    setSortedIndices([])
    setHighlightedLine(-1)
    
    const arr = [...arrayElements]
    const max = Math.max(...arr)
    const maxDigits = Math.floor(Math.log10(max)) + 1

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

    const countingSortByDigit = async (arr, exp) => {
      const n = arr.length
      const output = Array(n).fill(0)
      const count = Array(10).fill(0)

      setCurrentStep(`Sorting by digit at position ${exp === 1 ? 'ones' : exp === 10 ? 'tens' : exp === 100 ? 'hundreds' : 'position ' + exp}`)
      setHighlightedLine(2)

      for (let i = 0; i < n; i++) {
        const digit = Math.floor(arr[i] / exp) % 10
        count[digit]++
        setHighlightedIndices([i])
        await sleep(500)
      }

      for (let i = 1; i < 10; i++) {
        count[i] += count[i - 1]
      }

      for (let i = n - 1; i >= 0; i--) {
        const digit = Math.floor(arr[i] / exp) % 10
        output[count[digit] - 1] = arr[i]
        count[digit]--
        setHighlightedIndices([i, count[digit]])
        setArrayElements([...output])
        await sleep(800)
      }

      for (let i = 0; i < n; i++) {
        arr[i] = output[i]
      }
      setArrayElements([...arr])
    }

    for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
      setHighlightedLine(1)
      await countingSortByDigit(arr, exp)
      await sleep(1000)
    }

    setIsSorting(false)
    setCurrentStep('Array is sorted!')
    setHighlightedIndices([])
    setSortedIndices(Array.from({ length: arr.length }, (_, idx) => idx))
  }

  const startSorting = () => {
    if (algorithmId === 'bubble-sort') {
      if (viewMode === 'iterative') {
        startBubbleSort()
      } else {
        startRecursiveBubbleSort()
      }
    } else if (algorithmId === 'selection-sort') {
      startSelectionSort()
    } else if (algorithmId === 'insertion-sort') {
      startInsertionSort()
    } else if (algorithmId === 'merge-sort') {
      startMergeSort()
    } else if (algorithmId === 'quick-sort') {
      startQuickSort()
    } else if (algorithmId === 'heap-sort') {
      startHeapSort()
    } else if (algorithmId === 'counting-sort') {
      startCountingSort()
    } else if (algorithmId === 'radix-sort') {
      startRadixSort()
    } else {
      setCurrentStep(`${algorithm.title} visualization coming soon!`)
    }
  }

  const getCodeExamples = () => {
    const codes = {
      'bubble-sort': {
        javascript: `
function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {

        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}

const numbers = [64, 34, 25, 12, 22, 11, 90];
const sorted = bubbleSort(numbers);
console.log("Sorted array:", sorted);`,
        python: `# Bubble Sort in Python
def bubble_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        for j in range(n - i - 1):
            if arr[j] > arr[j + 1]:
                # Swap elements
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

# Usage
numbers = [64, 34, 25, 12, 22, 11, 90]
sorted_arr = bubble_sort(numbers)
print("Sorted array:", sorted_arr)`,
        java: `
import java.util.Arrays;

public class BubbleSort {
    public static void bubbleSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            for (int j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {

                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                }
            }
        }
    }
    
    public static void main(String[] args) {
        int[] numbers = {64, 34, 25, 12, 22, 11, 90};
        bubbleSort(numbers);
        System.out.println("Sorted array: " + Arrays.toString(numbers));
    }
}`,
        c: `
#include <stdio.h>

void bubble_sort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {

                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}

int main() {
    int numbers[] = {64, 34, 25, 12, 22, 11, 90};
    int n = sizeof(numbers) / sizeof(numbers[0]);
    bubble_sort(numbers, n);
    printf("Sorted array: ");
    for (int i = 0; i < n; i++) {
        printf("%d ", numbers[i]);
    }
    return 0;
}`,
        cpp: `
#include <iostream>
using namespace std;

void bubbleSort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {

                swap(arr[j], arr[j + 1]);
            }
        }
    }
}

int main() {
    int numbers[] = {64, 34, 25, 12, 22, 11, 90};
    int n = sizeof(numbers) / sizeof(numbers[0]);
    bubbleSort(numbers, n);
    cout << "Sorted array: ";
    for (int i = 0; i < n; i++) {
        cout << numbers[i] << " ";
    }
    return 0;
}`
      },
      'selection-sort': {
        javascript: `
function selectionSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIdx]) {
        minIdx = j;
      }
    }

    [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
  }
  return arr;
}

const numbers = [64, 34, 25, 12, 22, 11, 90];
const sorted = selectionSort(numbers);
console.log("Sorted array:", sorted);`,
        python: `# Selection Sort in Python
def selection_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        # Swap minimum with current
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr

# Usage
numbers = [64, 34, 25, 12, 22, 11, 90]
sorted_arr = selection_sort(numbers)
print("Sorted array:", sorted_arr)`,
        java: `
import java.util.Arrays;

public class SelectionSort {
    public static void selectionSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            int minIdx = i;
            for (int j = i + 1; j < n; j++) {
                if (arr[j] < arr[minIdx]) {
                    minIdx = j;
                }
            }

            int temp = arr[i];
            arr[i] = arr[minIdx];
            arr[minIdx] = temp;
        }
    }
    
    public static void main(String[] args) {
        int[] numbers = {64, 34, 25, 12, 22, 11, 90};
        selectionSort(numbers);
        System.out.println("Sorted array: " + Arrays.toString(numbers));
    }
}`,
        c: `
#include <stdio.h>

void selection_sort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        int min_idx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[min_idx]) {
                min_idx = j;
            }
        }

        int temp = arr[i];
        arr[i] = arr[min_idx];
        arr[min_idx] = temp;
    }
}

int main() {
    int numbers[] = {64, 34, 25, 12, 22, 11, 90};
    int n = sizeof(numbers) / sizeof(numbers[0]);
    selection_sort(numbers, n);
    printf("Sorted array: ");
    for (int i = 0; i < n; i++) {
        printf("%d ", numbers[i]);
    }
    return 0;
}`,
        cpp: `
#include <iostream>
using namespace std;

void selectionSort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) {
                minIdx = j;
            }
        }

        swap(arr[i], arr[minIdx]);
    }
}

int main() {
    int numbers[] = {64, 34, 25, 12, 22, 11, 90};
    int n = sizeof(numbers) / sizeof(numbers[0]);
    selectionSort(numbers, n);
    cout << "Sorted array: ";
    for (int i = 0; i < n; i++) {
        cout << numbers[i] << " ";
    }
    return 0;
}`
      },
      'insertion-sort': {
        javascript: `
function insertionSort(arr) {
  const n = arr.length;
  for (let i = 1; i < n; i++) {
    const key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
  }
  return arr;
}

const numbers = [64, 34, 25, 12, 22, 11, 90];
const sorted = insertionSort(numbers);
console.log("Sorted array:", sorted);`,
        python: `# Insertion Sort in Python
def insertion_sort(arr):
    n = len(arr)
    for i in range(1, n):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
    return arr

# Usage
numbers = [64, 34, 25, 12, 22, 11, 90]
sorted_arr = insertion_sort(numbers)
print("Sorted array:", sorted_arr)`,
        java: `
import java.util.Arrays;

public class InsertionSort {
    public static void insertionSort(int[] arr) {
        int n = arr.length;
        for (int i = 1; i < n; i++) {
            int key = arr[i];
            int j = i - 1;
            while (j >= 0 && arr[j] > key) {
                arr[j + 1] = arr[j];
                j--;
            }
            arr[j + 1] = key;
        }
    }
    
    public static void main(String[] args) {
        int[] numbers = {64, 34, 25, 12, 22, 11, 90};
        insertionSort(numbers);
        System.out.println("Sorted array: " + Arrays.toString(numbers));
    }
}`,
        c: `
#include <stdio.h>

void insertion_sort(int arr[], int n) {
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}

int main() {
    int numbers[] = {64, 34, 25, 12, 22, 11, 90};
    int n = sizeof(numbers) / sizeof(numbers[0]);
    insertion_sort(numbers, n);
    printf("Sorted array: ");
    for (int i = 0; i < n; i++) {
        printf("%d ", numbers[i]);
    }
    return 0;
}`,
        cpp: `
#include <iostream>
using namespace std;

void insertionSort(int arr[], int n) {
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}

int main() {
    int numbers[] = {64, 34, 25, 12, 22, 11, 90};
    int n = sizeof(numbers) / sizeof(numbers[0]);
    insertionSort(numbers, n);
    cout << "Sorted array: ";
    for (int i = 0; i < n; i++) {
        cout << numbers[i] << " ";
    }
    return 0;
}`
      },
      'merge-sort': {
        javascript: `
function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  
  return merge(left, right);
}

function merge(left, right) {
  const result = [];
  let i = 0, j = 0;
  
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      result.push(left[i++]);
    } else {
      result.push(right[j++]);
    }
  }
  
  return result.concat(left.slice(i)).concat(right.slice(j));
}

const numbers = [64, 34, 25, 12, 22, 11, 90];
const sorted = mergeSort(numbers);
console.log("Sorted array:", sorted);`,
        python: `# Merge Sort in Python
def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    
    mid = len(arr)
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    
    result.extend(left[i:])
    result.extend(right[j:])
    return result

# Usage
numbers = [64, 34, 25, 12, 22, 11, 90]
sorted_arr = merge_sort(numbers)
print("Sorted array:", sorted_arr)`,
        java: `
import java.util.Arrays;

public class MergeSort {
    public static void mergeSort(int[] arr, int left, int right) {
        if (left < right) {
            int mid = left + (right - left) / 2;
            mergeSort(arr, left, mid);
            mergeSort(arr, mid + 1, right);
            merge(arr, left, mid, right);
        }
    }
    
    private static void merge(int[] arr, int left, int mid, int right) {
        int[] leftArr = Arrays.copyOfRange(arr, left, mid + 1);
        int[] rightArr = Arrays.copyOfRange(arr, mid + 1, right + 1);
        
        int i = 0, j = 0, k = left;
        while (i < leftArr.length && j < rightArr.length) {
            if (leftArr[i] <= rightArr[j]) {
                arr[k++] = leftArr[i++];
            } else {
                arr[k++] = rightArr[j++];
            }
        }
        
        while (i < leftArr.length) arr[k++] = leftArr[i++];
        while (j < rightArr.length) arr[k++] = rightArr[j++];
    }
    
    public static void main(String[] args) {
        int[] numbers = {64, 34, 25, 12, 22, 11, 90};
        mergeSort(numbers, 0, numbers.length - 1);
        System.out.println("Sorted array: " + Arrays.toString(numbers));
    }
}`,
        c: `
#include <stdio.h>
#include <stdlib.h>

void merge(int arr[], int left, int mid, int right) {
    int n1 = mid - left + 1;
    int n2 = right - mid;
    
    int* leftArr = (int*)malloc(n1 * sizeof(int));
    int* rightArr = (int*)malloc(n2 * sizeof(int));
    
    for (int i = 0; i < n1; i++) leftArr[i] = arr[left + i];
    for (int j = 0; j < n2; j++) rightArr[j] = arr[mid + 1 + j];
    
    int i = 0, j = 0, k = left;
    while (i < n1 && j < n2) {
        if (leftArr[i] <= rightArr[j]) {
            arr[k++] = leftArr[i++];
        } else {
            arr[k++] = rightArr[j++];
        }
    }
    
    while (i < n1) arr[k++] = leftArr[i++];
    while (j < n2) arr[k++] = rightArr[j++];
    
    free(leftArr);
    free(rightArr);
}

void merge_sort(int arr[], int left, int right) {
    if (left < right) {
        int mid = left + (right - left) / 2;
        merge_sort(arr, left, mid);
        merge_sort(arr, mid + 1, right);
        merge(arr, left, mid, right);
    }
}

int main() {
    int numbers[] = {64, 34, 25, 12, 22, 11, 90};
    int n = sizeof(numbers) / sizeof(numbers[0]);
    merge_sort(numbers, 0, n - 1);
    printf("Sorted array: ");
    for (int i = 0; i < n; i++) {
        printf("%d ", numbers[i]);
    }
    return 0;
}`,
        cpp: `
#include <iostream>
#include <vector>
using namespace std;

void merge(vector<int>& arr, int left, int mid, int right) {
    vector<int> leftArr(arr.begin() + left, arr.begin() + mid + 1);
    vector<int> rightArr(arr.begin() + mid + 1, arr.begin() + right + 1);
    
    int i = 0, j = 0, k = left;
    while (i < leftArr.size() && j < rightArr.size()) {
        if (leftArr[i] <= rightArr[j]) {
            arr[k++] = leftArr[i++];
        } else {
            arr[k++] = rightArr[j++];
        }
    }
    
    while (i < leftArr.size()) arr[k++] = leftArr[i++];
    while (j < rightArr.size()) arr[k++] = rightArr[j++];
}

void mergeSort(vector<int>& arr, int left, int right) {
    if (left < right) {
        int mid = left + (right - left) / 2;
        mergeSort(arr, left, mid);
        mergeSort(arr, mid + 1, right);
        merge(arr, left, mid, right);
    }
}

int main() {
    vector<int> numbers = {64, 34, 25, 12, 22, 11, 90};
    mergeSort(numbers, 0, numbers.size() - 1);
    cout << "Sorted array: ";
    for (int num : numbers) {
        cout << num << " ";
    }
    return 0;
}`
      },
      'quick-sort': {
        javascript: `
function quickSort(arr, low = 0, high = arr.length - 1) {
  if (low < high) {
    const pivotIndex = partition(arr, low, high);
    quickSort(arr, low, pivotIndex - 1);
    quickSort(arr, pivotIndex + 1, high);
  }
  return arr;
}

function partition(arr, low, high) {
  const pivot = arr[high];
  let i = low - 1;
  
  for (let j = low; j < high; j++) {
    if (arr[j] < pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  return i + 1;
}

const numbers = [64, 34, 25, 12, 22, 11, 90];
quickSort(numbers);
console.log("Sorted array:", numbers);`,
        python: `# Quick Sort in Python
def quick_sort(arr, low=0, high=None):
    if high is None:
        high = len(arr) - 1
    if low < high:
        pivot_index = partition(arr, low, high)
        quick_sort(arr, low, pivot_index - 1)
        quick_sort(arr, pivot_index + 1, high)
    return arr

def partition(arr, low, high):
    pivot = arr[high]
    i = low - 1
    
    for j in range(low, high):
        if arr[j] < pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1

# Usage
numbers = [64, 34, 25, 12, 22, 11, 90]
quick_sort(numbers)
print("Sorted array:", numbers)`,
        java: `
import java.util.Arrays;

public class QuickSort {
    public static void quickSort(int[] arr, int low, int high) {
        if (low < high) {
            int pivotIndex = partition(arr, low, high);
            quickSort(arr, low, pivotIndex - 1);
            quickSort(arr, pivotIndex + 1, high);
        }
    }
    
    private static int partition(int[] arr, int low, int high) {
        int pivot = arr[high];
        int i = low - 1;
        
        for (int j = low; j < high; j++) {
            if (arr[j] < pivot) {
                i++;
                int temp = arr[i];
                arr[i] = arr[j];
                arr[j] = temp;
            }
        }
        
        int temp = arr[i + 1];
        arr[i + 1] = arr[high];
        arr[high] = temp;
        return i + 1;
    }
    
    public static void main(String[] args) {
        int[] numbers = {64, 34, 25, 12, 22, 11, 90};
        quickSort(numbers, 0, numbers.length - 1);
        System.out.println("Sorted array: " + Arrays.toString(numbers));
    }
}`,
        c: `
#include <stdio.h>

int partition(int arr[], int low, int high) {
    int pivot = arr[high];
    int i = low - 1;
    
    for (int j = low; j < high; j++) {
        if (arr[j] < pivot) {
            i++;
            int temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
    }
    
    int temp = arr[i + 1];
    arr[i + 1] = arr[high];
    arr[high] = temp;
    return i + 1;
}

void quick_sort(int arr[], int low, int high) {
    if (low < high) {
        int pivotIndex = partition(arr, low, high);
        quick_sort(arr, low, pivotIndex - 1);
        quick_sort(arr, pivotIndex + 1, high);
    }
}

int main() {
    int numbers[] = {64, 34, 25, 12, 22, 11, 90};
    int n = sizeof(numbers) / sizeof(numbers[0]);
    quick_sort(numbers, 0, n - 1);
    printf("Sorted array: ");
    for (int i = 0; i < n; i++) {
        printf("%d ", numbers[i]);
    }
    return 0;
}`,
        cpp: `
#include <iostream>
using namespace std;

int partition(int arr[], int low, int high) {
    int pivot = arr[high];
    int i = low - 1;
    
    for (int j = low; j < high; j++) {
        if (arr[j] < pivot) {
            i++;
            swap(arr[i], arr[j]);
        }
    }
    swap(arr[i + 1], arr[high]);
    return i + 1;
}

void quickSort(int arr[], int low, int high) {
    if (low < high) {
        int pivotIndex = partition(arr, low, high);
        quickSort(arr, low, pivotIndex - 1);
        quickSort(arr, pivotIndex + 1, high);
    }
}

int main() {
    int numbers[] = {64, 34, 25, 12, 22, 11, 90};
    int n = sizeof(numbers) / sizeof(numbers[0]);
    quickSort(numbers, 0, n - 1);
    cout << "Sorted array: ";
    for (int i = 0; i < n; i++) {
        cout << numbers[i] << " ";
    }
    return 0;
}`
      },
      'heap-sort': {
        javascript: `
function heapSort(arr) {
  const n = arr.length;
  
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(arr, n, i);
  }
  
  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    heapify(arr, i, 0);
  }
  
  return arr;
}

function heapify(arr, n, i) {
  let largest = i;
  const left = 2 * i + 1;
  const right = 2 * i + 2;
  
  if (left < n && arr[left] > arr[largest]) {
    largest = left;
  }
  
  if (right < n && arr[right] > arr[largest]) {
    largest = right;
  }
  
  if (largest !== i) {
    [arr[i], arr[largest]] = [arr[largest], arr[i]];
    heapify(arr, n, largest);
  }
}

const numbers = [64, 34, 25, 12, 22, 11, 90];
heapSort(numbers);
console.log("Sorted array:", numbers);`,
        python: `# Heap Sort in Python
def heap_sort(arr):
    n = len(arr)
    
    # Build max heap
    for i in range(n
        heapify(arr, n, i)
    
    # Extract elements from heap
    for i in range(n - 1, 0, -1):
        arr[0], arr[i] = arr[i], arr[0]
        heapify(arr, i, 0)
    
    return arr

def heapify(arr, n, i):
    largest = i
    left = 2 * i + 1
    right = 2 * i + 2
    
    if left < n and arr[left] > arr[largest]:
        largest = left
    
    if right < n and arr[right] > arr[largest]:
        largest = right
    
    if largest != i:
        arr[i], arr[largest] = arr[largest], arr[i]
        heapify(arr, n, largest)

# Usage
numbers = [64, 34, 25, 12, 22, 11, 90]
heap_sort(numbers)
print("Sorted array:", numbers)`,
        java: `
import java.util.Arrays;

public class HeapSort {
    public static void heapSort(int[] arr) {
        int n = arr.length;
        
        for (int i = n / 2 - 1; i >= 0; i--) {
            heapify(arr, n, i);
        }
        
        for (int i = n - 1; i > 0; i--) {
            int temp = arr[0];
            arr[0] = arr[i];
            arr[i] = temp;
            heapify(arr, i, 0);
        }
    }
    
    private static void heapify(int[] arr, int n, int i) {
        int largest = i;
        int left = 2 * i + 1;
        int right = 2 * i + 2;
        
        if (left < n && arr[left] > arr[largest]) {
            largest = left;
        }
        
        if (right < n && arr[right] > arr[largest]) {
            largest = right;
        }
        
        if (largest != i) {
            int temp = arr[i];
            arr[i] = arr[largest];
            arr[largest] = temp;
            heapify(arr, n, largest);
        }
    }
    
    public static void main(String[] args) {
        int[] numbers = {64, 34, 25, 12, 22, 11, 90};
        heapSort(numbers);
        System.out.println("Sorted array: " + Arrays.toString(numbers));
    }
}`,
        c: `
#include <stdio.h>

void heapify(int arr[], int n, int i) {
    int largest = i;
    int left = 2 * i + 1;
    int right = 2 * i + 2;
    
    if (left < n && arr[left] > arr[largest]) {
        largest = left;
    }
    
    if (right < n && arr[right] > arr[largest]) {
        largest = right;
    }
    
    if (largest != i) {
        int temp = arr[i];
        arr[i] = arr[largest];
        arr[largest] = temp;
        heapify(arr, n, largest);
    }
}

void heap_sort(int arr[], int n) {

    for (int i = n / 2 - 1; i >= 0; i--) {
        heapify(arr, n, i);
    }
    
    for (int i = n - 1; i > 0; i--) {
        int temp = arr[0];
        arr[0] = arr[i];
        arr[i] = temp;
        heapify(arr, i, 0);
    }
}

int main() {
    int numbers[] = {64, 34, 25, 12, 22, 11, 90};
    int n = sizeof(numbers) / sizeof(numbers[0]);
    heap_sort(numbers, n);
    printf("Sorted array: ");
    for (int i = 0; i < n; i++) {
        printf("%d ", numbers[i]);
    }
    return 0;
}`,
        cpp: `
#include <iostream>
using namespace std;

void heapify(int arr[], int n, int i) {
    int largest = i;
    int left = 2 * i + 1;
    int right = 2 * i + 2;
    
    if (left < n && arr[left] > arr[largest]) {
        largest = left;
    }
    
    if (right < n && arr[right] > arr[largest]) {
        largest = right;
    }
    
    if (largest != i) {
        swap(arr[i], arr[largest]);
        heapify(arr, n, largest);
    }
}

void heapSort(int arr[], int n) {

    for (int i = n / 2 - 1; i >= 0; i--) {
        heapify(arr, n, i);
    }
    
    for (int i = n - 1; i > 0; i--) {
        swap(arr[0], arr[i]);
        heapify(arr, i, 0);
    }
}

int main() {
    int numbers[] = {64, 34, 25, 12, 22, 11, 90};
    int n = sizeof(numbers) / sizeof(numbers[0]);
    heapSort(numbers, n);
    cout << "Sorted array: ";
    for (int i = 0; i < n; i++) {
        cout << numbers[i] << " ";
    }
    return 0;
}`
      },
      'counting-sort': {
        javascript: `
function countingSort(arr) {
  const max = Math.max(...arr);
  const count = Array(max + 1).fill(0);
  const output = Array(arr.length).fill(0);
  
  for (let i = 0; i < arr.length; i++) {
    count[arr[i]]++;
  }
  
  for (let i = 1; i <= max; i++) {
    count[i] += count[i - 1];
  }
  
  for (let i = arr.length - 1; i >= 0; i--) {
    output[count[arr[i]] - 1] = arr[i];
    count[arr[i]]--;
  }
  
  return output;
}

const numbers = [4, 2, 2, 8, 3, 3, 1];
const sorted = countingSort(numbers);
console.log("Sorted array:", sorted);`,
        python: `# Counting Sort in Python
def counting_sort(arr):
    max_val = max(arr)
    count = [0] * (max_val + 1)
    output = [0] * len(arr)
    
    # Count occurrences
    for num in arr:
        count[num] += 1
    
    # Build cumulative count
    for i in range(1, max_val + 1):
        count[i] += count[i - 1]
    
    # Place elements in sorted order
    for i in range(len(arr) - 1, -1, -1):
        output[count[arr[i]] - 1] = arr[i]
        count[arr[i]] -= 1
    
    return output

# Usage
numbers = [4, 2, 2, 8, 3, 3, 1]
sorted_arr = counting_sort(numbers)
print("Sorted array:", sorted_arr)`,
        java: `
import java.util.Arrays;

public class CountingSort {
    public static int[] countingSort(int[] arr) {
        int max = Arrays.stream(arr).max().orElse(0);
        int[] count = new int[max + 1];
        int[] output = new int[arr.length];
        
        for (int num : arr) {
            count[num]++;
        }
        
        for (int i = 1; i <= max; i++) {
            count[i] += count[i - 1];
        }
        
        for (int i = arr.length - 1; i >= 0; i--) {
            output[count[arr[i]] - 1] = arr[i];
            count[arr[i]]--;
        }
        
        return output;
    }
    
    public static void main(String[] args) {
        int[] numbers = {4, 2, 2, 8, 3, 3, 1};
        int[] sorted = countingSort(numbers);
        System.out.println("Sorted array: " + Arrays.toString(sorted));
    }
}`,
        c: `
#include <stdio.h>
#include <stdlib.h>

int* counting_sort(int arr[], int n) {
    int max = arr[0];
    for (int i = 1; i < n; i++) {
        if (arr[i] > max) max = arr[i];
    }
    
    int* count = (int*)calloc(max + 1, sizeof(int));
    int* output = (int*)malloc(n * sizeof(int));
    
    for (int i = 0; i < n; i++) {
        count[arr[i]]++;
    }
    
    for (int i = 1; i <= max; i++) {
        count[i] += count[i - 1];
    }
    
    for (int i = n - 1; i >= 0; i--) {
        output[count[arr[i]] - 1] = arr[i];
        count[arr[i]]--;
    }
    
    free(count);
    return output;
}

int main() {
    int numbers[] = {4, 2, 2, 8, 3, 3, 1};
    int n = sizeof(numbers) / sizeof(numbers[0]);
    int* sorted = counting_sort(numbers, n);
    printf("Sorted array: ");
    for (int i = 0; i < n; i++) {
        printf("%d ", sorted[i]);
    }
    free(sorted);
    return 0;
}`,
        cpp: `
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

vector<int> countingSort(vector<int>& arr) {
    int max = *max_element(arr.begin(), arr.end());
    vector<int> count(max + 1, 0);
    vector<int> output(arr.size());
    
    for (int num : arr) {
        count[num]++;
    }
    
    for (int i = 1; i <= max; i++) {
        count[i] += count[i - 1];
    }
    
    for (int i = arr.size() - 1; i >= 0; i--) {
        output[count[arr[i]] - 1] = arr[i];
        count[arr[i]]--;
    }
    
    return output;
}

int main() {
    vector<int> numbers = {4, 2, 2, 8, 3, 3, 1};
    vector<int> sorted = countingSort(numbers);
    cout << "Sorted array: ";
    for (int num : sorted) {
        cout << num << " ";
    }
    return 0;
}`
      },
      'radix-sort': {
        javascript: `
function radixSort(arr) {
  const max = Math.max(...arr);
  
  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
    countingSortByDigit(arr, exp);
  }
  
  return arr;
}

function countingSortByDigit(arr, exp) {
  const n = arr.length;
  const output = Array(n).fill(0);
  const count = Array(10).fill(0);
  
  for (let i = 0; i < n; i++) {
    count[Math.floor(arr[i] / exp) % 10]++;
  }
  
  for (let i = 1; i < 10; i++) {
    count[i] += count[i - 1];
  }
  
  for (let i = n - 1; i >= 0; i--) {
    const digit = Math.floor(arr[i] / exp) % 10;
    output[count[digit] - 1] = arr[i];
    count[digit]--;
  }
  
  for (let i = 0; i < n; i++) {
    arr[i] = output[i];
  }
}

const numbers = [170, 45, 75, 90, 802, 24, 2, 66];
radixSort(numbers);
console.log("Sorted array:", numbers);`,
        python: `# Radix Sort in Python
def radix_sort(arr):
    max_val = max(arr)
    
    exp = 1
    while max_val
        counting_sort_by_digit(arr, exp)
        exp *= 10
    
    return arr

def counting_sort_by_digit(arr, exp):
    n = len(arr)
    output = [0] * n
    count = [0] * 10
    
    # Count occurrences of each digit
    for num in arr:
        count[(num
    
    # Build cumulative count
    for i in range(1, 10):
        count[i] += count[i - 1]
    
    # Place elements in sorted order
    for i in range(n - 1, -1, -1):
        digit = (arr[i]
        output[count[digit] - 1] = arr[i]
        count[digit] -= 1
    
    # Copy output back to arr
    for i in range(n):
        arr[i] = output[i]

# Usage
numbers = [170, 45, 75, 90, 802, 24, 2, 66]
radix_sort(numbers)
print("Sorted array:", numbers)`,
        java: `
import java.util.Arrays;

public class RadixSort {
    public static void radixSort(int[] arr) {
        int max = Arrays.stream(arr).max().orElse(0);
        
        for (int exp = 1; max / exp > 0; exp *= 10) {
            countingSortByDigit(arr, exp);
        }
    }
    
    private static void countingSortByDigit(int[] arr, int exp) {
        int n = arr.length;
        int[] output = new int[n];
        int[] count = new int[10];
        
        for (int num : arr) {
            count[(num / exp) % 10]++;
        }
        
        for (int i = 1; i < 10; i++) {
            count[i] += count[i - 1];
        }
        
        for (int i = n - 1; i >= 0; i--) {
            int digit = (arr[i] / exp) % 10;
            output[count[digit] - 1] = arr[i];
            count[digit]--;
        }
        
        System.arraycopy(output, 0, arr, 0, n);
    }
    
    public static void main(String[] args) {
        int[] numbers = {170, 45, 75, 90, 802, 24, 2, 66};
        radixSort(numbers);
        System.out.println("Sorted array: " + Arrays.toString(numbers));
    }
}`,
        c: `
#include <stdio.h>

void countingSortByDigit(int arr[], int n, int exp) {
    int output[n];
    int count[10] = {0};
    
    for (int i = 0; i < n; i++) {
        count[(arr[i] / exp) % 10]++;
    }
    
    for (int i = 1; i < 10; i++) {
        count[i] += count[i - 1];
    }
    
    for (int i = n - 1; i >= 0; i--) {
        int digit = (arr[i] / exp) % 10;
        output[count[digit] - 1] = arr[i];
        count[digit]--;
    }
    
    for (int i = 0; i < n; i++) {
        arr[i] = output[i];
    }
}

void radix_sort(int arr[], int n) {
    int max = arr[0];
    for (int i = 1; i < n; i++) {
        if (arr[i] > max) max = arr[i];
    }
    
    for (int exp = 1; max / exp > 0; exp *= 10) {
        countingSortByDigit(arr, n, exp);
    }
}

int main() {
    int numbers[] = {170, 45, 75, 90, 802, 24, 2, 66};
    int n = sizeof(numbers) / sizeof(numbers[0]);
    radix_sort(numbers, n);
    printf("Sorted array: ");
    for (int i = 0; i < n; i++) {
        printf("%d ", numbers[i]);
    }
    return 0;
}`,
        cpp: `
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

void countingSortByDigit(vector<int>& arr, int exp) {
    int n = arr.size();
    vector<int> output(n);
    vector<int> count(10, 0);
    
    for (int num : arr) {
        count[(num / exp) % 10]++;
    }
    
    for (int i = 1; i < 10; i++) {
        count[i] += count[i - 1];
    }
    
    for (int i = n - 1; i >= 0; i--) {
        int digit = (arr[i] / exp) % 10;
        output[count[digit] - 1] = arr[i];
        count[digit]--;
    }
    
    arr = output;
}

void radixSort(vector<int>& arr) {
    int max = *max_element(arr.begin(), arr.end());
    
    for (int exp = 1; max / exp > 0; exp *= 10) {
        countingSortByDigit(arr, exp);
    }
}

int main() {
    vector<int> numbers = {170, 45, 75, 90, 802, 24, 2, 66};
    radixSort(numbers);
    cout << "Sorted array: ";
    for (int num : numbers) {
        cout << num << " ";
    }
    return 0;
}`
      }
    }
    
    return codes[algorithmId] || codes['bubble-sort']
  }

  const codeExamples = getCodeExamples()

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.bg, color: COLORS.text }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {}
        <button
          onClick={() => navigate('/algo-visualization/array/sorting')}
          className="flex items-center gap-2 mb-6 text-white/80 hover:text-white transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Sorting</span>
        </button>

        {}
        <div className="flex items-center gap-4 mb-6">
          <span className="text-5xl">{algorithm.icon}</span>
          <div>
            <h1 className="text-4xl font-bold mb-2">{algorithm.title}</h1>
            <span
              className="px-3 py-1 rounded-full text-sm font-semibold"
              style={{
                backgroundColor: getDifficultyColor(algorithm.difficulty) + '20',
                color: getDifficultyColor(algorithm.difficulty),
              }}
            >
              {algorithm.difficulty}
            </span>
          </div>
        </div>

        {}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {}
          <div className="rounded-2xl border-2 p-6 relative overflow-hidden" style={{ backgroundColor: COLORS.card, borderColor: COLORS.border }}>
            {}
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10" style={{ background: `radial-gradient(circle, ${COLORS.accent} 0%, transparent 70%)` }}></div>
            
            <div className="relative z-10">
              <h3 className="text-base font-bold mb-5 flex items-center gap-2" style={{ color: COLORS.text }}>
                <span className="text-xl">⏱️</span>
                Time Complexity
              </h3>
              <div className="space-y-4">
                <div className="p-3 rounded-lg" style={{ backgroundColor: COLORS.success + '15', border: `1px solid ${COLORS.success}30` }}>
                  <div className="text-xs mb-1.5 font-medium uppercase tracking-wide" style={{ color: COLORS.textSecondary }}>Best Case</div>
                  <p className="text-2xl font-bold" style={{ color: COLORS.success }}>
                    {algorithmId === 'bubble-sort' || algorithmId === 'insertion-sort' ? 'O(n)' : 
                     algorithmId === 'selection-sort' ? 'O(n²)' :
                     algorithmId === 'merge-sort' || algorithmId === 'quick-sort' || algorithmId === 'heap-sort' ? 'O(n log n)' : 
                     algorithmId === 'counting-sort' ? 'O(n + k)' : 'O(nk)'}
                  </p>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: COLORS.accent + '15', border: `1px solid ${COLORS.accent}30` }}>
                  <div className="text-xs mb-1.5 font-medium uppercase tracking-wide" style={{ color: COLORS.textSecondary }}>Average Case</div>
                  <p className="text-2xl font-bold" style={{ color: COLORS.accent }}>
                    {algorithm.timeComplexity.includes('avg') ? 'O(n log n)' : algorithm.timeComplexity}
                  </p>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: COLORS.error + '15', border: `1px solid ${COLORS.error}30` }}>
                  <div className="text-xs mb-1.5 font-medium uppercase tracking-wide" style={{ color: COLORS.textSecondary }}>Worst Case</div>
                  <p className="text-2xl font-bold" style={{ color: COLORS.error }}>
                    {algorithm.timeComplexity.includes('avg') ? 'O(n²)' : 
                     algorithmId === 'bubble-sort' || algorithmId === 'selection-sort' || algorithmId === 'insertion-sort' ? 'O(n²)' :
                     algorithmId === 'merge-sort' || algorithmId === 'heap-sort' ? 'O(n log n)' :
                     algorithmId === 'quick-sort' ? 'O(n²)' :
                     algorithmId === 'counting-sort' ? 'O(n + k)' : 'O(nk)'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {}
          <div className="rounded-2xl border-2 p-6 relative overflow-hidden" style={{ backgroundColor: COLORS.card, borderColor: COLORS.border }}>
            {}
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10" style={{ background: `radial-gradient(circle, ${COLORS.primary} 0%, transparent 70%)` }}></div>
            
            <div className="relative z-10">
              <h3 className="text-base font-bold mb-5 flex items-center gap-2" style={{ color: COLORS.text }}>
                <span className="text-xl">💾</span>
                Space Complexity
              </h3>
              <div className="space-y-4">
                <div className="p-3 rounded-lg" style={{ backgroundColor: COLORS.accent + '15', border: `1px solid ${COLORS.accent}30` }}>
                  <div className="text-xs mb-1.5 font-medium uppercase tracking-wide" style={{ color: COLORS.textSecondary }}>Auxiliary Space</div>
                  <p className="text-2xl font-bold" style={{ color: COLORS.accent }}>{algorithm.spaceComplexity}</p>
                </div>
                <div className="p-3 rounded-lg flex items-center justify-between" style={{ backgroundColor: COLORS.cardHover, border: `1px solid ${COLORS.border}` }}>
                  <div>
                    <div className="text-xs mb-1 font-medium uppercase tracking-wide" style={{ color: COLORS.textSecondary }}>In-Place</div>
                    <p className="text-sm font-semibold" style={{ color: algorithm.spaceComplexity === 'O(1)' || algorithmId === 'quick-sort' ? COLORS.success : COLORS.error }}>
                      {algorithm.spaceComplexity === 'O(1)' ? 'Yes' : algorithmId === 'quick-sort' ? 'Yes (O(log n) stack)' : 'No'}
                    </p>
                  </div>
                  <div className="text-2xl">
                    {algorithm.spaceComplexity === 'O(1)' || algorithmId === 'quick-sort' ? '✅' : '❌'}
                  </div>
                </div>
                <div className="p-3 rounded-lg flex items-center justify-between" style={{ backgroundColor: COLORS.cardHover, border: `1px solid ${COLORS.border}` }}>
                  <div>
                    <div className="text-xs mb-1 font-medium uppercase tracking-wide" style={{ color: COLORS.textSecondary }}>Stable</div>
                    <p className="text-sm font-semibold" style={{ color: (algorithmId === 'bubble-sort' || algorithmId === 'insertion-sort' || algorithmId === 'merge-sort' || algorithmId === 'counting-sort' || algorithmId === 'radix-sort') ? COLORS.success : COLORS.error }}>
                      {algorithmId === 'bubble-sort' || algorithmId === 'insertion-sort' || algorithmId === 'merge-sort' || algorithmId === 'counting-sort' || algorithmId === 'radix-sort' ? 'Yes' : 'No'}
                    </p>
                  </div>
                  <div className="text-2xl">
                    {(algorithmId === 'bubble-sort' || algorithmId === 'insertion-sort' || algorithmId === 'merge-sort' || algorithmId === 'counting-sort' || algorithmId === 'radix-sort') ? '✅' : '❌'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {}
          <div className="rounded-2xl border-2 p-6 relative overflow-hidden" style={{ backgroundColor: COLORS.card, borderColor: COLORS.border }}>
            {}
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10" style={{ background: `radial-gradient(circle, ${COLORS.primary} 0%, transparent 70%)` }}></div>
            
            <div className="relative z-10">
              <h3 className="text-base font-bold mb-5 flex items-center gap-2" style={{ color: COLORS.text }}>
                <span className="text-xl">🎯</span>
                Best Use Case
              </h3>
              <div className="p-4 rounded-lg" style={{ backgroundColor: COLORS.primary + '15', border: `1px solid ${COLORS.primary}30` }}>
                <p className="text-base font-semibold leading-relaxed" style={{ color: COLORS.primary }}>{algorithm.bestUseCase}</p>
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="rounded-2xl border p-6 mb-8" style={{ backgroundColor: COLORS.card, borderColor: COLORS.border }}>
          <h2 className="text-2xl font-bold mb-4">What is {algorithm.title}?</h2>
          <p className="text-lg leading-relaxed" style={{ color: COLORS.textSecondary }}>
            {algorithm.description}
          </p>
        </div>

        {}
        <section className="mb-8">
          <div className="rounded-2xl border p-6" style={{ backgroundColor: COLORS.card, borderColor: COLORS.border }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Visualize how {algorithm.title} works</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setViewMode('iterative')
                    resetSorting()
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
                    resetSorting()
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
              {}
              <div>
                <label className="block mb-4 font-semibold">Array Visualization (Bar Chart)</label>

                {}
                <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: COLORS.cardHover, border: `1px solid ${COLORS.border}` }}>
                  <label className="block mb-2 text-sm font-semibold">Array Size</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="5"
                      max="15"
                      value={arraySize}
                      onChange={(e) => updateArraySize(Number(e.target.value))}
                      className="flex-1"
                      disabled={isSorting}
                    />
                    <input
                      type="number"
                      min="5"
                      max="15"
                      value={arraySize}
                      onChange={(e) => updateArraySize(Number(e.target.value))}
                      className="w-20 px-2 py-1 rounded text-center text-white"
                      style={{ backgroundColor: COLORS.bg, border: `1px solid ${COLORS.border}` }}
                      disabled={isSorting}
                    />
                  </div>
                </div>

                {}
                <div className="mb-4 p-4 rounded-lg overflow-x-auto" style={{ backgroundColor: COLORS.bg, minHeight: '300px' }}>
                  <div className="flex items-end justify-center gap-2 min-w-max">
                    {arrayElements.map((element, index) => {
                      const maxValue = Math.max(...arrayElements, 1)
                      const height = (element / maxValue) * 220
                      const isHighlighted = highlightedIndices.includes(index)
                      const isSorted = sortedIndices.includes(index)
                      const barWidth = arraySize <= 10 ? 50 : 40

                      return (
                        <div key={index} className="flex flex-col items-center gap-1">
                          <div
                            className="rounded-t-lg transition-all duration-300 relative"
                            style={{
                              width: `${barWidth}px`,
                              height: `${height}px`,
                              backgroundColor: isSorted
                                ? COLORS.success
                                : isHighlighted
                                ? COLORS.primary
                                : COLORS.cardHover,
                              border: `2px solid ${
                                isSorted
                                  ? COLORS.success
                                  : isHighlighted
                                  ? COLORS.primary
                                  : COLORS.border
                              }`,
                              boxShadow: isHighlighted || isSorted ? `0 0 15px ${isSorted ? COLORS.success : COLORS.primary}` : 'none',
                              transform: isHighlighted ? 'scale(1.1)' : 'scale(1)',
                            }}
                          >
                            {isHighlighted && (
                              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold whitespace-nowrap" style={{ color: COLORS.primary }}>
                                Comparing
                              </div>
                            )}
                          </div>
                          <div className="text-center">
                            <div className={`font-bold text-sm ${isSorted ? 'text-green-400' : ''}`}>{element}</div>
                            <div className="text-xs" style={{ color: COLORS.textSecondary }}>Idx {index}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {}
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
                        disabled={isSorting}
                      />
                    ))}
                  </div>
                  <button
                    onClick={generateRandomArray}
                    disabled={isSorting}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
                    style={{ backgroundColor: COLORS.cardHover, border: `1px solid ${COLORS.border}` }}
                  >
                    Random Array
                  </button>
                </div>

                {}
                <div className="flex gap-3 mb-4">
                  <button
                    onClick={startSorting}
                    disabled={isSorting}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50 flex-1"
                    style={{ backgroundColor: COLORS.primary, color: 'white' }}
                  >
                    <Play className="w-5 h-5" />
                    {isSorting ? 'Sorting...' : 'Start Sort'}
                  </button>
                  <button
                    onClick={resetSorting}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition"
                    style={{ backgroundColor: COLORS.cardHover, border: `1px solid ${COLORS.border}` }}
                  >
                    <RotateCcw className="w-5 h-5" />
                    Reset
                  </button>
                </div>

                {}
                {currentStep && (
                  <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: COLORS.primary + '20', border: `1px solid ${COLORS.primary}` }}>
                    <p className="font-semibold text-sm" style={{ color: COLORS.primary }}>
                      {currentStep}
                    </p>
                    <div className="flex gap-4 mt-2 text-xs" style={{ color: COLORS.textSecondary }}>
                      <span>Comparisons: {comparisons}</span>
                      <span>Swaps: {swaps}</span>
                    </div>
                  </div>
                )}

                {sortedIndices.length === arrayElements.length && (
                  <div className="p-4 rounded-lg" style={{ backgroundColor: COLORS.success + '20', border: `1px solid ${COLORS.success}` }}>
                    <p className="font-semibold" style={{ color: COLORS.success }}>
                      ✓ Array is sorted!
                    </p>
                  </div>
                )}

                {}
                {(algorithmId === 'bubble-sort' || algorithmId === 'merge-sort' || algorithmId === 'quick-sort' || algorithmId === 'heap-sort') && recursionStack.length > 0 && (
                  <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: COLORS.bg, border: `1px solid ${COLORS.border}` }}>
                    <label className="block mb-3 font-semibold text-sm">
                      {algorithmId === 'quick-sort' ? 'Divide & Conquer Recursion Stack' : 
                       algorithmId === 'heap-sort' ? 'Heapify Recursion Stack' : 
                       algorithmId === 'merge-sort' ? 'Merge Sort Recursion Stack' :
                       'Recursion Stack'}
                    </label>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {recursionStack.map((frame, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg transition-all ${
                            idx === currentRecursionIndex ? 'scale-105' : ''
                          }`}
                          style={{
                            backgroundColor: frame.completed
                              ? COLORS.success + '30'
                              : frame.checking
                              ? COLORS.primary + '30'
                              : COLORS.cardHover,
                            border: `2px solid ${
                              frame.completed
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
                                Level {frame.stackDepth + 1}:
                              </span>
                              <span className="ml-2 font-semibold text-xs">
                                {algorithmId === 'quick-sort' 
                                  ? `quickSort(arr, low=${frame.low}, high=${frame.high})`
                                  : algorithmId === 'heap-sort'
                                  ? `heapify(arr, size=${frame.heapSize}, i=${frame.nodeIndex})`
                                  : algorithmId === 'merge-sort'
                                  ? `mergeSort(arr, left=${frame.left}, right=${frame.right})`
                                  : `${algorithmId.replace('-', '')}(arr, n=${frame.n})`}
                              </span>
                            </div>
                            {frame.checking && (
                              <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: COLORS.primary, color: 'white' }}>
                                Active
                              </span>
                            )}
                            {frame.completed && (
                              <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: COLORS.success, color: 'white' }}>
                                Completed
                              </span>
                            )}
                          </div>
                          <div className="mt-1 text-xs space-y-1" style={{ color: COLORS.textSecondary }}>
                            {algorithmId === 'quick-sort' && (
                              <>
                                <div>Processing subarray: indices {frame.low} to {frame.high}</div>
                                {frame.pivotIndex >= 0 && (
                                  <div className="text-xs" style={{ color: COLORS.accent }}>
                                    ✓ Pivot at index {frame.pivotIndex} (value: {arrayElements[frame.pivotIndex]})
                                  </div>
                                )}
                                {frame.low < frame.high && !frame.completed && frame.pivotIndex >= 0 && (
                                  <div className="text-xs" style={{ color: COLORS.primary }}>
                                    → Will divide into: [{frame.low} to {frame.pivotIndex - 1}] and [{frame.pivotIndex + 1} to {frame.high}]
                                  </div>
                                )}
                              </>
                            )}
                            {algorithmId === 'heap-sort' && (
                              <>
                                <div>Heapifying node at index {frame.nodeIndex}</div>
                                <div>Heap size: {frame.heapSize}</div>
                                {frame.completed && (
                                  <div className="text-xs" style={{ color: COLORS.success }}>
                                    ✓ Max heap property maintained
                                  </div>
                                )}
                              </>
                            )}
                            {algorithmId === 'merge-sort' && (
                              <>
                                <div>Processing subarray: indices {frame.left} to {frame.right}</div>
                                {frame.mid !== undefined && (
                                  <div>Mid point: {frame.mid}</div>
                                )}
                                {frame.completed && (
                                  <div className="text-xs" style={{ color: COLORS.success }}>
                                    ✓ Merged and sorted
                                  </div>
                                )}
                              </>
                            )}
                            {(algorithmId === 'bubble-sort') && frame.n !== undefined && (
                              <div>Processing pass for n = {frame.n}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {}
              <div>
                <label className="block mb-4 font-semibold">Code Execution</label>
                <div className="p-4 rounded-lg" style={{ backgroundColor: '#0D1117', border: `1px solid ${COLORS.border}` }}>
                  <pre className="text-sm">
                    <code>
                      {viewMode === 'iterative' ? (
                        <>
                          <div className={highlightedLine === 1 ? 'bg-blue-500/30 px-2 py-1 rounded' : ''}>
                            <span style={{ color: '#79C0FF' }}>function</span>{' '}
                            <span style={{ color: '#D2A8FF' }}>bubbleSort</span>
                            <span style={{ color: '#C9D1D9' }}>(arr)</span> {'{'}
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
                          </div>
                          <div className={highlightedLine === 3 ? 'bg-blue-500/30 px-2 py-1 rounded' : ''}>
                            {'    '}
                            <span style={{ color: '#79C0FF' }}>for</span>
                            <span style={{ color: '#C9D1D9' }}> (</span>
                            <span style={{ color: '#79C0FF' }}>let</span>{' '}
                            <span style={{ color: '#FF7B72' }}>j</span>
                            <span style={{ color: '#C9D1D9' }}> = </span>
                            <span style={{ color: '#A5D6FF' }}>0</span>
                            <span style={{ color: '#C9D1D9' }}>; </span>
                            <span style={{ color: '#FF7B72' }}>j</span>
                            <span style={{ color: '#C9D1D9' }}> {'<'} arr.length - </span>
                            <span style={{ color: '#FF7B72' }}>i</span>
                            <span style={{ color: '#C9D1D9' }}> - </span>
                            <span style={{ color: '#A5D6FF' }}>1</span>
                            <span style={{ color: '#C9D1D9' }}>; </span>
                            <span style={{ color: '#FF7B72' }}>j</span>
                            <span style={{ color: '#C9D1D9' }}>++)</span> {'{'}
                          </div>
                          <div className={highlightedLine === 3 ? 'bg-blue-500/30 px-2 py-1 rounded' : ''}>
                            {'      '}
                            <span style={{ color: '#79C0FF' }}>if</span>
                            <span style={{ color: '#C9D1D9' }}> (arr[</span>
                            <span style={{ color: '#FF7B72' }}>j</span>
                            <span style={{ color: '#C9D1D9' }}>] {'>'} arr[</span>
                            <span style={{ color: '#FF7B72' }}>j</span>
                            <span style={{ color: '#C9D1D9' }}> + </span>
                            <span style={{ color: '#A5D6FF' }}>1</span>
                            <span style={{ color: '#C9D1D9' }}>])</span> {'{'}
                          </div>
                          <div className={highlightedLine === 4 ? 'bg-green-500/30 px-2 py-1 rounded' : ''}>
                            {'        '}
                            <span style={{ color: '#79C0FF' }}>let</span>{' '}
                            <span style={{ color: '#FF7B72' }}>temp</span>
                            <span style={{ color: '#C9D1D9' }}> = arr[</span>
                            <span style={{ color: '#FF7B72' }}>j</span>
                            <span style={{ color: '#C9D1D9' }}>];</span>
                          </div>
                          <div>
                            {'        '}
                            <span style={{ color: '#FF7B72' }}>arr</span>
                            <span style={{ color: '#C9D1D9' }}>[</span>
                            <span style={{ color: '#FF7B72' }}>j</span>
                            <span style={{ color: '#C9D1D9' }}>] = arr[</span>
                            <span style={{ color: '#FF7B72' }}>j</span>
                            <span style={{ color: '#C9D1D9' }}> + </span>
                            <span style={{ color: '#A5D6FF' }}>1</span>
                            <span style={{ color: '#C9D1D9' }}>];</span>
                          </div>
                          <div>
                            {'        '}
                            <span style={{ color: '#FF7B72' }}>arr</span>
                            <span style={{ color: '#C9D1D9' }}>[</span>
                            <span style={{ color: '#FF7B72' }}>j</span>
                            <span style={{ color: '#C9D1D9' }}> + </span>
                            <span style={{ color: '#A5D6FF' }}>1</span>
                            <span style={{ color: '#C9D1D9' }}>] = </span>
                            <span style={{ color: '#FF7B72' }}>temp</span>
                            <span style={{ color: '#C9D1D9' }}>;</span>
                          </div>
                          <div>
                            {'      '}
                            <span style={{ color: '#C9D1D9' }}>{'}'}</span>
                          </div>
                          <div>
                            {'    '}
                            <span style={{ color: '#C9D1D9' }}>{'}'}</span>
                          </div>
                          <div>
                            {'  '}
                            <span style={{ color: '#C9D1D9' }}>{'}'}</span>
                          </div>
                          <div>
                            {'  '}
                            <span style={{ color: '#79C0FF' }}>return</span>{' '}
                            <span style={{ color: '#FF7B72' }}>arr</span>
                            <span style={{ color: '#C9D1D9' }}>;</span>
                          </div>
                          <div>
                            <span style={{ color: '#C9D1D9' }}>{'}'}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className={highlightedLine === 1 ? 'bg-blue-500/30 px-2 py-1 rounded' : ''}>
                            <span style={{ color: '#79C0FF' }}>function</span>{' '}
                            <span style={{ color: '#D2A8FF' }}>bubbleSort</span>
                            <span style={{ color: '#C9D1D9' }}>(arr, n = arr.length)</span> {'{'}
                          </div>
                          <div className={highlightedLine === 2 ? 'bg-blue-500/30 px-2 py-1 rounded' : ''}>
                            {'  '}
                            <span style={{ color: '#79C0FF' }}>if</span>
                            <span style={{ color: '#C9D1D9' }}> (n {'<='} </span>
                            <span style={{ color: '#A5D6FF' }}>1</span>
                            <span style={{ color: '#C9D1D9' }}>)</span> {'{'}
                            <span className="ml-2 text-xs" style={{ color: '#FF7B72' }}>
                          </div>
                          <div>
                            {'    '}
                            <span style={{ color: '#79C0FF' }}>return</span>
                            <span style={{ color: '#C9D1D9' }}>;</span>
                          </div>
                          <div>
                            {'  '}
                            <span style={{ color: '#C9D1D9' }}>{'}'}</span>
                          </div>
                          <div className={highlightedLine === 3 ? 'bg-purple-500/30 px-2 py-1 rounded' : ''}>
                            {'  '}
                            <span style={{ color: '#79C0FF' }}>for</span>
                            <span style={{ color: '#C9D1D9' }}> (</span>
                            <span style={{ color: '#79C0FF' }}>let</span>{' '}
                            <span style={{ color: '#FF7B72' }}>i</span>
                            <span style={{ color: '#C9D1D9' }}> = </span>
                            <span style={{ color: '#A5D6FF' }}>0</span>
                            <span style={{ color: '#C9D1D9' }}>; </span>
                            <span style={{ color: '#FF7B72' }}>i</span>
                            <span style={{ color: '#C9D1D9' }}> {'<'} n - </span>
                            <span style={{ color: '#A5D6FF' }}>1</span>
                            <span style={{ color: '#C9D1D9' }}>; </span>
                            <span style={{ color: '#FF7B72' }}>i</span>
                            <span style={{ color: '#C9D1D9' }}>++)</span> {'{'}
                          </div>
                          <div>
                            {'    '}
                            <span style={{ color: '#79C0FF' }}>if</span>
                            <span style={{ color: '#C9D1D9' }}> (arr[i] {'>'} arr[i + 1])</span> {'{'}
                          </div>
                          <div>
                            {'      '}
                            <span style={{ color: '#79C0FF' }}>let</span>{' '}
                            <span style={{ color: '#FF7B72' }}>temp</span>
                            <span style={{ color: '#C9D1D9' }}> = arr[i];</span>
                          </div>
                          <div>
                            {'      '}
                            <span style={{ color: '#FF7B72' }}>arr</span>
                            <span style={{ color: '#C9D1D9' }}>[i] = arr[i + </span>
                            <span style={{ color: '#A5D6FF' }}>1</span>
                            <span style={{ color: '#C9D1D9' }}>];</span>
                          </div>
                          <div>
                            {'      '}
                            <span style={{ color: '#FF7B72' }}>arr</span>
                            <span style={{ color: '#C9D1D9' }}>[i + </span>
                            <span style={{ color: '#A5D6FF' }}>1</span>
                            <span style={{ color: '#C9D1D9' }}>] = </span>
                            <span style={{ color: '#FF7B72' }}>temp</span>
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
                          <div className={highlightedLine === 4 ? 'bg-purple-500/30 px-2 py-1 rounded' : ''}>
                            {'  '}
                            <span style={{ color: '#79C0FF' }}>return</span>{' '}
                            <span style={{ color: '#D2A8FF' }}>bubbleSort</span>
                            <span style={{ color: '#C9D1D9' }}>(arr, n - </span>
                            <span style={{ color: '#A5D6FF' }}>1</span>
                            <span style={{ color: '#C9D1D9' }}>);</span>
                            <span className="ml-2 text-xs" style={{ color: '#D2A8FF' }}>
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

        {}
        <div className="rounded-2xl border p-6 mb-8" style={{ backgroundColor: COLORS.card, borderColor: COLORS.border }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">{algorithm.title} Implementation</h2>
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

        {}
        <section className="space-y-6">
          <div className="rounded-2xl border p-6" style={{ backgroundColor: COLORS.card, borderColor: COLORS.border }}>
            <h2 className="text-2xl font-bold mb-4">How Does {algorithm.title} Work?</h2>
            <div className="space-y-4 text-lg leading-relaxed" style={{ color: COLORS.textSecondary }}>
              {algorithmId === 'bubble-sort' && (
                <>
                  <p>
                    Bubble Sort works by repeatedly stepping through the list of elements, comparing each pair of adjacent items, and swapping them if they are in the wrong order. The pass through the list is repeated until no swaps are needed, which indicates that the list is sorted.
                  </p>
                  <p>
                    The algorithm gets its name from the way smaller elements "bubble" to the top of the list (beginning of the array) while larger elements "sink" to the bottom (end of the array) with each pass.
                  </p>
                </>
              )}
              {algorithmId === 'selection-sort' && (
                <>
                  <p>
                    Selection Sort works by dividing the array into two parts: a sorted portion at the beginning and an unsorted portion at the end. The algorithm repeatedly finds the minimum element from the unsorted portion and places it at the end of the sorted portion.
                  </p>
                  <p>
                    This process continues until the entire array is sorted. Selection Sort is called so because it "selects" the smallest element in each iteration.
                  </p>
                </>
              )}
              {algorithmId === 'insertion-sort' && (
                <>
                  <p>
                    Insertion Sort works similarly to how you might sort playing cards in your hands. It builds the sorted array one element at a time by taking each element from the unsorted portion and inserting it into its correct position in the sorted portion.
                  </p>
                  <p>
                    The algorithm maintains a sorted subarray at the beginning of the array and repeatedly inserts the next element into its correct position within this sorted subarray.
                  </p>
                </>
              )}
              {algorithmId === 'merge-sort' && (
                <>
                  <p>
                    Merge Sort is a divide-and-conquer algorithm that works by dividing the array into two halves, sorting each half recursively, and then merging the two sorted halves back together.
                  </p>
                  <p>
                    The key operation is the merge step, which combines two sorted arrays into a single sorted array. This process continues recursively until the base case is reached (arrays of size 1, which are already sorted).
                  </p>
                </>
              )}
              {algorithmId === 'quick-sort' && (
                <>
                  <p>
                    Quick Sort is a divide-and-conquer algorithm that works by selecting a "pivot" element from the array and partitioning the other elements into two sub-arrays according to whether they are less than or greater than the pivot.
                  </p>
                  <p>
                    The sub-arrays are then sorted recursively. The pivot is placed in its final position, and the algorithm continues until all elements are sorted. Quick Sort is efficient because it sorts in-place and has good average-case performance.
                  </p>
                </>
              )}
              {algorithmId === 'heap-sort' && (
                <>
                  <p>
                    Heap Sort works by first building a max heap (or min heap) from the array, then repeatedly extracting the maximum (or minimum) element from the heap and placing it at the end of the sorted portion.
                  </p>
                  <p>
                    The algorithm uses the heap data structure to efficiently find and extract the maximum element. After building the heap, it repeatedly swaps the root (maximum) with the last element, reduces the heap size, and heapifies the root.
                  </p>
                </>
              )}
              {algorithmId === 'counting-sort' && (
                <>
                  <p>
                    Counting Sort is a non-comparison based sorting algorithm that works by counting the number of occurrences of each unique element in the array. It uses this count to determine the position of each element in the sorted output.
                  </p>
                  <p>
                    The algorithm creates a count array to store the count of each element, then modifies this count array to store the cumulative count, and finally places each element in its correct position based on the count.
                  </p>
                </>
              )}
              {algorithmId === 'radix-sort' && (
                <>
                  <p>
                    Radix Sort is a non-comparison based sorting algorithm that sorts numbers by processing individual digits or characters from least significant to most significant digit (LSD) or vice versa (MSD).
                  </p>
                  <p>
                    The algorithm uses a stable sorting algorithm (like Counting Sort) as a subroutine to sort the elements based on each digit position. It processes digits from right to left (or left to right) until all digits have been processed.
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="rounded-2xl border p-6" style={{ backgroundColor: COLORS.card, borderColor: COLORS.border }}>
            <h2 className="text-2xl font-bold mb-4">Step-by-Step Algorithm</h2>
            <div className="space-y-3">
              {algorithmId === 'bubble-sort' && (
                <ol className="list-decimal list-inside space-y-2 text-lg" style={{ color: COLORS.textSecondary }}>
                  <li>Start with the first element (index 0) and compare it with the next element (index 1).</li>
                  <li>If the first element is greater than the second, swap them.</li>
                  <li>Move to the next pair (index 1 and 2) and repeat the comparison and swap if needed.</li>
                  <li>Continue this process for all adjacent pairs until the end of the array.</li>
                  <li>After one complete pass, the largest element will be at the end.</li>
                  <li>Repeat the process for the remaining unsorted portion (excluding the last sorted element).</li>
                  <li>Continue until no swaps are needed in a complete pass, indicating the array is sorted.</li>
                </ol>
              )}
              {algorithmId === 'selection-sort' && (
                <ol className="list-decimal list-inside space-y-2 text-lg" style={{ color: COLORS.textSecondary }}>
                  <li>Find the minimum element in the unsorted portion of the array.</li>
                  <li>Swap it with the first element of the unsorted portion.</li>
                  <li>Move the boundary of the sorted portion one position to the right.</li>
                  <li>Repeat steps 1-3 for the remaining unsorted portion.</li>
                  <li>Continue until the entire array is sorted.</li>
                </ol>
              )}
              {algorithmId === 'insertion-sort' && (
                <ol className="list-decimal list-inside space-y-2 text-lg" style={{ color: COLORS.textSecondary }}>
                  <li>Start with the second element (index 1) as the key element.</li>
                  <li>Compare the key with elements in the sorted portion (to its left).</li>
                  <li>Shift all elements greater than the key one position to the right.</li>
                  <li>Insert the key into its correct position.</li>
                  <li>Move to the next element and repeat steps 2-4.</li>
                  <li>Continue until all elements have been inserted into their correct positions.</li>
                </ol>
              )}
              {algorithmId === 'merge-sort' && (
                <ol className="list-decimal list-inside space-y-2 text-lg" style={{ color: COLORS.textSecondary }}>
                  <li>If the array has only one element, return it (base case).</li>
                  <li>Divide the array into two halves.</li>
                  <li>Recursively sort the left half.</li>
                  <li>Recursively sort the right half.</li>
                  <li>Merge the two sorted halves into a single sorted array.</li>
                  <li>Return the merged sorted array.</li>
                </ol>
              )}
              {algorithmId === 'quick-sort' && (
                <ol className="list-decimal list-inside space-y-2 text-lg" style={{ color: COLORS.textSecondary }}>
                  <li>Choose a pivot element from the array (commonly the last or first element).</li>
                  <li>Partition the array: rearrange elements so that all elements less than the pivot come before it, and all elements greater come after it.</li>
                  <li>The pivot is now in its final sorted position.</li>
                  <li>Recursively apply Quick Sort to the sub-array of elements less than the pivot.</li>
                  <li>Recursively apply Quick Sort to the sub-array of elements greater than the pivot.</li>
                  <li>Combine the results (pivot is already in correct position).</li>
                </ol>
              )}
              {algorithmId === 'heap-sort' && (
                <ol className="list-decimal list-inside space-y-2 text-lg" style={{ color: COLORS.textSecondary }}>
                  <li>Build a max heap from the input array.</li>
                  <li>Swap the root (maximum element) with the last element of the heap.</li>
                  <li>Reduce the heap size by one (excluding the last element from the heap).</li>
                  <li>Heapify the root to maintain the max heap property.</li>
                  <li>Repeat steps 2-4 until the heap size is 1.</li>
                  <li>The array is now sorted in ascending order.</li>
                </ol>
              )}
              {algorithmId === 'counting-sort' && (
                <ol className="list-decimal list-inside space-y-2 text-lg" style={{ color: COLORS.textSecondary }}>
                  <li>Find the maximum element in the array to determine the range.</li>
                  <li>Create a count array of size (max + 1) and initialize all values to 0.</li>
                  <li>Count the occurrences of each element and store in the count array.</li>
                  <li>Modify the count array to store cumulative counts (each element represents the number of elements less than or equal to that index).</li>
                  <li>Create an output array and place each element in its correct position based on the count array.</li>
                  <li>Copy the output array back to the original array.</li>
                </ol>
              )}
              {algorithmId === 'radix-sort' && (
                <ol className="list-decimal list-inside space-y-2 text-lg" style={{ color: COLORS.textSecondary }}>
                  <li>Find the maximum number to determine the number of digits.</li>
                  <li>For each digit position (from least significant to most significant):</li>
                  <li className="ml-8">a. Use a stable sorting algorithm (like Counting Sort) to sort elements based on the current digit.</li>
                  <li className="ml-8">b. Update the array with the sorted order.</li>
                  <li>After processing all digits, the array is sorted.</li>
                </ol>
              )}
            </div>
          </div>

          <div className="rounded-2xl border p-6" style={{ backgroundColor: COLORS.card, borderColor: COLORS.border }}>
            <h2 className="text-2xl font-bold mb-4">Time & Space Complexity</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold mb-3" style={{ color: COLORS.primary }}>Time Complexity</h3>
                <ul className="space-y-2 text-lg" style={{ color: COLORS.textSecondary }}>
                  <li><strong style={{ color: COLORS.text }}>Best Case:</strong> {algorithmId === 'bubble-sort' || algorithmId === 'insertion-sort' ? 'O(n)' : algorithmId === 'merge-sort' || algorithmId === 'quick-sort' || algorithmId === 'heap-sort' ? 'O(n log n)' : algorithmId === 'counting-sort' ? 'O(n + k)' : 'O(nk)'}</li>
                  <li><strong style={{ color: COLORS.text }}>Average Case:</strong> {algorithm.timeComplexity}</li>
                  <li><strong style={{ color: COLORS.text }}>Worst Case:</strong> {algorithm.timeComplexity.includes('avg') ? 'O(n²)' : algorithm.timeComplexity}</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3" style={{ color: COLORS.primary }}>Space Complexity</h3>
                <ul className="space-y-2 text-lg" style={{ color: COLORS.textSecondary }}>
                  <li><strong style={{ color: COLORS.text }}>Auxiliary Space:</strong> {algorithm.spaceComplexity}</li>
                  <li><strong style={{ color: COLORS.text }}>In-Place:</strong> {algorithm.spaceComplexity === 'O(1)' ? 'Yes' : algorithmId === 'quick-sort' ? 'Yes (O(log n) for recursion stack)' : 'No'}</li>
                  <li><strong style={{ color: COLORS.text }}>Stable:</strong> {algorithmId === 'bubble-sort' || algorithmId === 'insertion-sort' || algorithmId === 'merge-sort' || algorithmId === 'counting-sort' || algorithmId === 'radix-sort' ? 'Yes' : 'No'}</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border p-6" style={{ backgroundColor: COLORS.card, borderColor: COLORS.border }}>
            <h2 className="text-2xl font-bold mb-4">Advantages & Disadvantages</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold mb-3" style={{ color: COLORS.success }}>Advantages</h3>
                <ul className="space-y-2 text-lg list-disc list-inside" style={{ color: COLORS.textSecondary }}>
                  {algorithmId === 'bubble-sort' && (
                    <>
                      <li>Simple to understand and implement</li>
                      <li>In-place sorting (O(1) extra space)</li>
                      <li>Stable sorting algorithm</li>
                      <li>Good for educational purposes</li>
                    </>
                  )}
                  {algorithmId === 'selection-sort' && (
                    <>
                      <li>Simple to understand and implement</li>
                      <li>In-place sorting (O(1) extra space)</li>
                      <li>Minimal number of swaps (at most n swaps)</li>
                      <li>Good when memory writes are expensive</li>
                    </>
                  )}
                  {algorithmId === 'insertion-sort' && (
                    <>
                      <li>Simple to understand and implement</li>
                      <li>Efficient for small datasets</li>
                      <li>Stable sorting algorithm</li>
                      <li>Adaptive: efficient for nearly sorted data</li>
                      <li>In-place sorting (O(1) extra space)</li>
                    </>
                  )}
                  {algorithmId === 'merge-sort' && (
                    <>
                      <li>Guaranteed O(n log n) time complexity</li>
                      <li>Stable sorting algorithm</li>
                      <li>Good for large datasets</li>
                      <li>Predictable performance</li>
                      <li>Good for external sorting</li>
                    </>
                  )}
                  {algorithmId === 'quick-sort' && (
                    <>
                      <li>Very fast in practice (average case)</li>
                      <li>In-place sorting (O(log n) space for recursion)</li>
                      <li>Cache-friendly</li>
                      <li>Good for general-purpose sorting</li>
                    </>
                  )}
                  {algorithmId === 'heap-sort' && (
                    <>
                      <li>Guaranteed O(n log n) time complexity</li>
                      <li>In-place sorting (O(1) extra space)</li>
                      <li>No worst-case quadratic behavior</li>
                      <li>Good for systems with limited memory</li>
                    </>
                  )}
                  {algorithmId === 'counting-sort' && (
                    <>
                      <li>Very fast when range is small (O(n + k))</li>
                      <li>Stable sorting algorithm</li>
                      <li>Linear time complexity for small ranges</li>
                      <li>No comparisons needed</li>
                    </>
                  )}
                  {algorithmId === 'radix-sort' && (
                    <>
                      <li>Linear time complexity for integers/strings</li>
                      <li>Stable sorting algorithm</li>
                      <li>No comparisons needed</li>
                      <li>Good for sorting numbers with fixed digits</li>
                    </>
                  )}
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3" style={{ color: COLORS.error }}>Disadvantages</h3>
                <ul className="space-y-2 text-lg list-disc list-inside" style={{ color: COLORS.textSecondary }}>
                  {algorithmId === 'bubble-sort' && (
                    <>
                      <li>Very slow for large datasets (O(n²))</li>
                      <li>Not efficient in practice</li>
                      <li>Many unnecessary comparisons</li>
                      <li>Not suitable for real-world applications</li>
                    </>
                  )}
                  {algorithmId === 'selection-sort' && (
                    <>
                      <li>O(n²) time complexity in all cases</li>
                      <li>Not efficient for large datasets</li>
                      <li>Not adaptive (always does same work)</li>
                      <li>Many comparisons needed</li>
                    </>
                  )}
                  {algorithmId === 'insertion-sort' && (
                    <>
                      <li>O(n²) worst-case time complexity</li>
                      <li>Not efficient for large datasets</li>
                      <li>Many shifts required</li>
                      <li>Not suitable for random data</li>
                    </>
                  )}
                  {algorithmId === 'merge-sort' && (
                    <>
                      <li>Requires O(n) extra space</li>
                      <li>Not in-place sorting</li>
                      <li>Slower than Quick Sort in practice</li>
                      <li>More memory overhead</li>
                    </>
                  )}
                  {algorithmId === 'quick-sort' && (
                    <>
                      <li>Worst-case O(n²) time complexity</li>
                      <li>Not stable sorting</li>
                      <li>Performance depends on pivot selection</li>
                      <li>Worst case can be slow</li>
                    </>
                  )}
                  {algorithmId === 'heap-sort' && (
                    <>
                      <li>Not stable sorting</li>
                      <li>Slower than Quick Sort in practice</li>
                      <li>More complex to implement</li>
                      <li>Not cache-friendly</li>
                    </>
                  )}
                  {algorithmId === 'counting-sort' && (
                    <>
                      <li>Only works for integers with small range</li>
                      <li>Requires O(k) extra space</li>
                      <li>Not suitable for large ranges</li>
                      <li>Inefficient when range is much larger than n</li>
                    </>
                  )}
                  {algorithmId === 'radix-sort' && (
                    <>
                      <li>Only works for integers or strings</li>
                      <li>Requires O(n + k) extra space</li>
                      <li>Not suitable for floating-point numbers</li>
                      <li>More complex to implement</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border p-6" style={{ backgroundColor: COLORS.card, borderColor: COLORS.border }}>
            <h2 className="text-2xl font-bold mb-4">When to Use {algorithm.title}</h2>
            <div className="space-y-3 text-lg" style={{ color: COLORS.textSecondary }}>
              <p><strong style={{ color: COLORS.text }}>Best Use Case:</strong> {algorithm.bestUseCase}</p>
              <div>
                <strong style={{ color: COLORS.text }}>Ideal Scenarios:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                  {algorithmId === 'bubble-sort' && (
                    <>
                      <li>Educational purposes and learning sorting algorithms</li>
                      <li>Very small datasets (less than 10 elements)</li>
                      <li>When simplicity is more important than efficiency</li>
                    </>
                  )}
                  {algorithmId === 'selection-sort' && (
                    <>
                      <li>When the number of swaps needs to be minimized</li>
                      <li>When memory writes are expensive</li>
                      <li>Small datasets where simplicity matters</li>
                    </>
                  )}
                  {algorithmId === 'insertion-sort' && (
                    <>
                      <li>Nearly sorted or small datasets</li>
                      <li>When you need a stable, in-place sorting algorithm</li>
                      <li>As a subroutine in more complex algorithms (like Timsort)</li>
                      <li>Online sorting (sorting data as it arrives)</li>
                    </>
                  )}
                  {algorithmId === 'merge-sort' && (
                    <>
                      <li>When you need guaranteed O(n log n) performance</li>
                      <li>When stability is important</li>
                      <li>External sorting (sorting data that doesn't fit in memory)</li>
                      <li>When you can afford O(n) extra space</li>
                    </>
                  )}
                  {algorithmId === 'quick-sort' && (
                    <>
                      <li>General-purpose sorting (most common use case)</li>
                      <li>When average-case performance is important</li>
                      <li>When you need in-place sorting</li>
                      <li>When stability is not required</li>
                    </>
                  )}
                  {algorithmId === 'heap-sort' && (
                    <>
                      <li>When you need guaranteed O(n log n) with O(1) space</li>
                      <li>Systems with limited memory</li>
                      <li>When worst-case performance matters</li>
                      <li>Priority queue implementations</li>
                    </>
                  )}
                  {algorithmId === 'counting-sort' && (
                    <>
                      <li>When sorting integers with a small range</li>
                      <li>When the range of values is known and small</li>
                      <li>As a subroutine in Radix Sort</li>
                      <li>When linear time complexity is critical</li>
                    </>
                  )}
                  {algorithmId === 'radix-sort' && (
                    <>
                      <li>Sorting integers or fixed-length strings</li>
                      <li>When the number of digits/characters is small</li>
                      <li>When you need stable sorting for integers</li>
                      <li>Sorting large datasets of integers</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border p-6" style={{ backgroundColor: COLORS.card, borderColor: COLORS.border }}>
            <h2 className="text-2xl font-bold mb-4">Real-World Applications</h2>
            <div className="space-y-3 text-lg" style={{ color: COLORS.textSecondary }}>
              <ul className="list-disc list-inside space-y-2 ml-4">
                {algorithmId === 'bubble-sort' && (
                  <>
                    <li>Educational demonstrations and teaching sorting concepts</li>
                    <li>Simple embedded systems with very limited resources</li>
                    <li>Prototyping and testing small datasets</li>
                  </>
                )}
                {algorithmId === 'selection-sort' && (
                  <>
                    <li>Systems where write operations are expensive (flash memory)</li>
                    <li>Simple sorting in resource-constrained environments</li>
                    <li>When minimizing swaps is critical</li>
                  </>
                )}
                {algorithmId === 'insertion-sort' && (
                  <>
                    <li>Sorting small datasets in real-time applications</li>
                    <li>As a subroutine in Timsort (used in Python and Java)</li>
                    <li>Online sorting: sorting data as it arrives</li>
                    <li>Sorting nearly-sorted data efficiently</li>
                  </>
                )}
                {algorithmId === 'merge-sort' && (
                  <>
                    <li>External sorting: sorting large files that don't fit in memory</li>
                    <li>Database systems for sorting large result sets</li>
                    <li>Merge operations in version control systems (Git)</li>
                    <li>When stability and predictable performance are required</li>
                  </>
                )}
                {algorithmId === 'quick-sort' && (
                  <>
                    <li>Default sorting algorithm in many programming languages (C++ std::sort)</li>
                    <li>Database query optimization</li>
                    <li>Operating system process scheduling</li>
                    <li>General-purpose sorting in applications</li>
                  </>
                )}
                {algorithmId === 'heap-sort' && (
                  <>
                    <li>Priority queue implementations</li>
                    <li>Operating system scheduling algorithms</li>
                    <li>Memory-constrained systems</li>
                    <li>When worst-case O(n log n) is required with limited space</li>
                  </>
                )}
                {algorithmId === 'counting-sort' && (
                  <>
                    <li>Sorting integers with a known small range (e.g., ages 0-120)</li>
                    <li>As a subroutine in Radix Sort</li>
                    <li>Histogram generation and frequency counting</li>
                    <li>Sorting data with limited value range</li>
                  </>
                )}
                {algorithmId === 'radix-sort' && (
                  <>
                    <li>Sorting large datasets of integers (IP addresses, phone numbers)</li>
                    <li>String sorting (fixed-length strings)</li>
                    <li>Card sorting machines</li>
                    <li>Sorting dates and timestamps</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default SortingAlgorithm
