import React from 'react';
import { ShieldCheck, Users, CheckCircle2, Tag, AlertCircle, RefreshCw } from 'lucide-react';
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
            ? 'bg-red-955/20 border-red-900/30 text-red-400'
            : 'bg-red-50 border-red-200 text-red-600'
        }`}
      >
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error || 'Unable to load community statistics.'}</span>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg border font-bold text-[10px] hover:opacity-80 active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
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
      iconColor: isDark ? 'text-blue-400' : 'text-blue-600',
      iconBg: isDark ? 'bg-blue-950/30' : 'bg-blue-50',
    },
    {
      label: 'Active Providers',
      value: stats.activeProviders.toLocaleString(),
      icon: Users,
      iconColor: isDark ? 'text-emerald-400' : 'text-emerald-600',
      iconBg: isDark ? 'bg-emerald-950/30' : 'bg-emerald-50',
    },
    {
      label: 'Services Completed',
      value: stats.totalCompleted.toLocaleString(),
      icon: CheckCircle2,
      iconColor: isDark ? 'text-amber-400' : 'text-amber-600',
      iconBg: isDark ? 'bg-amber-950/30' : 'bg-amber-50',
    },
    {
      label: 'Active Service Listings',
      value: stats.activeListings.toLocaleString(),
      icon: Tag,
      iconColor: isDark ? 'text-orange-400' : 'text-orange-600',
      iconBg: isDark ? 'bg-orange-950/30' : 'bg-orange-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
      {statItems.map((item) => (
        <div
          key={item.label}
          className={`rounded-2xl p-4 border flex items-center space-x-3.5 shadow-sm transition-all duration-200 ${
            isDark
              ? 'bg-[#22211e] border-neutral-800/80 text-[#f2efe9]'
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.iconBg} ${item.iconColor}`}
          >
            <item.icon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-extrabold tracking-tight leading-tight">
              {item.value}
            </p>
            <p
              className={`text-[10px] font-bold uppercase tracking-wider truncate ${
                isDark ? 'text-[#b4b0a9]' : 'text-slate-500'
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
