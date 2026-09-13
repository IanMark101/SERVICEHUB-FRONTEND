'use client';

import React from 'react';

export type TickerVariant = 'trust' | 'barangays' | 'standards';

interface LandingTickerProps {
  isDark?: boolean;
  variant?: TickerVariant;
  direction?: 'forward' | 'reverse';
  className?: string;
}

const TICKER_DATA: Record<TickerVariant, string[]> = {
  trust: [
    'Verified Cordova Residency Gate',
    'Listing-Specific First-Come First-Served Queues',
    'Transparent Fixed & Hourly Rates',
    '13 Recognized Cordova Barangays',
    'GCash Test Mode & On-Site Cash',
    'Zero Unmoderated Social Media Posts',
    'Accountable Post-Service Reviews',
    'One Resident Account For Both Roles',
  ],
  barangays: [
    'Barangay Ibabao',
    'Electrical & Diagnostic Repair',
    'Barangay Poblacion',
    'Plumbing & Water Pumps',
    'Barangay Catarman',
    'Aircon Deep Cleaning & Servicing',
    'Barangay Gabi',
    'Carpentry & Masonry',
    'Barangay Pilipog',
    'Appliance Diagnostics',
    'Barangay Day-as',
    'Motorcycle & Engine Care',
    'Barangay Alegria',
    'Barangay Bangbang',
    'Barangay Buagsong',
    'Barangay Cogon',
    'Barangay Dapitan',
    'Barangay Gilutongan',
    'Barangay San Miguel',
  ],
  standards: [
    'Email & Residency Access Gates',
    'Booking-Scoped Messages',
    'Administrative Listing Review',
    'Simulated Online-Payment Hold',
    'Reviews From Completed Services',
    'Fair Listing-Specific Queue Order',
    'Visible Trust History',
    'Direct On-Site Cash Arrangements',
  ],
};

export default function LandingTicker({
  isDark,
  variant = 'trust',
  direction = 'forward',
  className = '',
}: LandingTickerProps) {
  const items = TICKER_DATA[variant] || TICKER_DATA.trust;
  const animationClass = direction === 'reverse' ? 'animate-ticker-reverse' : 'animate-ticker';

  return (
    <div
      data-theme={isDark ? 'dark' : 'light'}
      className={`relative w-full overflow-hidden border-y border-black/[0.08] bg-[#ede8e1]/60 py-3.5 backdrop-blur-md dark:border-white/10 dark:bg-zinc-900/50 ${className}`}
      aria-label={`${variant} ticker`}
    >
      {/* Edge gradient masks for smooth fade-in and fade-out */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#f5f4f2] to-transparent dark:from-[#121211] sm:w-28" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#f5f4f2] to-transparent dark:from-[#121211] sm:w-28" />

      {/* Infinite scrolling track */}
      <div className={`flex w-max items-center gap-8 will-change-transform ${animationClass} hover:[animation-play-state:paused]`}>
        {/* Track 1 */}
        <div className="flex shrink-0 items-center gap-8">
          {items.map((item, idx) => (
            <div key={`track1-${variant}-${idx}`} className="flex items-center gap-3.5">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-800 dark:text-neutral-200">
                {item}
              </span>
              <span className="h-3 w-px bg-[#c86544]/50" aria-hidden="true" />
            </div>
          ))}
        </div>

        {/* Track 2 (Duplicate for seamless loop) */}
        <div className="flex shrink-0 items-center gap-8" aria-hidden="true">
          {items.map((item, idx) => (
            <div key={`track2-${variant}-${idx}`} className="flex items-center gap-3.5">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-800 dark:text-neutral-200">
                {item}
              </span>
              <span className="h-3 w-px bg-[#c86544]/50" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
