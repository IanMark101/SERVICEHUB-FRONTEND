'use client';

import React from 'react';
import { ArrowLeftRight, BriefcaseBusiness, CheckCircle2, Search, ShieldCheck } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

interface LandingWorkspacesProps {
  isDark: boolean;
}

export default function LandingWorkspaces({ isDark }: LandingWorkspacesProps) {
  return (
    <section
      id="workspaces"
      data-theme={isDark ? 'dark' : 'light'}
      className="scroll-mt-20 border-b border-black/[0.06] bg-transparent px-5 py-20 dark:border-white/10 sm:px-8 lg:px-10 lg:py-28"
    >
      <div className="mx-auto max-w-7xl">
        <ScrollReveal className="max-w-3xl">
          <h2 className="font-sans text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-4xl lg:text-5xl lg:leading-[1.12]">
            One resident account. Two focused workspaces.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-zinc-400 sm:text-lg">
            Switch between household seeker and professional provider with a single click. Your residency verification, trust records, and messages stay linked.
          </p>
        </ScrollReveal>

        {/* Asymmetric Bento Grid */}
        <div className="mt-12 grid gap-6 lg:grid-cols-12">
          {/* Seeker Panel (7 cols) */}
          <ScrollReveal direction="left" className="flex flex-col justify-between rounded-3xl border border-orange-200/80 bg-gradient-to-br from-orange-50/50 via-white to-white p-7 shadow-xs dark:border-orange-900/30 dark:from-orange-950/20 dark:via-zinc-900 dark:to-zinc-900 sm:p-9 lg:col-span-7">
            <div>
              <div className="flex items-center justify-between">
                <div className="grid size-12 place-items-center rounded-2xl bg-orange-100 text-[#c86544] dark:bg-orange-950/60 dark:text-orange-300">
                  <Search size={22} />
                </div>
                <span className="rounded-full bg-orange-100/80 px-3 py-1 text-[11px] font-bold text-orange-900 dark:bg-orange-950/50 dark:text-orange-300">
                  Seeker Workspace
                </span>
              </div>

              <h3 className="mt-8 text-2xl font-bold text-slate-950 dark:text-white">
                Find trusted help or post what you need.
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-zinc-400">
                Browse verified local listings, describe urgent household repairs, compare incoming provider offers, and pay through your choice of direct cash or verified GCash Test Mode.
              </p>

              {/* Seeker capability pills */}
              <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold">
                <span className="rounded-lg border border-orange-200 bg-white px-3 py-1.5 text-slate-700 dark:border-orange-900/40 dark:bg-zinc-800 dark:text-zinc-200">
                  Direct Listing Booking
                </span>
                <span className="rounded-lg border border-orange-200 bg-white px-3 py-1.5 text-slate-700 dark:border-orange-900/40 dark:bg-zinc-800 dark:text-zinc-200">
                  Broadcast Service Requests
                </span>
                <span className="rounded-lg border border-orange-200 bg-white px-3 py-1.5 text-slate-700 dark:border-orange-900/40 dark:bg-zinc-800 dark:text-zinc-200">
                  Real-time Queue Tracking
                </span>
              </div>
            </div>

            <div className="mt-8 rounded-xl border border-orange-200/60 bg-white/80 p-4 dark:border-orange-900/30 dark:bg-zinc-950/40">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <CheckCircle2 size={16} className="text-[#c86544]" />
                <span>Protected Completion Verification</span>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                Seekers explicitly confirm satisfactory completion before trust milestones and review opportunities unlock.
              </p>
            </div>
          </ScrollReveal>

          {/* Provider Panel (5 cols) */}
          <ScrollReveal direction="right" delay={0.08} className="flex flex-col justify-between rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/50 via-white to-white p-7 shadow-xs dark:border-emerald-900/30 dark:from-emerald-950/20 dark:via-zinc-900 dark:to-zinc-900 sm:p-9 lg:col-span-5">
            <div>
              <div className="flex items-center justify-between">
                <div className="grid size-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  <BriefcaseBusiness size={22} />
                </div>
                <span className="rounded-full bg-emerald-100/80 px-3 py-1 text-[11px] font-bold text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300">
                  Provider Workspace
                </span>
              </div>

              <h3 className="mt-8 text-2xl font-bold text-slate-950 dark:text-white">
                Publish approved skills and manage queues.
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-zinc-400">
                Submit service listings for administrative review, respond to open requests, manage queue capacity, and build authentic local reputation.
              </p>

              {/* Provider capability pills */}
              <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold">
                <span className="rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-slate-700 dark:border-emerald-900/40 dark:bg-zinc-800 dark:text-zinc-200">
                  Listing Capacity Limits
                </span>
                <span className="rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-slate-700 dark:border-emerald-900/40 dark:bg-zinc-800 dark:text-zinc-200">
                  Targeted Job Proposals
                </span>
              </div>
            </div>

            <div className="mt-8 rounded-xl border border-emerald-200/60 bg-white/80 p-4 dark:border-emerald-900/30 dark:bg-zinc-950/40">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                <span>Single Active Job Discipline</span>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                Providers focus on serving one client at a time, strictly honoring the first eligible entry in line.
              </p>
            </div>
          </ScrollReveal>

          {/* Full-width Bridge Element (12 cols) */}
          <ScrollReveal direction="scale" delay={0.12} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-6 dark:border-zinc-800 dark:bg-zinc-900/50 sm:flex-row sm:items-center lg:col-span-12">
            <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-slate-700 shadow-xs dark:bg-zinc-800 dark:text-zinc-200">
              <ArrowLeftRight size={19} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-slate-950 dark:text-white">
                Switching roles changes your active workspace, never your verified resident identity.
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-zinc-400">
                Both profiles share identical trust history, community badges, and platform audit records.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
              <ShieldCheck size={18} />
              <span>Verified Account Unified</span>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
