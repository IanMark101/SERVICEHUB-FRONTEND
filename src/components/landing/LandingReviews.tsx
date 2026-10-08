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
    title: 'Both Sides Can Review',
    copy: 'After completion, the Seeker and Provider can each leave one review.',
    tag: 'Step 2',
  },
  {
    icon: Star,
    title: 'Trust History Updates',
    copy: 'The feedback becomes part of the recipient\'s ratings and trust history.',
    tag: 'Step 3',
  },
];

export default function LandingReviews({ isDark }: LandingReviewsProps) {
  return (
    <section
      id="reviews"
      data-landing-framing="viewport"
      data-theme={isDark ? 'dark' : 'light'}
      className="scroll-mt-20 border-b border-black/[0.06] bg-transparent px-5 pt-16 pb-16 dark:border-white/10 sm:px-8 sm:pt-20 lg:flex lg:min-h-[100svh] lg:items-center lg:px-10 lg:py-28"
    >
      <div className="mx-auto w-full max-w-7xl">
        <ScrollReveal className="max-w-3xl">
          <h2 className="text-balance font-sans text-3xl font-extrabold tracking-tight text-[#0a0a0a] dark:text-white sm:text-4xl lg:text-5xl lg:leading-[1.12]">
            Reviews come from completed ServiceHub work.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-neutral-600 dark:text-zinc-400">
            Feedback helps the next person make an informed choice. Here is how it becomes part of a ServiceHub profile.
          </p>
        </ScrollReveal>

        <div className="mt-8 grid gap-4 sm:mt-10 md:grid-cols-3 md:gap-6">
          {reviewMilestones.map((item, index) => {
            const Icon = item.icon;
            return (
              <ScrollReveal
                key={item.title}
                direction="scale"
                delay={index * 0.09}
                hoverLift
                className="relative rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.03)] transition-all hover:border-neutral-300 hover:shadow-md dark:border-zinc-800 dark:bg-charcoal/90 sm:p-7"
              >
                <div className="flex items-center justify-between">
                  <div className="grid size-10 place-items-center rounded-xl bg-white text-[#c86544] shadow-xs dark:bg-charcoal dark:text-orange-400">
                    <Icon size={18} />
                  </div>
                  <span className="text-[11px] font-semibold text-neutral-500 dark:text-zinc-400">
                    {item.tag}
                  </span>
                </div>
                <h3 className="mt-5 text-base font-bold text-[#0a0a0a] dark:text-white sm:text-lg">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-zinc-400">
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
