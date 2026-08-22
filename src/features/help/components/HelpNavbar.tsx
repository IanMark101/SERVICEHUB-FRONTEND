"use client";
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, Sun, Moon, Search, Sparkles } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function HelpNavbar() {
  const router = useRouter();
  const { isDark, toggleTheme, isAuthenticated, user } = useApp();

  // Determine back destination (dashboard if logged in, home if visitor)
  const backHref = isAuthenticated
    ? user?.role === 'admin'
      ? '/admin'
      : user?.role === 'provider'
      ? '/provider'
      : '/seeker'
    : '/';

  return (
    <header className={`sticky top-0 z-40 w-full border-b backdrop-blur-xl transition-colors duration-200 ${
      isDark
        ? 'bg-[#191919]/90 border-neutral-800/80 text-[#f2efe9]'
        : 'bg-[#fbfaf7]/90 border-slate-200 text-slate-900'
    }`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand and Breadcrumb title */}
        <div className="flex items-center gap-3">
          <Link
            href={backHref}
            className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              isDark
                ? 'border-neutral-800 bg-[#22211e] hover:bg-[#2c2b27] text-[#b4b0a9] hover:text-white'
                : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 shadow-sm'
            }`}
            title="Return to ServiceHub Application"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to App</span>
          </Link>

          <div className="h-5 w-px bg-slate-200 dark:bg-neutral-800 hidden sm:block" />

          <Link href="/help" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black tracking-tight leading-none group-hover:text-orange-500 transition-colors">
                ServiceHub Cordova
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 leading-tight">
                Help Center
              </span>
            </div>
          </Link>
        </div>

        {/* Right Actions: Search quick-btn + Theme Toggle */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/help/search"
            className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
              isDark
                ? 'border-neutral-800 bg-[#22211e] hover:border-neutral-700 text-[#b4b0a9]'
                : 'border-slate-200 bg-white hover:border-slate-300 text-slate-500 shadow-xs'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-[11px]">Search docs...</span>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[9px] font-mono rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-300 dark:border-neutral-700">
              /
            </kbd>
          </Link>

          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isDark
                ? 'border-neutral-800 bg-[#22211e] hover:bg-[#2c2b27] text-amber-400'
                : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700 shadow-sm'
            }`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
