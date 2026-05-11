import { motion } from 'framer-motion';
import LoadingSpinner from '../LoadingSpinner.jsx';


export const Skeleton = ({ className }) => (
  <div className={`animate-pulse rounded-2xl bg-slate-200 dark:bg-gray-800 ${className}`} />
);

export const CardSkeleton = () => (
  <div className="relative rounded-[2rem] border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/50 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none overflow-hidden">
    <div className="absolute inset-0 flex items-center justify-center bg-white/10 dark:bg-gray-950/10 backdrop-blur-[2px] z-10">
      <LoadingSpinner size="sm" />
    </div>
    <div className="opacity-40">
      <Skeleton className="h-4 w-24 mb-4" />
      <Skeleton className="h-10 w-16 mb-6" />
      <Skeleton className="h-4 w-full" />
    </div>
  </div>
);


export const TableSkeleton = ({ rows = 5 }) => (
  <div className="relative w-full space-y-4">
    <div className="absolute inset-0 flex items-center justify-center bg-white/10 dark:bg-gray-950/10 backdrop-blur-[1px] z-10 pt-16">
      <LoadingSpinner size="md" label="Fetching data..." />
    </div>
    <div className="opacity-40">
      <div className="flex gap-4 px-8 py-4 border-b border-slate-50 dark:border-gray-800">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-4 flex-1" />)}
      </div>
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-8 py-6">
          <Skeleton className="h-12 w-12 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-24 rounded-xl" />
        </div>
      ))}
    </div>
  </div>
);


export const CampSkeleton = () => (
  <div className="relative rounded-[2.5rem] border border-slate-100 bg-white shadow-xl shadow-slate-200/50 dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
    <div className="absolute inset-0 flex items-center justify-center bg-white/10 dark:bg-gray-950/10 backdrop-blur-[2px] z-10">
      <LoadingSpinner size="md" />
    </div>
    <div className="opacity-40">
      <Skeleton className="h-48 w-full rounded-t-[2.5rem]" />
      <div className="p-6 space-y-4">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-6 w-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="pt-4 border-t border-slate-50 dark:border-gray-800">
          <Skeleton className="h-2 w-full" />
        </div>
      </div>
    </div>
  </div>
);

