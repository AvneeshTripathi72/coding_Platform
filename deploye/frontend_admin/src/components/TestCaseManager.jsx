import { useState, useEffect } from 'react'
import { Plus, X, CheckCircle2, AlertCircle, GripVertical, Eye, EyeOff, Sparkles } from 'lucide-react'

function TestCaseManager({ 
  visibleTestCases = [], 
  hiddenTestCases = [], 
  onVisibleChange, 
  onHiddenChange,
  mode = 'both'
}) {
  const [localVisible, setLocalVisible] = useState([])
  const [localHidden, setLocalHidden] = useState([])
  const [errors, setErrors] = useState({ visible: {}, hidden: {} })
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [dragOverIndex, setDragOverIndex] = useState(null)

  useEffect(() => {
    setLocalVisible(Array.isArray(visibleTestCases) ? visibleTestCases : [])
    setLocalHidden(Array.isArray(hiddenTestCases) ? hiddenTestCases : [])
  }, [visibleTestCases, hiddenTestCases])

  const validateTestCase = (testCase, type) => {
    const errors = {}
    if (!testCase.input || testCase.input.trim() === '') {
      errors.input = 'Input is required'
    }
    if (!testCase.output || testCase.output.trim() === '') {
      errors.output = 'Output is required'
    }
    if (type === 'visible' && testCase.explanation && testCase.explanation.trim().length < 10) {
      errors.explanation = 'Explanation should be at least 10 characters'
    }
    return errors
  }

  const updateVisible = (index, field, value) => {
    const updated = [...localVisible]
    updated[index] = { ...updated[index], [field]: value }
    setLocalVisible(updated)
    
    const testErrors = validateTestCase(updated[index], 'visible')
    setErrors(prev => ({
      ...prev,
      visible: { ...prev.visible, [index]: testErrors }
    }))
    
    onVisibleChange(updated)
  }

  const updateHidden = (index, field, value) => {
    const updated = [...localHidden]
    updated[index] = { ...updated[index], [field]: value }
    setLocalHidden(updated)
    
    const testErrors = validateTestCase(updated[index], 'hidden')
    setErrors(prev => ({
      ...prev,
      hidden: { ...prev.hidden, [index]: testErrors }
    }))
    
    onHiddenChange(updated)
  }

  const addVisible = () => {
    const newCase = { input: '', output: '', explanation: '' }
    setLocalVisible([...localVisible, newCase])
    onVisibleChange([...localVisible, newCase])
  }

  const addHidden = () => {
    const newCase = { input: '', output: '' }
    setLocalHidden([...localHidden, newCase])
    onHiddenChange([...localHidden, newCase])
  }

  const removeVisible = (index) => {
    const updated = localVisible.filter((_, i) => i !== index)
    setLocalVisible(updated)
    onVisibleChange(updated)
    setErrors(prev => {
      const newErrors = { ...prev.visible }
      delete newErrors[index]

      const reindexed = {}
      Object.keys(newErrors).forEach(key => {
        const keyNum = parseInt(key)
        if (keyNum > index) {
          reindexed[keyNum - 1] = newErrors[key]
        } else if (keyNum < index) {
          reindexed[keyNum] = newErrors[key]
        }
      })
      return { ...prev, visible: reindexed }
    })
  }

  const removeHidden = (index) => {
    const updated = localHidden.filter((_, i) => i !== index)
    setLocalHidden(updated)
    onHiddenChange(updated)
    setErrors(prev => {
      const newErrors = { ...prev.hidden }
      delete newErrors[index]

      const reindexed = {}
      Object.keys(newErrors).forEach(key => {
        const keyNum = parseInt(key)
        if (keyNum > index) {
          reindexed[keyNum - 1] = newErrors[key]
        } else if (keyNum < index) {
          reindexed[keyNum] = newErrors[key]
        }
      })
      return { ...prev, hidden: reindexed }
    })
  }

  const isTestCaseValid = (testCase, type, index) => {
    const testErrors = errors[type][index] || {}
    return Object.keys(testErrors).length === 0 && 
           testCase.input?.trim() && 
           testCase.output?.trim() &&
           (type === 'hidden' || testCase.explanation?.trim() || true)
  }

  const getValidationStatus = (testCase, type, index) => {
    if (!testCase.input && !testCase.output) return 'empty'
    const valid = isTestCaseValid(testCase, type, index)
    return valid ? 'valid' : 'invalid'
  }

  const handleDragStart = (e, index, type) => {
    setDraggedIndex({ index, type })
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, index, type) => {
    e.preventDefault()
    if (draggedIndex && draggedIndex.type === type) {
      setDragOverIndex({ index, type })
    }
  }

  const handleDrop = (e, dropIndex, type) => {
    e.preventDefault()
    if (!draggedIndex || draggedIndex.type !== type) return
    
    const sourceIndex = draggedIndex.index
    if (sourceIndex === dropIndex) return

    if (type === 'visible') {
      const updated = [...localVisible]
      const [removed] = updated.splice(sourceIndex, 1)
      updated.splice(dropIndex, 0, removed)
      setLocalVisible(updated)
      onVisibleChange(updated)
    } else {
      const updated = [...localHidden]
      const [removed] = updated.splice(sourceIndex, 1)
      updated.splice(dropIndex, 0, removed)
      setLocalHidden(updated)
      onHiddenChange(updated)
    }
    
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const TestCaseCard = ({ testCase, index, type, onUpdate, onRemove, isDragging, dragOver }) => {
    const status = getValidationStatus(testCase, type, index)
    const testErrors = errors[type][index] || {}
    const isValid = status === 'valid'
    const isEmpty = status === 'empty'

    return (
      <div
        draggable
        onDragStart={(e) => handleDragStart(e, index, type)}
        onDragOver={(e) => handleDragOver(e, index, type)}
        onDrop={(e) => handleDrop(e, index, type)}
        onDragEnd={() => {
          setDraggedIndex(null)
          setDragOverIndex(null)
        }}
        className={`
          relative group border-2 rounded-xl p-4 transition-all duration-300
          ${isDragging ? 'opacity-50 scale-95' : ''}
          ${dragOver ? 'border-emerald-400/50 bg-emerald-400/5 scale-105' : ''}
          ${isEmpty ? 'border-white/10 bg-black/20' : ''}
          ${isValid ? 'border-emerald-400/30 bg-emerald-400/5 hover:border-emerald-400/50' : ''}
          ${!isEmpty && !isValid ? 'border-amber-400/30 bg-amber-400/5 hover:border-amber-400/50' : ''}
          hover:shadow-lg hover:shadow-emerald-500/10
        `}
      >
        {}
        <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="w-4 h-4 text-white/30 cursor-move" />
        </div>

        {}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
              ${isEmpty ? 'bg-white/10 text-white/50' : ''}
              ${isValid ? 'bg-emerald-400/20 text-emerald-400 border border-emerald-400/30' : ''}
              ${!isEmpty && !isValid ? 'bg-amber-400/20 text-amber-400 border border-amber-400/30' : ''}
            `}>
              {index + 1}
            </div>
            <span className="text-sm font-medium text-white/70">
              Test Case {index + 1}
            </span>
            {isValid && (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-pulse" />
            )}
            {!isEmpty && !isValid && (
              <AlertCircle className="w-4 h-4 text-amber-400" />
            )}
          </div>
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="p-1.5 rounded-lg hover:bg-rose-400/20 text-rose-400/70 hover:text-rose-400 transition-all group/remove"
          >
            <X className="w-4 h-4 group-hover/remove:rotate-90 transition-transform" />
          </button>
        </div>

        {}
        <div className="mb-3">
          <label className="block text-xs font-medium text-white/60 mb-1.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            Input
            {testErrors.input && (
              <span className="text-rose-400 text-xs ml-1">({testErrors.input})</span>
            )}
          </label>
          <textarea
            rows={2}
            value={testCase.input || ''}
            onChange={(e) => onUpdate(index, 'input', e.target.value)}
            placeholder="Enter test input (e.g., nums = [2,7,11,15], target = 9)"
            className={`
              w-full bg-black/50 border rounded-lg px-3 py-2 text-sm font-mono
              outline-none transition-all resize-none
              ${testErrors.input 
                ? 'border-rose-400/50 focus:border-rose-400' 
                : 'border-white/15 focus:border-blue-400/50'
              }
            `}
          />
        </div>

        {}
        <div className="mb-3">
          <label className="block text-xs font-medium text-white/60 mb-1.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Expected Output
            {testErrors.output && (
              <span className="text-rose-400 text-xs ml-1">({testErrors.output})</span>
            )}
          </label>
          <textarea
            rows={2}
            value={testCase.output || ''}
            onChange={(e) => onUpdate(index, 'output', e.target.value)}
            placeholder="Enter expected output (e.g., [0,1])"
            className={`
              w-full bg-black/50 border rounded-lg px-3 py-2 text-sm font-mono
              outline-none transition-all resize-none
              ${testErrors.output 
                ? 'border-rose-400/50 focus:border-rose-400' 
                : 'border-white/15 focus:border-emerald-400/50'
              }
            `}
          />
        </div>

        {}
        {type === 'visible' && (
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
              Explanation (Optional)
              {testErrors.explanation && (
                <span className="text-amber-400 text-xs ml-1">({testErrors.explanation})</span>
              )}
            </label>
            <textarea
              rows={2}
              value={testCase.explanation || ''}
              onChange={(e) => onUpdate(index, 'explanation', e.target.value)}
              placeholder="Explain why this output is correct..."
              className={`
                w-full bg-black/50 border rounded-lg px-3 py-2 text-sm
                outline-none transition-all resize-none
                ${testErrors.explanation 
                  ? 'border-amber-400/50 focus:border-amber-400' 
                  : 'border-white/15 focus:border-purple-400/50'
                }
              `}
            />
          </div>
        )}

        {}
        {isValid && (
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs text-emerald-400 font-medium">Ready for acceptance</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {}
      {(mode === 'visible' || mode === 'both') && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-400" />
              <h3 className="text-base font-semibold text-white">Visible Test Cases</h3>
              <span className="px-2 py-0.5 rounded-full text-xs bg-blue-400/20 text-blue-400 border border-blue-400/30">
                {localVisible.length}
              </span>
            </div>
            <button
              type="button"
              onClick={addVisible}
              className="px-3 py-1.5 rounded-lg text-sm bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 font-medium transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Add Test Case
            </button>
          </div>
          
          {localVisible.length === 0 ? (
            <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center bg-black/20">
              <Eye className="w-8 h-8 text-white/20 mx-auto mb-2" />
              <p className="text-sm text-white/50 mb-3">No visible test cases yet</p>
              <button
                type="button"
                onClick={addVisible}
                className="px-4 py-2 rounded-lg text-sm bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 transition-all"
              >
                Add Your First Test Case
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {localVisible.map((testCase, index) => (
                <TestCaseCard
                  key={index}
                  testCase={testCase}
                  index={index}
                  type="visible"
                  onUpdate={updateVisible}
                  onRemove={removeVisible}
                  isDragging={draggedIndex?.index === index && draggedIndex?.type === 'visible'}
                  dragOver={dragOverIndex?.index === index && dragOverIndex?.type === 'visible'}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {}
      {(mode === 'hidden' || mode === 'both') && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-purple-400" />
              <h3 className="text-base font-semibold text-white">Hidden Test Cases</h3>
              <span className="px-2 py-0.5 rounded-full text-xs bg-purple-400/20 text-purple-400 border border-purple-400/30">
                {localHidden.length}
              </span>
            </div>
            <button
              type="button"
              onClick={addHidden}
              className="px-3 py-1.5 rounded-lg text-sm bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-400 font-medium transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Add Test Case
            </button>
          </div>
          
          {localHidden.length === 0 ? (
            <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center bg-black/20">
              <EyeOff className="w-8 h-8 text-white/20 mx-auto mb-2" />
              <p className="text-sm text-white/50 mb-3">No hidden test cases yet</p>
              <button
                type="button"
                onClick={addHidden}
                className="px-4 py-2 rounded-lg text-sm bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-400 transition-all"
              >
                Add Your First Test Case
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {localHidden.map((testCase, index) => (
                <TestCaseCard
                  key={index}
                  testCase={testCase}
                  index={index}
                  type="hidden"
                  onUpdate={updateHidden}
                  onRemove={removeHidden}
                  isDragging={draggedIndex?.index === index && draggedIndex?.type === 'hidden'}
                  dragOver={dragOverIndex?.index === index && dragOverIndex?.type === 'hidden'}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {}
      {(mode === 'both') && (
        <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/10">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-white/60">Total Test Cases:</span>
                <span className="font-semibold text-white">
                  {localVisible.length + localHidden.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white/60">Valid:</span>
                <span className="font-semibold text-emerald-400">
                  {localVisible.filter((tc, i) => isTestCaseValid(tc, 'visible', i)).length +
                   localHidden.filter((tc, i) => isTestCaseValid(tc, 'hidden', i)).length}
                </span>
              </div>
            </div>
            {(localVisible.length + localHidden.length) >= 5 && (
              <div className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs font-medium">Great coverage!</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default TestCaseManager
