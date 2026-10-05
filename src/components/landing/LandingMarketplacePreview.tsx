'use client';

import React, { useEffect, useRef, useState, type CSSProperties } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { AcceptedBookingFace, MessagesFace, MarketplaceConnectionFace } from './LandingHeroCardFaces';
import styles from './LandingMarketplacePreview.module.css';

interface LandingMarketplacePreviewProps { isDark: boolean; paused?: boolean }
type WorkspaceRole = 'seeker' | 'shared';
type OrbitCardKind = 'accepted-booking' | 'messages' | 'service-progress';
interface OrbitCardDefinition { kind: OrbitCardKind; role: WorkspaceRole; slot: number }
interface OrbitPose { x: number; y: number; z: number; scale: number; opacity: number; rotateX: number; rotateY: number }

// Repeat the three remaining panels with even spacing along the existing orbit.
const ORBIT_CARDS: OrbitCardDefinition[] = [
  { kind: 'accepted-booking', role: 'seeker', slot: 0 },
  { kind: 'messages', role: 'shared', slot: 1 },
  { kind: 'service-progress', role: 'shared', slot: 2 },
  { kind: 'accepted-booking', role: 'seeker', slot: 3 },
  { kind: 'messages', role: 'shared', slot: 4 },
  { kind: 'service-progress', role: 'shared', slot: 5 },
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
function smoothstep(start: number, end: number, value: number) {
  const progress = clamp((value - start) / (end - start), 0, 1);
  return progress * progress * (3 - 2 * progress);
}

// A closed ellipse keeps both position and velocity continuous at the loop seam.
// The front half descends; the back half recedes on the right behind the scene.
export function getOrbitPose(phase: number): OrbitPose {
  const normalizedPhase = ((phase % 1) + 1) % 1;
  const angle = normalizedPhase * Math.PI * 2 - Math.PI / 2;
  const frontDepth = Math.cos(angle);
  const entry = smoothstep(0, 0.1, normalizedPhase);
  // Keep the card solid while it crosses the right viewport edge; fade only on the hidden return arc.
  const exit = 1 - smoothstep(0.62, 0.74, normalizedPhase);

  return {
    x: 295 - 305 * frontDepth + 90 * Math.sin(angle),
    y: -86 + 300 * Math.sin(angle),
    z: 190 * frontDepth,
    scale: 0.75 + 0.14 * frontDepth,
    opacity: entry * exit,
    rotateX: 2 + 0.8 * Math.sin(angle),
    rotateY: -2 * frontDepth,
  };
}

function poseToTransform(pose: OrbitPose) {
  return `translate(-50%, -50%) translate3d(${pose.x.toFixed(2)}px, ${pose.y.toFixed(2)}px, ${pose.z.toFixed(2)}px) rotateX(${pose.rotateX.toFixed(3)}deg) rotateY(${pose.rotateY.toFixed(3)}deg) scale(${pose.scale.toFixed(4)})`;
}
function poseToZIndex(pose: OrbitPose) { return Math.round(50 + pose.z / 5); }

// Serialize the existing path into ordinary CSS once. The server sends these
// frames with the cards, so motion can start even while client JS is pending.
const orbitKeyframes = `@keyframes servicehub-hero-orbit {${Array.from({ length: 121 }, (_, step) => {
  const pose = getOrbitPose(step / 120);
  return `${(step / 1.2).toFixed(4)}%{transform:${poseToTransform(pose)};opacity:${pose.opacity.toFixed(4)};z-index:${poseToZIndex(pose)}}`;
}).join('')}}`;

function OrbitCard({ kind, role, slot }: OrbitCardDefinition) {
  const initialPose = getOrbitPose(slot / ORBIT_CARDS.length);
  const content = kind === 'accepted-booking' ? <AcceptedBookingFace /> : kind === 'messages' ? <MessagesFace /> : <MarketplaceConnectionFace />;
  const style = {
    '--orbit-rest-transform': poseToTransform(initialPose),
    '--orbit-rest-opacity': initialPose.opacity,
    '--orbit-rest-z-index': poseToZIndex(initialPose),
    animationName: 'servicehub-hero-orbit',
    animationDelay: `${-slot * 4}s`,
  } as CSSProperties;
  return <article data-orbit-card data-role-card={role} data-card-kind={kind} data-orbit-slot={slot} aria-hidden="true" className={styles.orbitCard} style={style}>{content}</article>;
}

export default function LandingMarketplacePreview({ isDark, paused = false }: LandingMarketplacePreviewProps) {
  const shouldReduceMotion = useReducedMotion();
  const orbitRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(orbitRef, { margin: '200px 0px', initial: true });
  const [pageVisible, setPageVisible] = useState(true);

  useEffect(() => {
    const updateVisibility = () => setPageVisible(document.visibilityState === 'visible');
    updateVisibility();
    document.addEventListener('visibilitychange', updateVisibility);
    return () => document.removeEventListener('visibilitychange', updateVisibility);
  }, []);

  return <motion.div ref={orbitRef} initial={false} whileInView={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: [0.8, 1], y: [14, 0] }} viewport={{ once: false, amount: 0.18 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className={`${styles.orbit} mx-auto w-full max-w-[42rem]`} data-preview-theme={isDark ? 'dark' : 'light'} data-running={isInView && pageVisible && !shouldReduceMotion && !paused ? 'true' : 'false'}>
    <style>{orbitKeyframes}</style>
    <p className="sr-only">Compare offers, follow agreed work, and build trust through completed services.</p>
    <div className={styles.orbitScene} aria-hidden="true">{ORBIT_CARDS.map((card) => <OrbitCard key={`${card.kind}-${card.slot}`} {...card} />)}</div>
  </motion.div>;
}
