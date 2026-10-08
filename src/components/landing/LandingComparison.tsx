'use client';

import React from 'react';
import { Check, Minus } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

interface LandingComparisonProps {
  isDark: boolean;
}

const rows = [
  {
    capability: 'Content reports',
    context: 'Content',
    serviceHub: true,
    detail: 'Flag a service listing or request that may break the rules.',
  },
  {
    capability: 'Booking disputes',
    context: 'Booking',
    serviceHub: true,
    detail: 'Raise a problem with work or payment through the booking so the relevant records can be reviewed.',
  },
  {
    capability: 'Account appeals',
    context: 'Account',
    serviceHub: true,
    detail: 'Ask an administrator to reconsider an account ban through the appeal process.',
  },
  {
    capability: 'Help Center',
    context: 'Guides',
    serviceHub: false,
    detail: 'Find instructions for everyday tasks before you need to ask for help.',
  },
];

export default function LandingComparison({ isDark }: LandingComparisonProps) {
  return (
    <section
      id="comparison"
      data-theme={isDark ? 'dark' : 'light'}
      className="scroll-mt-20 border-b border-black/[0.06] bg-transparent px-5 py-20 dark:border-white/10 sm:px-8 lg:px-10 lg:py-28"
    >
      <div className="mx-auto max-w-5xl">
        <ScrollReveal className="text-center">
          <h2 className="font-sans text-3xl font-extrabold tracking-tight text-[#0a0a0a] dark:text-white sm:text-4xl lg:text-5xl lg:leading-[1.12]">
            Support when something needs attention.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-neutral-600 dark:text-zinc-400">
            Choose the route that matches the issue. Content reports, booking disputes, and account appeals serve different purposes.
          </p>
        </ScrollReveal>

        <ScrollReveal className="mt-12 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-charcoal">
          {/* Table Header */}
          <div className="grid grid-cols-[minmax(0,1fr)_3.5rem_5rem] sm:grid-cols-[1fr_120px_140px] items-center border-b border-slate-200 bg-slate-100/70 px-6 py-4.5 text-xs font-bold text-neutral-700 dark:border-zinc-800 dark:bg-charcoal/60 dark:text-zinc-300 sm:px-8">
            <span>Support route</span>
            <span className="text-center">For</span>
            <div className="text-center">
              <span className="inline-block rounded-md bg-[#c86544]/10 px-2.5 py-1 text-[11px] font-bold text-[#c86544] dark:bg-orange-950/50 dark:text-orange-300">
                Admin review
              </span>
            </div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-slate-100 dark:divide-zinc-800/80">
            {rows.map((row) => (
              <div
                key={row.capability}
                className="grid grid-cols-[minmax(0,1fr)_3.5rem_5rem] sm:grid-cols-[1fr_120px_140px] items-center px-6 py-5 transition-colors hover:bg-slate-50/50 dark:hover:bg-charcoal/30 sm:px-8"
              >
                <div>
                  <p className="text-sm font-bold text-[#0a0a0a] dark:text-white">
                    {row.capability}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500 dark:text-zinc-400">
                    {row.detail}
                  </p>
                </div>
                <div className="grid place-items-center text-xs font-semibold text-neutral-600 dark:text-zinc-400">
                  {row.context}
                </div>
                <div className="grid place-items-center text-emerald-600 dark:text-emerald-400">
                  {row.serviceHub ? (
                    <div className="grid size-7 place-items-center rounded-full bg-emerald-50 dark:bg-emerald-950/50">
                      <Check size={16} className="stroke-[2.5]" aria-label="Admin review available" />
                    </div>
                  ) : <Minus size={18} className="text-neutral-400" aria-label="Self-service guide" />}
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
