function InputField({ label, error, as = 'input', className = '', ...props }){
  const Cmp = as
  return (
    <label className="block text-sm">
      {label}
      <Cmp className={`w-full mt-1 bg-black border border-white/15 rounded px-3 py-2 ${className}`} {...props} />
      {error && <div className="text-xs text-red-400 mt-1">{error}</div>}
    </label>
  )
}

export default InputField
