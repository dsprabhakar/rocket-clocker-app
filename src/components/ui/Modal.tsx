import { ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  const sizeClass = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl' }[size]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div className={`bg-white rounded-2xl shadow-xl w-full ${sizeClass} max-h-[90dvh] flex flex-col`} onClick={(e) => e.stopPropagation()}>
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
              <X size={18} />
            </button>
          </div>
        )}
        <div className="overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  )
}
