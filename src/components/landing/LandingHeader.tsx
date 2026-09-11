'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { useState } from 'react';

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

export default function LandingHeader({ isDark, toggleTheme }: LandingHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-stone-200/80 bg-[#fbfaf7]/95 text-slate-950 backdrop-blur-md dark:border-white/10 dark:bg-[#171715]/95 dark:text-stone-50">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-5 px-5 sm:px-8 lg:px-10">
          <a href="#top" className="flex min-w-0 items-center gap-3" aria-label="ServiceHub Cordova home">
            <Image src="/logo.svg" alt="" width={36} height={36} className="size-9 shrink-0 rounded-xl" priority />
            <span className="leading-none">
              <span className="block text-sm font-extrabold tracking-[-0.02em]">ServiceHub</span>
              <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.2em] text-[#c86544]">Cordova</span>
            </span>
          </a>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Landing page">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-stone-100 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c86544] dark:text-stone-300 dark:hover:bg-white/5 dark:hover:text-white">
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button type="button" onClick={toggleTheme} className="grid size-10 place-items-center rounded-xl border border-stone-200 bg-white text-slate-600 transition-colors hover:border-stone-300 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c86544] dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-300 dark:hover:text-white" aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <Link href="/login" className="hidden rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-white/5 sm:inline-flex">Log in</Link>
            <Link href="/register" className="inline-flex rounded-xl bg-[#c86544] px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#b95738] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c86544]">Create account</Link>
            <button type="button" onClick={() => setMobileOpen((value) => !value)} className="grid size-10 place-items-center rounded-xl border border-stone-200 bg-white text-slate-700 lg:hidden dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-200" aria-expanded={mobileOpen} aria-controls="mobile-navigation" aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}>
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      <div className="h-[68px] shrink-0" aria-hidden="true" />

      {mobileOpen && (
        <div id="mobile-navigation" className="fixed inset-x-0 top-[68px] z-40 border-b border-stone-200 bg-[#fbfaf7] px-5 py-4 shadow-lg lg:hidden dark:border-white/10 dark:bg-[#171715]">
          <nav className="mx-auto grid max-w-7xl gap-1" aria-label="Mobile landing page">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-white/5">
                {link.label}
              </a>
            ))}
            <Link href="/help" onClick={() => setMobileOpen(false)} className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-white/5">Help Center</Link>
          </nav>
        </div>
      )}
    </>
  );
}
