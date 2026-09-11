'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, Clock, ShieldCheck, UserCheck, Zap } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

interface LandingHeroProps {
  isDark: boolean;
  onGetStarted: () => void;
}

export default function LandingHero({ onGetStarted }: LandingHeroProps) {
  const shouldReduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState<'seeker' | 'provider'>('seeker');
  const [simulatedAdvance, setSimulatedAdvance] = useState(false);

  return (
    <section id="top" className="relative min-h-[calc(100svh-80px)] overflow-hidden border-b border-black/[0.06] bg-[#f5f4f2] dark:border-white/10 dark:bg-[#121211]">
      {/* Background: Clean Warm Limestone with Soft Ambient Atmosphere */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {/* Soft warm ambient glows */}
        <div className="absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-[#c86544]/[0.06] blur-3xl dark:bg-orange-500/[0.04]" />
        <div className="absolute -right-20 top-1/4 h-80 w-80 rounded-full bg-[#c86544]/[0.04] blur-3xl dark:bg-orange-500/[0.03]" />

        {/* Seamless bottom fade into ticker */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#f5f4f2] to-transparent dark:from-[#121211]" />
      </div>

      <div className="relative z-10 mx-auto grid min-h-[calc(100svh-80px)] max-w-7xl items-center gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_1.05fr] lg:gap-14 lg:px-10 lg:py-16">
        {/* Left Column: Calm High-Craft Typography */}
        <div className="relative z-10 max-w-2xl">
          {/* Top Pill Badge (matching reference: • v2 just shipped →) */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#c86544]/35 bg-[#c86544]/[0.08] px-3.5 py-1 text-[12px] font-medium tracking-tight text-[#aa5032] transition-colors hover:bg-[#c86544]/[0.12] dark:border-orange-500/30 dark:bg-orange-950/40 dark:text-orange-300">
            <span className="relative flex size-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-[#c86544]/70" />
              <span className="relative inline-flex size-1.5 rounded-full bg-[#c86544]" />
            </span>
            <span>Cordova verified network active</span>
            <ArrowRight size={13} className="text-[#c86544]" />
          </div>

          {/* Display Title */}
          <h1 className="font-sans text-[clamp(2.75rem,5.5vw,4.5rem)] font-semibold leading-[1.02] tracking-tight text-[#0a0a0a] dark:text-white">
            ServiceHub Cordova
          </h1>

          {/* Sub-headline & Tagline */}
          <p className="mt-4 max-w-xl text-xl font-normal leading-snug tracking-tight text-neutral-800 dark:text-neutral-200 sm:text-2xl lg:text-3xl">
            Local service work, with a clearer way to trust.
          </p>
          <p className="mt-3 text-[15px] font-medium text-[#c86544] sm:text-lg">
            Less guesswork, genuine local accountability.
          </p>

          {/* Concise Subtext */}
          <p className="mt-4 max-w-lg text-[14px] leading-relaxed text-neutral-600 dark:text-neutral-400 sm:text-base">
            Connect with verified Cordova neighbors. Transparent rates, honest online queues, and accountable payments in one local marketplace.
          </p>

          {/* CTAs with ambient top light shade on the black button (matching reference) */}
          <div className="mt-8 flex flex-col gap-3.5 sm:flex-row">
            <button
              type="button"
              onClick={onGetStarted}
              className="group/cta relative inline-flex min-h-12 items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-[#0a0a0a] px-7 py-3.5 text-[15px] font-semibold text-white shadow-[0_14px_32px_-8px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.18)] ring-1 ring-black/30 transition-all duration-300 hover:bg-[#141414] hover:shadow-[0_22px_44px_-10px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.25)] active:scale-[0.98] dark:bg-white dark:text-[#0a0a0a] dark:hover:bg-neutral-100"
            >
              {/* Light shade on black button */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-2xl dark:hidden"
                style={{
                  background: 'radial-gradient(140% 90% at 50% 0%, rgba(255,255,255,0.18), transparent 60%)',
                }}
              />
              {/* Moving sheen sweep on hover */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover/cta:translate-x-full"
              />
              <span className="relative z-10 transition-transform duration-300 group-hover/cta:-translate-x-0.5">
                Get started
              </span>
              <ArrowRight size={16} className="relative z-10 transition-transform duration-300 group-hover/cta:translate-x-1" />
            </button>

            <a
              href="#how-it-works"
              className="group/docs inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-neutral-300 bg-white px-7 py-3.5 text-[15px] font-medium text-neutral-900 shadow-[0_3px_10px_-2px_rgba(0,0,0,0.06)] transition-all duration-300 hover:border-neutral-400 hover:bg-neutral-50 hover:shadow-[0_10px_22px_-6px_rgba(0,0,0,0.12)] active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-200 dark:hover:bg-zinc-900 dark:hover:border-zinc-700"
            >
              <span>See how it works</span>
              <ArrowRight size={15} className="text-neutral-500 transition-transform duration-300 group-hover/docs:translate-x-1 group-hover/docs:text-neutral-900 dark:text-zinc-400 dark:group-hover/docs:text-white" />
            </a>
          </div>

          {/* Trust points */}
          <div className="mt-8 grid max-w-xl gap-3.5 border-t border-black/[0.06] pt-6 text-xs leading-5 text-neutral-600 dark:border-white/10 dark:text-neutral-400 sm:grid-cols-2">
            <div className="flex items-start gap-2.5">
              <BadgeCheck size={17} className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-500" />
              <span>Residency verification gate protects every transaction</span>
            </div>
            <div className="flex items-start gap-2.5">
              <ShieldCheck size={17} className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-500" />
              <span>One account connects both Seeker and Provider roles</span>
            </div>
          </div>
        </div>

        {/* Right Column: High-Craft Clean Interactive Marketplace Terminal */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative"
        >
          {/* Outer Framed Terminal Card - Clean White Floating Aesthetic */}
          <div className="relative rounded-2xl border border-neutral-200/90 bg-white/95 p-6 shadow-[0_18px_40px_-14px_rgba(15,15,15,0.12),0_1px_2px_rgba(0,0,0,0.04)] backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/95 sm:p-7">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-zinc-800/80">
              <div className="flex items-center gap-2.5">
                <span className="relative flex size-2.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">Cordova Live Engine</span>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-zinc-800 dark:text-zinc-400">
                  FCFS Queue
                </span>
              </div>

              {/* Perspective Selector */}
              <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-[11px] font-bold dark:border-zinc-800 dark:bg-zinc-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('seeker')}
                  className={`rounded-md px-2.5 py-1 transition-all ${activeTab === 'seeker'
                      ? 'bg-white text-slate-950 shadow-xs dark:bg-zinc-700 dark:text-white'
                      : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                    }`}
                >
                  Seeker view
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('provider')}
                  className={`rounded-md px-2.5 py-1 transition-all ${activeTab === 'provider'
                      ? 'bg-white text-slate-950 shadow-xs dark:bg-zinc-700 dark:text-white'
                      : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                    }`}
                >
                  Provider view
                </button>
              </div>
            </div>

            {/* Active Service Showcase */}
            <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/70 p-4.5 dark:border-zinc-800/80 dark:bg-zinc-950/50">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-900 dark:bg-orange-950/50 dark:text-orange-300">
                      Electrical & Repairs
                    </span>
                    <span className="text-xs text-slate-500 dark:text-zinc-400">Poblacion, Cordova</span>
                  </div>
                  <h2 className="mt-1.5 text-base font-bold text-slate-900 dark:text-white">
                    Emergency Circuit Breaker & Wiring Diagnostic
                  </h2>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">PHP 650</span>
                  <span className="block text-[10px] text-slate-500 dark:text-zinc-400">est. 2 hrs</span>
                </div>
              </div>

              {/* Provider Info Pill */}
              <div className="mt-3.5 flex items-center justify-between border-t border-slate-200/60 pt-3 text-xs dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="grid size-7 place-items-center rounded-full bg-emerald-100 font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    MR
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 dark:text-zinc-200">Mateo Rosal</span>
                    <span className="ml-1 text-[11px] text-slate-500 dark:text-zinc-400">Master Electrician</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                  <UserCheck size={13} />
                  <span>Cordova Resident Verified</span>
                </div>
              </div>
            </div>

            {/* Simulated Live Queue Stream */}
            <div className="mt-5 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-zinc-300">
                <span>Active Queue Progression</span>
                <span className="text-[11px] font-normal text-slate-500 dark:text-zinc-400">Capacity: 2 of 5</span>
              </div>

              {/* Queue Item 1: Serving */}
              <div className="flex items-center justify-between rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-3 text-xs dark:border-emerald-900/40 dark:bg-emerald-950/20">
                <div className="flex items-center gap-3">
                  <span className="grid size-6 place-items-center rounded-lg bg-emerald-600 text-[10px] font-bold text-white">
                    #1
                  </span>
                  <div>
                    <p className="font-bold text-emerald-950 dark:text-emerald-200">
                      {simulatedAdvance ? 'Service Complete' : 'Service In Progress'}
                    </p>
                    <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80">
                      Barangay Ibabao site inspection
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400">
                  <Clock size={13} className="animate-spin" style={{ animationDuration: '4s' }} />
                  <span>{simulatedAdvance ? 'Done' : 'Serving'}</span>
                </div>
              </div>

              {/* Queue Item 2: Up Next */}
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-xs dark:border-zinc-800 dark:bg-zinc-800/60">
                <div className="flex items-center gap-3">
                  <span className="grid size-6 place-items-center rounded-lg bg-orange-500 text-[10px] font-bold text-white">
                    #2
                  </span>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {simulatedAdvance ? 'Now Serving You' : 'Waiting in Queue (You)'}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Confirmed via GCash Test Mode
                    </p>
                  </div>
                </div>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-zinc-700 dark:text-zinc-300">
                  {simulatedAdvance ? 'Active' : 'Next in line'}
                </span>
              </div>
            </div>

            {/* Interactive Demo Footer */}
            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setSimulatedAdvance((prev) => !prev)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#c86544] transition-colors hover:text-[#aa5032] active:scale-[0.98]"
              >
                <Zap size={14} />
                <span>{simulatedAdvance ? 'Reset preview simulation' : 'Advance simulated queue'}</span>
              </button>
              <Link
                href="/help"
                className="text-xs font-semibold text-slate-500 underline decoration-slate-300 underline-offset-4 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                Learn queue rules
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
