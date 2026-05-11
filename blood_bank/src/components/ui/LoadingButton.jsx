import { motion } from 'framer-motion';
import LoadingSpinner from '../LoadingSpinner.jsx';

export default function LoadingButton({ 
  children, 
  loading, 
  loadingText = "Processing...", 
  onClick, 
  type = "button", 
  className = "", 
  disabled = false,
  variant = "primary"
}) {
  const variants = {
    primary: "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/30",
    secondary: "bg-slate-900 text-white hover:bg-black dark:bg-white dark:text-slate-900 shadow-xl",
    outline: "border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-gray-700 dark:text-gray-300"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      className={`relative inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-4 text-sm font-bold transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {loading ? (
        <>
          <LoadingSpinner size="xs" color="text-current" />
          <span className="animate-pulse">{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
