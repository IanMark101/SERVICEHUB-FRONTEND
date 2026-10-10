'use client';

import { useState } from 'react';
import { ArrowRight, Pause, Play } from 'lucide-react';
import { useReducedMotion } from 'motion/react';
import LandingMarketplacePreview from './LandingMarketplacePreview';
import LandingHeroHorizontalTrack from './LandingHeroHorizontalTrack';
import styles from './LandingHeroResponsive.module.css';

export default function LandingBenefits({ isDark }: { isDark: boolean }) {
  const [paused, setPaused] = useState(false);
  const reducedMotion = useReducedMotion();
  return (
    <section id="problem" aria-labelledby="landing-benefits-title" className={`${styles.heroSurface} relative overflow-hidden border-b border-black/[0.06] dark:border-white/10`}>
      <div className={`${styles.heroGrid} relative z-10 mx-auto grid min-h-0 max-w-7xl items-center gap-10 px-5 py-14 sm:px-8 lg:min-h-[560px] lg:px-10 lg:py-16`}>
        <div data-landing-anchor className="relative z-10 max-w-xl">
          <h2 id="landing-benefits-title" className="text-4xl font-semibold leading-[1.1] tracking-tight text-[#0a0a0a] dark:text-white sm:text-5xl lg:text-[3.5rem]">Local help, with less guesswork.</h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-neutral-600 dark:text-zinc-300">Too much gets lost between a post and a conversation. Bring requests, offers, and booking progress together in one place.</p>
          <dl className="mt-8 space-y-5 text-sm leading-relaxed text-neutral-600 dark:text-zinc-300">
            <div><dt className="font-semibold text-neutral-900 dark:text-white">Compare before choosing.</dt><dd>Review offered prices and terms, or describe a specific task when a listed service doesn’t fit.</dd></div>
            <div><dt className="font-semibold text-neutral-900 dark:text-white">Follow your agreed work.</dt><dd>Keep booking updates together. Paid online work has a visible place in the provider’s queue.</dd></div>
            <div><dt className="font-semibold text-neutral-900 dark:text-white">Trust built through completed work.</dt><dd>Residency verification and reviews tied to completed services support informed choices.</dd></div>
          </dl>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <a href="#how-it-works" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-action-hover    dark:text-orange-300">See how it works <ArrowRight size={16} aria-hidden="true" /></a>
            <button type="button" disabled={!!reducedMotion} onClick={() => setPaused(value => !value)} aria-pressed={paused || !!reducedMotion} className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-xs font-medium text-neutral-600 hover:bg-charcoal/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-action-hover disabled:cursor-default dark:text-zinc-300 dark:hover:bg-charcoal">
              {paused || reducedMotion ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
              {reducedMotion ? 'Motion off' : paused ? 'Resume cards' : 'Pause cards'}
            </button>
          </div>
        </div>
        <div className={styles.desktopPreview}><LandingMarketplacePreview isDark={isDark} paused={paused} /></div>
        <div className={styles.horizontalShowcase}><LandingHeroHorizontalTrack paused={paused} /></div>
      </div>
    </section>
  );
}
