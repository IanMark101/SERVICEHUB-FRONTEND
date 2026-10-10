"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import HelpNavbar from './HelpNavbar';

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="help-shell flex min-h-[100dvh] flex-col bg-[#f5f4f2] font-sans text-ink selection:bg-brand-action selection:text-white dark:bg-charcoal dark:text-white">
      <HelpNavbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-20 pt-6 sm:px-6 sm:pt-10 lg:px-8">
        {children}
      </main>

      <footer className="border-t border-black/8 bg-[#fffdfa] py-8 text-ink-muted dark:border-white/10 dark:bg-charcoal dark:text-white/58">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 text-xs sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Image width={26} height={26} src="/logo.svg?v=7" alt="" className="size-[26px] rounded-lg object-contain" />
            <div className="leading-4">
              <span className="block font-semibold text-ink dark:text-white">ServiceHub</span>
              <span className="block">Official help center</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 font-medium">
            <Link href="/help" className="transition-colors hover:text-brand-text dark:hover:text-brand-on-dark">
              Help Home
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-brand-text dark:hover:text-brand-on-dark">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-brand-text dark:hover:text-brand-on-dark">
              Terms of Service
            </Link>
            <Link
              href="/help/safety"
              className="font-semibold text-brand-text transition-colors hover:text-brand-action-hover dark:text-brand-on-dark dark:hover:text-orange-200"
            >
              Safety and support guides
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
