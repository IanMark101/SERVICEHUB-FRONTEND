import React from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, UsersThree } from '@phosphor-icons/react';
import { TopProvider } from '../types/community.types';
import { TopProvidersSkeleton } from './CommunitySkeletons';
import CommunityEmptyState from './CommunityEmptyState';
import SteppedPodiumGraph from './SteppedPodiumGraph';

interface TopProvidersProps {
  providers: TopProvider[];
  loading?: boolean;
  isDark?: boolean;
  workspaceRole?: 'seeker' | 'provider' | 'admin';
  currentUserId?: string;
  leaderboardPeriod?: { start: string; end: string };
}

export default function TopProviders({
  providers = [],
  loading = false,
  isDark = false,
  currentUserId,
  leaderboardPeriod,
}: TopProvidersProps) {
  const router = useRouter();

  if (loading) {
    return (
      <section id="community-providers" className="scroll-mt-24 space-y-5">
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400"><Trophy size={20} weight="fill" aria-hidden="true" /></div>
            <div className="min-w-0 flex-1"><h2 className={`text-lg font-black tracking-tight sm:text-2xl ${isDark ? 'text-white' : 'text-ink'}`}>Providers of the week</h2><p className="text-[11px] leading-relaxed text-ink-muted sm:text-xs">Ranked by trust score, completed work, and client ratings</p></div>
          </div>
        </div>
        <TopProvidersSkeleton isDark={isDark} />
      </section>
    );
  }

  if (providers.length === 0) {
    return (
      <section id="community-providers" className="scroll-mt-24 space-y-4">
        <h2 className={`text-xl font-extrabold tracking-tight sm:text-2xl ${isDark ? 'text-white' : 'text-ink'}`}>
          Providers of the week
        </h2>
        <CommunityEmptyState
          icon={UsersThree}
          title="No provider recognition is available this week"
          description="Providers with verified services completed this week will appear here."
          isDark={isDark}
        />
      </section>
    );
  }

  const handleSelectProvider = (id: string) => {
    router.push(`/profile/${encodeURIComponent(id)}`);
  };

  return (
    <section id="community-providers" className="scroll-mt-24 space-y-5" aria-labelledby="top-providers-title">
      {/* Section Header */}
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <Trophy size={20} weight="fill" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 id="top-providers-title" className={`text-lg sm:text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-ink'}`}>
              Providers of the week
            </h2>
            <p className={`text-[11px] sm:text-xs leading-relaxed ${isDark ? 'text-ink-subtle' : 'text-ink-muted'}`}>
              {leaderboardPeriod
                ? `Week of ${new Date(leaderboardPeriod.start).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })} · Ranked by trust, completed work, and client ratings`
                : 'Ranked by trust score, completed work, and client ratings'}
            </p>
          </div>
        </div>
      </div>

      {/* Stepped Olympic Podium Bar Graph with floating provider cards */}
      <SteppedPodiumGraph
        providers={providers}
        currentUserId={currentUserId}
        isDark={isDark}
        onSelect={handleSelectProvider}
      />
    </section>
  );
}
