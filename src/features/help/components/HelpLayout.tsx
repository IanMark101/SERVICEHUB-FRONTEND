"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import HelpNavbar from './HelpNavbar';

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="help-shell flex min-h-[100dvh] flex-col bg-[#f5f4f2] font-sans text-[#171716] selection:bg-[#c86544] selection:text-white dark:bg-[#121211] dark:text-[#f5f4f2]">
      <HelpNavbar />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-20 pt-6 sm:px-6 sm:pt-10 lg:px-8">
        {children}
      </main>

      <footer className="border-t border-black/8 bg-[#fffdfa] py-8 text-[#6f6a64] dark:border-white/10 dark:bg-[#171716] dark:text-white/58">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 text-xs sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Image width={26} height={26} src="/logo.svg" alt="" className="size-[26px] rounded-lg object-contain" />
            <div className="leading-4">
              <span className="block font-semibold text-[#171716] dark:text-[#f5f4f2]">ServiceHub Cordova</span>
              <span className="block">Official help center</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 font-medium">
            <Link href="/help" className="transition-colors hover:text-[#c86544] dark:hover:text-[#e18463]">
              Help Home
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-[#c86544] dark:hover:text-[#e18463]">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-[#c86544] dark:hover:text-[#e18463]">
              Terms of Service
            </Link>
            <a
              href="mailto:admin@servicehub-cordova.local"
              className="font-semibold text-[#c86544] transition-colors hover:text-[#aa5032] dark:text-[#e18463] dark:hover:text-[#efb29c]"
            >
              Contact Municipal Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
