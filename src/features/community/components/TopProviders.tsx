import React from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, UsersThree } from '@phosphor-icons/react';
import { TopProvider } from '../types/community.types';
import { TopProvidersSkeleton } from './CommunitySkeletons';
import CommunityEmptyState from './CommunityEmptyState';
import PodiumChampions from './PodiumChampions';
import LeaderboardTable from './LeaderboardTable';

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
  workspaceRole = 'seeker',
  currentUserId,
  leaderboardPeriod,
}: TopProvidersProps) {
  const router = useRouter();

  if (loading) {
    return (
      <div className="space-y-5">
        <h2 className={`text-xl font-semibold tracking-[-0.025em] sm:text-2xl ${isDark ? 'text-[#f5f4f2]' : 'text-[#171716]'}`}>Providers of the week</h2>
        <TopProvidersSkeleton isDark={isDark} />
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div className="space-y-5">
        <h2 className={`text-xl font-semibold tracking-[-0.025em] sm:text-2xl ${isDark ? 'text-[#f5f4f2]' : 'text-[#171716]'}`}>Providers of the week</h2>
        <CommunityEmptyState
          icon={UsersThree}
          title="No provider recognition is available this week"
          description="Providers with verified services completed this week will appear here."
          isDark={isDark}
        />
      </div>
    );
  }

  const firstPlace = providers.find((p) => p.rank === 1);
  const secondPlace = providers.find((p) => p.rank === 2);
  const thirdPlace = providers.find((p) => p.rank === 3);
  const remainingProviders = providers.filter((p) => p.rank > 3);

  const handleSelectProvider = (id: string) => {
    const prefix = workspaceRole === 'provider' ? '/provider' : '/seeker';
    router.push(`${prefix}/user-profile?id=${id}`);
  };

  return (
    <section className="space-y-5" aria-labelledby="top-providers-title">
      {/* Section Header */}
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-2">
          <Trophy size={20} className="text-[#c86544]" aria-hidden="true" />
          <h2 id="top-providers-title" className={`text-xl font-semibold tracking-[-0.025em] sm:text-2xl ${isDark ? 'text-[#f5f4f2]' : 'text-[#171716]'}`}>
            Providers of the week
          </h2>
        </div>
        <span className={`text-[10px] font-semibold sm:text-right ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>
          {leaderboardPeriod
            ? `Week of ${new Date(leaderboardPeriod.start).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })} · Ranked by trust, completed work, and client ratings`
            : 'Ranked by trust, completed work, and client ratings'}
        </span>
      </div>

      {/* Recognition and rankings share one reading surface. */}
      <div
        className={`overflow-hidden rounded-2xl border p-5 sm:p-6 ${
          isDark ? 'border-white/10 bg-[#201f1c] text-[#f5f4f2]' : 'border-black/8 bg-[#fffdfa] text-[#171716]'
        }`}
      >
        <PodiumChampions
          firstPlace={firstPlace}
          secondPlace={secondPlace}
          thirdPlace={thirdPlace}
          currentUserId={currentUserId}
          isDark={isDark}
          onSelect={handleSelectProvider}
        />

        <LeaderboardTable
          providers={remainingProviders}
          currentUserId={currentUserId}
          isDark={isDark}
          onSelect={handleSelectProvider}
        />
      </div>
    </section>
  );
}
