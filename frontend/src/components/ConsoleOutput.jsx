function ConsoleOutput({ verdict, output, expected }){
  const color = !verdict ? 'text-white/60' : verdict.includes('Accepted') ? 'text-emerald-400' : verdict.includes('Error') || verdict.includes('Wrong') ? 'text-rose-400' : 'text-white/60'
  return (
    <div className="border border-white/20 p-3 rounded-xl bg-white/5 text-white">
      <h3 className="font-semibold text-sm">Result</h3>
      <p className={`mt-2 text-sm font-semibold ${color}`}>{verdict || '----'}</p>
      <h4 className="mt-3 font-medium text-white">Your Output</h4>
      <pre className="mt-1 p-2 bg-black/40 rounded border border-white/10 whitespace-pre-wrap text-sm">{output}</pre>
      <h4 className="mt-3 font-medium text-white">Expected Output</h4>
      <pre className="mt-1 p-2 bg-black/40 rounded border border-white/10 whitespace-pre-wrap text-sm">{expected}</pre>
    </div>
  )
}

export default ConsoleOutput
