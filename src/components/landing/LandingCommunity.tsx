'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, Megaphone, UsersRound } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

interface LandingCommunityProps {
  isDark: boolean;
}

const items = [
  {
    title: 'Official Community Updates',
    copy: 'Read announcements and service updates shared by ServiceHub administrators.',
    icon: Megaphone,
  },
  {
    title: 'Recently Added Services',
    copy: 'Discover published services that were recently added to the marketplace.',
    icon: BadgeCheck,
  },
  {
    title: 'Local Provider Directory',
    copy: 'Browse public provider profiles and see their active services, ratings, and trust information.',
    icon: UsersRound,
  },
];

export default function LandingCommunity({ isDark }: LandingCommunityProps) {
  return (
    <section
      id="community"
      data-theme={isDark ? 'dark' : 'light'}
      className="scroll-mt-20 border-b border-white/10 bg-charcoal px-5 py-20 text-zinc-100 sm:px-8 lg:px-10 lg:py-28"
    >
      <div className="mx-auto max-w-7xl">
        <ScrollReveal className="max-w-3xl">
          <h2 className="max-w-[17ch] font-sans text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl lg:leading-[1.12]">
            See what is happening across ServiceHub Cordova.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-300">
            Follow local service activity in the Community Hub after signing in.
          </p>
        </ScrollReveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3 lg:grid-cols-[1.15fr_1fr_1fr]">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <ScrollReveal
                key={item.title}
                direction="scale"
                delay={index * 0.09}
                hoverLift
                className="rounded-2xl border border-white/10 bg-charcoal p-7 shadow-[0_14px_30px_-18px_rgba(0,0,0,0.85)] transition-colors hover:border-white/20 sm:p-8"
              >
                <div className="grid size-11 place-items-center rounded-xl bg-[#c86544]/15 text-orange-300">
                  <Icon size={22} />
                </div>
                <h3 className="mt-6 text-lg font-bold text-white">
                  {item.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-zinc-400">
                  {item.copy}
                </p>
              </ScrollReveal>
            );
          })}
        </div>

        <ScrollReveal className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-zinc-400">
            Sign in to explore ServiceHub updates and local service activity.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-xs font-bold text-orange-300 transition-colors hover:text-orange-200 active:scale-[0.98]"
          >
            <span>Sign in to view the Community Hub</span>
            <ArrowRight size={14} />
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
