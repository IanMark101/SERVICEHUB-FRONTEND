"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, MagnifyingGlass, Moon, Sun } from '@phosphor-icons/react';
import { useApp } from '@/context/AppContext';

export default function HelpNavbar() {
  const { toggleTheme, isAuthenticated, user, isDark } = useApp();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const backHref = isAuthenticated
    ? user?.role === 'admin'
      ? '/admin'
      : user?.role === 'provider'
      ? '/provider'
      : '/seeker'
    : '/';

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-4 z-40 px-4 text-[#171716] dark:text-[#f5f4f2] sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <Link
            href="/help"
            className="pointer-events-auto flex items-center gap-2.5 rounded-2xl border border-black/10 bg-[#fffdfa] px-3 py-2 shadow-[0_8px_22px_rgba(23,23,22,0.10)] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c86544] dark:border-white/12 dark:bg-[#201f1c]"
          >
            <Image width={30} height={30} src="/logo.svg" alt="" className="size-[30px] rounded-lg object-contain" priority />
            <span className="leading-none">
              <span className="block text-xs font-semibold tracking-tight">ServiceHub</span>
              <span className="mt-1 block text-[8px] font-bold uppercase tracking-[0.18em] text-[#c86544] dark:text-[#e18463]">Help Center</span>
            </span>
          </Link>

          <nav aria-label="Help center actions" className="pointer-events-auto flex items-center gap-1 rounded-2xl border border-black/10 bg-[#fffdfa] p-1.5 shadow-[0_8px_22px_rgba(23,23,22,0.10)] dark:border-white/12 dark:bg-[#201f1c]">
          <Link
            href="/help/search"
            className="flex min-h-9 items-center gap-2 rounded-xl px-3 text-xs font-medium text-[#514d48] transition-colors hover:bg-[#f5f4f2] hover:text-[#171716] focus-visible:outline-2 focus-visible:outline-[#c86544] dark:text-white/66 dark:hover:bg-white/[0.06] dark:hover:text-white"
          >
            <MagnifyingGlass size={15} aria-hidden="true" />
            <span className="hidden sm:inline">Search help</span>
          </Link>

          <Link
            href={backHref}
            suppressHydrationWarning
            className="flex min-h-9 items-center gap-2 rounded-xl px-3 text-xs font-semibold text-[#514d48] transition-colors hover:bg-[#f5f4f2] hover:text-[#171716] focus-visible:outline-2 focus-visible:outline-[#c86544] dark:text-white/66 dark:hover:bg-white/[0.06] dark:hover:text-white"
          >
            <ArrowLeft size={15} aria-hidden="true" />
            <span className="hidden md:inline">Back to app</span>
          </Link>

          <button
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="grid size-9 cursor-pointer place-items-center rounded-xl text-[#514d48] transition-colors hover:bg-[#f5f4f2] hover:text-[#171716] focus-visible:outline-2 focus-visible:outline-[#c86544] dark:text-white/66 dark:hover:bg-white/[0.06] dark:hover:text-white"
          >
            {mounted ? (
              isDark ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />
            ) : (
              <span className="w-4 h-4 block" />
            )}
          </button>
          </nav>
        </div>
      </header>
      <div className="h-20" aria-hidden="true" />
    </>
  );
}
