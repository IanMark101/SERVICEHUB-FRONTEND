import React from 'react';
import Skeleton from './Skeleton';

export function ServiceListingSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-[22px] p-5 border border-slate-200 dark:border-neutral-800/90 bg-white dark:bg-[#22211e] flex flex-col justify-between space-y-4 shadow-sm"
        >
          <div className="space-y-3.5">
            {/* Header: Provider Avatar + Info */}
            <div className="flex items-center space-x-3">
              <Skeleton variant="circular" className="w-10 h-10 flex-shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-2.5 w-16" />
              </div>
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>

            {/* Category tag */}
            <Skeleton className="h-4 w-20 rounded-md" />

            {/* Title & Description */}
            <div className="space-y-2 pt-1">
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/6" />
            </div>
          </div>

          {/* Bottom section: Price & Action */}
          <div className="pt-3 border-t border-slate-100 dark:border-neutral-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function JobRequestSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-[24px] p-5 border border-slate-200 dark:border-neutral-800/80 bg-white dark:bg-[#22211e] flex flex-col justify-between shadow-sm"
        >
          <div>
            {/* Top Seeker info */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <Skeleton variant="circular" className="w-10 h-10 flex-shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="h-2.5 w-14 rounded-md" />
                </div>
              </div>
              <div className="flex flex-col items-end space-y-1">
                <Skeleton className="h-2.5 w-16" />
                <Skeleton className="h-2.5 w-20" />
              </div>
            </div>

            {/* Category & Urgency Badges */}
            <div className="mt-4 flex items-center gap-2">
              <Skeleton className="h-5 w-20 rounded-lg" />
              <Skeleton className="h-5 w-28 rounded-lg" />
            </div>

            {/* Title & Description */}
            <div className="mt-3 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>

          <div className="mt-4">
            {/* Divider */}
            <div className="border-t border-slate-100 dark:border-neutral-800/80 my-3.5" />

            {/* Budget & Escrow */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-2.5 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-5 w-24 rounded-md" />
            </div>

            {/* Payment Badges */}
            <div className="mt-3 flex items-center gap-2">
              <Skeleton className="h-5 w-20 rounded-lg" />
              <Skeleton className="h-5 w-24 rounded-lg" />
            </div>

            {/* Action Button */}
            <div className="mt-3.5">
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ActivityItemSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-[22px] p-5 border border-slate-200 dark:border-neutral-800/90 bg-white dark:bg-[#22211e] space-y-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Skeleton variant="circular" className="w-10 h-10" />
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-2.5 w-20" />
              </div>
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <Skeleton className="h-1.5 w-full rounded-full" />
          <div className="flex items-center justify-between pt-2">
            <Skeleton className="h-3 w-36" />
            <Skeleton className="h-8 w-24 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}
