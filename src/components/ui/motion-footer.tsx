"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Briefcase, MapPin, UserCheck, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import LandingTicker, { type TickerVariant } from "@/components/landing/LandingTicker";
import ParticlesComponent from '@/components/ui/particles-bg';

// Register ScrollTrigger safely for React
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// -------------------------------------------------------------------------
// 1. THEME-ADAPTIVE INLINE STYLES
// -------------------------------------------------------------------------
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');

/* ---- DARK MODE (default) ---- */
.cinematic-footer-wrapper {
  font-family: 'Plus Jakarta Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
  
  --bg-token: #0d0d0c;
  --fg-token: #f7f4ed;
  --accent-orange: #c86544;
  --accent-orange-light: #ea7a56;
  --sub-text: rgba(161,161,170,1);
  
  --pill-bg-1: color-mix(in oklch, var(--fg-token) 4%, transparent);
  --pill-bg-2: color-mix(in oklch, var(--fg-token) 1.5%, transparent);
  --pill-shadow: color-mix(in oklch, var(--bg-token) 60%, transparent);
  --pill-highlight: color-mix(in oklch, var(--fg-token) 12%, transparent);
  --pill-inset-shadow: color-mix(in oklch, var(--bg-token) 85%, transparent);
  --pill-border: color-mix(in oklch, var(--fg-token) 10%, transparent);
  
  --pill-bg-1-hover: color-mix(in oklch, var(--fg-token) 10%, transparent);
  --pill-bg-2-hover: color-mix(in oklch, var(--fg-token) 3%, transparent);
  --pill-border-hover: color-mix(in oklch, var(--fg-token) 24%, transparent);
  --pill-shadow-hover: color-mix(in oklch, var(--bg-token) 75%, transparent);
  --pill-highlight-hover: color-mix(in oklch, var(--fg-token) 25%, transparent);
  --bottom-bar-border: rgba(255,255,255,0.05);
  --bottom-bar-bg: rgba(0,0,0,0.20);
  --copyright-color: #71717a;
  --badge-text: #a1a1aa;
  --badge-brand: #ffffff;
  --location-tag-bg: rgba(255,255,255,0.05);
  --location-tag-border: rgba(255,255,255,0.10);
  --location-tag-text: rgba(255,255,255,0.80);
  --pill-text: #ffffff;
  --pill-text-secondary: rgba(161,161,170,1);
}

/* ---- LIGHT MODE ---- */
.cinematic-footer-wrapper.light-mode {
  --bg-token: var(--landing-surface, #faf9f6);
  --fg-token: #0a0a0a;
  --accent-orange: #c86544;
  --accent-orange-light: #ea7a56;
  --sub-text: #78716c;

  --pill-bg-1: rgba(255,255,255,0.72);
  --pill-bg-2: rgba(255,255,255,0.40);
  --pill-shadow: rgba(0,0,0,0.06);
  --pill-highlight: rgba(255,255,255,0.90);
  --pill-inset-shadow: rgba(0,0,0,0.04);
  --pill-border: rgba(0,0,0,0.10);

  --pill-bg-1-hover: rgba(255,255,255,0.92);
  --pill-bg-2-hover: rgba(255,255,255,0.60);
  --pill-border-hover: rgba(200,101,68,0.30);
  --pill-shadow-hover: rgba(0,0,0,0.10);
  --pill-highlight-hover: rgba(255,255,255,1);
  --bottom-bar-border: rgba(0,0,0,0.06);
  --bottom-bar-bg: rgba(250,249,246,0.80);
  --copyright-color: #a8a29e;
  --badge-text: #78716c;
  --badge-brand: #0a0a0a;
  --location-tag-bg: rgba(0,0,0,0.04);
  --location-tag-border: rgba(0,0,0,0.08);
  --location-tag-text: rgba(28,25,23,0.80);
  --pill-text: #0a0a0a;
  --pill-text-secondary: #78716c;
}

@keyframes footer-breathe {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 0.55; }
  100% { transform: translate(-50%, -50%) scale(1.12); opacity: 0.95; }
}

@keyframes footer-heartbeat {
  0%, 100% { transform: scale(1); filter: drop-shadow(0 0 5px rgba(200, 101, 68, 0.5)); }
  15%, 45% { transform: scale(1.22); filter: drop-shadow(0 0 10px rgba(200, 101, 68, 0.85)); }
  30% { transform: scale(1); }
}

.animate-footer-breathe {
  animation: footer-breathe 8s ease-in-out infinite alternate;
}

.animate-footer-heartbeat {
  animation: footer-heartbeat 2s cubic-bezier(0.25, 1, 0.5, 1) infinite;
}

