import React from 'react';

function skeletonColors(isDark: boolean) {
  return {
    surface: isDark ? 'border-white/10 bg-[#201f1c]' : 'border-black/8 bg-[#fffdfa]',
    line: isDark ? 'bg-white/10' : 'bg-[#e8e3dd]',
    divider: isDark ? 'border-white/10' : 'border-black/8',
  };
}

export function StatsSkeleton({ isDark = false }: { isDark?: boolean }) {
  const colors = skeletonColors(isDark);
  return (
    <div className={`grid overflow-hidden rounded-2xl border sm:grid-cols-2 lg:grid-cols-4 ${colors.surface}`} aria-label="Loading community statistics" aria-busy="true">
      {[1, 2, 3, 4].map((index) => (
        <div key={index} className={`flex min-h-24 items-center gap-3 border-b p-5 last:border-b-0 sm:border-r sm:[&:nth-child(2n)]:border-r-0 lg:border-b-0 lg:[&:nth-child(2n)]:border-r lg:last:border-r-0 ${colors.divider}`}>
          <div className={`size-9 shrink-0 animate-pulse rounded-xl ${colors.line}`} />
          <div className="space-y-2">
            <div className={`h-5 w-14 animate-pulse rounded ${colors.line}`} />
            <div className={`h-3 w-28 animate-pulse rounded ${colors.line}`} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function UpdatesSkeleton({ isDark = false }: { isDark?: boolean }) {
  const colors = skeletonColors(isDark);
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]" aria-label="Loading community updates" aria-busy="true">
      {[1, 2].map((index) => (
        <div key={index} className={`space-y-5 rounded-2xl border p-6 ${colors.surface}`}>
          <div className={`h-4 w-40 animate-pulse rounded ${colors.line}`} />
          {[1, 2, 3].map((row) => (
            <div key={row} className={`space-y-2 border-t pt-4 ${colors.divider}`}>
              <div className={`h-3 w-2/3 animate-pulse rounded ${colors.line}`} />
              <div className={`h-3 w-full animate-pulse rounded ${colors.line}`} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function RecentGridSkeleton({ isDark = false }: { isDark?: boolean }) {
  const colors = skeletonColors(isDark);
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]" aria-label="Loading recently approved services" aria-busy="true">
      {[1, 2].map((index) => (
        <div key={index} className={`space-y-5 rounded-2xl border p-6 ${colors.surface}`}>
          <div className={`h-4 w-32 animate-pulse rounded ${colors.line}`} />
          {[1, 2, 3].map((row) => (
            <div key={row} className={`flex gap-3 border-t pt-4 ${colors.divider}`}>
              <div className={`size-9 shrink-0 animate-pulse rounded-xl ${colors.line}`} />
              <div className="flex-1 space-y-2">
                <div className={`h-3 w-3/4 animate-pulse rounded ${colors.line}`} />
                <div className={`h-3 w-1/2 animate-pulse rounded ${colors.line}`} />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function TopProvidersSkeleton({ isDark = false }: { isDark?: boolean }) {
  const colors = skeletonColors(isDark);
  return (
    <div className={`rounded-2xl border p-6 ${colors.surface}`} aria-label="Loading provider recognition" aria-busy="true">
      <div className="grid md:grid-cols-3">
        {[1, 2, 3].map((index) => (
          <div key={index} className={`space-y-4 border-b py-4 md:border-b-0 md:border-r md:px-5 md:last:border-r-0 ${colors.divider}`}>
            <div className={`h-3 w-14 animate-pulse rounded ${colors.line}`} />
            <div className="flex items-center gap-3">
              <div className={`size-11 animate-pulse rounded-full ${colors.line}`} />
              <div className="space-y-2">
                <div className={`h-3 w-28 animate-pulse rounded ${colors.line}`} />
                <div className={`h-3 w-20 animate-pulse rounded ${colors.line}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
