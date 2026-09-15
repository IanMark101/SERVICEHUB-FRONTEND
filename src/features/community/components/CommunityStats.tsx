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
    },
    {
      label: 'Active Providers',
      value: stats.activeProviders.toLocaleString(),
      icon: UsersThree,
    },
    {
      label: 'Services Completed',
      value: stats.totalCompleted.toLocaleString(),
      icon: SealCheck,
    },
    {
      label: 'Active Service Listings',
      value: stats.activeListings.toLocaleString(),
      icon: Tag,
    },
  ];

  return (
    <div className={`grid overflow-hidden rounded-2xl border sm:grid-cols-2 lg:grid-cols-4 ${isDark ? 'border-white/10 bg-[#201f1c]' : 'border-black/8 bg-[#fffdfa]'}`} aria-label="Community statistics">
      {statItems.map((item) => (
        <div
          key={item.label}
          className={`flex min-h-24 items-center gap-3 border-b p-5 last:border-b-0 sm:border-r sm:[&:nth-child(2n)]:border-r-0 lg:border-b-0 lg:[&:nth-child(2n)]:border-r lg:last:border-r-0 ${isDark ? 'border-white/10 text-[#f5f4f2]' : 'border-black/8 text-[#171716]'}`}
        >
          <div
            className={`grid size-9 shrink-0 place-items-center rounded-xl ${isDark ? 'bg-white/[0.06] text-[#e9a58c]' : 'bg-[#f5ebe6] text-[#c86544]'}`}
          >
            <item.icon className="size-4.5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-xl font-semibold tabular-nums tracking-[-0.03em]">
              {item.value}
            </p>
            <p
              className={`mt-0.5 text-xs leading-4 ${
                isDark ? 'text-[#aaa59d]' : 'text-[#6f6a64]'
              }`}
            >
              {item.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
