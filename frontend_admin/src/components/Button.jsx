function Button({ children, variant = 'default', className = '', ...props }){
  const base = 'px-3 py-2 rounded-xl text-sm';
  const styles = variant === 'primary'
    ? 'bg-white text-black'
    : variant === 'outline'
    ? 'border border-white/15'
    : 'bg-white/10 hover:bg-white/15 border border-white/10';
  return (
    <button className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </button>
  )
}

export default Button
