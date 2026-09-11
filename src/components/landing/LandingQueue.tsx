'use client';

import React from 'react';
import { CheckCircle2, CircleDollarSign, Clock3, LockKeyhole, Play, ShieldAlert } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

interface LandingQueueProps {
  isDark: boolean;
}

const queueStages = [
  {
    step: 'Stage 01',
    label: 'Backend Payment Confirmed',
    detail: 'GCash Test Mode payments verify automatically via PayMongo webhooks before queue admittance.',
    icon: CircleDollarSign,
    status: 'Verified',
  },
  {
    step: 'Stage 02',
    label: 'Listing-Specific FCFS Placement',
    detail: 'Every service listing runs its own honest queue with strict first-paid, first-waiting ordering.',
    icon: Clock3,
    status: 'Queued',
  },
  {
    step: 'Stage 03',
    label: 'Single Active Job Execution',
    detail: 'Providers serve exactly one active booking at a time, protecting quality and delivery standards.',
    icon: Play,
    status: 'Enforced',
  },
];

export default function LandingQueue({ isDark }: LandingQueueProps) {
  return (
    <section
      id="queue"
      data-theme={isDark ? 'dark' : 'light'}
      className="relative overflow-hidden scroll-mt-20 border-b border-black/[0.06] bg-transparent px-5 py-20 dark:border-white/10 sm:px-8 lg:px-10 lg:py-28"
    >

      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-20">
        {/* Left Column: Context & Rule */}
        <ScrollReveal>
          <h2 className="font-sans text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-4xl lg:text-5xl lg:leading-[1.12]">
            First paid, first waiting, first eligible.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-slate-600 dark:text-zinc-400">
            ServiceHub eliminates guesswork by attaching queue entries directly to verified online payments, preventing double-booking and queue jumping.
          </p>

          <div className="mt-8 flex gap-3.5 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/70">
            <LockKeyhole className="mt-0.5 size-5 shrink-0 text-[#c86544]" />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                Cash Payment Separation
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-zinc-400">
                On-site cash is arranged directly with the provider and does not occupy online queue capacity.
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* Right Column: Queue Stages Breakdown */}
        <ScrollReveal className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
          <div className="space-y-3.5">
            {queueStages.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="grid grid-cols-[44px_1fr_auto] items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4.5 dark:border-zinc-800/80 dark:bg-zinc-950/40"
                >
                  <div className="grid size-11 place-items-center rounded-xl bg-white text-[#c86544] shadow-xs dark:bg-zinc-800 dark:text-orange-400">
                    <Icon size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-950 dark:text-white">
                        {item.label}
                      </p>
                      <span className="hidden sm:inline-block rounded-md bg-emerald-100/70 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                        {item.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-zinc-400">
                      {item.detail}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-400 dark:text-zinc-500">
                    {item.step}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs dark:border-zinc-800">
            <span className="font-semibold text-slate-600 dark:text-zinc-400">
              Listing capacity limit enforced by backend logic
            </span>
            <span className="font-bold text-emerald-700 dark:text-emerald-400">
              Accountable FCFS
            </span>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
