'use client';

import React from 'react';
import { Check, Minus } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

interface LandingComparisonProps {
  isDark: boolean;
}

const rows = [
  {
    capability: 'Cordova residency verification gate',
    socialPost: false,
    serviceHub: true,
    detail: 'Stops anonymous accounts from booking or collecting funds',
  },
  {
    capability: 'Unified resident profile (Seeker + Provider)',
    socialPost: false,
    serviceHub: true,
    detail: 'One verified account handles household jobs and service gigs',
  },
  {
    capability: 'Listing-specific first-paid online queue',
    socialPost: false,
    serviceHub: true,
    detail: 'Guaranteed sequential ordering tied to confirmed GCash payments',
  },
  {
    capability: 'Booking-scoped messaging & status records',
    socialPost: false,
    serviceHub: true,
    detail: 'Chat tied strictly to agreed service deliverables and milestones',
  },
  {
    capability: 'Admin audit trails & community oversight',
    socialPost: false,
    serviceHub: true,
    detail: 'Administrative mediation logs and transparent platform metrics',
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
          <h2 className="font-sans text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-4xl lg:text-5xl lg:leading-[1.12]">
            More than a public listing board.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-zinc-400">
            Compare casual social group postings with ServiceHub's accountable marketplace workflow.
          </p>
        </ScrollReveal>

        <ScrollReveal className="mt-12 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          {/* Table Header */}
          <div className="grid grid-cols-[1fr_120px_140px] items-center border-b border-slate-200 bg-slate-100/70 px-6 py-4.5 text-xs font-bold text-slate-700 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-300 sm:px-8">
            <span>Marketplace Capability</span>
            <span className="text-center">Social Posts</span>
            <div className="text-center">
              <span className="inline-block rounded-md bg-[#c86544]/10 px-2.5 py-1 text-[11px] font-bold text-[#c86544] dark:bg-orange-950/50 dark:text-orange-300">
                ServiceHub
              </span>
            </div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-slate-100 dark:divide-zinc-800/80">
            {rows.map((row) => (
              <div
                key={row.capability}
                className="grid grid-cols-[1fr_120px_140px] items-center px-6 py-5 transition-colors hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 sm:px-8"
              >
                <div>
                  <p className="text-sm font-bold text-slate-950 dark:text-white">
                    {row.capability}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
                    {row.detail}
                  </p>
                </div>
                <div className="grid place-items-center text-slate-300 dark:text-zinc-700">
                  <Minus size={18} />
                </div>
                <div className="grid place-items-center text-emerald-600 dark:text-emerald-400">
                  <div className="grid size-7 place-items-center rounded-full bg-emerald-50 dark:bg-emerald-950/50">
                    <Check size={16} className="stroke-[2.5]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
