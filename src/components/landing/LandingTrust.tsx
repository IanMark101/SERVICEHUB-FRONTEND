'use client';

import React from 'react';
import { BadgeCheck, CheckCircle2, CircleAlert, Lock, MessagesSquare, ShieldCheck } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

interface LandingTrustProps {
  isDark: boolean;
}

const safeguards = [
  {
    title: 'Residency Verification Gate',
    copy: 'Approved Cordova residency is required before users can initiate bookings, submit offers, or process payments.',
    icon: BadgeCheck,
  },
  {
    title: 'Visible Trust History',
    copy: 'Trust history reflects verified system events, completed work, eligible reviews, and moderation decisions instead of paid promotion.',
    icon: CircleAlert,
  },
  {
    title: 'Booking-Scoped Communication',
    copy: 'Direct chat unlocks strictly within confirmed bookings and active proposals, eliminating unsolicited spam.',
    icon: MessagesSquare,
  },
];

export default function LandingTrust({ isDark }: LandingTrustProps) {
  return (
    <section
      id="trust"
      data-theme={isDark ? 'dark' : 'light'}
      className="scroll-mt-20 border-b border-black/[0.06] bg-transparent px-5 py-20 dark:border-white/10 sm:px-8 lg:px-10 lg:py-28"
    >
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
        {/* Left Column: illustrative trust profile without invented scores */}
        <ScrollReveal className="relative rounded-3xl border border-neutral-200/80 bg-white p-7 shadow-lg shadow-black/[0.03] dark:border-zinc-800 dark:bg-zinc-900/90 sm:p-9">
          {/* Header of the illustrative card */}
          <div className="flex items-center justify-between border-b border-slate-200/70 pb-5 dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="grid size-9 place-items-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Trust profile overview</p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">How marketplace history is represented</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
              Illustrative
            </span>
          </div>

          {/* Trust status summary */}
          <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-950/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  Residency status
                </p>
                <p className="mt-1 font-sans text-xl font-extrabold text-slate-950 dark:text-white">
                  Verified resident
                </p>
              </div>
              <div className="rounded-xl bg-emerald-50 px-3 py-1.5 text-right dark:bg-emerald-950/40">
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">Admin reviewed</span>
                <span className="block text-[10px] text-slate-500 dark:text-zinc-400">Cordova residency</span>
              </div>
            </div>

            {/* Example trust-history inputs */}
            <div className="mt-4 divide-y divide-slate-100 border-t border-slate-100 text-xs dark:divide-zinc-800/80 dark:border-zinc-800/80">
              <div className="flex items-center justify-between py-2.5">
                <span className="flex items-center gap-2 text-slate-700 dark:text-zinc-300">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  Residency verification decision
                </span>
                <span className="font-bold text-slate-500 dark:text-zinc-400">Recorded</span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="flex items-center gap-2 text-slate-700 dark:text-zinc-300">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  Confirmed completed service
                </span>
                <span className="font-bold text-slate-500 dark:text-zinc-400">Recorded</span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="flex items-center gap-2 text-slate-700 dark:text-zinc-300">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  Eligible completion-linked review
                </span>
                <span className="font-bold text-slate-500 dark:text-zinc-400">Visible</span>
              </div>
            </div>
          </div>

          {/* Privacy & Security Note */}
          <div className="mt-5 flex items-center gap-2 rounded-xl bg-slate-100/70 px-4 py-3 text-xs text-slate-600 dark:bg-zinc-800/50 dark:text-zinc-400">
            <Lock size={14} className="shrink-0 text-slate-500" />
            <span>Verification files stay on restricted review paths. Payment credentials are handled by PayMongo in Test Mode.</span>
          </div>
        </ScrollReveal>

        {/* Right Column: Narrative & Safeguards */}
        <div>
          <ScrollReveal>
            <h2 className="font-sans text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-4xl lg:text-5xl lg:leading-[1.12]">
              Trust signals grounded in real marketplace action.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-slate-600 dark:text-zinc-400">
              ServiceHub combines residency status, completed work, eligible reviews, and moderation history into one accountable profile.
            </p>
          </ScrollReveal>

          <div className="mt-9 divide-y divide-slate-200/80 border-y border-slate-200/80 dark:divide-zinc-800 dark:border-zinc-800">
            {safeguards.map((item) => {
              const Icon = item.icon;
              return (
                <ScrollReveal key={item.title} className="flex gap-4 py-6">
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-emerald-600 dark:bg-zinc-900 dark:text-emerald-400">
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-950 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-zinc-400">
                      {item.copy}
                    </p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
