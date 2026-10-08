import React, { useState } from 'react';
import Image from 'next/image';
import {
  Trophy,
  Medal,
  Star,
  ShieldCheck,
  ArrowUpRight,
  CaretDown,
  CaretUp,
  Sparkle,
} from '@phosphor-icons/react';
import type { TopProvider } from '../types/community.types';
import TrustScoreBadge from '../../../components/ui/TrustScoreBadge';

interface SteppedPodiumGraphProps {
  providers: TopProvider[];
  currentUserId?: string;
  isDark?: boolean;
  onSelect: (id: string) => void;
}

function ProviderAvatar({
  provider,
  rank,
  size = 'large',
}: {
  provider: TopProvider;
  rank: number;
  size?: 'large' | 'medium' | 'small';
}) {
  const sizeClasses = {
    large: 'size-13 sm:size-20 md:size-24 text-base sm:text-2xl',
    medium: 'size-10 sm:size-16 md:size-20 text-sm sm:text-xl',
    small: 'size-8 sm:size-10 text-xs sm:text-sm',
  };

  const ringColors = {
    1: 'ring-2 sm:ring-4 ring-amber-400 dark:ring-amber-400/80 shadow-[0_0_24px_rgba(251,191,36,0.35)]',
    2: 'ring-2 sm:ring-4 ring-slate-300 dark:ring-neutral-400 shadow-[0_0_18px_rgba(148,163,184,0.25)]',
    3: 'ring-2 sm:ring-4 ring-amber-700/60 dark:ring-amber-600/70 shadow-[0_0_18px_rgba(180,83,9,0.2)]',
  };

  const ring = ringColors[rank as 1 | 2 | 3] || 'ring-2 ring-slate-200 dark:ring-neutral-700';

  if (provider.avatarUrl) {
    return (
      <Image
        src={provider.avatarUrl}
        alt={provider.name}
        width={size === 'large' ? 96 : size === 'medium' ? 72 : 40}
        height={size === 'large' ? 96 : size === 'medium' ? 72 : 40}
        unoptimized
        className={`${sizeClasses[size]} shrink-0 rounded-full object-cover ${ring} transition-transform duration-300 group-hover:scale-105`}
      />
    );
  }

  return (
    <span
      className={`grid ${sizeClasses[size]} shrink-0 place-items-center rounded-full font-black ${ring} transition-transform duration-300 group-hover:scale-105 ${
        rank === 1
          ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
          : rank === 2
            ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-ink dark:from-charcoal dark:to-charcoal dark:text-white'
            : 'bg-gradient-to-br from-amber-600 to-amber-800 text-amber-100'
      }`}
    >
      {provider.name.charAt(0).toUpperCase()}
    </span>
  );
}

