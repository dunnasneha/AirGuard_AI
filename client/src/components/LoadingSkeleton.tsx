import React from 'react';

export const LoadingSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-1/3"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        ))}
      </div>
      <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full"></div>
    </div>
  );
};
