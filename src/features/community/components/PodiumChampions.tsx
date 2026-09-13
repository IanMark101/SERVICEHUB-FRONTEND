import React from 'react';
import Image from 'next/image';
import { ArrowUpRight, Star } from 'lucide-react';
import { TopProvider } from '../types/community.types';

interface PodiumChampionsProps {
  firstPlace?: TopProvider;
  secondPlace?: TopProvider;
  thirdPlace?: TopProvider;
  currentUserId?: string;
  isDark?: boolean;
  onSelect: (id: string) => void;
}

export default function PodiumChampions({
  firstPlace, secondPlace, thirdPlace, currentUserId, isDark = false, onSelect,
}: PodiumChampionsProps) {
  const providers = [firstPlace, secondPlace, thirdPlace].filter((provider): provider is TopProvider => !!provider);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {providers.map((provider) => (
        <button
          type="button"
          key={provider.id}
          onClick={() => onSelect(provider.id)}
          className={`min-w-0 rounded-xl border p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 ${isDark ? 'bg-neutral-900/40 border-neutral-700 hover:bg-neutral-800' : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100'}`}
          aria-label={`View ranked provider ${provider.name}`}
        >
          <div className="mb-4 flex items-center justify-between">
            <span className={`text-xs font-semibold ${isDark ? 'text-neutral-300' : 'text-slate-600'}`}>Rank {provider.rank}</span>
            <ArrowUpRight className="h-4 w-4 text-slate-400" />
          </div>
          <div className="flex items-center gap-3 min-w-0">
            {provider.avatarUrl ? (
              <Image src={provider.avatarUrl} alt="" width={40} height={40} unoptimized className="h-10 w-10 shrink-0 rounded-full object-cover" />
            ) : (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-700 text-sm font-semibold text-white">
                {provider.name.charAt(0).toUpperCase()}
              </span>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold break-words">{provider.name}{provider.id === currentUserId ? ' (You)' : ''}</p>
              <p className={`mt-1 text-xs line-clamp-2 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>{provider.primaryService || 'Local service provider'}</p>
            </div>
          </div>
          <div className={`mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t pt-3 text-xs ${isDark ? 'border-neutral-700 text-neutral-300' : 'border-slate-200 text-slate-600'}`}>
            <span>Trust <strong>{provider.trustScore}/100</strong></span>
            <span className="inline-flex items-center gap-1"><Star className="h-3 w-3 text-amber-600" />{provider.avgRating === null ? 'No ratings' : provider.avgRating.toFixed(1)} ({provider.reviewCount})</span>
            <span>{provider.completedJobs} completed this week</span>
          </div>
        </button>
      ))}
    </div>
  );
}
