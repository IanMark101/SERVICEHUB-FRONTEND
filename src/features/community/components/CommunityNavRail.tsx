import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Sparkle,
  Megaphone,
  SquaresFour,
  ArrowUpRight,
  ShieldCheck,
} from '@phosphor-icons/react';
import Link from 'next/link';

interface CommunityNavRailProps {
  isDark?: boolean;
}

const navItems = [
  { label: 'Providers of the Week', href: '#community-providers', icon: Trophy },
  { label: 'Recently added', href: '#community-newly-approved', icon: Sparkle },
  { label: 'Notices & Handbook', href: '#community-announcements', icon: Megaphone },
  { label: 'Civic Overview', href: '#community-overview', icon: SquaresFour },
];

export default function CommunityNavRail({ isDark = false }: CommunityNavRailProps) {
  const [activeSection, setActiveSection] = useState('#community-providers');

  useEffect(() => {
    // Synchronize with URL hash if present
    const hash = window.location.hash;
    const hashTimer = window.setTimeout(() => {
      if (navItems.some((item) => item.href === hash)) setActiveSection(hash);
    }, 0);

    // Live IntersectionObserver to highlight section as user scrolls
    const sectionIds = ['community-providers', 'community-newly-approved', 'community-announcements', 'community-overview'];
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return () => window.clearTimeout(hashTimer);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) {
          setActiveSection(`#${visible.target.id}`);
        }
      },
      {
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0.1,
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => { window.clearTimeout(hashTimer); observer.disconnect(); };
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setActiveSection(href);
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.pushState(null, '', href);
    }
  };

  return (
    <aside className="space-y-4" aria-label="Community directory navigation">
      {/* Directory Navigator Card */}
      <div
        className={`rounded-3xl border p-4 sm:p-5 transition-all ${
          isDark
            ? 'bg-[#1c1b18] border-neutral-800/90 shadow-xl shadow-black/40'
            : 'bg-white border-slate-200/90 shadow-sm shadow-slate-900/5'
        }`}
      >
        <div className="flex items-center justify-between pb-3 px-1 border-b border-slate-100 dark:border-neutral-800/80 mb-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-ink-subtle dark:text-ink-subtle">
            Directory Index
          </span>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>

        <nav className="space-y-1">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = activeSection === href;
            return (
              <a
                key={href}
                href={href}
                onClick={(e) => handleNavClick(e, href)}
                className={`group flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                  isActive
                    ? isDark
                      ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30 shadow-xs'
                      : 'bg-orange-50 text-orange-700 border border-orange-200/80 shadow-xs'
                    : isDark
                      ? 'text-ink-muted hover:bg-neutral-800/70 hover:text-white border border-transparent'
                      : 'text-ink-muted hover:bg-slate-50 hover:text-ink border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon size={16} weight={isActive ? 'fill' : 'bold'} className="shrink-0" />
                  <span className="truncate">{label}</span>
                </div>
                {isActive && (
                  <span className="size-1.5 rounded-full bg-orange-500 shrink-0" />
                )}
              </a>
            );
          })}
        </nav>
      </div>

      {/* Quiet Civic Trust Note */}
      <div
        className={`rounded-3xl border p-4 sm:p-5 transition-all ${
          isDark
            ? 'bg-gradient-to-br from-neutral-900 via-[#1c1b18] to-neutral-950 border-neutral-800/90'
            : 'bg-gradient-to-br from-orange-50/40 via-white to-amber-50/20 border-slate-200/90'
        }`}
      >
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
          <ShieldCheck size={16} weight="fill" />
          <span>Cordova Civic Integrity</span>
        </div>
        <p className={`mt-2 text-xs leading-relaxed ${isDark ? 'text-ink-subtle' : 'text-ink-muted'}`}>
          Provider rankings and newly published listings are tied to verified residency and authentic completed work.
        </p>
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-neutral-800/80">
          <Link
            href="/help"
            className={`inline-flex items-center gap-1 text-[11px] font-bold transition-colors ${
              isDark ? 'text-orange-400 hover:text-orange-300' : 'text-orange-600 hover:text-orange-700'
            }`}
          >
            <span>Platform rules & help</span>
            <ArrowUpRight size={12} weight="bold" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
