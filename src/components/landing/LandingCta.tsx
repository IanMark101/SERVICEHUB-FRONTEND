'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

interface LandingCtaProps {
  isDark: boolean;
  onGetStarted: () => void;
}

export default function LandingCta({ isDark, onGetStarted }: LandingCtaProps) {
  return (
    <section
      data-theme={isDark ? 'dark' : 'light'}
      className="px-5 py-20 sm:px-8 lg:px-10 lg:py-28"
    >
      <ScrollReveal className="mx-auto grid max-w-7xl gap-8 rounded-3xl bg-gradient-to-br from-[#c86544] to-[#aa5032] px-7 py-12 text-white shadow-xl shadow-orange-950/20 sm:px-12 lg:grid-cols-[1fr_auto] lg:items-center lg:px-16 lg:py-16">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold tracking-wide text-orange-100">
            <ShieldCheck size={14} />
            <span>Cordova Verified Marketplace</span>
          </div>
          <h2 className="mt-4 max-w-3xl font-sans text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl lg:leading-[1.12]">
            Start with one account. Choose your workspace inside.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-orange-100/90 sm:text-base">
            Browse listings freely, complete residency verification when you are ready to book or offer, and manage all your local service activity under one accountable identity.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col sm:items-center lg:items-stretch">
          <button
            type="button"
            onClick={onGetStarted}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-7 text-sm font-bold text-[#aa5032] shadow-md transition-all hover:bg-orange-50 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <span>Get started</span>
            <ArrowRight size={16} />
          </button>
          <Link
            href="/login"
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/30 bg-white/5 px-7 text-sm font-bold text-white transition-all hover:bg-white/10 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Sign in
          </Link>
        </div>
      </ScrollReveal>
    </section>
  );
}
