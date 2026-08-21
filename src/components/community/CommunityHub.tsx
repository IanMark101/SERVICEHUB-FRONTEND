import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, Calendar, Star, Award, Users, ShieldCheck, CheckCircle2, Tag, LoaderCircle, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/api/axios';

interface TopProvider {
  rank: number;
  id: string;
  name: string;
  avatarUrl: string | null;
  trustScore: number;
  completedJobs: number;
  avgRating: number | null;
  reviewCount: number;
}

interface CommunityStats {
  totalCompleted: number;
  verifiedUsers: number;
  activeListings: number;
}

interface RecentCategory {
  id: string;
  name: string;
  description: string;
  reviewedAt: string;
}

interface CommunityData {
  leaderboard: TopProvider[];
  stats: CommunityStats;
  recentCategories: RecentCategory[];
}

export default function CommunityHub() {
  const router = useRouter();
  const { isDark, user } = useApp();
  const [data, setData] = useState<CommunityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    api.get('/community/stats')
      .then((res) => {
        if (mounted) {
          setData(res.data.data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setError('Failed to load community data. Please try again later.');
          setLoading(false);
        }
      });

    return () => { mounted = false; };
  }, []);

  const card = `rounded-[24px] p-6 border shadow-sm transition-colors duration-200 ${
    isDark ? 'bg-[#22211e] border-neutral-800/80' : 'bg-white border-slate-200'
  }`;

  const sectionHeader = `font-extrabold text-xs uppercase tracking-wider border-b pb-3 flex items-center space-x-2 ${
    isDark ? 'text-[#f2efe9] border-neutral-800/80' : 'text-slate-900 border-slate-100'
  }`;

  const subText = `text-[10px] font-bold leading-snug ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <LoaderCircle className="w-8 h-8 animate-spin text-orange-500" />
          <p className={`text-sm font-semibold ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>
            Loading Community Hub...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className={`flex flex-col items-center gap-3 rounded-2xl border p-8 text-center max-w-sm ${
          isDark ? 'bg-[#22211e] border-neutral-800/80 text-[#b4b0a9]' : 'bg-white border-slate-200 text-slate-500'
        }`}>
          <AlertTriangle className="w-8 h-8 text-amber-500" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  const { leaderboard, stats, recentCategories } = data!;

  return (
    <div className={`space-y-6 select-none transition-colors duration-200 ${isDark ? 'text-[#f2efe9]' : 'text-slate-800'}`}>

      {/* Header Banner */}
      <div className={`rounded-[24px] p-6 border flex items-start space-x-5 relative overflow-hidden transition-colors duration-200 ${
        isDark
          ? 'bg-[#22211e] border-neutral-800/80'
          : 'bg-gradient-to-br from-slate-50 to-slate-100/50 border-slate-200'
      }`}>
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm border transition-colors ${
          isDark
            ? 'bg-[#191919] border-neutral-800/80 text-[#f2efe9]'
            : 'bg-white border-slate-200 text-slate-700'
        }`}>
          <Globe className="w-7 h-7" />
        </div>
        <div className="space-y-1.5 max-w-xl">
          <h2 className={`text-xl font-extrabold leading-none transition-colors ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
            Community Hub
          </h2>
          <p className={`text-xs leading-relaxed transition-colors ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>
            Live stats, top-rated local providers, and the latest additions to the Cordova marketplace.
          </p>
        </div>
        <div className="absolute top-1/2 -translate-y-1/2 right-12 opacity-[0.03] pointer-events-none hidden md:block">
          <Globe className="w-40 h-40" />
        </div>
      </div>

      {/* Community Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: CheckCircle2, label: 'Services Completed', value: stats.totalCompleted.toLocaleString(), color: 'text-emerald-500' },
          { icon: ShieldCheck, label: 'Verified Residents', value: stats.verifiedUsers.toLocaleString(), color: 'text-blue-500' },
          { icon: Tag, label: 'Active Listings', value: stats.activeListings.toLocaleString(), color: 'text-orange-500' },
        ].map((stat) => (
          <div key={stat.label} className={`${card} flex items-center space-x-4`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              isDark ? 'bg-neutral-800' : 'bg-slate-50'
            }`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className={`text-lg font-extrabold leading-none ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
                {stat.value}
              </p>
              <p className={subText}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Newly Added Categories (Part 18/19) */}
        <div className="lg:col-span-2 space-y-4">
          <div className={`${card} space-y-4`}>
            <h3 className={sectionHeader}>
              <span className="w-2.5 h-2.5 bg-orange-500 rounded-full" />
              <span>Newly Added Categories</span>
            </h3>
            <p className={subText}>
              These categories were recently approved and added to the marketplace by the Cordova admin team.
            </p>

            {recentCategories.length === 0 ? (
              <div className={`rounded-2xl border p-6 text-center ${
                isDark ? 'border-neutral-800/80 text-[#b4b0a9]' : 'border-slate-100 text-slate-400'
              }`}>
                <p className="text-xs font-semibold">No new categories recently — check back later!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recentCategories.map((cat) => (
                  <div
                    key={cat.id}
                    className={`border rounded-2xl p-4 space-y-1.5 transition-colors duration-200 ${
                      isDark
                        ? 'bg-orange-950/20 text-orange-400 border-orange-900/30'
                        : 'bg-orange-50 text-orange-600 border-orange-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-xs uppercase tracking-wide leading-none">{cat.name}</h4>
                      <span className="text-[9px] font-bold opacity-70 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {cat.reviewedAt ? new Date(cat.reviewedAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                      </span>
                    </div>
                    {cat.description && (
                      <p className="text-[10px] font-semibold leading-relaxed opacity-80 line-clamp-2">{cat.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Top Providers Leaderboard */}
        <div className="space-y-4">
          <div className={`${card} space-y-4 h-full`}>
            <h3 className={sectionHeader}>
              <Award className="w-4 h-4 text-amber-500" />
              <span>Top Providers</span>
            </h3>

            <p className={subText}>
              Ranked by trust score, completed jobs, and rating.
            </p>

            {leaderboard.length === 0 ? (
              <div className={`rounded-2xl border p-6 text-center ${
                isDark ? 'border-neutral-800/80 text-[#b4b0a9]' : 'border-slate-100 text-slate-400'
              }`}>
                <Users className="w-6 h-6 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-semibold">No completed services yet. Be the first!</p>
              </div>
            ) : (
              <div className="space-y-2.5 pt-1">
                {leaderboard.map((prov) => (
                  <div
                    key={prov.id}
                    onClick={() => {
                      const prefix = user?.role === 'provider' ? '/provider' : '/seeker';
                      router.push(`${prefix}/user-profile?id=${prov.id}`);
                    }}
                    className={`flex items-center justify-between border rounded-2xl p-3 transition-all duration-200 cursor-pointer select-none group/prov hover:border-orange-500/50 hover:scale-[1.01] ${
                      isDark
                        ? 'bg-[#191919] border-neutral-800/80 hover:bg-neutral-800/60'
                        : 'bg-slate-50 border-slate-100 hover:bg-slate-100/80 hover:shadow-sm'
                    }`}
                    title={`View ${prov.name}'s profile`}
                  >
                    <div className="flex items-center space-x-3">
                      {/* Rank Badge */}
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center font-extrabold text-[9px] border flex-shrink-0 transition-colors ${
                        prov.rank === 1
                          ? (isDark ? 'bg-amber-950/40 text-amber-400 border-amber-900/30' : 'bg-amber-100 text-amber-700 border-amber-200')
                          : prov.rank === 2
                          ? (isDark ? 'bg-neutral-800 text-[#f2efe9] border-neutral-700' : 'bg-slate-200 text-slate-700 border-slate-300')
                          : prov.rank === 3
                          ? (isDark ? 'bg-amber-950/20 text-amber-500 border-amber-900/20' : 'bg-amber-50 text-amber-600 border-amber-100')
                          : (isDark ? 'bg-[#1c1b18] text-[#b4b0a9] border-neutral-800' : 'bg-slate-50 text-slate-400 border-slate-100')
                      }`}>
                        {prov.rank}
                      </div>

                      {/* Avatar */}
                      {prov.avatarUrl ? (
                        <img
                          src={prov.avatarUrl}
                          alt={prov.name}
                          className="w-7 h-7 rounded-full object-cover flex-shrink-0 transition-transform group-hover/prov:scale-105 group-hover/prov:ring-1 group-hover/prov:ring-orange-500/40"
                        />
                      ) : (
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-extrabold transition-transform group-hover/prov:scale-105 ${
                          isDark ? 'bg-neutral-700 text-[#f2efe9]' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {prov.name.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div>
                        <h4 className={`font-extrabold text-xs truncate max-w-[100px] transition-colors group-hover/prov:text-orange-500 ${
                          isDark ? 'text-[#f2efe9]' : 'text-slate-900'
                        }`}>{prov.name}</h4>
                        <div className="flex items-center space-x-2 mt-0.5 text-[8px] font-bold uppercase tracking-wider">
                          <span className={`px-1 rounded border ${
                            isDark
                              ? 'text-emerald-400 bg-emerald-950/20 border-emerald-900/30'
                              : 'text-emerald-600 bg-emerald-50 border-emerald-100'
                          }`}>
                            Trust {prov.trustScore}
                          </span>
                          <span className={isDark ? 'text-[#b4b0a9]' : 'text-slate-400'}>
                            {prov.completedJobs} job{prov.completedJobs !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>

                    {prov.avgRating !== null ? (
                      <div className="flex items-center text-xs font-bold text-amber-500">
                        <Star className="w-3.5 h-3.5 mr-0.5 fill-amber-500 text-amber-500" />
                        <span>{prov.avgRating.toFixed(1)}</span>
                      </div>
                    ) : (
                      <span className={`text-[9px] font-semibold ${isDark ? 'text-[#b4b0a9]' : 'text-slate-400'}`}>
                        No reviews
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
