'use client';

import { motion, useReducedMotion } from 'motion/react';

type RevealDirection = 'up' | 'left' | 'right' | 'scale';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  direction?: RevealDirection;
  delay?: number;
  amount?: number;
  hoverLift?: boolean;
}

const hiddenByDirection: Record<RevealDirection, { opacity: number; x?: number; y?: number; scale?: number }> = {
  up: { opacity: 0, y: 24 },
  left: { opacity: 0, x: -32 },
  right: { opacity: 0, x: 32 },
  scale: { opacity: 0, y: 12, scale: 0.97 },
};

export default function ScrollReveal({
  children,
  className = '',
  direction = 'up',
  delay = 0,
  amount = 0.18,
  hoverLift = false,
}: ScrollRevealProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? false : hiddenByDirection[direction]}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      whileHover={shouldReduceMotion || !hoverLift ? undefined : { y: -4 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.68, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
