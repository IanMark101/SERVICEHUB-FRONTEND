"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Sun, Moon, Search, ExternalLink } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function HelpNavbar() {
  const { toggleTheme, isAuthenticated, user, isDark } = useApp();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const backHref = isAuthenticated
    ? user?.role === 'admin'
      ? '/admin'
      : user?.role === 'provider'
      ? '/provider'
      : '/seeker'
    : '/';

  return (
    <header className="sticky top-0 z-40 w-full border-b transition-colors duration-200 bg-white/95 dark:bg-[#181818]/95 border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-[#f2efe9] backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href="/help" className="flex items-center gap-2.5 group">
            <img src="/logo.png" alt="ServiceHub Logo" className="w-8 h-8 rounded-lg object-contain shadow-xs" />
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                ServiceHub Cordova
              </span>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-neutral-400 mt-0.5">
                Help Center
              </span>
            </div>
          </Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/help/search"
            className="px-3 py-1.5 rounded-lg border text-xs font-medium transition-all flex items-center gap-2 cursor-pointer border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-[#22211e] hover:border-slate-300 dark:hover:border-neutral-700 text-slate-600 dark:text-[#b4b0a9]"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline text-xs">Search help articles...</span>
          </Link>

          <Link
            href={backHref}
            className="px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border-slate-200 dark:border-neutral-800 bg-white dark:bg-[#22211e] hover:bg-slate-50 dark:hover:bg-[#2c2b27] text-slate-700 dark:text-[#d4cfc7] hover:text-slate-900 dark:hover:text-white"
          >
            <span>Go to ServiceHub</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
          </Link>

          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2 rounded-lg border transition-all cursor-pointer border-slate-200 dark:border-neutral-800 bg-white dark:bg-[#22211e] hover:bg-slate-50 dark:hover:bg-[#2c2b27] text-slate-700 dark:text-amber-400"
          >
            {mounted ? (
              isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />
            ) : (
              <span className="w-4 h-4 block" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
