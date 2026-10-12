'use client';

import { motion, useInView, useReducedMotion } from 'motion/react';
import { useRef, type CSSProperties } from 'react';
import styles from './LandingEntrance.module.css';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'up' | 'left' | 'right' | 'scale';
  delay?: number;
  distance?: number;
  hoverLift?: boolean;
}

export default function ScrollReveal({
  children,
  className = '',
  direction = 'up',
  delay = 0,
  distance = 72,
  hoverLift = false,
}: ScrollRevealProps) {
  const shouldReduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const hasEntered = useInView(ref, { once: true, amount: 0.15 });

  return (
    <motion.div
      ref={ref}
      data-entrance-direction={direction}
      data-entrance-active={hasEntered ? 'true' : 'false'}
      style={{ '--entrance-delay':`${delay}s`, '--entrance-distance':`${distance}px` } as CSSProperties}
      initial={false}
      whileHover={shouldReduceMotion || !hoverLift ? undefined : { y: -4 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={`${styles.entrance} ${className}`}
    >
      {children}
    </motion.div>
  );
}
