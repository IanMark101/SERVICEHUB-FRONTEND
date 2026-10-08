import React from 'react';
import { ShieldCheck, UsersThree, SealCheck, Tag, Warning, ArrowClockwise } from '@phosphor-icons/react';
import { CommunityStatsData } from '../types/community.types';
import { StatsSkeleton } from './CommunitySkeletons';

interface CommunityStatsProps {
  stats: CommunityStatsData | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  isDark?: boolean;
}

export default function CommunityStats({
  stats,
  loading = false,
  error = null,
  onRetry,
  isDark = false,
}: CommunityStatsProps) {
  if (loading) {
    return <StatsSkeleton isDark={isDark} />;
  }

  if (error || !stats) {
    return (
      <div
        className={`rounded-2xl p-4 border flex items-center justify-between text-xs font-semibold ${
          isDark
            ? 'bg-red-950/20 border-red-900/30 text-red-400'
            : 'bg-red-50 border-red-200 text-red-600'
        }`}
      >
        <div className="flex items-center space-x-2">
          <Warning className="w-4 h-4" />
          <span>{error || 'Unable to load community statistics.'}</span>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg border font-bold text-[10px] hover:opacity-80 active:scale-95 cursor-pointer"
          >
            <ArrowClockwise className="w-3 h-3" />
            <span>Try Again</span>
          </button>
        )}
      </div>
    );
  }

  const statItems = [
    {
      label: 'Verified Residents',
      value: stats.verifiedUsers.toLocaleString(),
      icon: ShieldCheck,
      iconTone: isDark ? 'bg-orange-500/15 text-orange-400' : 'bg-orange-50 text-orange-600',
    },
    {
      label: 'Active Providers',
      value: stats.activeProviders.toLocaleString(),
      icon: UsersThree,
      iconTone: isDark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Services Completed',
      value: stats.totalCompleted.toLocaleString(),
      icon: SealCheck,
      iconTone: isDark ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Active Service Listings',
      value: stats.activeListings.toLocaleString(),
      icon: Tag,
      iconTone: isDark ? 'bg-blue-500/15 text-blue-400' : 'bg-blue-50 text-blue-600',
    },
  ];

  return (
    <div
      className={`overflow-hidden rounded-3xl border transition-all ${
        isDark
          ? 'bg-charcoal-inset border-neutral-800/90 shadow-xl shadow-black/40'
          : 'bg-white border-slate-200/90 shadow-sm shadow-slate-900/5'
      }`}
      aria-label="Community statistics"
    >
      <div className="grid grid-cols-2 divide-y divide-slate-100 dark:divide-neutral-800/80 sm:grid-cols-4 sm:divide-y-0">
        {statItems.map((item, index) => {
          const isRightColOnMobile = index % 2 === 1;
          const isLastColOnDesktop = index === 3;
          return (
            <div
              key={item.label}
              className={`flex min-w-0 flex-col justify-between p-3.5 sm:p-5 lg:p-6 transition-colors hover:bg-slate-50/50 dark:hover:bg-charcoal/20 ${
                isRightColOnMobile ? '' : 'border-r border-slate-100 dark:border-neutral-800/80'
              } ${
                isLastColOnDesktop ? '' : 'sm:border-r border-slate-100 dark:border-neutral-800/80'
              }`}
            >
              <div className="flex items-start justify-between gap-1.5 sm:items-center">
                <span className={`text-[11px] sm:text-xs lg:text-[13px] font-bold leading-tight line-clamp-2 min-h-[1.75rem] sm:min-h-0 ${isDark ? 'text-ink-subtle' : 'text-ink-muted'}`}>
                  {item.label}
                </span>
                <span className={`grid size-7 sm:size-8 shrink-0 place-items-center rounded-xl ${item.iconTone}`}>
                  <item.icon size={15} weight="duotone" aria-hidden="true" />
                </span>
              </div>
              <p className={`mt-2 sm:mt-3 text-lg sm:text-2xl lg:text-3xl font-black leading-none tabular-nums tracking-tight ${isDark ? 'text-white' : 'text-ink'}`}>
                {item.value}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
