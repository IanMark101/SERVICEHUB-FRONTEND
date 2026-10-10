'use client';

import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import GetStartedLink from './GetStartedLink';
import { useApp } from '@/context/AppContext';

export default function LandingCta({ isDark }: { isDark: boolean }) {
  const { authLoading, isAuthenticated, user } = useApp();
  const hasSession = !authLoading && isAuthenticated && Boolean(user);
  return (
    <section
      data-theme={isDark ? 'dark' : 'light'}
      className="px-5 py-20 sm:px-8 lg:px-10 lg:py-28"
    >
      <ScrollReveal className="mx-auto grid max-w-7xl gap-8 rounded-3xl bg-gradient-to-br from-brand to-brand-action-hover px-7 py-12 text-white shadow-xl shadow-orange-950/20 sm:px-12 lg:grid-cols-[1fr_auto] lg:items-center lg:px-16 lg:py-16">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold tracking-wide text-orange-100">
            <ShieldCheck size={14} aria-hidden="true" />
            <span>Find services nearby</span>
          </div>
          <h2 className="mt-4 max-w-3xl font-sans text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl lg:leading-[1.12]">
            Create your ServiceHub profile.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-orange-100/90 sm:text-base">
            Get started with a new account, or sign in to continue with the profile you already have.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col sm:items-center lg:items-stretch">
          <GetStartedLink className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-7 text-sm font-bold text-brand-action-hover shadow-md transition-all hover:bg-orange-50 motion-safe:active:scale-[0.98] motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
            <span>{hasSession ? 'Open workspace' : 'Get started'}</span>
            <ArrowRight size={16} aria-hidden="true" />
          </GetStartedLink>
          {!hasSession && (
            <Link href="/login" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/30 bg-white/5 px-7 text-sm font-bold text-white transition-all hover:bg-white/10 motion-safe:active:scale-[0.98] motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
              Sign in
            </Link>
          )}
        </div>
      </ScrollReveal>
    </section>
  );
}
