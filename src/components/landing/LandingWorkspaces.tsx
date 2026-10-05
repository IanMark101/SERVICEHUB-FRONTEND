'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  ArrowLeftRight,
  BriefcaseBusiness,
  CheckCircle2,
  ExternalLink,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform, useReducedMotion } from 'motion/react';
import ScrollReveal from './ScrollReveal';

interface LandingWorkspacesProps {
  isDark: boolean;
}

type WorkspaceTab = 'seeker' | 'provider';

export default function LandingWorkspaces({ isDark }: LandingWorkspacesProps) {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('seeker');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isHoveringLens, setIsHoveringLens] = useState(false);
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 });
  const [containerDims, setContainerDims] = useState({ width: 0, height: 0 });
  const screenRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const LENS_DIAMETER = 290;
  const LENS_RADIUS = 145;
  const ZOOM = 2.2;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!screenRef.current) return;
    const rect = screenRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
    setLensPos({ x, y });
  };

  const handleMouseEnter = () => {
    if (screenRef.current) {
      setContainerDims({
        width: screenRef.current.offsetWidth,
        height: screenRef.current.offsetHeight,
      });
    }
    setIsHoveringLens(true);
  };

  const handleMouseLeave = () => {
    setIsHoveringLens(false);
  };

  // Escape key and scroll lock for high-res screenshot lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsLightboxOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isLightboxOpen]);

  // Scroll-linked 3D perspective animation for the right-side tablet frame
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'center center'],
  });

  const rotateX = useTransform(
    scrollYProgress,
    [0, 1],
    shouldReduceMotion ? [0, 0] : [14, 0]
  );
  const scale = useTransform(
    scrollYProgress,
    [0, 1],
    shouldReduceMotion ? [1, 1] : [0.95, 1]
  );
  const translateY = useTransform(
    scrollYProgress,
    [0, 1],
    shouldReduceMotion ? [0, 0] : [24, 0]
  );

  return (
    <section
      id="workspaces"
      ref={sectionRef}
      data-theme={isDark ? 'dark' : 'light'}
      className="scroll-mt-20 border-b border-black/[0.06] bg-transparent px-5 py-14 dark:border-white/10 sm:px-8 sm:py-18 lg:px-10 lg:py-20"
    >
      <div className="mx-auto max-w-[1440px]">
        {/* Section Heading */}
        <ScrollReveal className="max-w-3xl">
          <h2 className="font-sans text-3xl font-extrabold tracking-tight text-[#0a0a0a] dark:text-white sm:text-4xl lg:text-5xl lg:leading-[1.12]">
            One resident account. Two focused workspaces.
          </h2>
          <p className="mt-3.5 text-base leading-relaxed text-neutral-600 dark:text-zinc-400 sm:text-lg">
            Switch between finding help and offering your services with one account. Your profile, verification, trust history, and messages stay with you.
          </p>
        </ScrollReveal>

        {/* Interactive Workspace Switcher Pills */}
        <div className="mt-7 flex items-center">
          <div className="relative inline-flex rounded-2xl border border-black/[0.08] bg-black/[0.03] p-1.5 dark:border-white/10 dark:bg-neutral-900/60 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveTab('seeker')}
              className={`relative z-10 flex items-center gap-2.5 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                activeTab === 'seeker'
                  ? 'text-[#c86544] dark:text-orange-300'
                  : 'text-neutral-600 hover:text-black dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              <Search className="size-4" />
              <span>Seeker Workspace</span>
              {activeTab === 'seeker' && (
                <span className="hidden sm:inline-block size-2 rounded-full bg-[#c86544] animate-pulse" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('provider')}
              className={`relative z-10 flex items-center gap-2.5 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                activeTab === 'provider'
                  ? 'text-emerald-700 dark:text-emerald-300'
                  : 'text-neutral-600 hover:text-black dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              <BriefcaseBusiness className="size-4" />
              <span>Provider Workspace</span>
              {activeTab === 'provider' && (
                <span className="hidden sm:inline-block size-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>

            {/* Smooth animated active pill slider */}
            <motion.div
              layoutId="workspaceTabHighlight"
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className={`absolute inset-y-1.5 rounded-xl shadow-sm ${
                activeTab === 'seeker'
                  ? 'left-1.5 w-[calc(50%-0.375rem)] bg-white dark:bg-neutral-800'
                  : 'right-1.5 w-[calc(50%-0.375rem)] bg-white dark:bg-neutral-800'
              }`}
            />
          </div>
        </div>

        {/* 2-Column Split: Left Side Texts, Right Side Container Tablet */}
        <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-center">
          {/* Left Column: Workspace Narrative & Feature Tiles (4 cols) */}
          <div className="lg:col-span-4 xl:col-span-4">
            <AnimatePresence initial={false} mode="wait">
              {activeTab === 'seeker' ? (
                <motion.div
                  key="seeker-copy"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                  className="flex flex-col justify-between rounded-3xl border border-orange-200/80 bg-gradient-to-br from-orange-50/50 via-white to-white p-7 shadow-xs dark:border-orange-900/30 dark:from-orange-950/20 dark:via-zinc-900 dark:to-zinc-900 sm:p-8"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="grid size-12 place-items-center rounded-2xl bg-orange-100 text-[#c86544] dark:bg-orange-950/60 dark:text-orange-300">
                        <Search size={22} />
                      </div>
                      <span className="rounded-full bg-orange-100/90 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-orange-900 dark:bg-orange-950/60 dark:text-orange-300 border border-orange-200 dark:border-orange-900/50">
                        Seeker Workspace
                      </span>
                    </div>

                    <h3 className="mt-6 text-2xl sm:text-3xl font-bold tracking-tight text-[#0a0a0a] dark:text-white">
                      Find trusted help or post what you need.
                    </h3>
                    <p className="mt-3 text-sm sm:text-base leading-relaxed text-neutral-600 dark:text-zinc-400">
                      Keep your service requests, incoming offers, and booking activity together in the Seeker workspace.
                    </p>

                    {/* Seeker capability pills */}
                    <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold">
                      <span className="rounded-lg border border-orange-200 bg-white px-3 py-1.5 text-neutral-700 dark:border-orange-900/40 dark:bg-zinc-800 dark:text-zinc-200">
                        Request a Listed Service
                      </span>
                      <span className="rounded-lg border border-orange-200 bg-white px-3 py-1.5 text-neutral-700 dark:border-orange-900/40 dark:bg-zinc-800 dark:text-zinc-200">
                        Post a Service Request
                      </span>
                      <span className="rounded-lg border border-orange-200 bg-white px-3 py-1.5 text-neutral-700 dark:border-orange-900/40 dark:bg-zinc-800 dark:text-zinc-200">
                        Track Online Queue Position
                      </span>
                    </div>
                  </div>

                  {/* Workspace-specific tool */}
                  <div className="mt-8 rounded-2xl border border-orange-200/60 bg-white/80 p-4 dark:border-orange-900/30 dark:bg-zinc-950/40">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#0a0a0a] dark:text-white">
                      <CheckCircle2 size={16} className="text-[#c86544]" />
                      <span>Compare Incoming Offers</span>
                    </div>
                    <p className="mt-1.5 text-xs text-neutral-500 dark:text-zinc-400 leading-relaxed">
                      Review proposed prices and terms together before choosing an offer.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="provider-copy"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                  className="flex flex-col justify-between rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/50 via-white to-white p-7 shadow-xs dark:border-emerald-900/30 dark:from-emerald-950/20 dark:via-zinc-900 dark:to-zinc-900 sm:p-8"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="grid size-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        <BriefcaseBusiness size={22} />
                      </div>
                      <span className="rounded-full bg-emerald-100/90 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50">
                        Provider Workspace
                      </span>
                    </div>

                    <h3 className="mt-6 text-2xl sm:text-3xl font-bold tracking-tight text-[#0a0a0a] dark:text-white">
                      Publish services and manage your work.
                    </h3>
                    <p className="mt-3 text-sm sm:text-base leading-relaxed text-neutral-600 dark:text-zinc-400">
                      Keep your published services, job opportunities, and incoming requests together in the Provider workspace.
                    </p>

                    {/* Provider capability pills */}
                    <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold">
                      <span className="rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-neutral-700 dark:border-emerald-900/40 dark:bg-zinc-800 dark:text-zinc-200">
                        Manage Paid Waiting Capacity
                      </span>
                      <span className="rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-neutral-700 dark:border-emerald-900/40 dark:bg-zinc-800 dark:text-zinc-200">
                        Send Offers to Requests
                      </span>
                      <span className="rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-neutral-700 dark:border-emerald-900/40 dark:bg-zinc-800 dark:text-zinc-200">
                        View Booking Details
                      </span>
                    </div>
                  </div>

                  {/* Workspace-specific tool */}
                  <div className="mt-8 rounded-2xl border border-emerald-200/60 bg-white/80 p-4 dark:border-emerald-900/30 dark:bg-zinc-950/40">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#0a0a0a] dark:text-white">
                      <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                      <span>Update Your Listings</span>
                    </div>
                    <p className="mt-1.5 text-xs text-neutral-500 dark:text-zinc-400 leading-relaxed">
                      Use Service Manager to edit pricing, payment options, and availability.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Aceternity Container Tablet Mockup with Floating Showcase Badges (8 cols) */}
          <div className="lg:col-span-8 xl:col-span-8">
            <div
              className="relative w-full"
              style={{
                perspective: shouldReduceMotion ? 'none' : '1200px',
              }}
            >
              {/* Decorative Abstract Flow Ribbons behind Tablet */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-14 -right-10 sm:-top-20 sm:-right-16 -z-10 w-[300px] sm:w-[460px] lg:w-[560px] h-[300px] sm:h-[460px] lg:h-[560px] overflow-visible opacity-75 dark:opacity-35 transition-opacity duration-700"
              >
                <svg
                  viewBox="0 0 500 500"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full"
                >
                  <circle
                    cx="440"
                    cy="60"
                    r="360"
                    stroke={activeTab === 'seeker' ? '#c86544' : '#059669'}
                    strokeWidth="32"
                    strokeOpacity="0.22"
                    className="transition-all duration-700"
                  />
                  <circle
                    cx="440"
                    cy="60"
                    r="305"
                    stroke={activeTab === 'seeker' ? '#f97316' : '#10b981'}
                    strokeWidth="36"
                    strokeOpacity="0.3"
                    className="transition-all duration-700"
                  />
                  <circle
                    cx="440"
                    cy="60"
                    r="250"
                    stroke={activeTab === 'seeker' ? '#fbbf24' : '#34d399'}
                    strokeWidth="24"
                    strokeOpacity="0.22"
                    className="transition-all duration-700"
                  />
                </svg>
              </div>

              {/* Backlight Ambient Glow */}
              <div
                aria-hidden="true"
                className={`pointer-events-none absolute -inset-4 rounded-[40px] blur-3xl transition-colors duration-500 opacity-60 ${
                  activeTab === 'seeker'
                    ? 'bg-gradient-to-tr from-orange-400/25 via-amber-300/15 to-transparent'
                    : 'bg-gradient-to-tr from-emerald-500/25 via-teal-300/15 to-transparent'
                }`}
              />

              {/* Tablet Frame with Scroll Perspective Tilt */}
              <motion.div
                style={{
                  rotateX,
                  scale,
                  translateY,
                  transformStyle: 'preserve-3d',
                }}
                className="relative rounded-[28px] sm:rounded-[36px] p-2.5 sm:p-4 bg-gradient-to-b from-[#2a2a2a] via-[#1a1a1a] to-[#0e0e0e] border-2 sm:border-[3px] border-neutral-700/60 dark:border-neutral-700/40 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.35),0_30px_90px_-20px_rgba(0,0,0,0.25)] transition-shadow duration-300"
              >
                {/* Tablet Hardware Top: Centered Camera & Ambient Sensor */}
                <div className="flex items-center justify-center gap-2 pb-2">
                  <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-neutral-900 border border-neutral-700/80 ring-1 ring-white/10" />
                  <div className="h-1 w-1 rounded-full bg-neutral-800 opacity-60" />
                </div>

                {/* Inner Device Screen: Click to Open Full-Resolution Lightbox */}
                <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-neutral-950 ring-1 ring-white/10 shadow-inner">
                  {/* Subtle Screen Sheen Reflection */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent"
                  />

                  {/* Screenshot Display with Lossless Quality, Magnifier Loupe & Interactive Click-to-Zoom */}
                  <div
                    ref={screenRef}
                    role="button"
                    tabIndex={0}
                    onClick={() => setIsLightboxOpen(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setIsLightboxOpen(true);
                      }
                    }}
                    onMouseMove={handleMouseMove}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    aria-label="Interactive Magnifier: Move cursor to inspect details, click to expand full resolution"
                    className="relative aspect-[1024/532] w-full cursor-crosshair overflow-hidden bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-orange-500/50 select-none"
                  >
                    {/* Corner Persistent Zoom & Magnifier Hint Badge */}
                    <div className="absolute top-2.5 right-2.5 z-20 pointer-events-none">
                      <div className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-black/70 px-2.5 py-1 text-[11px] font-semibold text-white/90 backdrop-blur-md shadow-sm">
                        <Search size={12} className={activeTab === 'seeker' ? 'text-orange-400' : 'text-emerald-400'} />
                        <span>Hover to Magnify • Click for HD</span>
                      </div>
                    </div>

                    {/* Interactive Cursor Magnifier Loupe */}
                    <AnimatePresence>
                      {isHoveringLens && containerDims.width > 0 && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.6 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.6 }}
                          transition={{ duration: 0.12, ease: 'easeOut' }}
                          style={{
                            left: `${lensPos.x - LENS_RADIUS}px`,
                            top: `${lensPos.y - LENS_RADIUS}px`,
                            width: `${LENS_DIAMETER}px`,
                            height: `${LENS_DIAMETER}px`,
                          }}
                          className="pointer-events-none absolute z-30 overflow-hidden rounded-full border-[3px] border-white/95 dark:border-white shadow-[0_20px_50px_rgba(0,0,0,0.7),0_0_25px_rgba(200,101,68,0.35)] ring-1 ring-black/50"
                        >
                          {/* 2.4x Optical Magnification Canvas */}
                          <div
                            className="pointer-events-none absolute select-none"
                            style={{
                              left: `${LENS_RADIUS - lensPos.x * ZOOM}px`,
                              top: `${LENS_RADIUS - lensPos.y * ZOOM}px`,
                              width: `${containerDims.width * ZOOM}px`,
                              height: `${containerDims.height * ZOOM}px`,
                            }}
                          >
                            <Image
                              src={
                                activeTab === 'seeker'
                                  ? '/screenshots/seeker-dashboard.png'
                                  : '/screenshots/provider-dashboard.png'
                              }
                              alt="Magnified Detail View"
                              width={activeTab === 'seeker' ? 1432 : 1440}
                              height={activeTab === 'seeker' ? 755 : 747}
                              unoptimized
                              priority
                              className="h-full w-full object-cover object-top select-none pointer-events-none"
                              style={{
                                imageRendering: '-webkit-optimize-contrast',
                              }}
                            />
                          </div>

                          {/* Optical Lens Glass Reflection */}
                          <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-tr from-white/10 via-transparent to-white/30 ring-1 ring-inset ring-white/50"
                          />

                          {/* Center Aim Reticle */}
                          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                            <div
                              className={`size-2 rounded-full border-2 border-white shadow-sm ${
                                activeTab === 'seeker' ? 'bg-[#c86544]' : 'bg-emerald-500'
                              }`}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence initial={false} mode="wait">
                      {activeTab === 'seeker' ? (
                        <motion.div
                          key="seeker-screen"
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                          className="relative h-full w-full"
                        >
                          <Image
                            src="/screenshots/seeker-dashboard.png"
                            alt="ServiceHub Seeker Workspace Dashboard"
                            width={1432}
                            height={755}
                            unoptimized
                            priority
                            className="h-full w-full object-cover object-top select-none pointer-events-none"
                            style={{
                              imageRendering: '-webkit-optimize-contrast',
                            }}
                          />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="provider-screen"
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                          className="relative h-full w-full"
                        >
                          <Image
                            src="/screenshots/provider-dashboard.png"
                            alt="ServiceHub Provider Workspace Dashboard"
                            width={1440}
                            height={747}
                            unoptimized
                            priority
                            className="h-full w-full object-cover object-top select-none pointer-events-none"
                            style={{
                              imageRendering: '-webkit-optimize-contrast',
                            }}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Full-width preview context */}
        <ScrollReveal direction="scale" delay={0.12} className="mt-12 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-6 dark:border-zinc-800 dark:bg-zinc-900/50 sm:flex-row sm:items-center">
          <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-neutral-700 shadow-xs dark:bg-zinc-800 dark:text-zinc-200">
            <ArrowLeftRight size={19} />
          </div>
          <div className="flex-1">
            <p className="font-bold text-[#0a0a0a] dark:text-white">
              Explore the workspace previews.
            </p>
            <p className="mt-1 text-sm text-neutral-600 dark:text-zinc-400">
              These screenshots show example workspace views. Your own listings, offers, and bookings appear after you sign in.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
            <ShieldCheck size={18} />
            <span>Workspace Preview</span>
          </div>
        </ScrollReveal>
      </div>

      {/* Full-Resolution Screenshot Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsLightboxOpen(false)}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-3 sm:p-6 lg:p-8 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            aria-label="Screenshot Fullscreen Preview"
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 16 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              className="relative flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/20 bg-neutral-950 shadow-2xl"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-white/10 bg-neutral-900/90 px-4 sm:px-6 py-3.5 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex size-8 items-center justify-center rounded-lg border ${
                      activeTab === 'seeker'
                        ? 'border-orange-500/40 bg-orange-500/20 text-orange-400'
                        : 'border-emerald-500/40 bg-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    {activeTab === 'seeker' ? <Search size={16} /> : <BriefcaseBusiness size={16} />}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">
                      {activeTab === 'seeker'
                        ? 'Seeker Workspace Dashboard — Full Resolution'
                        : 'Provider Workspace Dashboard — Full Resolution'}
                    </h4>
                    <p className="text-[11px] text-neutral-400 hidden sm:block">
                      Actual uncompressed live system interface
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={
                      activeTab === 'seeker'
                        ? '/screenshots/seeker-dashboard.png'
                        : '/screenshots/provider-dashboard.png'
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition-colors"
                  >
                    <ExternalLink size={13} />
                    <span>Open Raw Image</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setIsLightboxOpen(false)}
                    className="flex items-center gap-1 rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-500/80 transition-colors cursor-pointer"
                  >
                    <X size={15} />
                    <span className="hidden sm:inline">Close</span>
                    <kbd className="hidden sm:inline-block ml-1 rounded bg-black/40 px-1.5 py-0.5 text-[10px] text-neutral-300">
                      ESC
                    </kbd>
                  </button>
                </div>
              </div>

              {/* Modal Body / Image View */}
              <div className="relative flex flex-1 items-center justify-center overflow-auto bg-neutral-950 p-2 sm:p-4">
                <Image
                  src={
                    activeTab === 'seeker'
                      ? '/screenshots/seeker-dashboard.png'
                      : '/screenshots/provider-dashboard.png'
                  }
                  alt={
                    activeTab === 'seeker'
                      ? 'Seeker Workspace Dashboard Full Resolution'
                      : 'Provider Workspace Dashboard Full Resolution'
                  }
                  width={activeTab === 'seeker' ? 1432 : 1440}
                  height={activeTab === 'seeker' ? 755 : 747}
                  unoptimized
                  priority
                  className="h-auto w-full max-w-full rounded-lg object-contain shadow-md"
                />
              </div>

              {/* Modal Footer Caption */}
              <div className="flex items-center justify-between border-t border-white/10 bg-neutral-900/80 px-4 sm:px-6 py-2.5 text-xs text-neutral-400">
                <span>
                  {activeTab === 'seeker'
                    ? 'Showing resident services directory, budget filters, and live queue status.'
                    : 'Showing provider service manager, job queue controls, and offer submissions.'}
                </span>
                <span className="hidden sm:inline text-neutral-500">
                  Click outside or press ESC to dismiss
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
