import React from 'react';
import { useApp } from '../../context/AppContext';
import { useCommunityHub } from '../../features/community/hooks/useCommunityHub';
import CommunityHeader, { CommunitySectionNav } from '../../features/community/components/CommunityHeader';
import CommunityStats from '../../features/community/components/CommunityStats';
import OfficialAnnouncements from '../../features/community/components/OfficialAnnouncements';
import RecentlyAdded from '../../features/community/components/RecentlyAdded';
import TopProviders from '../../features/community/components/TopProviders';
import PlatformHandbook from '../../features/community/components/PlatformHandbook';
import WorkspaceErrorState from '../ui/WorkspaceErrorState';

export default function CommunityHub() {
  const { isDark, user } = useApp();
  const workspaceRole = user?.role || 'seeker';
  const { data, loading, refreshing, error, refetch } = useCommunityHub();

  if (error && !data) {
    return (
      <div className={`space-y-6 pb-8 ${isDark ? 'text-white' : 'text-ink'}`}>
        <CommunityHeader isDark={isDark} firstName={user?.firstName} />
        <WorkspaceErrorState
          title="Unable to load Community Hub"
          description={error}
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className={`space-y-7 sm:space-y-10 pb-12 sm:pb-16 transition-colors duration-200 ${isDark ? 'text-white' : 'text-ink'}`}>
      {error && data && (
        <div role="status" className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-xs ${isDark ? 'border-amber-900/40 bg-amber-950/20 text-amber-300' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
          <span>Showing the latest loaded community data. Refresh was unsuccessful.</span>
          <button type="button" onClick={refetch} className="font-bold underline underline-offset-2 cursor-pointer">Retry</button>
        </div>
      )}

      {refreshing && data && (
        <p role="status" className="text-right text-[11px] font-medium text-ink-muted dark:text-ink-muted">
          Updating community data…
        </p>
      )}

      {/* Stage 1: Civic Masthead & Overview Stats Strip */}
      <div className="space-y-5">
        <CommunityHeader isDark={isDark} firstName={user?.firstName} />

        <section id="community-overview" className="scroll-mt-28" aria-label="Community overview">
          <CommunityStats
            stats={data?.stats || null}
            loading={loading && !data}
            isDark={isDark}
          />
        </section>
      </div>

      {/* Sticky Town Square Navigator */}
      <CommunitySectionNav isDark={isDark} />

      {/* Stage 2: Highlighted Official Municipal Notices (First Thing Residents Look For) */}
      <OfficialAnnouncements
        announcements={data?.announcements || []}
        loading={loading && !data}
        isDark={isDark}
      />

      {/* Stage 3: The Weekly Podium Arena (Top 3 Providers Bar Graph) */}
      <TopProviders
        providers={data?.leaderboard || []}
        loading={loading && !data}
        isDark={isDark}
        workspaceRole={workspaceRole}
        currentUserId={user?.id}
        leaderboardPeriod={data?.leaderboardPeriod}
      />

      {/* Stage 4: Marketplace Discoveries (Recently Added Services & Categories) */}
      <RecentlyAdded
        categories={data?.recentCategories || []}
        services={data?.recentServices || []}
        loading={loading && !data}
        isDark={isDark}
      />

      {/* Stage 5: Using ServiceHub Platform Handbook & Rules */}
      <PlatformHandbook isDark={isDark} />
    </div>
  );
}
