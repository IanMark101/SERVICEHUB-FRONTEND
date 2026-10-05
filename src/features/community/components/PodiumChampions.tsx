import TrustScoreBadge from '../../../components/ui/TrustScoreBadge';
import React from 'react';
import Image from 'next/image';
import { ArrowUpRight, SealCheck, ShieldCheck, Star } from '@phosphor-icons/react';
import type { TopProvider } from '../types/community.types';

interface PodiumChampionsProps {
  firstPlace?: TopProvider;
  secondPlace?: TopProvider;
  thirdPlace?: TopProvider;
  currentUserId?: string;
  isDark?: boolean;
  onSelect: (id: string) => void;
}

function ProviderAvatar({ provider, size }: { provider: TopProvider; size: 'large' | 'small' }) {
  const sizeClass = size === 'large' ? 'size-16 text-xl' : 'size-11 text-base';
  if (provider.avatarUrl) {
    return <Image src={provider.avatarUrl} alt="" width={size === 'large' ? 64 : 44} height={size === 'large' ? 64 : 44} unoptimized className={`${sizeClass} shrink-0 rounded-full object-cover`} />;
  }
  return <span className={`grid ${sizeClass} shrink-0 place-items-center rounded-full bg-[#f5ebe6] font-semibold text-[#aa5032] dark:bg-[#c86544]/15 dark:text-[#e9a58c]`}>{provider.name.charAt(0).toUpperCase()}</span>;
}

export default function PodiumChampions({ firstPlace, secondPlace, thirdPlace, currentUserId, isDark = false, onSelect }: PodiumChampionsProps) {
  const providers = [firstPlace, secondPlace, thirdPlace].filter((provider): provider is TopProvider => !!provider);
  const featured = providers[0];
  if (!featured) return null;
  const supporting = providers.slice(1);
  const muted = isDark ? 'text-ink-muted' : 'text-ink-muted';

  return (
    <div className={`grid items-start gap-4 ${supporting.length > 0 ? 'lg:grid-cols-[minmax(0,1.15fr)_minmax(17rem,0.85fr)]' : 'max-w-[42rem]'}`}>
      <button type="button" onClick={() => onSelect(featured.id)} aria-label={`View ranked provider ${featured.name}`}
        className={`group min-w-0 rounded-3xl border p-6 text-left transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--workspace-focus)] motion-reduce:hover:translate-y-0 sm:p-7 ${
          isDark
            ? 'bg-[#1c1b18] border-neutral-800/90 text-white shadow-xl shadow-black/40'
            : 'bg-white border-slate-200/90 text-ink shadow-sm shadow-slate-900/5 hover:border-slate-300'
        }`}>
        <div className="flex items-start justify-between gap-3">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${isDark ? 'bg-[#c86544]/18 text-[#f3b69f]' : 'bg-[#f5ebe6] text-[#92452b]'}`}><SealCheck size={15} aria-hidden="true" /> Rank {featured.rank}</span>
          <ArrowUpRight size={18} className={muted} aria-hidden="true" />
        </div>
        <div className="mt-5 flex min-w-0 items-center gap-4">
          <ProviderAvatar provider={featured} size="large" />
          <div className="min-w-0">
            <span className="block break-words text-lg font-bold leading-6 tracking-tight group-hover:text-[#aa5032] dark:group-hover:text-[#e9a58c]">{featured.name}{featured.id === currentUserId ? ' (You)' : ''}</span>
            <span className={`mt-1 block text-sm ${muted}`}>{featured.primaryService || 'Local service provider'}</span>
            {featured.verificationStatus === 'APPROVED' && <span className={`mt-2 inline-flex items-center gap-1 text-xs font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}><ShieldCheck size={15} weight="fill" aria-hidden="true" /> Verified resident</span>}
          </div>
        </div>
        <div className={`mt-5 grid grid-cols-3 gap-2 border-t pt-4 text-xs ${isDark ? 'border-neutral-800' : 'border-slate-100'}`}>
          <span><strong className="block text-base font-extrabold tabular-nums">{featured.trustScore}/100</strong><span className={muted}>Trust score</span></span>
          <span><strong className="flex items-center gap-1 text-base font-extrabold tabular-nums"><Star size={14} weight="fill" className="text-amber-500" aria-hidden="true" />{featured.avgRating === null ? '—' : featured.avgRating.toFixed(1)}</strong><span className={muted}>{featured.reviewCount} reviews</span></span>
          <span><strong className="block text-base font-extrabold tabular-nums">{featured.completedJobs}</strong><span className={muted}>Completed this week</span></span>
        </div>
      </button>

      {supporting.length > 0 && (
        <div className={`divide-y rounded-3xl border px-5 py-2 transition-all ${
          isDark
            ? 'divide-neutral-800/80 bg-[#1c1b18] border-neutral-800/90 shadow-xl shadow-black/40'
            : 'divide-slate-100 bg-white border-slate-200/90 shadow-sm shadow-slate-900/5'
        }`}>
          {supporting.map((provider) => (
            <button type="button" key={provider.id} onClick={() => onSelect(provider.id)} aria-label={`View ranked provider ${provider.name}`}
              className="group flex w-full min-w-0 items-start gap-3 py-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--workspace-focus)]">
              <ProviderAvatar provider={provider} size="small" />
              <span className="min-w-0 flex-1">
                <span className={`block text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>Rank {provider.rank}</span>
                <span className={`mt-0.5 block break-words text-sm font-bold group-hover:text-[#aa5032] dark:group-hover:text-[#e9a58c] ${isDark ? 'text-white' : 'text-ink'}`}>{provider.name}{provider.id === currentUserId ? ' (You)' : ''}</span>
                <span className={`mt-0.5 block text-xs ${muted}`}>{provider.primaryService || 'Local service provider'}</span>
                <span className={`mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] ${muted}`}>
                  <TrustScoreBadge score={provider.trustScore} />
                  <span><Star size={12} weight="fill" className="mr-1 inline text-amber-500" aria-hidden="true" />{provider.avgRating === null ? 'No ratings' : provider.avgRating.toFixed(1)} ({provider.reviewCount})</span>
                  <span>{provider.completedJobs} completed this week</span>
                  {provider.verificationStatus === 'APPROVED' && <span className={isDark ? 'text-emerald-400 font-medium' : 'text-emerald-600 font-medium'}><ShieldCheck size={12} weight="fill" className="mr-1 inline" aria-hidden="true" />Verified</span>}
                </span>
              </span>
              <ArrowUpRight size={15} className={`mt-1 shrink-0 ${muted}`} aria-hidden="true" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
