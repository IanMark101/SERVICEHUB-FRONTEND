'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'motion/react';
import { AcceptedBookingFace, MessagesFace, MarketplaceConnectionFace } from './LandingHeroCardFaces';
import styles from './LandingHeroHorizontalTrack.module.css';

const CARDS = [
  { kind: 'accepted-booking', face: AcceptedBookingFace },
  { kind: 'messages', face: MessagesFace },
  { kind: 'service-progress', face: MarketplaceConnectionFace },
] as const;

function CardSequence({ copy = false }: { copy?: boolean }) {
  return (
    <div className={styles.sequence} data-track-sequence={copy ? 'copy' : 'original'} aria-hidden="true">
      {CARDS.map(({ kind, face: Face }) => (
        <article key={kind} className={styles.card} data-card-kind={kind}>
          <Face />
        </article>
      ))}
    </div>
  );
}

export default function LandingHeroHorizontalTrack({ paused = false }: { paused?: boolean }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(viewportRef, { margin: '200px 0px', initial: true });
  const shouldReduceMotion = useReducedMotion();
  const [pageVisible, setPageVisible] = useState(true);

  useEffect(() => {
    const updateVisibility = () => setPageVisible(document.visibilityState === 'visible');
    updateVisibility();
    document.addEventListener('visibilitychange', updateVisibility);
    return () => document.removeEventListener('visibilitychange', updateVisibility);
  }, []);

  return (
    <div
      ref={viewportRef}
      className={styles.viewport}
      data-hero-track
      data-running={isInView && pageVisible && !shouldReduceMotion && !paused ? 'true' : 'false'}
      tabIndex={shouldReduceMotion ? 0 : undefined}
    >
      <p className="sr-only">Compare offers, follow agreed work, and build trust through completed services.</p>
      <div className={styles.track} data-hero-track-motion>
        <CardSequence />
        <CardSequence copy />
      </div>
    </div>
  );
}
