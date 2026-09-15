import React from 'react';
import Image from 'next/image';
import { ArrowUpRight, Star } from '@phosphor-icons/react';
import type { TopProvider } from '../types/community.types';

interface PodiumChampionsProps {
  firstPlace?: TopProvider;
  secondPlace?: TopProvider;
  thirdPlace?: TopProvider;
  currentUserId?: string;
  isDark?: boolean;
  onSelect: (id: string) => void;
}

export default function PodiumChampions({ firstPlace, secondPlace, thirdPlace, currentUserId, isDark = false, onSelect }: PodiumChampionsProps) {
  const providers = [firstPlace, secondPlace, thirdPlace].filter((provider): provider is TopProvider => !!provider);

  return (
    <div className="grid gap-0 md:grid-cols-3">
      {providers.map((provider) => (
        <button
          type="button"
          key={provider.id}
          onClick={() => onSelect(provider.id)}
          aria-label={`View ranked provider ${provider.name}`}
          className={`group min-w-0 border-b border-black/10 py-5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c86544] md:border-b-0 md:border-r md:px-5 md:first:pl-0 md:last:border-r-0 md:last:pr-0 ${isDark ? 'border-white/10' : ''}`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${provider.rank === 1 ? (isDark ? 'text-[#e9a58c]' : 'text-[#aa5032]') : isDark ? 'text-[#aaa59d]' : 'text-[#6f6a64]'}`}>Rank {provider.rank}</span>
            <ArrowUpRight size={16} className="text-[#827c75] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
          </div>
          <div className="mt-4 flex min-w-0 items-center gap-3">
            {provider.avatarUrl ? (
              <Image src={provider.avatarUrl} alt="" width={44} height={44} unoptimized className="size-11 shrink-0 rounded-full object-cover" />
            ) : (
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#f5ebe6] text-base font-semibold text-[#aa5032] dark:bg-[#c86544]/15 dark:text-[#e9a58c]">{provider.name.charAt(0).toUpperCase()}</span>
            )}
            <span className="min-w-0">
              <span className={`block truncate text-sm font-semibold tracking-[-0.02em] group-hover:text-[#aa5032] dark:group-hover:text-[#e9a58c] ${isDark ? 'text-[#f5f4f2]' : 'text-[#171716]'}`}>{provider.name}{provider.id === currentUserId ? ' (You)' : ''}</span>
              <span className={`mt-1 block truncate text-xs ${isDark ? 'text-[#aaa59d]' : 'text-[#625d57]'}`}>{provider.primaryService || 'Local service provider'}</span>
            </span>
          </div>
          <div className={`mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs ${isDark ? 'text-[#aaa59d]' : 'text-[#625d57]'}`}>
            <span>Trust <strong className={isDark ? 'text-[#f5f4f2]' : 'text-[#171716]'}>{provider.trustScore}/100</strong></span>
            <span className="inline-flex items-center gap-1"><Star size={13} className="text-[#c86544]" aria-hidden="true" />{provider.avgRating === null ? 'No ratings' : provider.avgRating.toFixed(1)} ({provider.reviewCount})</span>
            <span>{provider.completedJobs} completed this week</span>
          </div>
        </button>
      ))}
    </div>
  );
}
