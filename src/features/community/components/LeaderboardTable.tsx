import React from 'react';
import { Star, ShieldCheck } from 'lucide-react';
import { TopProvider } from '../types/community.types';

interface LeaderboardTableProps {
  providers: TopProvider[];
  currentUserId?: string;
  isDark?: boolean;
  onSelect: (id: string) => void;
}

export default function LeaderboardTable({
  providers = [],
  currentUserId,
  isDark = false,
  onSelect,
}: LeaderboardTableProps) {
  if (providers.length === 0) return null;

  return (
    <div className="pt-4 space-y-2">
      <h4 className={`text-[10px] font-extrabold uppercase tracking-wider px-2 ${isDark ? 'text-[#b4b0a9]' : 'text-slate-400'}`}>
        Rankings (4+)
      </h4>

      <div className="space-y-1.5">
        {providers.map((prov) => {
          const isUser = prov.id === currentUserId;
          return (
            <button
              type="button"
              key={prov.id}
              onClick={() => onSelect(prov.id)}
              className={`w-full text-left flex items-center justify-between p-3 rounded-xl border transition-all duration-200 cursor-pointer select-none group/row hover:border-orange-500/50 hover:shadow-sm ${
                isUser
                  ? (isDark ? 'bg-orange-950/20 border-orange-800/40' : 'bg-orange-50/70 border-orange-200')
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
                        You
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
                      ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400'
                      : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                  }`}
                >
                  Trust score {prov.trustScore}
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
            </button>
          );
        })}
      </div>
    </div>
  );
}
