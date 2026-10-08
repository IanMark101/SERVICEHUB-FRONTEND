'use client';

import React from 'react';
import { CircleDollarSign, Clock3, LockKeyhole, Play } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import ScrollReveal from './ScrollReveal';

interface LandingQueueProps {
  isDark: boolean;
}

const queueStages = [
  {
    step: 'Payment',
    label: 'Test Mode Payment Confirmed',
    detail: 'A booking joins the queue only after its GCash Test Mode payment succeeds.',
    icon: CircleDollarSign,
    status: 'Confirmed',
  },
  {
    step: 'Placement',
    label: "Added to the Provider's Paid Queue",
    detail: 'Paid jobs from every listing and accepted offer share one first-come, first-served order for that provider.',
    icon: Clock3,
    status: 'Waiting',
  },
  {
    step: 'Execution',
    label: 'One Active Job at a Time',
    detail: 'A Provider can work on only one active job and must start the first eligible paid booking next.',
    icon: Play,
    status: 'In Order',
  },
];

export default function LandingQueue({ isDark }: LandingQueueProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      id="queue"
      data-theme={isDark ? 'dark' : 'light'}
      className="relative overflow-hidden scroll-mt-20 border-b border-black/[0.06] bg-transparent px-5 py-20 dark:border-white/10 sm:px-8 lg:px-10 lg:py-28"
    >

      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-20">
        {/* Left Column: Context & Rule */}
        <ScrollReveal direction="left">
          <h2 className="font-sans text-3xl font-extrabold tracking-tight text-[#0a0a0a] dark:text-white sm:text-4xl lg:text-5xl lg:leading-[1.12]">
            Online payments join a fair provider queue.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-neutral-600 dark:text-zinc-400">
            See how a paid booking moves from payment to its place in the provider&apos;s workload.
          </p>

          <div className="mt-8 flex gap-3.5 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-charcoal/70">
            <LockKeyhole className="mt-0.5 size-5 shrink-0 text-[#c86544]" />
            <div>
              <p className="text-xs font-bold text-[#0a0a0a] dark:text-white">
                On-Site Cash Stays Outside the Queue
              </p>
              <p className="mt-1 text-xs leading-relaxed text-neutral-600 dark:text-zinc-400">
                On-site cash is arranged directly with the provider and does not occupy online queue capacity.
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* Right Column: Queue Stages Breakdown */}
        <ScrollReveal direction="right" className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-charcoal sm:p-8">
          <div className="space-y-3.5">
            {queueStages.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  initial={false}
                  whileInView={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: [0.8, 1], x: [18, 0] }}
                  viewport={{ once: false, amount: 0.7 }}
                  transition={{ duration: 0.5, delay: 0.14 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="grid grid-cols-[44px_1fr_auto] items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4.5 dark:border-zinc-800/80 dark:bg-charcoal/40"
                >
                  <div className="grid size-11 place-items-center rounded-xl bg-white text-[#c86544] shadow-xs dark:bg-charcoal dark:text-orange-400">
                    <Icon size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-[#0a0a0a] dark:text-white">
                        {item.label}
                      </p>
                      <span className="hidden sm:inline-block rounded-md bg-emerald-100/70 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                        {item.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-neutral-500 dark:text-zinc-400">
                      {item.detail}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-neutral-400 dark:text-zinc-500">
                    {item.step}
                  </span>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-6 border-t border-slate-100 pt-4 text-xs leading-relaxed text-neutral-600 dark:border-zinc-800 dark:text-zinc-400">
            <a href="#workspaces" className="font-semibold text-[#c86544] underline underline-offset-4 hover:text-[#aa5032] dark:text-orange-300">Preview the workspaces</a> to see where you manage your bookings.
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
