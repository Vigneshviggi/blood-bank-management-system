import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext()

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, duration)
    }

    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 sm:bottom-6 sm:right-6 pointer-events-none">
        {toasts.map(toast => (
          <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

function Toast({ id, message, type, onClose }) {
  const typeStyles = {
    success: 'bg-green-50 border-green-200 text-green-900',
    error: 'bg-red-50 border-red-200 text-red-900',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    info: 'bg-blue-50 border-blue-200 text-blue-900'
  }

  const iconStyles = {
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600'
  }

  const icons = {
    success: <path d="M9 12l2 2 4-4" />,
    error: <path d="M12 8v4m0 4v.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />,
    warning: <path d="M12 8v4m0 4v.01M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20Z" />,
    info: <circle cx="12" cy="12" r="10" />,
  }

  return (
    <div
      className={`pointer-events-auto rounded-lg border px-4 py-3 shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-right-4 sm:px-5 sm:py-4 ${typeStyles[type]}`}
    >
      <div className="flex items-start gap-3">
        <svg className={`h-5 w-5 shrink-0 mt-0.5 ${iconStyles[type]}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {icons[type]}
        </svg>
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 text-opacity-70 hover:text-opacity-100 transition"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
