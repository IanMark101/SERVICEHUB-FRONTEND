import React from 'react';
import { useRouter } from 'next/navigation';
import { Crown, Trophy, Award, Users, Star, ShieldCheck, CheckCircle2, Sparkles, TrendingUp } from 'lucide-react';
import { TopProvider } from '../types/community.types';
import { TopProvidersSkeleton } from './CommunitySkeletons';
import CommunityEmptyState from './CommunityEmptyState';

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

  const navigateToProfile = (id: string) => {
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

      {/* ── Main Podium & Leaderboard Card ─────────────────────────────── */}
      <div
        className={`rounded-2xl border p-6 shadow-sm transition-colors duration-200 overflow-hidden ${
          isDark ? 'bg-[#22211e] border-neutral-800/80 text-[#f2efe9]' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* ── Top 3 Podium ─────────────────────────────────────────────── */}
        <div className="pt-4 pb-8 border-b dark:border-neutral-800/80 border-slate-100 relative">
          <div className="flex flex-col sm:flex-row items-end justify-center gap-4 sm:gap-6 lg:gap-10 max-w-2xl mx-auto">

            {/* ── 2nd Place (Left) ── */}
            {secondPlace && (
              <div
                onClick={() => navigateToProfile(secondPlace.id)}
                className="w-full sm:w-44 flex flex-col items-center text-center cursor-pointer group/rank2 order-2 sm:order-1 transition-transform hover:scale-[1.03]"
                title={`Rank #2: ${secondPlace.name}`}
              >
                <div className="relative mb-2.5">
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full ring-3 ring-blue-400/80 p-0.5 shadow-md bg-neutral-800 flex items-center justify-center overflow-hidden">
                    {secondPlace.avatarUrl ? (
                      <img
                        src={secondPlace.avatarUrl}
                        alt={secondPlace.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-700 text-white font-black text-lg flex items-center justify-center">
                        {secondPlace.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  {/* Rank Badge */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 text-white font-black text-[11px] flex items-center justify-center shadow border-2 border-white dark:border-[#22211e]">
                    2
                  </div>
                </div>

                <div className="mt-2 space-y-0.5 w-full px-1">
                  <div className="flex items-center justify-center space-x-1">
                    <h4 className="font-extrabold text-xs sm:text-sm truncate group-hover/rank2:text-blue-400 transition-colors">
                      {secondPlace.name}
                    </h4>
                    {secondPlace.id === currentUserId && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full font-black bg-blue-500 text-white">
                        You
                      </span>
                    )}
                  </div>
                  <p className={`text-[10px] font-medium truncate ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>
                    {secondPlace.primaryService || 'Cordova Resident'}
                  </p>
                  <p className="text-xs font-black text-blue-500 pt-0.5">
                    {secondPlace.trustScore}% Trust
                  </p>
                  <div className="flex items-center justify-center space-x-2 text-[10px] pt-1">
                    <span className="flex items-center text-amber-500 font-bold">
                      <Star className="w-3 h-3 mr-0.5 fill-amber-500 text-amber-500" />
                      {secondPlace.avgRating ? secondPlace.avgRating.toFixed(1) : '—'}
                    </span>
                    <span className={isDark ? 'text-neutral-500' : 'text-slate-400'}>•</span>
                    <span className={`font-semibold ${isDark ? 'text-[#b4b0a9]' : 'text-slate-600'}`}>
                      {secondPlace.completedJobs} jobs
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ── 1st Place (Center / Champion Elevated) ── */}
            {firstPlace && (
              <div
                onClick={() => navigateToProfile(firstPlace.id)}
                className="w-full sm:w-52 flex flex-col items-center text-center cursor-pointer group/rank1 order-1 sm:order-2 transition-transform hover:scale-[1.04]"
                title={`Rank #1 Champion: ${firstPlace.name}`}
              >
                <div className="relative mb-3 flex flex-col items-center">
                  {/* Floating Gold Crown */}
                  <div className="animate-pulse mb-1">
                    <Crown className="w-8 h-8 text-amber-400 fill-amber-400 drop-shadow-md" />
                  </div>

                  <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full ring-4 ring-amber-400 p-0.5 shadow-xl shadow-amber-500/20 bg-neutral-800 flex items-center justify-center overflow-hidden">
                    {firstPlace.avatarUrl ? (
                      <img
                        src={firstPlace.avatarUrl}
                        alt={firstPlace.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-amber-600 text-white font-black text-xl flex items-center justify-center">
                        {firstPlace.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Rank 1 Crown Badge */}
                  <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 font-black text-xs flex items-center justify-center shadow-lg border-2 border-white dark:border-[#22211e]">
                    1
                  </div>
                </div>

                <div className="mt-2 space-y-0.5 w-full px-1">
                  <div className="flex items-center justify-center space-x-1">
                    <h3 className="font-extrabold text-sm sm:text-base truncate group-hover/rank1:text-amber-400 transition-colors">
                      {firstPlace.name}
                    </h3>
                    {firstPlace.id === currentUserId && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full font-black bg-amber-500 text-slate-950">
                        You
                      </span>
                    )}
                  </div>
                  <p className={`text-[11px] font-semibold truncate ${isDark ? 'text-[#b4b0a9]' : 'text-slate-600'}`}>
                    {firstPlace.primaryService || 'Top Service Provider'}
                  </p>
                  <p className="text-sm font-black text-amber-500 pt-0.5">
                    {firstPlace.trustScore}% Trust
                  </p>
                  <div className="flex items-center justify-center space-x-2 text-[10.5px] pt-1">
                    <span className="flex items-center text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 mr-0.5 fill-amber-500 text-amber-500" />
                      {firstPlace.avgRating ? firstPlace.avgRating.toFixed(1) : '5.0'}
                    </span>
                    <span className={isDark ? 'text-neutral-500' : 'text-slate-400'}>•</span>
                    <span className={`font-semibold ${isDark ? 'text-[#b4b0a9]' : 'text-slate-600'}`}>
                      {firstPlace.completedJobs} jobs completed
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ── 3rd Place (Right) ── */}
            {thirdPlace && (
              <div
                onClick={() => navigateToProfile(thirdPlace.id)}
                className="w-full sm:w-44 flex flex-col items-center text-center cursor-pointer group/rank3 order-3 sm:order-3 transition-transform hover:scale-[1.03]"
                title={`Rank #3: ${thirdPlace.name}`}
              >
                <div className="relative mb-2.5">
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full ring-3 ring-emerald-500/80 p-0.5 shadow-md bg-neutral-800 flex items-center justify-center overflow-hidden">
                    {thirdPlace.avatarUrl ? (
                      <img
                        src={thirdPlace.avatarUrl}
                        alt={thirdPlace.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-emerald-800 text-white font-black text-lg flex items-center justify-center">
                        {thirdPlace.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  {/* Rank Badge */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-white font-black text-[11px] flex items-center justify-center shadow border-2 border-white dark:border-[#22211e]">
                    3
                  </div>
                </div>

                <div className="mt-2 space-y-0.5 w-full px-1">
                  <div className="flex items-center justify-center space-x-1">
                    <h4 className="font-extrabold text-xs sm:text-sm truncate group-hover/rank3:text-emerald-400 transition-colors">
                      {thirdPlace.name}
                    </h4>
                    {thirdPlace.id === currentUserId && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full font-black bg-emerald-500 text-white">
                        You
                      </span>
                    )}
                  </div>
                  <p className={`text-[10px] font-medium truncate ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>
                    {thirdPlace.primaryService || 'Cordova Resident'}
                  </p>
                  <p className="text-xs font-black text-emerald-500 pt-0.5">
                    {thirdPlace.trustScore}% Trust
                  </p>
                  <div className="flex items-center justify-center space-x-2 text-[10px] pt-1">
                    <span className="flex items-center text-amber-500 font-bold">
                      <Star className="w-3 h-3 mr-0.5 fill-amber-500 text-amber-500" />
                      {thirdPlace.avgRating ? thirdPlace.avgRating.toFixed(1) : '—'}
                    </span>
                    <span className={isDark ? 'text-neutral-500' : 'text-slate-400'}>•</span>
                    <span className={`font-semibold ${isDark ? 'text-[#b4b0a9]' : 'text-slate-600'}`}>
                      {thirdPlace.completedJobs} jobs
                    </span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ── Remaining Providers Table (Ranks 4+) ───────────────────────── */}
        {remainingProviders.length > 0 && (
          <div className="pt-4 space-y-2">
            <h4 className={`text-[10px] font-extrabold uppercase tracking-wider px-2 ${isDark ? 'text-[#b4b0a9]' : 'text-slate-400'}`}>
              Rankings (4+)
            </h4>

            <div className="space-y-1.5">
              {remainingProviders.map((prov) => {
                const isUser = prov.id === currentUserId;
                return (
                  <div
                    key={prov.id}
                    onClick={() => navigateToProfile(prov.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 cursor-pointer select-none group/row hover:border-orange-500/50 hover:shadow-sm ${
                      isUser
                        ? (isDark ? 'bg-orange-955/20 border-orange-800/40' : 'bg-orange-50/70 border-orange-200')
                        : (isDark ? 'bg-[#191919] border-neutral-800/80 hover:bg-neutral-800/50' : 'bg-slate-50 border-slate-200/80 hover:bg-white')
                    }`}
                  >
                    {/* Left: Rank, Avatar, Name & Category */}
                    <div className="flex items-center space-x-3.5 min-w-0">
                      <span className="w-6 text-center font-black text-xs text-slate-400 dark:text-neutral-500 flex-shrink-0">
                        {prov.rank}
                      </span>

                      <div className="relative flex-shrink-0">
                        {prov.avatarUrl ? (
                          <img
                            src={prov.avatarUrl}
                            alt={prov.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-neutral-700 text-[#f2efe9] text-xs font-extrabold flex items-center justify-center">
                            {prov.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        {prov.verificationStatus === 'APPROVED' && (
                          <div
                            className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-blue-600 rounded-full flex items-center justify-center text-white border border-white dark:border-[#191919]"
                            title="Verified Resident"
                          >
                            <ShieldCheck className="w-2 h-2" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center space-x-1.5">
                          <h5 className="font-extrabold text-xs leading-none truncate group-hover/row:text-orange-500 transition-colors">
                            {prov.name}
                          </h5>
                          {isUser && (
                            <span className="text-[8px] font-black uppercase px-1.5 py-0.2 rounded bg-orange-600 text-white">
                              ★ You
                            </span>
                          )}
                        </div>
                        {prov.primaryService && (
                          <p className={`text-[10px] font-medium truncate mt-0.5 ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>
                            {prov.primaryService}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Trust Score & Metrics */}
                    <div className="flex items-center space-x-3 text-right flex-shrink-0">
                      <span
                        className={`text-[9.5px] font-extrabold px-2 py-0.5 rounded-md border ${
                          isDark
                            ? 'bg-emerald-955/20 border-emerald-900/30 text-emerald-400'
                            : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                        }`}
                      >
                        {prov.trustScore}% Trust
                      </span>

                      <div className="hidden sm:flex items-center space-x-2 text-[10px]">
                        <span className={`font-semibold ${isDark ? 'text-[#b4b0a9]' : 'text-slate-600'}`}>
                          {prov.completedJobs} jobs
                        </span>
                        {prov.avgRating !== null && (
                          <span className="flex items-center text-amber-500 font-bold">
                            <Star className="w-3 h-3 mr-0.5 fill-amber-500 text-amber-500" />
                            {prov.avgRating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
