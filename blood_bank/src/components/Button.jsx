export default function Button({ variant = 'primary', size = 'base', className = '', children, ...props }) {
  const variantClasses = {
    primary: 'bg-red-600 text-white hover:bg-red-700 hover:scale-105 hover:shadow-md',
    secondary: 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:scale-105 hover:shadow-md',
    outline: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:scale-105 hover:shadow-md',
    ghost: 'bg-transparent text-slate-700 hover:bg-slate-50 hover:scale-105 hover:shadow-md',
    icon: 'h-10 w-10 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:scale-105 hover:shadow-md',
    pill: 'inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold bg-red-600 text-white hover:bg-red-700 hover:scale-105 hover:shadow-md',
  }

  const sizeClasses = {
    base: 'px-4 py-3 text-sm',
    sm: 'px-3 py-2 text-sm',
    lg: 'px-5 py-3 text-base',
    block: 'w-full',
  }

  const variantClass = variantClasses[variant] ?? variantClasses.primary
  const sizeClass = sizeClasses[size] ?? ''

  return (
    <button
      className={`inline-flex items-center justify-center transition-all duration-200 ease-in-out active:scale-95 ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
