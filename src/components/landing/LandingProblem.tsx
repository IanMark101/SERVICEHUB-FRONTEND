'use client';

import React from 'react';
import { ArrowDown, CheckCircle2, FileCheck2, ShieldCheck } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

interface LandingProblemProps {
  isDark: boolean;
}

const pillars = [
  {
    title: 'Clear Terms Upfront',
    description: 'See the price, estimated duration, and accepted payment options before choosing a service.',
    icon: ShieldCheck,
    tag: 'Informed Choices',
  },
  {
    title: 'Room for Specific Needs',
    description: 'Describe a task in your own words and set a budget when a published service does not fit.',
    icon: FileCheck2,
    tag: 'Custom Requests',
  },
  {
    title: 'A Record You Can Follow',
    description: 'Keep agreed work and its progress in one booking record instead of piecing together separate posts and conversations.',
    icon: CheckCircle2,
    tag: 'Organized Work',
  },
];

export default function LandingProblem({ isDark }: LandingProblemProps) {
  return (
    <section
      id="problem"
      data-theme={isDark ? 'dark' : 'light'}
      className="scroll-mt-0 border-b border-black/[0.06] bg-transparent px-5 py-20 dark:border-white/10 sm:px-8 lg:px-10 lg:py-28"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section Header: Headline + Subhead, stacked cleanly without redundant eyebrow */}
        <ScrollReveal className="max-w-3xl">
          <h2 className="font-sans text-3xl font-extrabold tracking-tight text-[#0a0a0a] dark:text-white sm:text-4xl lg:text-5xl lg:leading-[1.12]">
            Local service work deserves more structure than a social media post.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-neutral-600 dark:text-zinc-300 sm:text-lg">
            Arranging a job takes more effort when its price, scope, and progress are scattered across posts. ServiceHub keeps those decisions organized.
          </p>
        </ScrollReveal>

        {/* 3 Civic Pillars - Distinctive high-contrast cards with subtle borders */}
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <ScrollReveal
                key={pillar.title}
                direction="scale"
                delay={index * 0.08}
                hoverLift
                className="group relative rounded-2xl border border-neutral-200/80 bg-white p-7 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.03)] transition-all hover:border-neutral-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/90 dark:hover:border-zinc-700 sm:p-8"
              >
                <div className="flex items-center justify-between">
                  <div className="grid size-12 place-items-center rounded-xl bg-white text-[#c86544] shadow-xs dark:bg-zinc-800 dark:text-orange-400">
                    <Icon size={22} />
                  </div>
                  <span className="text-[11px] font-bold text-neutral-400 dark:text-zinc-500">
                    {pillar.tag}
                  </span>
                </div>
                <h3 className="mt-8 text-lg font-bold text-[#0a0a0a] dark:text-white">
                  {pillar.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-zinc-400">
                  {pillar.description}
                </p>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Action Link */}
        <ScrollReveal className="mt-10 flex items-center justify-between border-t border-slate-200/80 pt-6 dark:border-zinc-800">
          <p className="text-xs font-medium text-neutral-500 dark:text-zinc-400">
            Built for accountable local service work across Cordova, Cebu.
          </p>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#c86544] transition-colors hover:text-[#aa5032] active:scale-[0.98]"
          >
            <span>See how ServiceHub works</span>
            <ArrowDown size={14} />
          </a>
        </ScrollReveal>
      </div>
    </section>
  );
}
