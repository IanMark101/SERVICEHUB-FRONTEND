'use client';

import React from 'react';
import { ClipboardCheck, MessageSquareText, Star } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

interface LandingReviewsProps {
  isDark: boolean;
}

const reviewMilestones = [
  {
    icon: ClipboardCheck,
    title: 'Work Completed',
    copy: 'The provider marks the work complete, then the seeker confirms the result.',
    tag: 'Step 1',
  },
  {
    icon: MessageSquareText,
    title: 'Verified Review Submitted',
    copy: 'An eligible participant can review the completed service relationship.',
    tag: 'Step 2',
  },
  {
    icon: Star,
    title: 'Reputation Score Updated',
    copy: 'Public provider ratings and trust point history reflect completed service reviews.',
    tag: 'Step 3',
  },
];

export default function LandingReviews({ isDark }: LandingReviewsProps) {
  return (
    <section
      id="reviews"
      data-theme={isDark ? 'dark' : 'light'}
      className="scroll-mt-20 border-b border-black/[0.06] bg-transparent px-5 py-20 dark:border-white/10 sm:px-8 lg:px-10 lg:py-24"
    >
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <ScrollReveal>
          <h2 className="font-sans text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-4xl lg:text-5xl lg:leading-[1.12]">
            Reviews require real service completion.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-slate-600 dark:text-zinc-400">
            ServiceHub unlocks reviews only for eligible participants after the related work is formally confirmed as completed.
          </p>
        </ScrollReveal>

        <div className="grid gap-4 sm:grid-cols-3">
          {reviewMilestones.map((item, index) => {
            const Icon = item.icon;
            return (
              <ScrollReveal
                key={item.title}
                direction="scale"
                delay={index * 0.09}
                hoverLift
                className="relative rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.03)] transition-all hover:border-neutral-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/90"
              >
                <div className="flex items-center justify-between">
                  <div className="grid size-10 place-items-center rounded-xl bg-white text-[#c86544] shadow-xs dark:bg-zinc-800 dark:text-orange-400">
                    <Icon size={18} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500">
                    {item.tag}
                  </span>
                </div>
                <h3 className="mt-6 text-sm font-bold text-slate-950 dark:text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-zinc-400">
                  {item.copy}
                </p>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
