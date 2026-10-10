'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { installReferenceReveals } from './referenceReveals';
import styles from './MarketplacePresentation.module.css';

export default function MarketplacePresentation({ role, children }: { role: 'seeker' | 'provider'; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root || typeof window.matchMedia !== 'function') return;
    let cleanupReveals: (() => void) | undefined;
    let initialized = false;
    const prepare = () => {
      if (initialized) return;
      const cards = [...root.querySelectorAll<HTMLElement>('[data-marketplace-card]')];
      if (!cards.length) return;
      initialized = true;
      const grid = cards[0].parentElement;
      const columns = grid ? getComputedStyle(grid).gridTemplateColumns.split(' ').length : 1;
      cards.forEach((card, index) => {
        card.dataset.reveal = Math.floor(index / columns) % 2 ? 'slide' : 'rise';
        card.dataset.revealIndex = String(index % columns);
      });
      cleanupReveals = installReferenceReveals(root);
      observer.disconnect();
    };
    const observer = new MutationObserver(prepare);
    observer.observe(root, { childList: true, subtree: true });
    prepare();
    return () => {
      observer.disconnect();
      cleanupReveals?.();
    };
  }, []);
  return <div ref={ref} data-marketplace-role={role} className={styles.presentation}>{children}</div>;
}
