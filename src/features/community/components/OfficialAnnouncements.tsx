import React, { useState } from 'react';
import { Megaphone, SealCheck, Bell, CaretLeft, CaretRight } from '@phosphor-icons/react';
import type { CommunityAnnouncement } from '../types/community.types';
import { UpdatesSkeleton } from './CommunitySkeletons';
import CommunityEmptyState from './CommunityEmptyState';

interface OfficialAnnouncementsProps {
  announcements: CommunityAnnouncement[];
  loading?: boolean;
  isDark?: boolean;
}

export default function OfficialAnnouncements({
  announcements = [],
  loading = false,
  isDark = false,
}: OfficialAnnouncementsProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (loading) {
    return (
      <section id="community-announcements" className="scroll-mt-28 space-y-4" aria-label="Official announcements">
        <div className="flex items-center gap-2.5">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-orange-500/15 text-brand-text"><Megaphone size={19} weight="fill" aria-hidden="true" /></div>
          <div className="min-w-0"><h2 className="text-lg font-black tracking-tight sm:text-2xl">Official platform notices</h2><p className="truncate text-[11px] text-ink-muted sm:text-xs">Direct announcements from ServiceHub Administration</p></div>
        </div>
        <UpdatesSkeleton isDark={isDark} />
      </section>
    );
  }

  if (announcements.length === 0) {
    return (
      <section
        id="community-announcements"
        className="scroll-mt-28 space-y-4"
        aria-labelledby="official-announcements-title"
      >
        <div className="flex items-center gap-2.5">
          <div className="grid size-8 place-items-center rounded-xl bg-orange-500/15 text-brand-text dark:text-orange-400">
            <Megaphone size={18} weight="fill" aria-hidden="true" />
          </div>
          <h2 id="official-announcements-title" className={`text-xl font-extrabold tracking-tight sm:text-2xl ${isDark ? 'text-white' : 'text-ink'}`}>
            Official platform notices
          </h2>
        </div>
        <div className={`rounded-3xl border p-6 ${isDark ? 'bg-charcoal-inset border-neutral-800' : 'bg-white border-slate-200/90'}`}>
          <CommunityEmptyState
            icon={Bell}
            title="No official announcements at this time"
            description="Important ServiceHub notices will be published here."
            isDark={isDark}
          />
        </div>
      </section>
    );
  }

  const currentNotice = announcements[activeIndex] || announcements[0];
  const hasMultiple = announcements.length > 1;

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : announcements.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < announcements.length - 1 ? prev + 1 : 0));
  };

  return (
    <section
      id="community-announcements"
      className="scroll-mt-28 space-y-4"
      aria-labelledby="official-announcements-title"
    >
      {/* Section Header with Live Broadcast Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-sm shadow-orange-500/20">
            <Megaphone size={19} weight="fill" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 id="official-announcements-title" className={`text-lg font-black tracking-tight sm:text-2xl ${isDark ? 'text-white' : 'text-ink'}`}>
                Official platform notices
              </h2>
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
            </div>
            <p className={`text-[11px] sm:text-xs truncate ${isDark ? 'text-ink-subtle' : 'text-ink-muted'}`}>
              Direct announcements from ServiceHub Administration
            </p>
          </div>
        </div>

        {/* Pager if multiple notices exist */}
        {hasMultiple && (
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <span className={`text-[11px] sm:text-xs font-semibold ${isDark ? 'text-ink-subtle' : 'text-ink-muted'}`}>
              Bulletin {activeIndex + 1} of {announcements.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous announcement"
                className={`grid size-8 place-items-center rounded-xl border transition-colors ${
                  isDark
                    ? 'border-neutral-800 bg-charcoal text-neutral-300 hover:bg-charcoal hover:text-white'
                    : 'border-slate-200 bg-white text-ink-muted hover:bg-slate-100 hover:text-ink shadow-2xs'
                }`}
              >
                <CaretLeft size={16} weight="bold" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next announcement"
                className={`grid size-8 place-items-center rounded-xl border transition-colors ${
                  isDark
                    ? 'border-neutral-800 bg-charcoal text-neutral-300 hover:bg-charcoal hover:text-white'
                    : 'border-slate-200 bg-white text-ink-muted hover:bg-slate-100 hover:text-ink shadow-2xs'
                }`}
              >
                <CaretRight size={16} weight="bold" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hero Notice Card with Warm Editorial Finish */}
      <article
        className={`relative overflow-hidden rounded-3xl border p-4 sm:p-7 md:p-8 transition-all ${
          isDark
            ? 'bg-gradient-to-br from-charcoal via-charcoal to-charcoal border-orange-500/30 text-white shadow-2xl shadow-black/40'
            : 'bg-gradient-to-br from-orange-50/80 via-amber-50/30 to-white border-orange-200/90 text-ink shadow-lg shadow-orange-950/5'
        }`}
      >
        {/* Decorative corner seal background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-6 -top-6 size-36 rounded-full bg-gradient-to-br from-orange-500/10 to-amber-500/5 blur-2xl"
        />

        <div className="relative z-10 space-y-3 sm:space-y-4">
          {/* Header Row: Badge & Timestamp */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-black uppercase tracking-wider ${
              isDark
                ? 'bg-orange-500/20 text-orange-400 ring-1 ring-orange-500/40'
                : 'bg-orange-100 text-orange-800 ring-1 ring-orange-300/80'
            }`}>
              <Megaphone size={13} weight="fill" className="text-brand-text dark:text-orange-400 shrink-0" />
              Official Administration Notice
            </span>

            <time
              dateTime={currentNotice.publishedAt}
              className={`text-[11px] sm:text-xs font-bold shrink-0 ${isDark ? 'text-ink-subtle' : 'text-ink-muted'}`}
            >
              {new Date(currentNotice.publishedAt).toLocaleDateString('en-PH', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </time>
          </div>

          {/* Announcement Headline */}
          <h3 className={`text-lg sm:text-2xl lg:text-[1.65rem] font-black tracking-tight leading-snug ${
            isDark ? 'text-white' : 'text-ink'
          }`}>
            {currentNotice.title}
          </h3>

          {/* Announcement Body */}
          <p className={`text-xs sm:text-base leading-relaxed ${
            isDark ? 'text-neutral-300' : 'text-ink-secondary'
          }`}>
            {currentNotice.body}
          </p>

          {/* Verification Seal & Poster */}
          <div className="pt-2 sm:pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-t border-orange-200/50 dark:border-neutral-800">
            <div className="flex min-w-0 items-center gap-1.5 text-[11px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <SealCheck size={16} weight="fill" className="shrink-0" />
              <span className="truncate">Posted by {currentNotice.author?.name || 'ServiceHub Administration'}</span>
            </div>

            {hasMultiple && (
              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                {announcements.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    aria-label={`Go to notice ${idx + 1}`}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === activeIndex
                        ? 'w-6 bg-orange-500'
                        : isDark
                          ? 'w-2 bg-charcoal hover:bg-charcoal'
                          : 'w-2 bg-slate-300 hover:bg-slate-400'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </article>
    </section>
  );
}
