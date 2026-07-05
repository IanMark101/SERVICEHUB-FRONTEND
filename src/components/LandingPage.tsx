import React, { useState, useEffect } from 'react';
import LandingHeader from './landing/LandingHeader';
import LandingHero from './landing/LandingHero';
import LandingProblem from './landing/LandingProblem';
import LandingHowItWorks from './landing/LandingHowItWorks';
import LandingWorkspaces from './landing/LandingWorkspaces';
import LandingQueue from './landing/LandingQueue';
import LandingTrust from './landing/LandingTrust';
import LandingComparison from './landing/LandingComparison';
import LandingCommunity from './landing/LandingCommunity';
import LandingReviews from './landing/LandingReviews';
import LandingFaq from './landing/LandingFaq';
import LandingCta from './landing/LandingCta';
import LandingFooter from './landing/LandingFooter';

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const dark = localStorage.getItem("theme") === "dark";
      setIsDark(dark);
      if (dark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    localStorage.setItem('theme', nextDark ? 'dark' : 'light');
    if (typeof window !== "undefined") {
      if (nextDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      window.dispatchEvent(new Event('storage'));
    }
  };

  return (
    <div className="min-h-screen font-sans select-none flex flex-col justify-between transition-colors duration-500 overflow-x-clip relative bg-[#fbfaf7] dark:bg-[#191919] text-[#1c1b18] dark:text-[#f2efe9]">
      {/* Global Background Grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-100 pointer-events-none z-0"></div>
      
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
