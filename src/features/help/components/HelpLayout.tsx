"use client";
import React from 'react';
import Link from 'next/link';
import HelpNavbar from './HelpNavbar';

interface HelpLayoutProps {
  children: React.ReactNode;
}

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-150 bg-[#faf8f5] dark:bg-[#121212] text-slate-800 dark:text-[#e8e6e3]">
      {/* Top Header */}
      <HelpNavbar />

      {/* Main Wide Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 lg:px-12 py-8 sm:py-12">
        {children}
      </main>

      {/* Wide Footer */}
      <footer className="border-t py-10 transition-colors bg-white dark:bg-[#0e0e0e] border-slate-200 dark:border-neutral-800/80 text-slate-500 dark:text-neutral-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="ServiceHub Logo" className="w-6 h-6 rounded-lg object-contain opacity-90" />
            <div>
              <span className="font-bold text-slate-900 dark:text-white">
                ServiceHub Cordova
              </span>
              <span className="text-slate-400 mx-2">·</span>
              <span>Official Knowledge Base &amp; Documentation</span>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-6 text-xs font-semibold">
            <Link href="/help" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
              Help Home
            </Link>
            <Link href="/privacy" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
              Terms of Service
            </Link>
            <a
              href="mailto:admin@servicehub-cordova.local"
              className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors font-bold text-orange-600 dark:text-orange-400"
            >
              Contact Municipal Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
