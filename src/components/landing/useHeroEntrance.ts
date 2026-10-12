'use client';

import { useEffect, useRef } from 'react';
import { inView } from 'motion/react';

export default function useHeroEntrance() {
  const scope = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = scope.current;
    if (!element) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let stopObserving: (() => void) | undefined;
    const observe = () => {
      stopObserving?.();
      stopObserving = undefined;
      if (preference.matches) {
        element.dataset.heroMotion = 'idle';
        return;
      }
      stopObserving = inView(element, () => {
        // The server's "enter" attribute already starts the CSS entrance at
        // first paint. Setting the same value must not restart it on hydration.
        element.dataset.heroMotion = 'enter';
        // Removing the animation offscreen reveals its final, readable state.
        return () => { element.dataset.heroMotion = 'idle'; };
      }, { amount: 0.12 });
    };
    observe();
    preference.addEventListener?.('change', observe);
    return () => {
      preference.removeEventListener?.('change', observe);
      stopObserving?.();
    };
    // Observe viewport boundaries rather than updating React on scroll ticks.
  }, []);

  return scope;
}
