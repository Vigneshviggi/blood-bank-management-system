import { motion } from 'framer-motion';

export default function LoadingSpinner({ size = 'md', color = 'text-red-600', label = null }) {
  const sizes = {
    xs: 'h-4 w-4',
    sm: 'h-8 w-8',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
    xl: 'h-32 w-32'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <div className={`relative ${sizes[size]}`}>
        {/* Pulsing Outer Ring */}
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 rounded-full bg-red-500 blur-2xl"
        />

        {/* Heartbeat Animation */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1, 1.3, 1],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            times: [0, 0.1, 0.2, 0.4, 0.8],
            ease: "easeInOut"
          }}
          className="relative flex h-full w-full items-center justify-center"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`h-full w-full ${color}`}
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="currentColor" fillOpacity="0.2" />
            
            {/* Heartbeat Line */}
            <motion.path
              d="M3.5 12h2.5l2-5 3 10 3-12 2 7h4.5"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "linear"
              }}
              stroke="white"
              strokeWidth="2"
            />
          </svg>
        </motion.div>
      </div>

      {label && (
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 dark:text-gray-400"
        >
          {label}
        </motion.p>
      )}
    </div>
  );
}

