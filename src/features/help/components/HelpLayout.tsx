"use client";
import React from 'react';
import Link from 'next/link';
import HelpNavbar from './HelpNavbar';
import { useApp } from '@/context/AppContext';

interface HelpLayoutProps {
  children: React.ReactNode;
}

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  const { isDark } = useApp();

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-150 ${
      isDark ? 'bg-[#151515] text-[#e8e6e3]' : 'bg-[#faf8f5] text-slate-800'
    }`}>
      {/* Top Header */}
      <HelpNavbar />

      {/* Main Container */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
        {children}
      </main>

      {/* Minimalist Sharetribe Style Footer */}
      <footer className={`border-t py-8 transition-colors ${
        isDark ? 'bg-[#121212] border-neutral-800/80 text-neutral-400' : 'bg-white border-slate-200 text-slate-500'
      }`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="ServiceHub Logo" className="w-5 h-5 rounded object-contain opacity-80" />
            <span className="font-semibold text-slate-700 dark:text-neutral-300">
              ServiceHub Cordova
            </span>
            <span className="text-slate-400">·</span>
            <span>Help Center for Cordova, Cebu</span>
          </div>

          <div className="flex items-center gap-5 text-xs font-medium">
            <Link href="/help" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
              Help Home
            </Link>
            <Link href="/privacy" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
              Terms
            </Link>
            <a
              href="mailto:admin@servicehub-cordova.local"
              className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
