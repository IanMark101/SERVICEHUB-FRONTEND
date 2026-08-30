import React from 'react';

export function StatsSkeleton({ isDark = false }: { isDark?: boolean }) {
  const shimmer = isDark ? 'bg-neutral-800 animate-pulse' : 'bg-slate-200 animate-pulse';
  const card = isDark ? 'bg-[#22211e] border-neutral-800/80' : 'bg-white border-slate-200';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className={`rounded-2xl p-4 border flex items-center space-x-3.5 shadow-sm ${card}`}>
          <div className={`w-10 h-10 rounded-xl flex-shrink-0 ${shimmer}`} />
          <div className="space-y-1.5 flex-1">
            <div className={`h-5 w-16 rounded-md ${shimmer}`} />
            <div className={`h-3 w-24 rounded-md ${shimmer}`} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function UpdatesSkeleton({ isDark = false }: { isDark?: boolean }) {
  const shimmer = isDark ? 'bg-neutral-800 animate-pulse' : 'bg-slate-200 animate-pulse';
  const card = isDark ? 'bg-[#22211e] border-neutral-800/80' : 'bg-white border-slate-200';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className={`rounded-2xl p-5 border space-y-3.5 shadow-sm ${card}`}>
          <div className="flex justify-between items-center">
            <div className={`h-4 w-24 rounded-full ${shimmer}`} />
            <div className={`h-3 w-16 rounded-md ${shimmer}`} />
          </div>
          <div className={`h-4 w-3/4 rounded-md ${shimmer}`} />
          <div className="space-y-1.5">
            <div className={`h-3 w-full rounded-md ${shimmer}`} />
            <div className={`h-3 w-5/6 rounded-md ${shimmer}`} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function RecentGridSkeleton({ isDark = false }: { isDark?: boolean }) {
  const shimmer = isDark ? 'bg-neutral-800 animate-pulse' : 'bg-slate-200 animate-pulse';
  const card = isDark ? 'bg-[#22211e] border-neutral-800/80' : 'bg-white border-slate-200';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
      {[1, 2, 3].map((i) => (
        <div key={i} className={`rounded-2xl p-4 border space-y-3 shadow-sm ${card}`}>
          <div className="flex justify-between items-center">
            <div className={`h-4 w-20 rounded-md ${shimmer}`} />
            <div className={`h-4 w-16 rounded-md ${shimmer}`} />
          </div>
          <div className={`h-4 w-40 rounded-md ${shimmer}`} />
          <div className="flex items-center space-x-2 pt-1">
            <div className={`w-6 h-6 rounded-full ${shimmer}`} />
            <div className={`h-3 w-28 rounded-md ${shimmer}`} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TopProvidersSkeleton({ isDark = false }: { isDark?: boolean }) {
  const shimmer = isDark ? 'bg-neutral-800 animate-pulse' : 'bg-slate-200 animate-pulse';
  const card = isDark ? 'bg-[#22211e] border-neutral-800/80' : 'bg-white border-slate-200';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className={`rounded-2xl p-4 border space-y-3 shadow-sm ${card}`}>
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full ${shimmer}`} />
            <div className="space-y-1.5 flex-1">
              <div className={`h-4 w-24 rounded-md ${shimmer}`} />
              <div className={`h-3 w-16 rounded-md ${shimmer}`} />
            </div>
          </div>
          <div className="flex justify-between items-center pt-2">
            <div className={`h-3 w-20 rounded-md ${shimmer}`} />
            <div className={`h-3 w-12 rounded-md ${shimmer}`} />
          </div>
        </div>
      ))}
    </div>
  );
}