export default function SteppedPodiumGraph({
  providers = [],
  currentUserId,
  isDark = false,
  onSelect,
}: SteppedPodiumGraphProps) {
  const [showRemaining, setShowRemaining] = useState(false);

  const champion = providers.find((p) => p.rank === 1);
  const runnerUp2 = providers.find((p) => p.rank === 2);
  const runnerUp3 = providers.find((p) => p.rank === 3);
  const remainingProviders = providers.filter((p) => p.rank > 3);

  if (!champion) return null;

  // Stepped Podium order: [Rank 2 on Left, Rank 1 Center (Tallest), Rank 3 on Right]
  const podiumSlots = [
    { rank: 2, provider: runnerUp2, heightClass: 'h-24 sm:h-36 md:h-44', pedestalTier: 'silver' },
    { rank: 1, provider: champion, heightClass: 'h-32 sm:h-48 md:h-60', pedestalTier: 'gold' },
    { rank: 3, provider: runnerUp3, heightClass: 'h-16 sm:h-24 md:h-32', pedestalTier: 'bronze' },
  ].filter((slot) => !!slot.provider);

  return (
    <div className="space-y-6">
      {/* Podium Stage Container */}
      <div
        className={`relative overflow-hidden rounded-3xl border p-2.5 sm:p-6 md:p-8 lg:p-10 transition-all ${
          isDark
            ? 'bg-gradient-to-b from-charcoal via-charcoal to-charcoal border-neutral-800 shadow-2xl shadow-black/50'
            : 'bg-gradient-to-b from-amber-50/40 via-white to-slate-50/60 border-slate-200/90 shadow-lg shadow-slate-900/5'
        }`}
      >
        {/* Subtle ambient lighting for the center champion */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 -translate-y-1/3 rounded-full bg-gradient-to-b from-amber-500/15 via-orange-500/5 to-transparent blur-3xl"
        />

        {/* The Stepped Podium Grid: Left (Rank 2), Center (Rank 1), Right (Rank 3) */}
        <div className={`relative z-10 grid items-end justify-center gap-1 sm:gap-4 md:gap-6 ${
          podiumSlots.length === 1
            ? 'max-w-md mx-auto grid-cols-1'
            : podiumSlots.length === 2
              ? 'max-w-2xl mx-auto grid-cols-2'
              : 'max-w-4xl mx-auto grid-cols-3'
        }`}>
          {podiumSlots.map(({ rank, provider, heightClass, pedestalTier }) => {
            if (!provider) return null;
            const isChampion = rank === 1;

            return (
              <div
                key={provider.id}
                className={`flex flex-col items-center justify-end min-w-0 ${isChampion ? 'z-20' : 'z-10'}`}
              >
                {/* Floating Profile Info Above the Pedestal */}
                <button
                  type="button"
                  onClick={() => onSelect(provider.id)}
                  aria-label={`View ranked provider ${provider.name}`}
                  className="group flex w-full flex-col items-center pb-2 sm:pb-4 text-center cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-500"
                >
                  {/* Floating Rank Crown or Badge */}
                  <div className="mb-1 sm:mb-2">
                    {isChampion ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 sm:px-3 sm:py-1 text-[9px] sm:text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-300 ring-1 ring-amber-500/40 shadow-xs">
                        <Trophy size={11} weight="fill" className="text-amber-500 sm:size-[14px]" />
                        Top 1
                      </span>
                    ) : (
                      <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 sm:px-2.5 sm:py-0.5 text-[8.5px] sm:text-[11px] font-extrabold uppercase tracking-wider ${
                        rank === 2
                          ? isDark
                            ? 'bg-charcoal text-slate-300 ring-1 ring-neutral-700'
                            : 'bg-slate-100 text-ink-secondary ring-1 ring-slate-200'
                          : isDark
                            ? 'bg-amber-950/40 text-amber-400 ring-1 ring-amber-900/60'
                            : 'bg-amber-100/80 text-amber-800 ring-1 ring-amber-200'
                      }`}>
                        <Medal size={10} weight="bold" className="sm:size-[12px]" />
                        Rank {rank}
                      </span>
                    )}
                  </div>

                  {/* Provider Avatar */}
                  <div className="relative">
                    <ProviderAvatar provider={provider} rank={rank} size={isChampion ? 'large' : 'medium'} />
                    {isChampion && (
                      <span className="absolute -top-2 -right-1 sm:-top-3 sm:-right-2 grid size-4.5 sm:size-7 place-items-center rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-[9px] sm:text-xs font-black text-amber-950 shadow-md ring-1 sm:ring-2 ring-white dark:ring-neutral-900">
                        👑
                      </span>
                    )}
                  </div>

                  {/* Provider Name */}
                  <span className={`mt-1.5 sm:mt-3 block font-black tracking-tight transition-colors truncate max-w-[100px] sm:max-w-none px-0.5 ${
                    isChampion
                      ? 'text-[11.5px] sm:text-base md:text-lg group-hover:text-orange-600 dark:group-hover:text-orange-400'
                      : 'text-[10.5px] sm:text-sm md:text-base group-hover:text-orange-600 dark:group-hover:text-orange-400'
                  } ${isDark ? 'text-white' : 'text-ink'}`}>
                    {provider.name}
                    {provider.id === currentUserId ? ' (You)' : ''}
                  </span>

                  {/* Trade / Primary Service */}
                  <span className="mt-0.5 truncate max-w-[100px] sm:max-w-none px-0.5 text-[9.5px] sm:text-xs font-medium text-ink-muted dark:text-ink-muted">
                    {provider.primaryService || 'Local service provider'}
                  </span>

                  {/* Verified Resident Seal */}
                  {provider.verificationStatus === 'APPROVED' && (
                    <span className="mt-0.5 sm:mt-1.5 inline-flex items-center gap-1 text-[9.5px] sm:text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck size={11} weight="fill" className="sm:size-[14px] shrink-0" />
                      <span className="hidden sm:inline">Verified resident</span>
                      <span className="sm:hidden">Verified</span>
                    </span>
                  )}

                  {/* Responsive Metrics Pill */}
                  <div className={`mt-1 sm:mt-2 flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 rounded-lg sm:rounded-xl px-1 sm:px-2.5 py-0.5 sm:py-1 text-[9px] sm:text-[11px] font-semibold border max-w-full ${
                    isDark
                      ? 'bg-charcoal/80 border-neutral-800 text-neutral-300'
                      : 'bg-white/90 border-slate-200/80 text-ink-secondary shadow-2xs'
                  }`}>
                    <div className="flex flex-wrap items-center justify-center gap-1">
                      <TrustScoreBadge score={provider.trustScore} compact />
                      <span className="text-slate-300 dark:text-ink-secondary">•</span>
                      <span className="inline-flex items-center gap-0.5">
                        <Star size={9} weight="fill" className="text-amber-500 sm:size-[11px]" />
                        {provider.avgRating ? provider.avgRating.toFixed(1) : '—'}
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5 sm:gap-1">
                      <span className="hidden sm:inline text-slate-300 dark:text-ink-secondary">•</span>
                      <span className="tabular-nums font-bold">{provider.completedJobs}</span>
                      <span className="text-ink-subtle dark:text-ink-subtle font-normal">completed</span>
                    </div>
                  </div>
                </button>

                {/* The Physical Bar / Pedestal */}
                <div
                  className={`w-full rounded-t-xl sm:rounded-t-3xl border-t border-x flex flex-col items-center justify-between p-1.5 sm:p-4 transition-all duration-300 ${heightClass} ${
                    pedestalTier === 'gold'
                      ? isDark
                        ? 'bg-gradient-to-b from-amber-500/25 via-amber-950/20 to-charcoal/80 border-amber-500/40 shadow-[0_-8px_24px_rgba(245,158,11,0.15)]'
                        : 'bg-gradient-to-b from-amber-200/70 via-amber-100/40 to-white border-amber-300/80 shadow-[0_-8px_20px_rgba(251,191,36,0.2)]'
                      : pedestalTier === 'silver'
                        ? isDark
                          ? 'bg-gradient-to-b from-charcoal/30 via-charcoal/20 to-charcoal/80 border-neutral-700/60'
                          : 'bg-gradient-to-b from-slate-200/80 via-slate-100/40 to-white border-slate-300/80'
                        : isDark
                          ? 'bg-gradient-to-b from-amber-900/25 via-charcoal/20 to-charcoal/80 border-amber-900/40'
                          : 'bg-gradient-to-b from-amber-100/60 via-orange-50/30 to-white border-amber-200/80'
                  }`}
                >
                  {/* Subtle top indicator bar */}
                  <span className={`h-0.5 sm:h-1 w-5 sm:w-16 rounded-full ${
                    pedestalTier === 'gold'
                      ? 'bg-amber-400'
                      : pedestalTier === 'silver'
                        ? 'bg-slate-400'
                        : 'bg-amber-700'
                  }`} />

                  {/* Metallic Rank Number */}
                  <span className={`font-sans text-xl sm:text-5xl md:text-6xl font-black leading-none tracking-tighter select-none ${
                    pedestalTier === 'gold'
                      ? 'text-amber-500/80 dark:text-amber-400/90 drop-shadow-sm'
                      : pedestalTier === 'silver'
                        ? 'text-slate-400/80 dark:text-neutral-400/80'
                        : 'text-amber-700/60 dark:text-amber-600/70'
                  }`}>
                    {rank}
                  </span>

                  {/* Pedestal Bottom Label */}
                  <span className="text-[8px] sm:text-[11px] font-extrabold uppercase tracking-wider text-ink-muted dark:text-ink-muted select-none text-center">
                    {pedestalTier === 'gold' ? 'Champion' : pedestalTier === 'silver' ? 'Runner-Up' : 'Podium 3'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ranks 4-10 Expandable Table */}
      {remainingProviders.length > 0 && (
        <div
          className={`rounded-3xl border transition-all ${
            isDark
              ? 'bg-charcoal-inset border-neutral-800/90'
              : 'bg-white border-slate-200/90 shadow-xs'
          }`}
        >
          <button
            type="button"
            onClick={() => setShowRemaining(!showRemaining)}
            className="flex w-full items-center justify-between gap-2 p-3.5 sm:p-5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 cursor-pointer"
          >
            <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
              <Sparkle size={18} className="text-[#c86544] shrink-0" aria-hidden="true" />
              <span className={`truncate text-xs sm:text-sm font-bold tracking-tight ${isDark ? 'text-white' : 'text-ink'}`}>
                More recognized providers (Ranks 4–{Math.min(10, providers.length)})
              </span>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] sm:text-xs font-bold ${
                isDark ? 'bg-charcoal text-neutral-300' : 'bg-slate-100 text-ink-muted'
              }`}>
                {remainingProviders.length}
              </span>
            </div>
            {showRemaining ? <CaretUp size={18} className="shrink-0" /> : <CaretDown size={18} className="shrink-0" />}
          </button>

          {showRemaining && (
            <div className="divide-y border-t px-4 sm:px-5 pb-3 pt-1 border-slate-100 dark:border-neutral-800/80 divide-slate-100 dark:divide-neutral-800/80">
              {remainingProviders.map((provider) => (
                <button
                  type="button"
                  key={provider.id}
                  onClick={() => onSelect(provider.id)}
                  aria-label={`View ranked provider ${provider.name}`}
                  className="group flex w-full items-center gap-2.5 sm:gap-3 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c86544] cursor-pointer"
                >
                  <span className="w-5 sm:w-6 shrink-0 text-center text-xs font-bold tabular-nums text-ink-subtle dark:text-ink-subtle">
                    #{provider.rank}
                  </span>
                  <div className="min-w-0 flex-1 flex items-center gap-2.5 sm:gap-3">
                    <ProviderAvatar provider={provider} rank={provider.rank} size="small" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className={`truncate text-xs sm:text-sm font-bold group-hover:text-orange-600 dark:group-hover:text-orange-400 ${
                          isDark ? 'text-white' : 'text-ink'
                        }`}>
                          {provider.name}{provider.id === currentUserId ? ' (You)' : ''}
                        </span>
                        {provider.verificationStatus === 'APPROVED' && (
                          <ShieldCheck size={14} weight="fill" className="shrink-0 text-emerald-500" aria-label="Verified resident" />
                        )}
                      </div>
                      <span className="block truncate text-[11px] sm:text-xs text-ink-muted dark:text-ink-muted">
                        {provider.primaryService || 'Local provider'}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <TrustScoreBadge score={provider.trustScore} />
                    <span className="block text-[10px] sm:text-[11px] text-ink-subtle dark:text-ink-subtle">
                      {provider.completedJobs} completed
                    </span>
                  </div>
                  <ArrowUpRight size={14} className="shrink-0 text-ink-subtle group-hover:text-orange-600 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
