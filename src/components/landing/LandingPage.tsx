import React, { useState, useEffect, useCallback } from 'react';
import LandingHeader from './LandingHeader';
import LandingHero from './LandingHero';
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
      className="min-h-screen font-sans select-none flex flex-col bg-[#fbfaf7] dark:bg-[#191919] text-[#1c1b18] dark:text-[#f2efe9]"
      style={{ overflowX: 'clip' }}
    >
      {/* Global Background Grid — position fixed so it doesn't affect scroll */}
      <div className="fixed inset-0 bg-grid-pattern opacity-100 pointer-events-none z-0" />

      <LandingHeader isDark={isDark} toggleTheme={toggleTheme} onGetStarted={onGetStarted} />
      <LandingHero isDark={isDark} onGetStarted={onGetStarted} />
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
      <LandingFooter isDark={isDark} onGetStarted={onGetStarted} />
    </div>
  );
}
