'use client';

import React from 'react';
import LandingHeader from './LandingHeader';
import LandingHero from './LandingHero';
import LandingTicker from './LandingTicker';
import LandingBenefits from './LandingBenefits';
import LandingHowItWorks from './LandingHowItWorks';
import LandingWorkspaces from './LandingWorkspaces';
import LandingQueue from './LandingQueue';
import LandingTrust from './LandingTrust';
import LandingComparison from './LandingComparison';
import LandingCommunity from './LandingCommunity';
import LandingReviews from './LandingReviews';
import LandingFaq from './LandingFaq';
import LandingCta from './LandingCta';
import LandingScrollProgress from './LandingScrollProgress';
import { CinematicFooter } from '@/components/ui/motion-footer';
import { useApp } from '@/context/AppContext';
import useLandingSectionNavigation from './useLandingSectionNavigation';

export default function LandingPage() {
  const { isDark, toggleTheme } = useApp();
  const { shellRef, handleSectionClick } = useLandingSectionNavigation();

  return (
    <div
      ref={shellRef}
      onClick={handleSectionClick}
      className="landing-shell relative min-h-[100dvh] overflow-x-clip font-sans flex flex-col bg-[var(--landing-surface)] dark:bg-charcoal text-slate-900 dark:text-zinc-100 selection:bg-orange-500/20 selection:text-orange-900 dark:selection:bg-orange-500/30 dark:selection:text-orange-200"
      style={{
        backgroundImage: isDark
          ? 'radial-gradient(ellipse 78% 42% at 50% -8%, rgba(200, 101, 68, 0.04), transparent 72%)'
          : 'radial-gradient(ellipse 78% 42% at 50% -8%, rgba(217, 119, 87, 0.035), transparent 72%)',
      }}
    >
      <LandingScrollProgress />
      {/*
       * Keep the atmospheric color field at the shell level so it starts at
       * the viewport edge and remains visible around the floating header.
       * The fade keeps the rest of the page calm and neutral.
       */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[min(100svh,58rem)] overflow-hidden">
        <div className="absolute -left-28 -top-24 h-[30rem] w-[42rem] rounded-full bg-[#d97757]/[0.03] blur-[140px] dark:bg-[#c86544]/[0.02]" />
        <div className="absolute right-[2%] -top-16 h-[34rem] w-[46rem] rounded-full bg-[#e18463]/[0.025] blur-[150px] dark:bg-[#e18463]/[0.018]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[var(--landing-surface)] via-[var(--landing-surface)]/75 to-transparent dark:from-charcoal dark:via-charcoal/75" />
      </div>
      <LandingHeader isDark={isDark} toggleTheme={toggleTheme} />
      <main className="overflow-x-clip">
        <LandingHero isDark={isDark} />
        <LandingTicker isDark={isDark} variant="services" className="landing-hero-strip" />
        <LandingBenefits isDark={isDark} />
        <LandingHowItWorks isDark={isDark} />
        <LandingWorkspaces isDark={isDark} />
        <LandingQueue isDark={isDark} />
        <LandingTrust isDark={isDark} />
        <LandingComparison isDark={isDark} />
        <LandingCommunity isDark={isDark} />
        <LandingReviews isDark={isDark} />
        <LandingFaq isDark={isDark} />
        <LandingCta isDark={isDark} />
        <CinematicFooter isDark={isDark} marqueeVariant="locality" subheadline="Go straight to the service, request, or listing tools you need." />
      </main>
    </div>
  );
}