/* Theme-adaptive Aurora Glow */
.cinematic-footer-wrapper .footer-aurora {
  background: radial-gradient(
    circle at 50% 50%, 
    rgba(200, 101, 68, 0.22) 0%, 
    rgba(51, 65, 85, 0.18) 42%, 
    transparent 72%
  );
}
.cinematic-footer-wrapper.light-mode .footer-aurora {
  background: radial-gradient(
    circle at 50% 50%, 
    rgba(200, 101, 68, 0.10) 0%, 
    rgba(217, 119, 87, 0.07) 42%, 
    transparent 72%
  );
}

/* Glass Pill Theming */
.footer-glass-pill {
  background: linear-gradient(145deg, var(--pill-bg-1) 0%, var(--pill-bg-2) 100%);
  box-shadow: 
      0 10px 30px -10px var(--pill-shadow), 
      inset 0 1px 1px var(--pill-highlight), 
      inset 0 -1px 2px var(--pill-inset-shadow);
  border: 1px solid var(--pill-border);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.footer-glass-pill:hover {
  background: linear-gradient(145deg, var(--pill-bg-1-hover) 0%, var(--pill-bg-2-hover) 100%);
  border-color: var(--pill-border-hover);
  box-shadow: 
      0 20px 40px -10px var(--pill-shadow-hover), 
      inset 0 1px 1px var(--pill-highlight-hover);
  color: var(--fg-token);
}

/* Giant Background Text Masking */
.footer-giant-bg-text {
  font-size: min(26vw, 24rem);
  line-height: 0.75;
  font-weight: 900;
  letter-spacing: -0.05em;
  color: transparent;
  -webkit-text-stroke: 1px color-mix(in oklch, var(--fg-token) 6%, transparent);
  background: linear-gradient(180deg, color-mix(in oklch, var(--fg-token) 10%, transparent) 0%, transparent 65%);
  -webkit-background-clip: text;
  background-clip: text;
}

/* Keep the hero's charcoal tone with a soft fade on each heading line. */
.footer-heading {
  --footer-heading-ink: #ffffff;
  color: var(--footer-heading-ink);
}
.cinematic-footer-wrapper.light-mode .footer-heading {
  --footer-heading-ink: #0a0a0a;
}
.footer-heading-line {
  display: block;
}
@supports (background-clip: text) or (-webkit-background-clip: text) {
  .footer-heading-line {
    background: linear-gradient(180deg, var(--footer-heading-ink) 0%, var(--footer-heading-ink) 25%, color-mix(in srgb, var(--footer-heading-ink) 55%, transparent) 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
}
`;

// -------------------------------------------------------------------------
// 2. MAGNETIC BUTTON PRIMITIVE
// -------------------------------------------------------------------------
export type MagneticButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & 
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    as?: React.ElementType;
  };

export const MagneticButton = React.forwardRef<HTMLElement, MagneticButtonProps>(
  ({ className, children, as: Component = "button", ...props }, forwardedRef) => {
    const localRef = useRef<HTMLElement>(null);

    useEffect(() => {
      if (typeof window === "undefined") return;
      const element = localRef.current;
      if (!element) return;

      const ctx = gsap.context(() => {
        const handleMouseMove = (e: MouseEvent) => {
          const rect = element.getBoundingClientRect();
          const h = rect.width / 2;
          const w = rect.height / 2;
          const x = e.clientX - rect.left - h;
          const y = e.clientY - rect.top - w;

          gsap.to(element, {
            x: x * 0.35,
            y: y * 0.35,
            rotationX: -y * 0.12,
            rotationY: x * 0.12,
            scale: 1.04,
            ease: "power2.out",
            duration: 0.35,
          });
        };

        const handleMouseLeave = () => {
          gsap.to(element, {
            x: 0,
            y: 0,
            rotationX: 0,
            rotationY: 0,
            scale: 1,
            ease: "elastic.out(1, 0.35)",
            duration: 1.1,
          });
        };

        element.addEventListener("mousemove", handleMouseMove);
        element.addEventListener("mouseleave", handleMouseLeave);

        return () => {
          element.removeEventListener("mousemove", handleMouseMove);
          element.removeEventListener("mouseleave", handleMouseLeave);
        };
      }, element);

      return () => ctx.revert();
    }, []);

    return (
      <Component
        ref={(node: HTMLElement | null) => {
          (localRef as React.MutableRefObject<HTMLElement | null>).current = node;
          if (typeof forwardedRef === "function") forwardedRef(node as HTMLElement);
          else if (forwardedRef) (forwardedRef as React.MutableRefObject<HTMLElement | null>).current = node;
        }}
        className={cn("cursor-pointer select-none", className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
MagneticButton.displayName = "MagneticButton";

// -------------------------------------------------------------------------
// 3. SERVICEHUB FOOTER
// -------------------------------------------------------------------------
const SERVICE_CATEGORY_SHORTCUTS = [
  { label: "House Cleaning", category: "House Cleaning" },
  { label: "Electrical Repair", category: "Electrical Repair" },
  { label: "Aircon Service", category: "Aircon Service" },
  { label: "Carpentry", category: "Carpentry & Woodwork" },
  { label: "Plumbing", category: "Plumbing" },
];

export interface CinematicFooterProps {
  isDark?: boolean;
  brandText?: string;
  headline?: string;
  subheadline?: string;
  marqueeItems?: string[];
  marqueeVariant?: TickerVariant;
  copyright?: string;
}

export function CinematicFooter({
  isDark = true,
  brandText = "CORDOVA",
  headline = "Ready to get work done in Cordova?",
  subheadline = "Connect with verified local specialists, join clear queues, and support local livelihood.",
  marqueeItems,
  marqueeVariant = 'trust',
  copyright = "© 2026 ServiceHub Cordova. Built for Cordova, Cebu.",
}: CinematicFooterProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const giantTextRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!wrapperRef.current) return;

    // React strict mode compatible GSAP context cleanup
    const ctx = gsap.context(() => {
      // Background Parallax
      gsap.fromTo(
        giantTextRef.current,
        { y: "12vh", scale: 0.85, opacity: 0 },
        {
          y: "0vh",
          scale: 1,
          opacity: 1,
          ease: "power1.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 85%",
            end: "bottom bottom",
            scrub: 1,
          },
        }
      );

      // Staggered Content Reveal
      gsap.fromTo(
        [headingRef.current, linksRef.current],
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 45%",
            end: "bottom bottom",
            scrub: 1,
          },
        }
      );
    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* Keep the footer in page flow so taller content stays reachable. */}
      <div
        ref={wrapperRef}
        className="relative w-full"
      >
        {/* Cinematic footer */}
        <footer
          className={cn(
            "relative flex min-h-[100svh] w-full flex-col justify-between overflow-hidden cinematic-footer-wrapper",
            isDark ? "bg-[#0d0d0c] text-[#f7f4ed]" : "light-mode bg-[var(--landing-surface,#faf9f6)] text-[#1c1917]"
          )}
        >
          {/* Shared interactive particle background, behind the footer controls. */}
          <div className="footer-aurora absolute left-1/2 top-1/2 h-[65vh] w-[85vw] -translate-x-1/2 -translate-y-1/2 animate-footer-breathe rounded-[50%] blur-[90px] pointer-events-none z-0" />
          <ParticlesComponent isDark={isDark} variant="brand" className="z-0" />

          {/* Giant Background Wordmark Masking */}
          <div
            ref={giantTextRef}
            className="footer-giant-bg-text absolute -bottom-[4vh] left-1/2 -translate-x-1/2 whitespace-nowrap z-0 pointer-events-none select-none"
          >
            {brandText}
          </div>

          {/* 1. Shared landing-page strip */}
          <div className="relative z-10 w-full shrink-0 pt-10 lg:pt-6">
            <LandingTicker isDark={isDark} variant={marqueeVariant} items={marqueeItems} tilted />
          </div>

          {/* 2. Main Center Content */}
          <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pt-24 sm:pt-36 pb-12 lg:pt-[clamp(3.5rem,calc(100svh-39.5rem-3.5vw),6rem)] lg:pb-6 w-full max-w-6xl mx-auto">


            <h2
              ref={headingRef}
              className="text-[clamp(2rem,6.2vw,6rem)] lg:text-[clamp(2rem,min(6.2vw,10.5svh),6rem)] leading-[1.03] font-black footer-heading tracking-tighter mb-4 text-center w-full"
            >
              {headline === "Ready to get work done in Cordova?" ? (
                <>
                  <span className="footer-heading-line">Ready to get work done</span>
                  <span className="footer-heading-line">In Cordova?</span>
                </>
              ) : <span className="footer-heading-line">{headline}</span>}
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-center max-w-xl lg:max-w-3xl mb-12 lg:mb-6" style={{ color: 'var(--sub-text)' }}>
              {subheadline}
            </p>

            {/* Interactive Magnetic Action Pills */}
            <div ref={linksRef} className="flex flex-col items-center gap-5 w-full">
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4 w-full">
                <MagneticButton
                  as="a"
                  href="/seeker/seek-services"
                  className="footer-glass-pill px-7 sm:px-9 py-3.5 sm:py-4 rounded-full font-bold text-xs sm:text-sm flex items-center gap-2.5 group"
                  style={{ color: 'var(--pill-text)' }}
                >
                  <Briefcase className="w-4 h-4 text-[#c86544] group-hover:scale-110 transition-transform" />
                  <span>Find a Service</span>
                </MagneticButton>

                <MagneticButton
                  as="a"
                  href="/seeker/post-request"
                  className="footer-glass-pill px-7 sm:px-9 py-3.5 sm:py-4 rounded-full font-bold text-xs sm:text-sm flex items-center gap-2.5 group"
                  style={{ color: 'var(--pill-text)' }}
                >
                  <Wrench className="w-4 h-4 group-hover:opacity-100 transition-colors opacity-70" style={{ color: 'var(--pill-text)' }} />
                  <span>Post a Custom Request</span>
                </MagneticButton>

                <MagneticButton
                  as="a"
                  href="/register?role=provider"
                  className="footer-glass-pill px-7 sm:px-9 py-3.5 sm:py-4 rounded-full font-bold text-xs sm:text-sm flex items-center gap-2.5 group border-[#c86544]/40"
                  style={{ color: 'var(--pill-text)' }}
                >
                  <UserCheck className="w-4 h-4 text-[#c86544]" />
                  <span>Offer Skilled Work</span>
                </MagneticButton>
              </div>

              <nav aria-label="Browse services by category" className="flex flex-wrap justify-center gap-2 sm:gap-3 w-full">
                {SERVICE_CATEGORY_SHORTCUTS.map(({ label, category }) => (
                  <MagneticButton
                    key={category}
                    as="a"
                    href={`/seeker/seek-services?category=${encodeURIComponent(category)}`}
                    aria-label={`Browse ${label} services`}
                    className="footer-glass-pill min-h-10 px-4 sm:px-5 py-2 rounded-full font-medium text-xs"
                    style={{ color: 'var(--pill-text-secondary)' }}
                  >
                    {label}
                  </MagneticButton>
                ))}
              </nav>
            </div>
          </div>

          {/* 3. Full Footer Content Bar */}
          <div
            className="relative z-20 w-full shrink-0"
            style={{
              borderColor: 'var(--bottom-bar-border)',
              borderTopWidth: '1px',
              borderTopStyle: 'solid',
            }}
          >
            {/* Main footer grid: brand + nav */}
            <div className="mx-auto w-full px-5 py-5 sm:px-8 lg:px-12">
              <div className="grid items-start gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-x-12">

                {/* Brand column */}
                <div className="max-w-md lg:max-w-xl">
                  <div className="flex items-center gap-3">
                    <Image
                      src="/logo.svg?v=3"
                      alt="ServiceHub Cordova"
                      width={40}
                      height={40}
                      className="size-10 rounded-xl"
                    />
                    <div>
                      <p
                        className="text-sm font-extrabold"
                        style={{ color: 'var(--badge-brand)' }}
                      >
                        ServiceHub Cordova
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#c86544]">
                        <MapPin size={12} /> Cordova, Cebu
                      </p>
                    </div>
                  </div>
                  <p
                    className="mt-3 text-sm leading-relaxed"
                    style={{ color: 'var(--badge-text)' }}
                  >
                    Local needs meet local skills across Cordova, Cebu.
                  </p>
                </div>

                {/* Nav + bottom row column */}
                <div className="flex min-w-0 w-full flex-col gap-6 lg:gap-3">
                  <nav
                    className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-[repeat(3,max-content)] sm:justify-between lg:gap-y-2"
                    aria-label="Footer navigation"
                  >
                    {[
                      { label: 'How it works', href: '#how-it-works' },
                      { label: 'Workspaces', href: '#workspaces' },
                      { label: 'Queue rules', href: '#queue' },
                      { label: 'Trust ledger', href: '#trust' },
                      { label: 'Community Hub', href: '#community' },
                      { label: 'Help Center', href: '/help' },
                      { label: 'Terms', href: '/terms' },
                      { label: 'Privacy', href: '/privacy' },
                    ].map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        className="text-xs font-semibold transition-colors hover:text-[#c86544]"
                        style={{ color: 'var(--pill-text-secondary)' }}
                      >
                        {link.label}
                      </a>
                    ))}
                  </nav>

                  {/* Copyright row */}
                  <div
                    className="grid gap-3 border-t pt-5 text-[11px] leading-relaxed sm:grid-cols-[1.2fr_1fr] lg:pt-2"
                    style={{
                      borderColor: 'var(--bottom-bar-border)',
                      color: 'var(--copyright-color)',
                    }}
                  >
                    <p>{copyright}</p>
                    <p className="hidden sm:block">Local community accountability platform.</p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

export default CinematicFooter;
