'use client';

import { useEffect } from 'react';
import { useAnimate } from 'motion/react';

const ease = [0.22, 1, 0.36, 1] as const;
const entrance = [
  { name: 'badge', transform: 'translateY(-20px)', duration: 0.5, delay: 0.05 },
  { name: 'heading', transform: 'translateY(32px)', duration: 0.6, delay: 0.15 },
  { name: 'description', transform: 'translateY(32px)', duration: 0.6, delay: 0.25 },
  { name: 'actions', transform: 'translateY(32px)', duration: 0.6, delay: 0.35 },
  { name: 'scene', transform: 'translateX(48px)', duration: 0.7, delay: 0 },
] as const;

export default function useHeroEntrance() {
  const [scope, animate] = useAnimate<HTMLElement>();

  useEffect(() => {
    const first = scope.current?.querySelector<HTMLElement>('[data-hero-entrance]');
    // CSS exposes the finished composition for reduced motion and after the
    // no-script fallback. Never hide it again if hydration arrives late.
    if (!first || window.matchMedia('(prefers-reduced-motion: reduce)').matches
      || window.getComputedStyle(first).opacity === '1') return;

    const controls = entrance.map(({ name, transform, duration, delay }) => animate(
      `[data-hero-entrance="${name}"]`,
      { opacity: [0, 1], transform: [transform, 'none'] },
      { duration, delay, ease },
    ));
    return () => controls.forEach(control => control.stop());
    // The scope and animate identities are stable. Theme/session rerenders
    // and scroll changes cannot restart this mount-only entrance.
  }, [animate, scope]);

  return scope;
}
