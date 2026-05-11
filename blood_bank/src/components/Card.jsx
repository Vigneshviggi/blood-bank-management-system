export default function Card({ title, subtitle, className = '', children, footer }) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-sm transition duration-200 ease-in-out hover:-translate-y-1 hover:shadow-lg sm:rounded-3xl sm:p-5 dark:border-gray-700 dark:bg-gray-800/95 ${className}`}>
      {(title || subtitle) && (
        <div className="mb-3 flex flex-col gap-0.5 sm:mb-4 sm:gap-1">
          {title && <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate sm:text-lg">{title}</h3>}
          {subtitle && <p className="text-xs text-slate-500 dark:text-gray-400 line-clamp-2 sm:text-sm">{subtitle}</p>}
        </div>
      )}
      {children}
      {footer && <div className="mt-4 border-t border-slate-200 pt-3 text-xs text-slate-500 dark:border-gray-700 dark:text-gray-400 sm:mt-6 sm:pt-4 sm:text-sm">{footer}</div>}
    </section>
  )
}
