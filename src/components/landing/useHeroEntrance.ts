'use client';

import { useEffect } from 'react';
import { inView, useAnimate, type AnimationPlaybackControlsWithThen } from 'motion/react';

const ease = [0.22, 1, 0.36, 1] as const;
const entrance = [
  { name: 'badge', transform: 'translateY(-8px)', duration: 0.5, delay: 0 },
  { name: 'heading', transform: 'translateY(16px)', duration: 0.6, delay: 0.08 },
  { name: 'description', transform: 'translateY(14px)', duration: 0.6, delay: 0.16 },
  { name: 'actions', transform: 'translateY(12px)', duration: 0.6, delay: 0.24 },
  { name: 'scene', transform: 'translateX(24px)', duration: 0.7, delay: 0 },
] as const;

export default function useHeroEntrance() {
  const [scope, animate] = useAnimate<HTMLElement>();

  useEffect(() => {
    const element = scope.current;
    if (!element) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let controls: AnimationPlaybackControlsWithThen[] = [];
    let stopObserving: (() => void) | undefined;
    const observe = () => {
      stopObserving?.();
      controls.forEach(control => control.complete());
      if (preference.matches) return;
      stopObserving = inView(element, () => {
        controls.forEach(control => control.stop());
        controls = entrance.filter(({ name }) => element.querySelector(`[data-hero-entrance="${name}"]`)).map(({ name, transform, duration, delay }) => animate(
          `[data-hero-entrance="${name}"]`,
          { opacity: [0.85, 1], transform: [transform, 'none'] },
          { duration, delay, ease },
        ));
        // Finish an interrupted entrance offscreen; re-entry starts it afresh.
        return () => controls.forEach(control => control.complete());
      }, { amount: 0.12 });
    };
    observe();
    preference.addEventListener?.('change', observe);
    return () => {
      preference.removeEventListener?.('change', observe);
      stopObserving?.();
      controls.forEach(control => control.stop());
    };
    // Observe viewport boundaries rather than updating React on scroll ticks.
  }, [animate, scope]);

  return scope;
}
