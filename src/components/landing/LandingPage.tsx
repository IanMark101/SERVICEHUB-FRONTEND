import React from 'react';
import LandingHeader from './LandingHeader';
import LandingHero from './LandingHero';
import LandingTicker from './LandingTicker';
import LandingProblem from './LandingProblem';
import LandingHowItWorks from './LandingHowItWorks';
import LandingWorkspaces from './LandingWorkspaces';
import LandingQueue from './LandingQueue';
import LandingTrust from './LandingTrust';
import LandingComparison from './LandingComparison';
import LandingCommunity from './LandingCommunity';
import LandingReviews from './LandingReviews';
import LandingFaq from './LandingFaq';
import LandingCta from './LandingCta';
import LandingFooter from './LandingFooter';
import LandingScrollProgress from './LandingScrollProgress';
import { useApp } from '@/context/AppContext';

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const { isDark, toggleTheme } = useApp();

  return (
    <div
      className="landing-shell relative min-h-[100dvh] overflow-x-clip font-sans flex flex-col bg-[#f5f4f2] dark:bg-[#121211] text-slate-900 dark:text-zinc-100 selection:bg-orange-500/20 selection:text-orange-900 dark:selection:bg-orange-500/30 dark:selection:text-orange-200"
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
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#f5f4f2] via-[#f5f4f2]/75 to-transparent dark:from-[#121211] dark:via-[#121211]/75" />
      </div>
      <LandingHeader isDark={isDark} toggleTheme={toggleTheme} onGetStarted={onGetStarted} />
      <main className="overflow-x-clip">
        <LandingHero isDark={isDark} onGetStarted={onGetStarted} />
        <LandingTicker isDark={isDark} variant="trust" />
        <LandingProblem isDark={isDark} />
        <LandingHowItWorks isDark={isDark} />
        <LandingWorkspaces isDark={isDark} />
        <LandingQueue isDark={isDark} />
        <LandingTrust isDark={isDark} />
        <LandingComparison isDark={isDark} />
        <LandingCommunity isDark={isDark} />
        <LandingReviews isDark={isDark} />
        <LandingFaq isDark={isDark} />
        <LandingCta isDark={isDark} onGetStarted={onGetStarted} />
      </main>
      <LandingFooter />
    </div>
  );
}
