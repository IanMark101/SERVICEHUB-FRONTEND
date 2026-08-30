import React from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, Users } from 'lucide-react';
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
}

export default function TopProviders({
  providers = [],
  loading = false,
  isDark = false,
  workspaceRole = 'seeker',
  currentUserId,
}: TopProvidersProps) {
  const router = useRouter();

  if (loading) {
    return (
      <div className="space-y-3.5">
        <div className="flex items-center space-x-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          <h2 className={`font-extrabold text-sm uppercase tracking-wider ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
            Top Local Providers Leaderboard
          </h2>
        </div>
        <TopProvidersSkeleton isDark={isDark} />
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div className="space-y-3.5">
        <div className="flex items-center space-x-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          <h2 className={`font-extrabold text-sm uppercase tracking-wider ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
            Top Local Providers Leaderboard
          </h2>
        </div>
        <CommunityEmptyState
          icon={Users}
          title="No providers are currently available"
          description="Verified providers with completed services will appear here."
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
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          <h2 className={`font-extrabold text-sm uppercase tracking-wider ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
            Top Local Providers Leaderboard
          </h2>
        </div>
        <span className={`text-[10px] font-semibold ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>
          Ranked deterministically by Trust Score, completed jobs, and client reviews
        </span>
      </div>

      {/* Main Podium & Leaderboard Card */}
      <div
        className={`rounded-2xl border p-6 shadow-sm transition-colors duration-200 overflow-hidden ${
          isDark ? 'bg-[#22211e] border-neutral-800/80 text-[#f2efe9]' : 'bg-white border-slate-200 text-slate-900'
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
    </div>
  );
}
