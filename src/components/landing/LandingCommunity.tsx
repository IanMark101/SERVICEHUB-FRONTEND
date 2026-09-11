'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Megaphone, Sparkles, UsersRound } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

interface LandingCommunityProps {
  isDark: boolean;
}

const items = [
  {
    title: 'Verified Civic Announcements',
    copy: 'Official administrator advisories and genuine database-backed milestones for Cordova residents.',
    icon: Megaphone,
  },
  {
    title: 'Newly Approved Listings',
    copy: 'Freshly moderated local service offerings across electrical, plumbing, carpentry, and cleaning.',
    icon: Sparkles,
  },
  {
    title: 'Local Provider Directory',
    copy: 'Public provider directory filtered by approved residency and active marketplace credibility.',
    icon: UsersRound,
  },
];

export default function LandingCommunity({ isDark }: LandingCommunityProps) {
  return (
    <section
      id="community"
      data-theme={isDark ? 'dark' : 'light'}
      className="scroll-mt-20 border-b border-black/[0.06] bg-transparent px-5 py-20 text-slate-950 dark:border-white/10 dark:text-white sm:px-8 lg:px-10 lg:py-28"
    >
      <div className="mx-auto max-w-7xl">
        <ScrollReveal className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <h2 className="font-sans text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-4xl lg:text-5xl lg:leading-[1.12]">
              See what is happening across ServiceHub Cordova.
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-relaxed text-slate-600 dark:text-zinc-300">
            The authenticated Community Hub provides live community statistics, recent listings, and visible local providers without fake artificial activity counters.
          </p>
        </ScrollReveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <ScrollReveal
                key={item.title}
                className="rounded-2xl border border-neutral-200/80 bg-white p-7 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.03)] transition-all hover:border-neutral-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/90 sm:p-8"
              >
                <div className="grid size-11 place-items-center rounded-xl bg-orange-100 text-[#c86544] dark:bg-zinc-800 dark:text-orange-400">
                  <Icon size={22} />
                </div>
                <h3 className="mt-6 text-lg font-bold text-slate-950 dark:text-white">
                  {item.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-600 dark:text-zinc-400">
                  {item.copy}
                </p>
              </ScrollReveal>
            );
          })}
        </div>

        <ScrollReveal className="mt-10 flex items-center justify-between border-t border-black/[0.06] pt-6 dark:border-zinc-800/80">
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Access verified community bulletins and neighborhood service updates.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#c86544] transition-colors hover:text-[#aa5032] active:scale-[0.98] dark:text-orange-400 dark:hover:text-orange-300"
          >
            <span>Sign in to view the Community Hub</span>
            <ArrowRight size={14} />
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
