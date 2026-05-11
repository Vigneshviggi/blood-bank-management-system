import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner.jsx';

export default function FullScreenLoader({ isLoading, message = 'Initializing System...' }) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/60 backdrop-blur-xl dark:bg-gray-950/60"
        >
          <div className="relative flex flex-col items-center">
            {/* Branding Background Blur */}
            <div className="absolute -top-24 h-48 w-48 rounded-full bg-red-500/10 blur-[80px]" />
            
            <LoadingSpinner size="xl" />
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-8 text-center"
            >
              <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">LifeLink</h2>
              <p className="mt-2 text-sm font-bold uppercase tracking-[0.3em] text-red-600">{message}</p>
              <p className="mt-4 text-xs font-medium text-slate-400 dark:text-gray-500 italic">
                Connecting donors, hospitals, and lives.
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
