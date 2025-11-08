function TestCasePanel({ visibleTestCases=[] }){
  return (
    <div className="border border-white/20 p-3 rounded-xl bg-white/5 text-white">
      <h3 className="font-semibold text-sm">Example</h3>
      {visibleTestCases.length > 0 ? (
        <pre className="mt-2 p-2 bg-black/40 rounded border border-white/10 whitespace-pre-wrap text-sm">Input:\n{visibleTestCases[0].input}\n\nOutput:\n{visibleTestCases[0].output}</pre>
      ) : (
        <div className="text-white/60 text-sm mt-2">No sample testcase available.</div>
      )}
    </div>
  )
}

export default TestCasePanel
