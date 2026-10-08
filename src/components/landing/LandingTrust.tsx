'use client';

import React from 'react';
import { BadgeCheck, CheckCircle2, CircleAlert, Lock, MessagesSquare, ShieldCheck } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

interface LandingTrustProps {
  isDark: boolean;
}

const safeguards = [
  {
    title: 'Verify Before Requesting or Offering',
    copy: 'Members can browse freely, but must verify their email and Cordova residency before requesting work or offering services.',
    icon: BadgeCheck,
  },
  {
    title: 'Trust History You Can See',
    copy: 'Trust history reflects verification, completed work, reviews, and confirmed moderation decisions, not paid promotion.',
    icon: CircleAlert,
  },
  {
    title: 'Messages Tied to Bookings',
    copy: 'Chat becomes available after a booking is accepted, keeping service conversations connected to the work.',
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
        <ScrollReveal direction="left" className="relative rounded-3xl border border-neutral-200/80 bg-white p-7 shadow-lg shadow-black/[0.03] dark:border-zinc-800 dark:bg-charcoal/90 sm:p-9">
          {/* Header of the illustrative card */}
          <div className="flex items-center justify-between border-b border-slate-200/70 pb-5 dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="grid size-9 place-items-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-[#0a0a0a] dark:text-white">Trust profile example</p>
                <p className="text-[11px] text-neutral-500 dark:text-zinc-400">How ServiceHub records trust</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-neutral-600 dark:bg-charcoal dark:text-zinc-300">
              Illustrative
            </span>
          </div>

          {/* Trust status summary */}
          <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-charcoal/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-zinc-500">
                  Residency status
                </p>
                <p className="mt-1 font-sans text-xl font-extrabold text-[#0a0a0a] dark:text-white">
                  Verified resident
                </p>
              </div>
              <div className="rounded-xl bg-emerald-50 px-3 py-1.5 text-right dark:bg-emerald-950/40">
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">Reviewed by an admin</span>
                <span className="block text-[10px] text-neutral-500 dark:text-zinc-400">Cordova residency</span>
              </div>
            </div>

            {/* Example trust-history inputs */}
            <div className="mt-4 divide-y divide-slate-100 border-t border-slate-100 text-xs dark:divide-zinc-800/80 dark:border-zinc-800/80">
              <div className="flex items-center justify-between py-2.5">
                <span className="flex items-center gap-2 text-neutral-700 dark:text-zinc-300">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  Residency verification
                </span>
                <span className="font-bold text-neutral-500 dark:text-zinc-400">Recorded</span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="flex items-center gap-2 text-neutral-700 dark:text-zinc-300">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  Completed ServiceHub work
                </span>
                <span className="font-bold text-neutral-500 dark:text-zinc-400">Recorded</span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="flex items-center gap-2 text-neutral-700 dark:text-zinc-300">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  Review after completed work
                </span>
                <span className="font-bold text-neutral-500 dark:text-zinc-400">Visible</span>
              </div>
            </div>
          </div>

          {/* Privacy & Security Note */}
          <div className="mt-5 flex items-center gap-2 rounded-xl bg-slate-100/70 px-4 py-3 text-xs text-neutral-600 dark:bg-charcoal/50 dark:text-zinc-400">
            <Lock size={14} className="shrink-0 text-neutral-500" />
            <span>Verification documents are private and available only to authorized reviewers.</span>
          </div>
        </ScrollReveal>

        {/* Right Column: Narrative & Safeguards */}
        <div data-landing-anchor>
          <ScrollReveal direction="right">
            <h2 className="font-sans text-3xl font-extrabold tracking-tight text-[#0a0a0a] dark:text-white sm:text-4xl lg:text-5xl lg:leading-[1.12]">
              Trust built from real ServiceHub activity.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-neutral-600 dark:text-zinc-400">
              Check the information behind a profile before deciding who to work with.
            </p>
          </ScrollReveal>

          <div className="mt-9 divide-y divide-slate-200/80 border-y border-slate-200/80 dark:divide-zinc-800 dark:border-zinc-800">
            {safeguards.map((item, index) => {
              const Icon = item.icon;
              return (
                <ScrollReveal key={item.title} direction="right" delay={0.08 * index} className="flex gap-4 py-6">
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-emerald-600 dark:bg-charcoal dark:text-emerald-400">
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#0a0a0a] dark:text-white">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-neutral-600 dark:text-zinc-400">
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
