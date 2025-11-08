import { AlertCircle, Clock, Lock, Play, Send } from 'lucide-react'
import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { useParams } from 'react-router-dom'
import CodeEditor, { SUPPORTED_LANGUAGES } from '../components/CodeEditor.jsx'
import api from '../utils/api.js'

function ContestSolving() {
  const { contestId, problemId } = useParams()
  const [contest, setContest] = useState(null)
  const [problem, setProblem] = useState(null)
  const [selectedProblemIndex, setSelectedProblemIndex] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(0) // in seconds
  const [isContestEnded, setIsContestEnded] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const [loading, setLoading] = useState(true)
  
  // Editor state
  const [language, setLanguage] = useState('python')
  const [code, setCode] = useState('')
  const [customInput, setCustomInput] = useState('')
  const [output, setOutput] = useState('')
  const [verdict, setVerdict] = useState('')
  const [loadingSubmission, setLoadingSubmission] = useState(false)

  // Load contest and problem data
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data } = await api.contests.get(contestId)
        const contestData = data.contest
        setContest(contestData)

        // Find problem index
        if (problemId && contestData.problems) {
          const index = contestData.problems.findIndex(p => p._id === problemId)
          if (index >= 0) {
            setSelectedProblemIndex(index)
            loadProblem(contestData.problems[index]._id)
          } else if (contestData.problems.length > 0) {
            loadProblem(contestData.problems[0]._id)
          }
        } else if (contestData.problems && contestData.problems.length > 0) {
          loadProblem(contestData.problems[0]._id)
        }

        // Calculate initial time remaining
        const now = new Date()
        const end = new Date(contestData.endTime)
        const remaining = Math.max(0, Math.floor((end - now) / 1000))
        setTimeRemaining(remaining)
        setIsContestEnded(remaining === 0)
        setIsLocked(remaining === 0)
      } catch (e) {
        console.error('Failed to load contest:', e)
      } finally {
        setLoading(false)
      }
    }

    if (contestId) {
      loadData()
    }
  }, [contestId, problemId])

  const loadProblem = async (pid) => {
    try {
      const { data } = await api.problems.get(pid)
      const p = data.problem
      setProblem(p)

      // Load starter code
      if (p.starterCode && Array.isArray(p.starterCode) && p.starterCode.length > 0) {
        const starter = p.starterCode.find(sc => 
          sc.language?.toLowerCase() === language.toLowerCase()
        ) || p.starterCode[0]
        
        if (starter && starter.initialCode) {
          setCode(starter.initialCode)
          const lang = starter.language || 'python'
          const mappedLang = Object.keys(SUPPORTED_LANGUAGES).find(
            key => key.toLowerCase() === lang.toLowerCase()
          ) || 'python'
          setLanguage(mappedLang)
        }
      }
    } catch (e) {
      console.error('Failed to load problem:', e)
    }
  }

  // Countdown timer
  useEffect(() => {
    if (isContestEnded || !contest) return

    const interval = setInterval(() => {
      const now = new Date()
      const end = new Date(contest.endTime)
      const remaining = Math.max(0, Math.floor((end - now) / 1000))
      
      setTimeRemaining(remaining)
      
      if (remaining === 0) {
        setIsContestEnded(true)
        setIsLocked(true)
        clearInterval(interval)
        alert('Contest time is over! The contest has ended.')
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [contest, isContestEnded])

  // Prevent window closing during contest
  useEffect(() => {
    if (isContestEnded || !contest || !contest.isParticipant) return

    const handleBeforeUnload = (e) => {
      e.preventDefault()
      e.returnValue = 'Are you sure you want to leave? Your progress may be lost.'
      return e.returnValue
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [contest, isContestEnded])

  // Format time remaining
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  // Handle code run
  const handleRun = async () => {
    if (!problem || !code.trim()) return
    
    setLoadingSubmission(true)
    setOutput('')
    setVerdict('')
    
    try {
      let data
      if (customInput && customInput.trim()) {
        // Use custom input endpoint
        const response = await api.solve.runCustom({
          code,
          language,
          customInput
        })
        data = response.data
        console.log('Custom input response:', data)
        
        // Parse the result from custom input endpoint
        if (data.result) {
          console.log('Result object:', data.result)
          const result = data.result
          let outputText = ''
          
          // Check stdout first (main output) - handle empty string as valid output
          if (result.stdout !== null && result.stdout !== undefined) {
            outputText = result.stdout.trim()
          } 
          // Check stderr (runtime errors)
          else if (result.stderr !== null && result.stderr !== undefined && result.stderr !== '') {
            outputText = `Error: ${result.stderr.trim()}`
          } 
          // Check compile_output (compilation errors)
          else if (result.compile_output !== null && result.compile_output !== undefined && result.compile_output !== '') {
            outputText = `Compilation Error: ${result.compile_output.trim()}`
          } 
          // Check message field
          else if (result.message !== null && result.message !== undefined && result.message !== '') {
            outputText = result.message.trim()
          }
          // If still no output, check status
          else {
            // Check if it's still processing
            if (result.status_id === 1 || result.status_id === 2) {
              outputText = 'Processing... Please wait.'
            } else if (result.status_id === 3) {
              outputText = '(Program executed successfully but produced no output)'
            } else {
              outputText = `(Status: ${result.status_id} - No output generated)`
            }
          }
          
          // Always set output, even if empty string
          setOutput(outputText)
          
          // Set verdict based on status_id
          const statusMap = {
            1: 'In Queue',
            2: 'Processing',
            3: 'Accepted',
            4: 'Wrong Answer',
            5: 'Time Limit Exceeded',
            6: 'Compilation Error',
            7: 'Runtime Error (NZEC)',
            8: 'Runtime Error (Other)',
            9: 'Runtime Error (SIGFPE)',
            10: 'Runtime Error (SIGSEGV)',
            11: 'Runtime Error (SIGXFSZ)',
            12: 'Runtime Error (SIGABRT)',
            13: 'Runtime Error (SIGBUS)',
            14: 'Runtime Error (SIGTERM)',
            15: 'Time Limit Exceeded',
            70: 'Compilation Error'
          }
          
          if (result.status && result.status.description) {
            setVerdict(result.status.description)
          } else {
            setVerdict(statusMap[result.status_id] || `Status: ${result.status_id}`)
          }
        } else {
          // Log the full response for debugging
          console.log('No result in response, full data:', data)
          setOutput(data.message || JSON.stringify(data) || 'No result returned from server')
          setVerdict('Error')
        }
      } else {
        // Use test cases endpoint
        const response = await api.solve.run(problem._id, {
          code,
          language
        })
        data = response.data
        
        // Parse the result from test cases endpoint
        if (data.finalsubmissionResults && data.finalsubmissionResults.submissions) {
          const submissions = data.finalsubmissionResults.submissions
          let outputText = ''
          let allAccepted = true
          
          submissions.forEach((sub, index) => {
            if (sub.stdout) {
              outputText += `Test Case ${index + 1}:\n${sub.stdout}\n\n`
            } else if (sub.stderr) {
              outputText += `Test Case ${index + 1} Error: ${sub.stderr}\n\n`
              allAccepted = false
            } else if (sub.compile_output) {
              outputText += `Test Case ${index + 1} Compilation Error: ${sub.compile_output}\n\n`
              allAccepted = false
            }
            
            if (sub.status_id !== 3) {
              allAccepted = false
            }
          })
          
          setOutput(outputText || 'No output')
          setVerdict(allAccepted ? 'Accepted' : 'Failed')
        } else {
          setOutput(data.message || 'No result returned')
        }
      }
    } catch (e) {
      console.error('Error running code:', e)
      console.error('Error response:', e.response)
      const errorMessage = e.response?.data?.message || e.message || 'Failed to run code'
      setOutput(`Error: ${errorMessage}\n\nCheck the browser console (F12) for more details.`)
      setVerdict('Error')
    } finally {
      setLoadingSubmission(false)
    }
  }

  // Handle code submit
  const handleSubmit = async () => {
    if (!problem || !code.trim() || isLocked) return
    
    if (!confirm('Are you sure you want to submit? This will be your final submission.')) {
      return
    }
    
    setLoadingSubmission(true)
    setOutput('')
    setVerdict('')
    
    try {
      const { data } = await api.solve.submit(problem._id, {
        code,
        language
      })
      setVerdict(data.verdict || '')
      setOutput(data.message || '')
      
      if (data.verdict === 'Accepted') {
        alert('Congratulations! Your solution is correct!')
      }
    } catch (e) {
      setOutput('Error: ' + (e.response?.data?.message || 'Failed to submit'))
    } finally {
      setLoadingSubmission(false)
    }
  }

  // Switch problem
  const switchProblem = (index) => {
    if (isLocked) return
    setSelectedProblemIndex(index)
    if (contest.problems[index]) {
      loadProblem(contest.problems[index]._id)
    }
  }

  if (loading) {
    return (
      <div className="h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4"></div>
          <p>Loading contest...</p>
        </div>
      </div>
    )
  }

  if (!contest || !contest.isParticipant) {
    return (
      <div className="h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Lock className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <p className="text-xl mb-2">Access Denied</p>
          <p className="text-white/60">You are not a participant in this contest.</p>
        </div>
      </div>
    )
  }

  const currentProblem = contest.problems?.[selectedProblemIndex]

  return (
    <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
      {/* Top Bar - Timer and Contest Info */}
      <div className="border-b border-white/10 bg-black/80 backdrop-blur-sm z-50">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold">{contest.title}</h1>
            {isContestEnded && (
              <span className="px-3 py-1 rounded-lg text-sm bg-red-400/20 border border-red-400/50 text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Contest Ended
              </span>
            )}
            {isLocked && !isContestEnded && (
              <span className="px-3 py-1 rounded-lg text-sm bg-amber-400/20 border border-amber-400/50 text-amber-400 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Locked
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-bold ${
              timeRemaining < 300 
                ? 'bg-red-400/20 border border-red-400/50 text-red-400'
                : timeRemaining < 900
                ? 'bg-amber-400/20 border border-amber-400/50 text-amber-400'
                : 'bg-emerald-400/20 border border-emerald-400/50 text-emerald-400'
            }`}>
              <Clock className="w-5 h-5" />
              {formatTime(timeRemaining)}
            </div>
          </div>
        </div>

        {/* Problem Tabs */}
        {contest.problems && contest.problems.length > 0 && (
          <div className="flex gap-2 px-6 pb-3 overflow-x-auto">
            {contest.problems.map((p, index) => (
              <button
                key={p._id}
                onClick={() => switchProblem(index)}
                disabled={isLocked}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                  selectedProblemIndex === index
                    ? 'bg-emerald-400/20 border border-emerald-400/50 text-emerald-400'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10 text-white/70'
                } ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {String.fromCharCode(65 + index)}. {p.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Problem Description */}
        <div className="w-1/2 border-r border-white/10 overflow-y-auto p-6">
          {problem ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">{problem.title}</h2>
                <span className={`inline-block px-3 py-1 rounded-lg text-sm font-medium ${
                  problem.difficulty === 'Easy' ? 'bg-green-400/20 text-green-400' :
                  problem.difficulty === 'Medium' ? 'bg-yellow-400/20 text-yellow-400' :
                  'bg-red-400/20 text-red-400'
                }`}>
                  {problem.difficulty}
                </span>
              </div>

              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="mb-3 text-white/80">{children}</p>,
                    h1: ({ children }) => <h1 className="text-lg font-bold mb-2 text-white">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-base font-bold mb-2 text-white">{children}</h2>,
                    code: ({ children }) => <code className="bg-white/10 px-1 py-0.5 rounded text-xs">{children}</code>,
                    pre: ({ children }) => <pre className="bg-white/5 p-3 rounded border border-white/10 overflow-x-auto text-xs my-2">{children}</pre>,
                  }}
                >
                  {problem.description}
                </ReactMarkdown>
              </div>

              {/* Test Cases - SECOND */}
              {problem.visibleTestCases && problem.visibleTestCases.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Example:</h3>
                  {problem.visibleTestCases.map((testCase, i) => (
                    <div key={i} className="mb-4 p-3 bg-white/5 rounded border border-white/10">
                      <div className="mb-2">
                        <span className="text-xs text-white/60">Input:</span>
                        <pre className="mt-1 text-xs bg-black/40 p-2 rounded">{testCase.input}</pre>
                      </div>
                      <div>
                        <span className="text-xs text-white/60">Output:</span>
                        <pre className="mt-1 text-xs bg-black/40 p-2 rounded">{testCase.output}</pre>
                      </div>
                      {testCase.explanation && (
                        <div className="mt-2 text-xs text-white/60">
                          <span>Explanation: </span>{testCase.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Constraints - THIRD */}
              {problem.constraints && problem.constraints.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Constraints:</h3>
                  <ul className="list-disc ml-5 space-y-1 text-sm text-white/70">
                    {problem.constraints.map((constraint, i) => (
                      <li key={i}>{constraint}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-white/60">
              <p>Loading problem...</p>
            </div>
          )}
        </div>

        {/* Right Panel - Code Editor */}
        <div className="w-1/2 flex flex-col">
          {/* Language Selector */}
          <div className="border-b border-white/10 p-3 flex items-center justify-between">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled={isLocked}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-400/50"
            >
              {Object.entries(SUPPORTED_LANGUAGES).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            
            <div className="flex gap-2">
              <button
                onClick={handleRun}
                disabled={loadingSubmission || isLocked || !code.trim()}
                className="px-4 py-2 rounded-lg bg-blue-400/20 border border-blue-400/50 text-blue-400 hover:bg-blue-400/30 transition disabled:opacity-50 flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Run
              </button>
              <button
                onClick={handleSubmit}
                disabled={loadingSubmission || isLocked || !code.trim()}
                className="px-4 py-2 rounded-lg bg-emerald-400/20 border border-emerald-400/50 text-emerald-400 hover:bg-emerald-400/30 transition disabled:opacity-50 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Submit
              </button>
            </div>
          </div>

          {/* Code Editor */}
          <div className="flex-1">
            <CodeEditor
              language={language}
              value={code}
              onChange={setCode}
              height="100%"
              options={{
                readOnly: isLocked,
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: 'on'
              }}
            />
          </div>

          {/* Output Panel */}
          <div className="border-t border-white/10 p-4 bg-black/40">
            <div className="mb-2">
              <label className="text-sm text-white/70 mb-1 block">Custom Input (for testing):</label>
              <textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                disabled={isLocked}
                placeholder="Enter custom input..."
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-emerald-400/50 resize-none text-sm"
                rows={2}
              />
            </div>
            
            <div className="mt-3">
              <label className="text-sm text-white/70 mb-1 block">Output:</label>
              <pre className="px-3 py-2 rounded-lg bg-black/60 border border-white/10 text-sm text-white/80 overflow-x-auto min-h-[60px] whitespace-pre-wrap">
                {loadingSubmission && !output ? 'Running...' : (output || '(No output - Click Run to execute your code)')}
              </pre>
            </div>
            
            {verdict && (
              <div className={`mt-3 px-3 py-2 rounded-lg text-sm font-medium ${
                verdict === 'Accepted' 
                  ? 'bg-green-400/20 border border-green-400/50 text-green-400'
                  : 'bg-red-400/20 border border-red-400/50 text-red-400'
              }`}>
                Verdict: {verdict}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContestSolving

