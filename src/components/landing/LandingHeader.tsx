'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getWorkspaceEntryPath } from '@/lib/workspaceEntry';
import LandingActionLink from './LandingActionLink';
import styles from './LandingHeader.module.css';

interface LandingHeaderProps {
  isDark: boolean;
  toggleTheme: () => void;
}

const NAV_LINKS = [
  { label: 'Why ServiceHub', href: '#problem' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Booking progress', href: '#booking-progress' },
  { label: 'Workspaces', href: '#workspaces' },
  { label: 'Compare', href: '#comparison' },
  { label: 'FAQ', href: '#faq' },
];

export default function LandingHeader({ isDark, toggleTheme }: LandingHeaderProps) {
  const { authLoading, isAuthenticated, user } = useApp();
  // The server and first client render use the normal public actions. Only a
  // confirmed session changes them to workspace navigation.
  const hasSession = !authLoading && isAuthenticated && Boolean(user);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrollHidden, setScrollHidden] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const scrollAnchor = useRef(0);
  const { scrollY } = useScroll();
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1280px)');
    const closeMobileMenu = (event: MediaQueryListEvent) => {
      if (event.matches) setMobileOpen(false);
    };
    desktop.addEventListener('change', closeMobileMenu);
    return () => desktop.removeEventListener('change', closeMobileMenu);
  }, []);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    // Ignore rubber-band scrolling and accumulate small movements to prevent flicker.
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const position = Math.min(maxScroll, Math.max(0, latest));
    const distance = position - scrollAnchor.current;
    if (position <= 96) {
      scrollAnchor.current = position;
      setScrollHidden(false);
      return;
    }
    if (Math.abs(distance) < 10) return;
    scrollAnchor.current = position;
    setScrollHidden(distance > 0);
  });

  const headerHidden = scrollHidden && !mobileOpen && !focusWithin;

  return (
    <>
      {/* Floating Header Container */}
      <motion.header
        className={`${styles.header} fixed inset-x-0 top-4 z-[100] px-4 sm:px-6 lg:px-8 pointer-events-none`}
        data-scroll-hidden={headerHidden ? 'true' : 'false'}
        initial={false}
        animate={{ y: headerHidden ? 'calc(-100% - 2rem)' : 0, opacity: headerHidden ? 0 : 1 }}
        transition={{
          y: { duration: shouldReduceMotion ? 0 : 0.38, ease: [0.4, 0, 0.2, 1] },
          opacity: { duration: shouldReduceMotion ? 0 : 0.28, ease: 'easeInOut' },
        }}
        onFocusCapture={(event) => {
          setScrollHidden(false);
          setFocusWithin(event.target.matches(':focus-visible'));
        }}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setFocusWithin(false);
        }}
      >
        <div data-landing-header-bar className={`${styles.bar} mx-auto flex max-w-6xl items-center justify-between gap-3`}>
          {/* Left Floating Brand Card */}
          <a
            href="#top"
            className={`${styles.brand} pointer-events-auto group flex shrink-0 items-center gap-2.5 rounded-2xl border border-neutral-200/80 bg-white/80 px-3 py-2 shadow-[0_6px_18px_-6px_rgba(15,15,15,0.18),0_1px_2px_rgba(0,0,0,0.04)] backdrop-blur-md transition-all hover:border-neutral-300 hover:bg-white hover:shadow-[0_12px_24px_-8px_rgba(15,15,15,0.22)] active:scale-[0.98] dark:border-white/10 dark:bg-charcoal/85`}
            aria-label="ServiceHub home"
          >
            <Image
              src="/logo.svg?v=7"
              alt=""
              width={30}
              height={30}
              className="size-7 shrink-0 rounded-lg transition-transform group-hover:rotate-3"
              priority
            />
            <div className={`${styles.wordmark} hidden pr-1 leading-none min-[380px]:block`}>
              <span className="block text-xs font-extrabold tracking-tight text-slate-900 dark:text-white">
                ServiceHub
              </span>
            </div>
          </a>

          {/* Right Floating Liquid Glass Pill Navbar */}
          <div className={`${styles.controls} pointer-events-auto flex shrink-0 items-center gap-1.5 rounded-full border border-neutral-200/80 bg-white/80 p-1.5 shadow-[0_6px_18px_-6px_rgba(15,15,15,0.18),0_1px_2px_rgba(0,0,0,0.04)] backdrop-blur-md transition-all hover:border-neutral-300 dark:border-white/10 dark:bg-charcoal/80`}>
            {/* Desktop Navigation Links */}
            <nav className="hidden items-center gap-0.5 px-1 xl:flex" aria-label="Main navigation">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="inline-flex min-h-9 items-center whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-charcoal/[0.04] hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-focus dark:text-zinc-400 dark:hover:bg-charcoal dark:hover:text-white"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Theme Switcher Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="grid size-8 place-items-center rounded-full text-slate-600 transition-all hover:bg-charcoal/[0.04] hover:text-slate-950 active:scale-95 dark:text-zinc-400 dark:hover:bg-charcoal dark:hover:text-white"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>

                {/* Login Link */}
                {!hasSession && (
                  <Link
                    href="/login"
                    className={`${styles.login} hidden sm:inline-flex rounded-full px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:bg-charcoal/[0.04] dark:text-zinc-300 dark:hover:bg-charcoal`}
                  >
                    Log in
                  </Link>
                )}

                {/* Unique High-Contrast Action Pill Button with Specular Light Shade on Black */}
                <div className={styles.headerAction}><LandingActionLink>{hasSession ? 'Open workspace' : 'Get started'}</LandingActionLink></div>

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="grid size-8 place-items-center rounded-full text-slate-700 hover:bg-charcoal/[0.04] dark:text-zinc-200 dark:hover:bg-charcoal xl:hidden"
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation"
              aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
            >
              {mobileOpen ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div
            id="mobile-navigation"
            className={`${styles.drawer} pointer-events-auto mx-auto mt-3 max-w-6xl rounded-2xl border border-black/[0.08] bg-white/95 p-4 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-charcoal/95 xl:hidden`}
          >
            <nav className="grid gap-1" aria-label="Mobile navigation">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-charcoal"
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-2 border-t border-slate-100 pt-2 dark:border-zinc-800">
                <Link
                  href={hasSession && user ? getWorkspaceEntryPath(user) : '/login'}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-charcoal"
                >
                  {hasSession ? 'Open workspace' : 'Log in'}
                </Link>
                <Link
                  href="/help"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-charcoal"
                >
                  Help Center
                </Link>
              </div>
            </nav>
          </div>
        )}
      </motion.header>

    </>
  );
}
