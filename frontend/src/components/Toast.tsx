import React from 'react'
import { CheckCircle2, AlertCircle, Info } from 'lucide-react'
import type { ToastMessage } from '../types'

interface ToastContainerProps {
  toasts: ToastMessage[]
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts }) => {
  if (toasts.length === 0) return null

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="toast">
          {t.type === 'success' && <CheckCircle2 size={16} color="#16a34a" />}
          {t.type === 'error' && <AlertCircle size={16} color="#dc2626" />}
          {t.type === 'info' && <Info size={16} color="#2563eb" />}
          <span>{t.text}</span>
        </div>
      ))}
    </div>
  )
}
