import React, { useState, useCallback } from 'react';
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

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark" || document.documentElement.classList.contains("dark");
    }
    return false;
  });

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const nextDark = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem('theme', nextDark ? 'dark' : 'light');
        if (nextDark) {
          document.documentElement.classList.add('dark');
          document.documentElement.style.colorScheme = 'dark';
        } else {
          document.documentElement.classList.remove('dark');
          document.documentElement.style.colorScheme = 'light';
        }
      }
      return nextDark;
    });
  }, []);

  return (
    <div
      className="landing-shell min-h-screen font-sans flex flex-col bg-[#f5f4f2] dark:bg-[#121211] text-slate-900 dark:text-zinc-100 selection:bg-orange-500/20 selection:text-orange-900 dark:selection:bg-orange-500/30 dark:selection:text-orange-200"
      style={{ overflowX: 'clip' }}
    >
      <LandingHeader isDark={isDark} toggleTheme={toggleTheme} onGetStarted={onGetStarted} />
      <LandingHero isDark={isDark} onGetStarted={onGetStarted} />
      <LandingTicker isDark={isDark} variant="trust" />
      <LandingProblem isDark={isDark} />
      <LandingHowItWorks isDark={isDark} />
      <LandingWorkspaces isDark={isDark} />
      <LandingQueue isDark={isDark} />
      <LandingTrust isDark={isDark} />
      <LandingComparison isDark={isDark} />
      <LandingTicker isDark={isDark} variant="barangays" direction="reverse" />
      <LandingCommunity isDark={isDark} />
      <LandingReviews isDark={isDark} />
      <LandingFaq isDark={isDark} />
      <LandingTicker isDark={isDark} variant="standards" />
      <LandingCta isDark={isDark} onGetStarted={onGetStarted} />
      <LandingFooter />
    </div>
  );
}
