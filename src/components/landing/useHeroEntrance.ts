'use client';

import { useEffect } from 'react';
import { inView, useAnimate, type AnimationPlaybackControlsWithThen } from 'motion/react';

const ease = [0.22, 1, 0.36, 1] as const;
// Match the public eGovPH hero choreography (https://e.gov.ph/): a badge
// descending 20px, copy rising 32px with 100ms stagger, and the scene sliding
// 48px from the right. Our Help Center row occupies the final supporting slot.
const entrance = [
  { name: 'badge', transform: 'translateY(-20px)', duration: 0.5, delay: 0.05 },
  { name: 'heading', transform: 'translateY(32px)', duration: 0.6, delay: 0.15 },
  { name: 'description', transform: 'translateY(32px)', duration: 0.6, delay: 0.25 },
  { name: 'actions', transform: 'translateY(32px)', duration: 0.6, delay: 0.35 },
  { name: 'support', transform: 'translateY(32px)', duration: 0.6, delay: 0.45 },
  { name: 'scene', transform: 'translateX(48px)', duration: 0.7, delay: 0.3 },
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
          { opacity: [0, 1], transform: [transform, 'none'] },
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
