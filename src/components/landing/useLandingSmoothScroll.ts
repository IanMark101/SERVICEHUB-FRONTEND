'use client';

import { createContext, useCallback, useEffect, useRef } from 'react';
import Lenis from 'lenis';

export type LandingScrollTo = (
  target: HTMLElement,
  options: { behavior: ScrollBehavior; block: 'start' | 'center' },
) => boolean;

// Standalone previews and reduced-motion users retain native navigation.
export const LandingScrollContext = createContext<LandingScrollTo>(() => false);

export default function useLandingSmoothScroll(): LandingScrollTo {
  const instance = useRef<Lenis | null>(null);

  useEffect(() => {
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

    const syncScrollLock = () => {
      const lenis = instance.current;
      if (!lenis) return;
      const locked = document.querySelector('dialog[open]') !== null
        || ['hidden', 'clip'].includes(document.body.style.overflow)
        || ['hidden', 'clip'].includes(document.body.style.overflowY);
      if (locked) lenis.stop();
      else lenis.start();
    };

    const syncMotionPreference = () => {
      instance.current?.destroy();
      instance.current = null;
      if (motionPreference.matches) return;
      // Keep the window as the scroll container so native sticky boundaries,
      // Motion scroll tracking and mobile touch scrolling continue to work.
      instance.current = new Lenis({
        autoRaf: true,
        lerp: 0.085,
        wheelMultiplier: 0.95,
        smoothWheel: true,
        syncTouch: false,
        anchors: false,
      });
      syncScrollLock();
    };

    // Watch only lock attributes, never animation styles throughout the page.
    const locks = new MutationObserver(syncScrollLock);
    locks.observe(document.body, { attributes: true, attributeFilter: ['style'] });
    locks.observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: ['open'] });
    motionPreference.addEventListener('change', syncMotionPreference);
    syncMotionPreference();

    return () => {
      locks.disconnect();
      motionPreference.removeEventListener('change', syncMotionPreference);
      instance.current?.destroy();
      instance.current = null;
    };
  }, []);

  return useCallback<LandingScrollTo>((target, { behavior, block }) => {
    const lenis = instance.current;
    if (!lenis) return false;
    // Lenis reads CSS scroll-margin for element anchors. Centered demo jumps
    // use a document coordinate so the section's header clearance is excluded.
    let destination: HTMLElement | number = target;
    if (block === 'center') {
      const rect = target.getBoundingClientRect();
      destination = window.scrollY + rect.top + (rect.height - window.innerHeight) / 2;
    }
    lenis.scrollTo(destination, {
      immediate: behavior !== 'smooth',
      duration: 1.2,
      lerp: 0,
    });
    return true;
  }, []);
}
