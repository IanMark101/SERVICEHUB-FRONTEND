'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import styles from './ScaledPreview.module.css';

/** Fit real UI into a device without changing the product's text or spacing. */
export default function ScaledPreview({ width, label, className = '', children }: {
  width: number; label: string; className?: string; children: ReactNode;
}) {
  const viewport = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const outer = viewport.current;
    const inner = canvas.current;
    if (!outer || !inner) return;
    const fit = () => {
      const scale = outer.clientWidth / width;
      if (!scale) return;
      inner.style.transform = `scale(${scale})`;
      outer.style.height = `${inner.offsetHeight * scale}px`;
    };
    fit();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(fit);
    observer.observe(outer);
    observer.observe(inner);
    return () => observer.disconnect();
  }, [width]);
  return <div ref={viewport} className={`${styles.viewport} ${className}`} role="img" aria-label={label}>
    <div ref={canvas} className={styles.canvas} style={{ width }} inert aria-hidden="true">{children}</div>
  </div>;
}
