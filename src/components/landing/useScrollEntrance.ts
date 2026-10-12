'use client';

import { useEffect, useRef, type FocusEvent } from 'react';
import { useMotionValue, useScroll } from 'motion/react';

export type RevealDirection = 'up' | 'left' | 'right' | 'scale';

/** Progress is measured against layout coordinates, independent of transforms. */
export function useScrollEntrance<T extends HTMLElement>({
  direction = 'up',
  start = 0,
  distance = 72,
}: { direction?: RevealDirection; start?: number; distance?: number } = {}) {
  const ref = useRef<T>(null);
  const focused = useRef(false);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'start 0.5'],
  });

  // Visible SSR/no-script fallback. Only the mounted scroll subscription moves
  // these values; there is no timer, entry observer, or per-frame React state.
  const opacity = useMotionValue(1);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);
  const update = useRef<(progress: number) => void>(() => {});

  useEffect(() => {
    const wide = window.matchMedia('(min-width: 900px)');
    // Motion's installed useReducedMotion hook snapshots the initial value.
    // Subscribe directly so a live OS preference change takes effect as well.
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const settle = () => {
      opacity.set(1); x.set(0); y.set(0); scale.set(1);
    };
    update.current = (value: number) => {
      if (preference.matches || focused.current) {
        settle();
        return;
      }
      const entryStart = Math.min(0.24, Math.max(0, start));
      const progress = Math.min(1, Math.max(0, (value - entryStart) / (1 - entryStart)));
      const remaining = Math.pow(1 - progress, 1.35);
      const travel = wide.matches ? distance : Math.min(distance, 48);
      const sideways = wide.matches && (direction === 'left' || direction === 'right');
      opacity.set(1 - 0.6 * remaining);
      x.set(sideways ? travel * remaining * (direction === 'left' ? -1 : 1) : 0);
      y.set(sideways ? 0 : travel * remaining);
      scale.set(direction === 'scale' ? 1 - 0.04 * remaining : 1);
    };
    const refresh = () => update.current(scrollYProgress.get());
    refresh();
    const unsubscribe = scrollYProgress.on('change', update.current);
    wide.addEventListener('change', refresh);
    preference.addEventListener('change', refresh);
    return () => {
      unsubscribe();
      wide.removeEventListener('change', refresh);
      preference.removeEventListener('change', refresh);
      update.current = () => {};
    };
  }, [direction, distance, opacity, scale, scrollYProgress, start, x, y]);

  // Keep keyboard-operated controls steady while focus is inside the group.
  const onFocusCapture = () => {
    focused.current = true;
    update.current(scrollYProgress.get());
  };
  const onBlurCapture = (event: FocusEvent<T>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      focused.current = false;
      update.current(scrollYProgress.get());
    }
  };

  return { ref, style: { opacity, x, y, scale }, onFocusCapture, onBlurCapture };
}
