import { useEffect } from 'react'

function Modal({ open, title, children, onClose, footer }){
  useEffect(() => {
    const onEsc = (e) => { if (e.key === 'Escape') onClose?.() }
    if (open) window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-black p-4">
        {title && <div className="text-lg font-semibold mb-2">{title}</div>}
        <div>{children}</div>
        {footer && <div className="mt-4 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  )
}

export default Modal
