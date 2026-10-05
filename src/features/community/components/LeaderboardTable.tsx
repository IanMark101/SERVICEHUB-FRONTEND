import TrustScoreBadge from '../../../components/ui/TrustScoreBadge';
import React from 'react';
import Image from 'next/image';
import { Star, ShieldCheck } from '@phosphor-icons/react';
import type { TopProvider } from '../types/community.types';

interface LeaderboardTableProps {
  providers: TopProvider[];
  currentUserId?: string;
  isDark?: boolean;
  onSelect: (id: string) => void;
}

export default function LeaderboardTable({ providers = [], currentUserId, isDark = false, onSelect }: LeaderboardTableProps) {
  if (providers.length === 0) return null;

  return (
    <div className={`max-w-[68rem] rounded-3xl border p-5 sm:p-6 transition-all ${
      isDark
        ? 'bg-[#1c1b18] border-neutral-800/90 shadow-xl shadow-black/40'
        : 'bg-white border-slate-200/90 shadow-sm shadow-slate-900/5'
    }`}>
      <h3 className={`mb-3 text-xs font-extrabold uppercase tracking-wider text-ink-subtle dark:text-ink-subtle`}>
        More recognized providers
      </h3>
      <div className="divide-y divide-slate-100 dark:divide-neutral-800/80">
        {providers.map((provider) => (
          <button
            type="button"
            key={provider.id}
            onClick={() => onSelect(provider.id)}
            aria-label={`View ranked provider ${provider.name}`}
            className="group flex w-full items-center gap-3 py-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c86544]"
          >
            <span className={`w-5 shrink-0 text-center text-xs font-semibold tabular-nums ${isDark ? 'text-ink-muted' : 'text-ink-muted'}`}>{provider.rank}</span>
            {provider.avatarUrl ? (
              <Image src={provider.avatarUrl} alt="" width={32} height={32} unoptimized className="size-8 shrink-0 rounded-full object-cover" />
            ) : (
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#f5ebe6] text-xs font-semibold text-[#aa5032] dark:bg-[#c86544]/15 dark:text-[#e9a58c]">{provider.name.charAt(0).toUpperCase()}</span>
            )}
            <span className="min-w-0 flex-1">
              <span className={`flex items-center gap-1.5 truncate text-sm font-semibold group-hover:text-[#aa5032] dark:group-hover:text-[#e9a58c] ${isDark ? 'text-white' : 'text-ink'}`}>
                {provider.name}{provider.id === currentUserId ? ' (You)' : ''}
                {provider.verificationStatus === 'APPROVED' && <ShieldCheck size={14} className="shrink-0 text-[#c86544]" aria-label="Verified resident" />}
              </span>
              {provider.primaryService && <span className={`mt-0.5 block truncate text-xs ${isDark ? 'text-ink-muted' : 'text-ink-muted'}`}>{provider.primaryService}</span>}
            </span>
            <TrustScoreBadge score={provider.trustScore} />
            <span className={`hidden shrink-0 items-center gap-1 text-xs sm:flex ${isDark ? 'text-ink-muted' : 'text-ink-muted'}`}><Star size={13} className="text-[#c86544]" aria-hidden="true" />{provider.avgRating === null ? 'No rating' : provider.avgRating.toFixed(1)}</span>
            <span className={`hidden shrink-0 text-xs tabular-nums md:block ${isDark ? 'text-ink-muted' : 'text-ink-muted'}`}>{provider.completedJobs} completed this week</span>
          </button>
        ))}
      </div>
    </div>
  );
}
