'use client';

import React from 'react';
import { ArrowDown, CheckCircle2, FileCheck2, ShieldAlert, ShieldCheck } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

interface LandingProblemProps {
  isDark: boolean;
}

const pillars = [
  {
    title: 'Residency Verification First',
    description: 'Verify genuine Cordova residency before starting new marketplace transactions, keeping interactions accountable and local.',
    icon: ShieldCheck,
    tag: 'Identity Protection',
  },
  {
    title: 'Protected Booking Lifecycles',
    description: 'Track requests, provider offers, job-scoped messages, and verified completion receipts instead of relying on chaotic social group chats.',
    icon: FileCheck2,
    tag: 'Structured Flow',
  },
  {
    title: 'First-Paid, First-Served Queues',
    description: 'Fair listing-specific queues with backend payment confirmation for online work, alongside direct arrangements for on-site cash.',
    icon: CheckCircle2,
    tag: 'Fair Capacity',
  },
];

export default function LandingProblem({ isDark }: LandingProblemProps) {
  return (
    <section
      id="problem"
      data-theme={isDark ? 'dark' : 'light'}
      className="scroll-mt-20 border-b border-black/[0.06] bg-transparent px-5 py-20 dark:border-white/10 sm:px-8 lg:px-10 lg:py-28"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section Header: Headline + Subhead, stacked cleanly without redundant eyebrow */}
        <ScrollReveal className="max-w-3xl">
          <h2 className="font-sans text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-4xl lg:text-5xl lg:leading-[1.12]">
            Local service work deserves more structure than an unverified social post.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-slate-600 dark:text-zinc-300 sm:text-lg">
            ServiceHub replaces casual, unmoderated group posts with a verified community workflow designed specifically for Cordova households and local trades.
          </p>
        </ScrollReveal>

        {/* 3 Civic Pillars - Distinctive high-contrast cards with subtle borders */}
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <ScrollReveal
                key={pillar.title}
                className="group relative rounded-2xl border border-neutral-200/80 bg-white p-7 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.03)] transition-all hover:border-neutral-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/90 dark:hover:border-zinc-700 sm:p-8"
              >
                <div className="flex items-center justify-between">
                  <div className="grid size-12 place-items-center rounded-xl bg-white text-[#c86544] shadow-xs dark:bg-zinc-800 dark:text-orange-400">
                    <Icon size={22} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500">
                    {pillar.tag}
                  </span>
                </div>
                <h3 className="mt-8 text-lg font-bold text-slate-950 dark:text-white">
                  {pillar.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-zinc-400">
                  {pillar.description}
                </p>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Action Link */}
        <ScrollReveal className="mt-10 flex items-center justify-between border-t border-slate-200/80 pt-6 dark:border-zinc-800">
          <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">
            Engineered for genuine community accountability across Cordova, Cebu.
          </p>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#c86544] transition-colors hover:text-[#aa5032] active:scale-[0.98]"
          >
            <span>Follow the marketplace flow</span>
            <ArrowDown size={14} />
          </a>
        </ScrollReveal>
      </div>
    </section>
  );
}
