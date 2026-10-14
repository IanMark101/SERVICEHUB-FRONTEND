'use client';

import { motion, useScroll, useSpring } from 'motion/react';

export default function LandingScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 150,
    damping: 28,
    mass: 0.25,
  });

  return (
    <motion.div
      aria-hidden="true"
      // CSS honors the device preference before hydration without changing
      // the server/client tree or removing the neighboring hero content.
      className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-brand-action motion-reduce:hidden"
      style={{ scaleX }}
    />
  );
}
