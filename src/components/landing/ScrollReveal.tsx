'use client';

import { motion, useReducedMotion } from 'motion/react';
import { useScrollEntrance, type RevealDirection } from './useScrollEntrance';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  direction?: RevealDirection;
  scrollStart?: number;
  distance?: number;
  hoverLift?: boolean;
}

export default function ScrollReveal({
  children,
  className = '',
  direction = 'up',
  scrollStart = 0,
  distance = 72,
  hoverLift = false,
}: ScrollRevealProps) {
  const shouldReduceMotion = useReducedMotion();
  const entrance = useScrollEntrance<HTMLDivElement>({ direction, start: scrollStart, distance });

  return (
    <motion.div
      data-scroll-reveal={direction}
      data-scroll-motion="linked"
      {...entrance}
      initial={false}
      whileHover={shouldReduceMotion || !hoverLift ? undefined : { y: -4 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
