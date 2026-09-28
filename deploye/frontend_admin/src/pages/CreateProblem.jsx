import { useState } from 'react'
import { Plus, ArrowLeft, X, Code } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import axiosClient from '../api/axiosClient.js'
import TestCaseManager from '../components/TestCaseManager.jsx'

const SUPPORTED_LANGUAGES = [
  { value: 'Python', label: 'Python' },
  { value: 'Java', label: 'Java' },
  { value: 'C++', label: 'C++' },
  { value: 'C', label: 'C' },
  { value: 'JavaScript', label: 'JavaScript' },
  { value: 'Ruby', label: 'Ruby' },
  { value: 'Go', label: 'Go' },
  { value: 'Swift', label: 'Swift' },
  { value: 'Kotlin', label: 'Kotlin' },
  { value: 'PHP', label: 'PHP' }
]

function CreateProblem(){
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [starterCodeItems, setStarterCodeItems] = useState([
    { language: 'Python', initialCode: '' },
    { language: 'Java', initialCode: '' },
    { language: 'C++', initialCode: '' }
  ])
  const [referenceSolutionItems, setReferenceSolutionItems] = useState([
    { language: 'Python', completeCode: '' },
    { language: 'Java', completeCode: '' },
    { language: 'C++', completeCode: '' }
  ])

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'Easy',
    tags: '',
    constraints: '[]',
    acceptanceRate: ''
  })
  const [visibleTestCases, setVisibleTestCases] = useState([])
  const [hiddenTestCases, setHiddenTestCases] = useState([])

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
    setError('')
  }

  const addStarterCode = () => {
    const availableLangs = SUPPORTED_LANGUAGES.filter(
      lang => !starterCodeItems.some(item => item.language === lang.value)
    )
    if (availableLangs.length > 0) {
      setStarterCodeItems([...starterCodeItems, { language: availableLangs[0].value, initialCode: '' }])
    }
  }

  const removeStarterCode = (index) => {
    setStarterCodeItems(starterCodeItems.filter((_, i) => i !== index))
  }

  const updateStarterCode = (index, field, value) => {
    const updated = [...starterCodeItems]
    updated[index] = { ...updated[index], [field]: value }
    setStarterCodeItems(updated)
  }

  const addReferenceSolution = () => {
    const availableLangs = SUPPORTED_LANGUAGES.filter(
      lang => !referenceSolutionItems.some(item => item.language === lang.value)
    )
    if (availableLangs.length > 0) {
      setReferenceSolutionItems([...referenceSolutionItems, { language: availableLangs[0].value, completeCode: '' }])
    }
  }

  const removeReferenceSolution = (index) => {
    setReferenceSolutionItems(referenceSolutionItems.filter((_, i) => i !== index))
  }

  const updateReferenceSolution = (index, field, value) => {
    const updated = [...referenceSolutionItems]
    updated[index] = { ...updated[index], [field]: value }
    setReferenceSolutionItems(updated)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {

      const difficulty = formData.difficulty.charAt(0).toUpperCase() + formData.difficulty.slice(1).toLowerCase()
      
      const starterCode = starterCodeItems
        .filter(item => item.language && item.initialCode.trim())
        .map(item => ({
          language: item.language,
          initialCode: item.initialCode.trim()
        }))

      const referenceSolutions = referenceSolutionItems
        .filter(item => item.language && item.completeCode.trim())
        .map(item => ({
          language: item.language,
          completeCode: item.completeCode.trim()
        }))

      if (referenceSolutions.length < 3) {
        setError('At least 3 reference solutions are required (each in a different language)')
        setLoading(false)
        return
      }
      
      if (visibleTestCases.length === 0) {
        setError('At least one visible test case is required')
        setLoading(false)
        return
      }
      if (hiddenTestCases.length === 0) {
        setError('At least one hidden test case is required')
        setLoading(false)
        return
      }

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        difficulty: difficulty,
        tags: formData.tags.split(',').map(t=>t.trim()).filter(Boolean),
        visibleTestCases: visibleTestCases,
        hiddenTestCases: hiddenTestCases,
        starterCode: starterCode,
        constraints: JSON.parse(formData.constraints || '[]'),
        referenceSolutions: referenceSolutions,
        acceptanceRate: formData.acceptanceRate ? Number(formData.acceptanceRate) : 0,
      }
      await axiosClient.post('/problems/create', payload)
      setSuccess('Problem created successfully!')
      setTimeout(() => {
        navigate('/problems')
      }, 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create problem')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/problems')}
          className="p-2 rounded-lg hover:bg-white/10 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="font-semibold text-lg">Create New Problem</h2>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-400/10 border border-rose-400/20 rounded-lg text-rose-300 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-emerald-400/10 border border-emerald-400/20 rounded-lg text-emerald-300 text-sm">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-white/70 mb-1">Title *</label>
          <input
            required
            className="w-full bg-black border border-white/15 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500/50"
            value={formData.title}
            onChange={(e)=>handleChange('title', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm text-white/70 mb-1">Description *</label>
          <textarea
            rows={6}
            required
            className="w-full bg-black border border-white/15 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500/50"
            value={formData.description}
            onChange={(e)=>handleChange('description', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm text-white/70 mb-1">Difficulty *</label>
            <select
              required
              className="w-full bg-black border border-white/15 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500/50"
              value={formData.difficulty}
              onChange={(e)=>handleChange('difficulty', e.target.value)}
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-white/70 mb-1">Tags (comma-separated) *</label>
            <input
              required
              className="w-full bg-black border border-white/15 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500/50"
              value={formData.tags}
              onChange={(e)=>handleChange('tags', e.target.value)}
              placeholder="e.g., Array, Two Pointers, Hash Table"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-white/70 mb-1">Acceptance Rate (0-100)</label>
          <input
            type="number"
            min="0"
            max="100"
            className="w-full bg-black border border-white/15 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500/50"
            value={formData.acceptanceRate}
            onChange={(e)=>handleChange('acceptanceRate', e.target.value)}
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-sm text-white/70 mb-1">Constraints (JSON array of strings)</label>
          <textarea
            rows={3}
            className="w-full bg-black border border-white/15 rounded-lg px-3 py-2 text-sm font-mono outline-none focus:border-blue-500/50"
            value={formData.constraints}
            onChange={(e)=>handleChange('constraints', e.target.value)}
            placeholder='["1 <= n <= 100", "0 <= nums[i] <= 50"]'
          />
          <p className="text-xs text-white/50 mt-1">Array of constraint strings</p>
        </div>

        {}
        <div>
          <label className="block text-sm text-white/70 mb-4">Test Cases *</label>
          <TestCaseManager
            visibleTestCases={visibleTestCases}
            hiddenTestCases={hiddenTestCases}
            onVisibleChange={setVisibleTestCases}
            onHiddenChange={setHiddenTestCases}
            mode="both"
          />
        </div>

        {}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm text-white/70">Starter Code *</label>
            <button
              type="button"
              onClick={addStarterCode}
              className="px-2 py-1 text-xs bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              Add Language
            </button>
          </div>
          <div className="space-y-3">
            {starterCodeItems.map((item, index) => (
              <div key={index} className="border border-white/10 rounded-lg p-3 bg-black/40">
                <div className="flex items-center gap-2 mb-2">
                  <select
                    value={item.language}
                    onChange={(e)=>updateStarterCode(index, 'language', e.target.value)}
                    className="bg-black border border-white/15 rounded px-2 py-1 text-sm outline-none focus:border-blue-500/50"
                  >
                    {SUPPORTED_LANGUAGES.map(lang => (
                      <option key={lang.value} value={lang.value}>{lang.label}</option>
                    ))}
                  </select>
                  {starterCodeItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStarterCode(index)}
                      className="p-1 rounded hover:bg-white/10 transition"
                    >
                      <X className="w-4 h-4 text-rose-400" />
                    </button>
                  )}
                </div>
                <textarea
                  required
                  rows={6}
                  className="w-full bg-black border border-white/15 rounded-lg px-3 py-2 text-sm font-mono outline-none focus:border-blue-500/50"
                  value={item.initialCode}
                  onChange={(e)=>updateStarterCode(index, 'initialCode', e.target.value)}
                  placeholder={`Enter ${item.language} starter code...`}
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-white/50 mt-2">Add starter code for each supported language</p>
        </div>

        {}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm text-white/70">Reference Solutions *</label>
            <button
              type="button"
              onClick={addReferenceSolution}
              className="px-2 py-1 text-xs bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              Add Solution
            </button>
          </div>
          <div className="space-y-3">
            {referenceSolutionItems.map((item, index) => (
              <div key={index} className="border border-white/10 rounded-lg p-3 bg-black/40">
                <div className="flex items-center gap-2 mb-2">
                  <select
                    value={item.language}
                    onChange={(e)=>updateReferenceSolution(index, 'language', e.target.value)}
                    className="bg-black border border-white/15 rounded px-2 py-1 text-sm outline-none focus:border-blue-500/50"
                  >
                    {SUPPORTED_LANGUAGES.map(lang => (
                      <option key={lang.value} value={lang.value}>{lang.label}</option>
                    ))}
                  </select>
                  {referenceSolutionItems.length > 3 && (
                    <button
                      type="button"
                      onClick={() => removeReferenceSolution(index)}
                      className="p-1 rounded hover:bg-white/10 transition"
                    >
                      <X className="w-4 h-4 text-rose-400" />
                    </button>
                  )}
                </div>
                <textarea
                  required
                  rows={8}
                  className="w-full bg-black border border-white/15 rounded-lg px-3 py-2 text-sm font-mono outline-none focus:border-blue-500/50"
                  value={item.completeCode}
                  onChange={(e)=>updateReferenceSolution(index, 'completeCode', e.target.value)}
                  placeholder={`Enter complete ${item.language} solution...`}
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-white/50 mt-2">Minimum 3 reference solutions required (each in a different language)</p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={() => navigate('/problems')}
            className="px-4 py-2 rounded-lg text-sm border border-white/15 hover:bg-white/10 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm bg-gray-700 text-white font-semibold hover:bg-gray-600 transition disabled:opacity-50 flex items-center gap-2 border border-gray-600"
          >
            {loading ? 'Creating...' : (
              <>
                <Plus className="w-4 h-4" />
                Create Problem
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateProblem
