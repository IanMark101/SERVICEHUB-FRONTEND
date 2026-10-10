'use client';

import React from 'react';

export type TickerVariant = 'trust' | 'barangays' | 'standards' | 'services' | 'locality';

interface LandingTickerProps {
  isDark?: boolean;
  variant?: TickerVariant;
  direction?: 'forward' | 'reverse';
  tilted?: boolean;
  className?: string;
  items?: string[];
}

const TICKER_DATA: Record<TickerVariant, string[]> = {
  services: [
    'Aircon Service', 'Appliance Repair', 'Carpentry & Woodwork',
    'Electrical Repair', 'Haircut', 'House Cleaning', 'Lawn Care', 'Plumbing', 'Tutoring',
  ],
  locality: [
    'Choose Your Location', 'Adjust Your Search Radius', 'Nearby Providers',
    'Find the Right Help', 'Offer Your Skills', 'Find Service Requests',
    'Clear Service Coverage', 'One Account, Two Workspaces',
  ],
  trust: [
    'Identity & Residency Verification',
    'First-Come, First-Served Online Queues',
    'Clear Service Pricing',
    'Location + Radius Discovery',
    'GCash Test Mode and On-Site Cash',
    'Services from Verified Residents',
    'Reviews After Completed Work',
    'One Account for Both Workspaces',
  ],
  barangays: [
    'Nearby Providers',
    'Electrical & Diagnostic Repair',
    'Choose Your Location',
    'Plumbing & Water Pumps',
    'Across Communities',
    'Aircon Deep Cleaning & Servicing',
    'Flexible Search Radius',
    'Carpentry & Masonry',
    'Nearby Work Opportunities',
    'Appliance Diagnostics',
    'Verified Members',
    'Motorcycle & Engine Care',
  ],
  standards: [
    'Email and Residency Verification',
    'Messages Connected to Accepted Bookings',
    'Services from Verified Residents',
    'PayMongo Test Mode Payments',
    'Reviews From Completed Services',
    'First-Come, First-Served Service Queues',
    'Visible Trust Scores and History',
    'On-Site Cash Arrangements',
  ],
};

export default function LandingTicker({
  isDark,
  variant = 'trust',
  direction = 'forward',
  tilted = false,
  className = '',
  items: customItems,
}: LandingTickerProps) {
  const items = customItems ?? TICKER_DATA[variant] ?? TICKER_DATA.trust;
  const animationClass = direction === 'reverse' ? 'animate-ticker-reverse' : 'animate-ticker';

  return (
    <div
      data-theme={isDark ? 'dark' : 'light'}
      className={`relative w-full overflow-hidden ${tilted ? 'py-[calc(1.75vw+0.5rem)]' : ''} ${className}`}
      aria-label="ServiceHub highlights"
    >
      <div className={`relative flex min-h-14 items-center overflow-hidden border-y border-black/[0.08] bg-white/80 py-4.5 backdrop-blur-md dark:border-white/10 dark:bg-charcoal/70 sm:min-h-16 sm:py-5 ${tilted ? 'left-1/2 w-[calc(100%+4rem)] -translate-x-1/2 -rotate-2 shadow-[0_12px_22px_-16px_rgba(0,0,0,0.22)]' : 'w-full'}`}>
        {/* Edge gradient masks for smooth fade-in and fade-out */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[var(--landing-surface)] to-transparent dark:from-charcoal sm:w-28" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[var(--landing-surface)] to-transparent dark:from-charcoal sm:w-28" />

        {/* Infinite scrolling track */}
        <div className={`flex w-max items-center will-change-transform ${animationClass} hover:[animation-play-state:paused]`}>
          {/* Track 1 */}
          <div className="flex shrink-0 items-center gap-12 pr-12 sm:gap-16 sm:pr-16">
            {items.map((item, idx) => (
              <div key={`track1-${variant}-${idx}`} className="flex items-center gap-6 sm:gap-8">
                <span className="whitespace-nowrap text-sm font-bold uppercase leading-5 tracking-[0.24em] text-neutral-700 dark:text-neutral-200 sm:text-base sm:leading-6">
                  {item}
                </span>
                <span className="h-4 w-px shrink-0 bg-brand/50" aria-hidden="true" />
              </div>
            ))}
          </div>

          {/* Track 2 (Duplicate for seamless loop) */}
          <div className="flex shrink-0 items-center gap-12 pr-12 sm:gap-16 sm:pr-16" aria-hidden="true">
            {items.map((item, idx) => (
              <div key={`track2-${variant}-${idx}`} className="flex items-center gap-6 sm:gap-8">
                <span className="whitespace-nowrap text-sm font-bold uppercase leading-5 tracking-[0.24em] text-neutral-700 dark:text-neutral-200 sm:text-base sm:leading-6">
                  {item}
                </span>
                <span className="h-4 w-px shrink-0 bg-brand/50" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
