import React from 'react';
import { useRouter } from 'next/navigation';
import { Award, Users, Star, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { TopProvider } from '../types/community.types';
import { TopProvidersSkeleton } from './CommunitySkeletons';
import CommunityEmptyState from './CommunityEmptyState';

interface TopProvidersProps {
  providers: TopProvider[];
  loading?: boolean;
  isDark?: boolean;
  workspaceRole?: 'seeker' | 'provider' | 'admin';
}

export default function TopProviders({
  providers = [],
  loading = false,
  isDark = false,
  workspaceRole = 'seeker',
}: TopProvidersProps) {
  const router = useRouter();

  if (loading) {
    return (
      <div className="space-y-3.5">
        <div className="flex items-center space-x-2">
          <Award className="w-4 h-4 text-amber-500" />
          <h2 className={`font-extrabold text-sm uppercase tracking-wider ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
            Top Local Providers
          </h2>
        </div>
        <TopProvidersSkeleton isDark={isDark} />
      </div>
    );
  }

  const getRankBadgeStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return isDark
          ? 'bg-amber-950/40 text-amber-400 border-amber-800/40 ring-1 ring-amber-500/20'
          : 'bg-amber-100 text-amber-800 border-amber-300 ring-1 ring-amber-400/30';
      case 2:
        return isDark
          ? 'bg-neutral-800 text-slate-200 border-neutral-700'
          : 'bg-slate-200 text-slate-700 border-slate-300';
      case 3:
        return isDark
          ? 'bg-amber-950/20 text-amber-500 border-amber-900/20'
          : 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return isDark
          ? 'bg-[#1c1b18] text-[#b4b0a9] border-neutral-800'
          : 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Award className="w-4 h-4 text-amber-500" />
          <h2 className={`font-extrabold text-sm uppercase tracking-wider ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
            Top Local Providers
          </h2>
        </div>
        <span className={`text-[10px] font-semibold ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>
          Discover trusted local providers based on marketplace reputation and activity
        </span>
      </div>

      {providers.length === 0 ? (
        <CommunityEmptyState
          icon={Users}
          title="No providers are currently available"
          description="Verified providers with completed services will appear here."
          isDark={isDark}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {providers.map((prov) => (
            <div
              key={prov.id}
              onClick={() => {
                const prefix = workspaceRole === 'provider' ? '/provider' : '/seeker';
                router.push(`${prefix}/user-profile?id=${prov.id}`);
              }}
              className={`rounded-2xl p-4 border flex flex-col justify-between space-y-3 transition-all duration-200 cursor-pointer select-none group/prov hover:border-orange-500/50 hover:shadow-md hover:-translate-y-0.5 ${
                isDark
                  ? 'bg-[#22211e] border-neutral-800/80 text-[#f2efe9]'
                  : 'bg-white border-slate-200 text-slate-900'
              }`}
              title={`View ${prov.name}'s profile`}
            >
              {/* Top row: Avatar, Name, Rank */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="relative flex-shrink-0">
                    {prov.avatarUrl ? (
                      <img
                        src={prov.avatarUrl}
                        alt={prov.name}
                        className="w-10 h-10 rounded-full object-cover group-hover/prov:ring-2 group-hover/prov:ring-orange-500/40 transition-all"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-neutral-700 text-[#f2efe9] text-xs font-extrabold flex items-center justify-center">
                        {prov.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {prov.verificationStatus === 'APPROVED' && (
                      <div
                        className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-white border-2 border-white dark:border-[#22211e]"
                        title="Verified Resident"
                      >
                        <ShieldCheck className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <h4 className="font-extrabold text-xs leading-snug truncate group-hover/prov:text-orange-500 transition-colors">
                      {prov.name}
                    </h4>
                    {prov.primaryService && (
                      <p className={`text-[10px] font-medium truncate ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>
                        {prov.primaryService}
                      </p>
                    )}
                  </div>
                </div>

                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-extrabold text-[10px] border flex-shrink-0 ${getRankBadgeStyle(
                    prov.rank
                  )}`}
                >
                  #{prov.rank}
                </span>
              </div>

              {/* Bottom stats: Trust Score, Completed Jobs, Rating */}
              <div className="pt-2.5 border-t border-dashed border-neutral-700/20 dark:border-neutral-800/80 flex items-center justify-between text-[10px]">
                <div className="flex items-center space-x-1.5 font-bold">
                  <span
                    className={`px-1.5 py-0.5 rounded-md border ${
                      isDark
                        ? 'bg-emerald-955/20 border-emerald-900/30 text-emerald-400'
                        : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                    }`}
                  >
                    {prov.trustScore}% Trust
                  </span>
                  <span className={`flex items-center ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>
                    <CheckCircle2 className="w-3 h-3 mr-0.5 text-slate-400" />
                    {prov.completedJobs} job{prov.completedJobs !== 1 ? 's' : ''}
                  </span>
                </div>

                {prov.avgRating !== null ? (
                  <div className="flex items-center font-extrabold text-amber-500">
                    <Star className="w-3 h-3 mr-0.5 fill-amber-500 text-amber-500" />
                    <span>{prov.avgRating.toFixed(1)}</span>
                  </div>
                ) : (
                  <span className={`text-[9px] font-semibold ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>
                    New
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
