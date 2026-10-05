'use client';

import React, { useState } from 'react';
import { ArrowDown, BriefcaseBusiness, CheckCircle2, MessageSquare, Search, UserRoundSearch, WalletCards } from 'lucide-react';
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
    description: 'Browse services available in Cordova, or post what you need and compare offers from local providers.',
    icon: Search,
  },
  {
    step: 'Payment Choice',
    title: 'Choose an available payment option',
    description: 'Check the service terms, select a supported payment method, and follow the booking instructions.',
    icon: WalletCards,
  },
  {
    step: 'Delivery & Confirmation',
    title: 'Track and verify the work',
    description: 'Follow progress in Activity, stay in touch about the task, and confirm the result when the work is finished.',
    icon: CheckCircle2,
  },
];

const providerFlow = [
  {
    step: 'Service Listing',
    title: 'Create a service listing',
    description: 'Add your service details in Offer Services so people can discover what you do.',
    icon: BriefcaseBusiness,
  },
  {
    step: 'Job Intake',
    title: 'Respond to custom requests',
    description: 'Browse Jobs and send an offer with the terms you propose for a specific task.',
    icon: UserRoundSearch,
  },
  {
    step: 'Delivery & Completion',
    title: 'Deliver the agreed work',
    description: 'Manage accepted bookings in Activity and send finished work for seeker confirmation.',
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
            <h2 className="font-sans text-3xl font-extrabold tracking-tight text-[#0a0a0a] dark:text-white sm:text-4xl lg:text-5xl lg:leading-[1.12]">
              A straightforward path from need to completed work.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-neutral-600 dark:text-zinc-400">
              Switch between Seeker and Provider to see what happens on each side.
            </p>
          </div>

          {/* Interactive Role Switcher with Motion */}
          <div
            className="inline-flex w-fit rounded-xl border border-slate-200 bg-white p-1 shadow-xs dark:border-zinc-800 dark:bg-zinc-900"
            role="group"
            aria-label="Choose how you use ServiceHub"
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
                    active ? 'text-white' : 'text-neutral-600 hover:text-[#0a0a0a] dark:text-zinc-400 dark:hover:text-white'
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
            initial={false}
            whileInView={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: [0.8, 1], y: [10, 0] }}
            viewport={{ once: false, amount: 0.18 }}
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
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-neutral-600 dark:bg-zinc-800 dark:text-zinc-400">
                        0{index + 1}
                      </span>
                    </div>

                    <p className="mt-7 text-xs font-bold text-neutral-400 dark:text-zinc-500">
                      {item.step}
                    </p>
                    <h3 className="mt-2 text-lg font-bold text-[#0a0a0a] dark:text-white">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-zinc-400">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Shortcuts to the detailed rules, rather than a second policy summary. */}
        <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3.5 border-t border-slate-200/80 pt-6 text-xs font-semibold text-neutral-600 dark:border-zinc-800 dark:text-zinc-400">
          {[
            { href: '#queue', label: 'Payment and queue rules' },
            { href: '#trust', label: 'Verification and messaging' },
            { href: '#reviews', label: 'How reviews work' },
          ].map(({ href, label }) => (
            <a key={href} href={href} className="flex items-center gap-2 hover:text-[#c86544] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c86544]">
              <ArrowDown size={16} className="text-[#c86544]" aria-hidden="true" />
              {label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
