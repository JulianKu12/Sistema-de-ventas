import { useEffect } from 'react'

function Modal({ open, onClose, title, children, footer }) {
  useEffect(() => {
    if (!open) return
    const manejarTecla = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', manejarTecla)
    return () => window.removeEventListener('keydown', manejarTecla)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md rounded-3xl bg-card p-6 shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h2 className="mb-4 text-xl font-bold text-ink">{title}</h2>}
        {children}
        {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  )
}

export default Modal
