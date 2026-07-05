'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LandingHeaderProps {
  isDark: boolean;
  toggleTheme: () => void;
  onGetStarted: () => void;
}

const NAV_LINKS = [
  { label: 'How It Works', href: 'how-it-works' },
  { label: 'Live Queue', href: 'queue' },
  { label: 'Why Us', href: 'problem' },
  { label: 'Reviews', href: 'reviews' },
  { label: 'FAQ', href: 'faq' },
];

function scrollTo(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 68;
  window.scrollTo({ top, behavior: 'smooth' });
}

export default function LandingHeader({ isDark, toggleTheme }: LandingHeaderProps) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 w-full h-16 flex items-center justify-between px-6 md:px-12 border-b transition-all duration-300 ${isDark
          ? 'bg-[#191919]/95 border-neutral-800/60'
          : 'bg-[#fbfaf7]/95 border-slate-200/80'
          } ${scrolled ? 'backdrop-blur-xl shadow-md' : 'backdrop-blur-md'}`}
      >
        {/* Brand */}
        <div className="flex items-center space-x-3 shrink-0">
          <img src="/logo.png" alt="ServiceHub Cordova Logo" className="h-8 w-8 object-contain rounded-lg shadow-sm" />
          <span className={`font-extrabold text-lg tracking-tight transition-colors duration-300 ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
            ServiceHub Cordova
          </span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollTo(link.href)}
              className={`text-[13px] font-semibold px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer ${isDark
                ? 'text-[#a09c93] hover:text-[#f2efe9] hover:bg-white/5'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className={`p-2.5 rounded-xl border transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer ${isDark
              ? 'bg-[#2c2b27] border-neutral-700 text-amber-500 hover:text-amber-400'
              : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800 shadow-sm'
              }`}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          <button
            onClick={() => router.push('/login')}
            className={`hidden sm:block font-bold text-xs py-2.5 px-4 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${isDark ? 'text-[#f2efe9] hover:bg-neutral-800' : 'text-slate-700 hover:bg-slate-100/70'
              }`}
          >
            Log In
          </button>

          <button
            onClick={() => router.push('/register')}
            className="font-bold text-xs py-2.5 px-5 rounded-xl transition-all duration-300 shadow-sm hover:scale-[1.02] active:scale-[0.98] cursor-pointer bg-[#FF5A1F] hover:bg-[#e04f1a] text-white"
          >
            Sign Up
          </button>

          {/* Mobile hamburger */}
          <button
            className={`md:hidden p-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${isDark
              ? 'bg-[#2c2b27] border-neutral-700 text-[#f2efe9]'
              : 'bg-white border-slate-200 text-slate-700 shadow-sm'
              }`}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </header>

      {/* Mobile Nav Drawer */}
      {mobileOpen && (
        <div
          className={`md:hidden fixed top-16 left-0 right-0 z-40 border-b shadow-2xl ${isDark ? 'bg-[#1d1c19] border-neutral-800' : 'bg-[#fefdf9] border-slate-200'
            }`}
        >
          <nav className="flex flex-col px-6 py-4 gap-1">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => { scrollTo(link.href); setMobileOpen(false); }}
                className={`text-sm font-semibold text-left px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${isDark
                  ? 'text-[#a09c93] hover:text-[#f2efe9] hover:bg-white/5'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
              >
                {link.label}
              </button>
            ))}
            <div className={`pt-3 mt-2 border-t flex gap-3 ${isDark ? 'border-neutral-700' : 'border-slate-200'}`}>
              <button
                onClick={() => { router.push('/login'); setMobileOpen(false); }}
                className={`flex-1 font-bold text-xs py-3 px-4 rounded-xl transition-all duration-200 cursor-pointer border ${isDark
                  ? 'border-neutral-700 text-[#f2efe9] hover:bg-neutral-800'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
              >
                Log In
              </button>
              <button
                onClick={() => { router.push('/register'); setMobileOpen(false); }}
                className="flex-1 font-bold text-xs py-3 px-4 rounded-xl bg-[#FF5A1F] hover:bg-[#e04f1a] text-white transition-all duration-200 cursor-pointer"
              >
                Sign Up
              </button>
            </div>
          </nav>
        </div>
      )}
      {/* Spacer so page content isn't hidden behind the fixed header */}
      <div className="h-16" />
    </>
  );
}
