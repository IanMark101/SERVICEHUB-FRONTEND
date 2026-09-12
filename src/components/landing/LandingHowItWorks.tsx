'use client';

import React, { useState } from 'react';
import { BadgeCheck, Banknote, BriefcaseBusiness, CheckCircle2, MessageSquare, Search, Star, UserRoundSearch, WalletCards } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import ScrollReveal from './ScrollReveal';

interface LandingHowItWorksProps {
  isDark: boolean;
}

type Role = 'seeker' | 'provider';

const seekerFlow = [
  {
    step: 'Discovery & Posting',
    title: 'Browse or post a request',
    description: 'Search approved service listings, or describe a job and receive offers from eligible local providers.',
    icon: Search,
  },
  {
    step: 'Payment Choice',
    title: 'Choose the right payment path',
    description: 'On-site cash is coordinated directly. Eligible GCash Test Mode payments are confirmed by the backend before queue entry.',
    icon: WalletCards,
  },
  {
    step: 'Completion & Review',
    title: 'Track and verify the work',
    description: 'Follow booking status, use booking-scoped messages, confirm completion, and review completed service.',
    icon: CheckCircle2,
  },
];

const providerFlow = [
  {
    step: 'Service Publishing',
    title: 'Publish an approved service',
    description: 'Set a supported price, duration, queue capacity, and accepted GCash Test Mode or on-site cash methods.',
    icon: BriefcaseBusiness,
  },
  {
    step: 'Job Intake',
    title: 'Receive work two ways',
    description: 'Handle direct service requests, or send an offer linked to one of your active, category-compatible listings.',
    icon: UserRoundSearch,
  },
  {
    step: 'Delivery & Completion',
    title: 'Serve the eligible booking',
    description: 'Accept direct cash requests when required. Start only the first eligible paid queue entry, then mark the work complete.',
    icon: MessageSquare,
  },
];

export default function LandingHowItWorks({ isDark }: LandingHowItWorksProps) {
  const [role, setRole] = useState<Role>('seeker');
  const shouldReduceMotion = useReducedMotion();
  const flow = role === 'seeker' ? seekerFlow : providerFlow;

  return (
    <section
      id="how-it-works"
      data-theme={isDark ? 'dark' : 'light'}
      className="scroll-mt-20 border-b border-black/[0.06] bg-transparent px-5 py-20 dark:border-white/10 sm:px-8 lg:px-10 lg:py-28"
    >
      <div className="mx-auto max-w-7xl">
        <ScrollReveal className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <h2 className="font-sans text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-4xl lg:text-5xl lg:leading-[1.12]">
              A straightforward path from need to completed work.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-zinc-400">
              Toggle between Seeker and Provider to see how the implemented workflow operates on both sides.
            </p>
          </div>

          {/* Interactive Role Switcher with Motion */}
          <div
            className="inline-flex w-fit rounded-xl border border-slate-200 bg-white p-1 shadow-xs dark:border-zinc-800 dark:bg-zinc-900"
            role="group"
            aria-label="Marketplace role toggle"
          >
            {(['seeker', 'provider'] as Role[]).map((item) => {
              const active = role === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setRole(item)}
                  aria-pressed={active}
                  className={`relative rounded-lg px-5 py-2 text-xs font-bold capitalize transition-colors ${
                    active ? 'text-white' : 'text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="active-role-tab"
                      className={`absolute inset-0 rounded-lg shadow-xs ${
                        item === 'seeker' ? 'bg-[#c86544]' : 'bg-[#059669]'
                      }`}
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">
                    {item === 'seeker' ? 'Seeking services' : 'Offering services'}
                  </span>
                </button>
              );
            })}
          </div>
        </ScrollReveal>

        {/* 3 Steps Rail with AnimatePresence */}
        <AnimatePresence mode="wait">
          <motion.div
            key={role}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="mt-12 grid gap-6 md:grid-cols-3"
          >
            {flow.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-7 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/70 sm:p-8"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div
                        className={`grid size-12 place-items-center rounded-xl ${
                          role === 'seeker'
                            ? 'bg-orange-50 text-[#c86544] dark:bg-orange-950/40'
                            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                        }`}
                      >
                        <Icon size={22} />
                      </div>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 dark:bg-zinc-800 dark:text-zinc-400">
                        0{index + 1}
                      </span>
                    </div>

                    <p className="mt-7 text-xs font-bold text-slate-400 dark:text-zinc-500">
                      {item.step}
                    </p>
                    <h3 className="mt-2 text-lg font-bold text-slate-950 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-zinc-400">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Bottom Highlights */}
        <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3.5 border-t border-slate-200/80 pt-6 text-xs font-semibold text-slate-600 dark:border-zinc-800 dark:text-zinc-400">
          <span className="flex items-center gap-2">
            <BadgeCheck size={16} className="text-emerald-600 dark:text-emerald-500" />
            Approved residency unlocks new transactions
          </span>
          <span className="flex items-center gap-2">
            <Banknote size={16} className="text-[#c86544]" />
            Cash arrangements bypass the online queue
          </span>
          <span className="flex items-center gap-2">
            <Star size={16} className="text-amber-500" />
            Reviews require completed service history
          </span>
        </div>
      </div>
    </section>
  );
}
