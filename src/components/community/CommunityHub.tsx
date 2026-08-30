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
  const { data, loading, error, refetch, communityUpdates } = useCommunityHub(workspaceRole);

  return (
    <div className={`space-y-6 select-none transition-colors duration-200 ${isDark ? 'text-[#f2efe9]' : 'text-slate-800'}`}>

      {/* A. Community Hub Header */}
      <CommunityHeader
        isDark={isDark}
        workspaceRole={workspaceRole}
      />

      {/* Global Error Alert (if entire fetch failed) */}
      {error && !data && (
        <div
          className={`rounded-2xl p-6 border text-center flex flex-col items-center justify-center space-y-3 shadow-sm ${
            isDark ? 'bg-red-955/20 border-red-900/30 text-red-400' : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          <AlertCircle className="w-8 h-8 opacity-90" />
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold">Unable to Load Community Hub</h3>
            <p className="text-xs max-w-md font-medium opacity-90">
              {error}
            </p>
          </div>
          <button
            onClick={refetch}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl font-bold text-xs bg-red-600 hover:bg-red-700 text-white transition-all active:scale-95 cursor-pointer shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* B. Community Statistics (Supporting / Compact) */}
      <CommunityStats
        stats={data?.stats || null}
        loading={loading}
        error={error}
        onRetry={refetch}
        isDark={isDark}
      />

      {/* C. Community Updates (Main Feature Section) */}
      <CommunityUpdates
        updates={communityUpdates}
        loading={loading}
        isDark={isDark}
      />

      {/* D. Recently Added (New Categories & New Services) */}
      <RecentlyAdded
        categories={data?.recentCategories || []}
        services={data?.recentServices || []}
        loading={loading}
        isDark={isDark}
        workspaceRole={workspaceRole}
      />

      {/* E. Top Local Providers (Marketplace Visibility Compliant) */}
      <TopProviders
        providers={data?.leaderboard || []}
        loading={loading}
        isDark={isDark}
        workspaceRole={workspaceRole}
      />

    </div>
  );
}
