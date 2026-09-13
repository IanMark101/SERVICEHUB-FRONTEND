import React from 'react';
import { useApp } from '../../context/AppContext';
import { useCommunityHub } from '../../features/community/hooks/useCommunityHub';
import CommunityHeader from '../../features/community/components/CommunityHeader';
import CommunityStats from '../../features/community/components/CommunityStats';
import CommunityUpdates from '../../features/community/components/CommunityUpdates';
import RecentlyAdded from '../../features/community/components/RecentlyAdded';
import TopProviders from '../../features/community/components/TopProviders';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function CommunityHub() {
  const { isDark, user } = useApp();
  const workspaceRole = user?.role || 'seeker';
  const { data, loading, refreshing, error, refetch } = useCommunityHub();

  if (error && !data) {
    return (
      <div className={`space-y-6 pb-8 ${isDark ? 'text-[#f2efe9]' : 'text-slate-800'}`}>
        <CommunityHeader isDark={isDark} />
        <div role="alert" className={`rounded-2xl p-6 border text-center flex flex-col items-center justify-center space-y-3 shadow-sm ${isDark ? 'bg-red-950/20 border-red-900/30 text-red-400' : 'bg-red-50 border-red-200 text-red-700'}`}>
          <AlertCircle className="w-8 h-8" aria-hidden="true" />
          <div className="space-y-1"><h3 className="text-sm font-extrabold">Unable to load Community Hub</h3><p className="text-xs max-w-md font-medium opacity-90">{error}</p></div>
          <button onClick={refetch} className="flex items-center space-x-1.5 px-4 py-2 rounded-xl font-bold text-xs bg-red-600 hover:bg-red-700 text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"><RefreshCw className="w-3.5 h-3.5" aria-hidden="true" /><span>Try again</span></button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 pb-8 transition-colors duration-200 ${isDark ? 'text-[#f2efe9]' : 'text-slate-800'}`}>

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

      <CommunityUpdates announcements={data?.announcements || []} loading={loading && !data} isDark={isDark} />

      <RecentlyAdded categories={data?.recentCategories || []} services={data?.recentServices || []} loading={loading && !data} isDark={isDark} />

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
