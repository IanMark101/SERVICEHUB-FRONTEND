'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Menu, Moon, Sun, X } from 'lucide-react';

interface LandingHeaderProps {
  isDark: boolean;
  toggleTheme: () => void;
  onGetStarted: () => void;
}

const NAV_LINKS = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Workspaces', href: '#workspaces' },
  { label: 'Queue', href: '#queue' },
  { label: 'Trust', href: '#trust' },
  { label: 'Community', href: '#community' },
  { label: 'FAQ', href: '#faq' },
];

export default function LandingHeader({ isDark, toggleTheme, onGetStarted }: LandingHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Floating Header Container */}
      <header className="fixed inset-x-0 top-4 z-50 px-4 sm:px-6 lg:px-8 pointer-events-none">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          {/* Left Floating Brand Card */}
          <a
            href="#top"
            className="pointer-events-auto group flex items-center gap-2.5 rounded-2xl border border-neutral-200/80 bg-white/80 px-3 py-2 shadow-[0_6px_18px_-6px_rgba(15,15,15,0.18),0_1px_2px_rgba(0,0,0,0.04)] backdrop-blur-md transition-all hover:border-neutral-300 hover:bg-white hover:shadow-[0_12px_24px_-8px_rgba(15,15,15,0.22)] active:scale-[0.98] dark:border-white/10 dark:bg-zinc-900/85"
            aria-label="ServiceHub Cordova home"
          >
            <Image
              src="/logo.svg?v=3"
              alt=""
              width={30}
              height={30}
              className="size-7 shrink-0 rounded-lg transition-transform group-hover:rotate-3"
              priority
            />
            <div className="leading-none pr-1">
              <span className="block text-xs font-extrabold tracking-tight text-slate-900 dark:text-white">
                ServiceHub
              </span>
              <span className="mt-0.5 block text-[8.5px] font-bold uppercase tracking-[0.2em] text-[#c86544]">
                Cordova
              </span>
            </div>
          </a>

          {/* Right Floating Liquid Glass Pill Navbar */}
          <div className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-neutral-200/80 bg-white/80 p-1.5 shadow-[0_6px_18px_-6px_rgba(15,15,15,0.18),0_1px_2px_rgba(0,0,0,0.04)] backdrop-blur-md transition-all hover:border-neutral-300 dark:border-white/10 dark:bg-zinc-900/80">
            {/* Desktop Navigation Links */}
            <nav className="hidden items-center gap-0.5 lg:flex px-1" aria-label="Landing page">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-full px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-black/[0.04] hover:text-slate-950 dark:text-zinc-400 dark:hover:bg-white/[0.06] dark:hover:text-white"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Theme Switcher Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="grid size-8 place-items-center rounded-full text-slate-600 transition-all hover:bg-black/[0.04] hover:text-slate-950 active:scale-95 dark:text-zinc-400 dark:hover:bg-white/[0.06] dark:hover:text-white"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Login Link */}
            <Link
              href="/login"
              className="hidden sm:inline-flex rounded-full px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:bg-black/[0.04] dark:text-zinc-300 dark:hover:bg-white/[0.06]"
            >
              Log in
            </Link>

            {/* Unique High-Contrast Action Pill Button with Specular Light Shade on Black */}
            <button
              type="button"
              onClick={onGetStarted}
              className="group/btn relative inline-flex items-center gap-1.5 overflow-hidden rounded-full bg-[#0a0a0a] px-4 py-1.5 text-xs font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_6px_14px_-3px_rgba(0,0,0,0.4)] ring-1 ring-black/20 transition-all hover:bg-[#161616] hover:scale-[1.02] active:scale-[0.97] dark:bg-white dark:text-[#0a0a0a] dark:hover:bg-neutral-100"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-full dark:hidden"
                style={{
                  background: 'radial-gradient(120% 80% at 50% 0%, rgba(255,255,255,0.16), transparent 60%)',
                }}
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 ease-out group-hover/btn:translate-x-full"
              />
              <span className="relative z-10">Get started</span>
              <ArrowRight size={13} className="relative z-10 transition-transform duration-300 group-hover/btn:translate-x-0.5" />
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="grid size-8 place-items-center rounded-full text-slate-700 lg:hidden hover:bg-black/[0.04] dark:text-zinc-200 dark:hover:bg-white/[0.06]"
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
            className="pointer-events-auto mx-auto mt-3 max-w-6xl rounded-2xl border border-black/[0.08] bg-white/95 p-4 shadow-xl backdrop-blur-xl lg:hidden dark:border-white/10 dark:bg-zinc-950/95"
          >
            <nav className="grid gap-1" aria-label="Mobile landing page">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-2 border-t border-slate-100 pt-2 dark:border-zinc-800">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                >
                  Log in
                </Link>
                <Link
                  href="/help"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                >
                  Help Center
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Spacer to prevent content from hiding behind the floating header */}
      <div className="h-20 shrink-0" aria-hidden="true" />
    </>
  );
}
