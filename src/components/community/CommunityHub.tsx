import React from 'react';
import { useApp } from '../../context/AppContext';
import { useCommunityHub } from '../../features/community/hooks/useCommunityHub';
import CommunityHeader from '../../features/community/components/CommunityHeader';
import CommunityStats from '../../features/community/components/CommunityStats';
import CommunityUpdates from '../../features/community/components/CommunityUpdates';
import RecentlyAdded from '../../features/community/components/RecentlyAdded';
import TopProviders from '../../features/community/components/TopProviders';
import WorkspaceErrorState from '../ui/WorkspaceErrorState';

export default function CommunityHub() {
  const { isDark, user } = useApp();
  const workspaceRole = user?.role || 'seeker';
  const { data, loading, refreshing, error, refetch } = useCommunityHub();

  if (error && !data) {
    return (
      <div className={`space-y-8 pb-10 ${isDark ? 'text-[#f5f4f2]' : 'text-[#171716]'}`}>
        <CommunityHeader isDark={isDark} />
        <WorkspaceErrorState
          title="Unable to load Community Hub"
          description={error}
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className={`space-y-9 pb-10 transition-colors duration-200 ${isDark ? 'text-[#f5f4f2]' : 'text-[#171716]'}`}>

      {/* A. Community Hub Header */}
      <CommunityHeader isDark={isDark} />

      {error && data && <div role="status" className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-xs ${isDark ? 'border-amber-900/40 bg-amber-950/20 text-amber-300' : 'border-amber-200 bg-amber-50 text-amber-800'}`}><span>Showing the latest loaded community data. Refresh was unsuccessful.</span><button type="button" onClick={refetch} className="font-bold underline underline-offset-2">Retry</button></div>}
      {refreshing && data && <p role="status" className="text-right text-[11px] font-medium text-slate-500 dark:text-neutral-400">Updating community data…</p>}

      {/* B. Community Statistics (Supporting / Compact) */}
      <CommunityStats
        stats={data?.stats || null}
        loading={loading && !data}
        isDark={isDark}
      />

      <RecentlyAdded categories={data?.recentCategories || []} services={data?.recentServices || []} loading={loading && !data} isDark={isDark} />

      <CommunityUpdates announcements={data?.announcements || []} loading={loading && !data} isDark={isDark} />

      {/* E. Top Local Providers (Marketplace Visibility Compliant) */}
      <TopProviders
        providers={data?.leaderboard || []}
        loading={loading && !data}
        isDark={isDark}
        workspaceRole={workspaceRole}
        currentUserId={user?.id}
        leaderboardPeriod={data?.leaderboardPeriod}
      />

    </div>
  );
}
