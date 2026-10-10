import React, { useEffect, useState } from 'react';
import { SquaresFour, Sparkle, Megaphone, Trophy, BookOpen } from '@phosphor-icons/react';

interface CommunityHeaderProps {
  isDark?: boolean;
  firstName?: string;
}

export default function CommunityHeader({ isDark = false, firstName }: CommunityHeaderProps) {
  const greetingName = firstName?.trim();

  return (
    <header className="flex flex-col gap-2.5 sm:gap-3 pb-1 pt-1">
      <div>
        <h1 className={`font-sans text-2xl font-black tracking-tight sm:text-4xl lg:text-[2.65rem] leading-[1.1] ${
          isDark ? 'text-white' : 'text-ink'
        }`}>
          {greetingName ? `Hello, ${greetingName}!` : 'Hello!'}
        </h1>
        <p className={`mt-1.5 sm:mt-2 max-w-2xl text-xs sm:text-base leading-relaxed ${
          isDark ? 'text-ink-subtle' : 'text-ink-muted'
        }`}>
          Follow newly published services, official notices, and provider recognition across ServiceHub.
        </p>
      </div>
    </header>
  );
}

const sections = [
  { label: 'Overview', href: '#community-overview', icon: SquaresFour },
  { label: 'Announcements', href: '#community-announcements', icon: Megaphone },
  { label: 'Providers', href: '#community-providers', icon: Trophy },
  { label: 'Recently added', href: '#community-newly-approved', icon: Sparkle },
  { label: 'Handbook', href: '#community-handbook', icon: BookOpen },
];

export function CommunitySectionNav({ isDark = false }: CommunityHeaderProps) {
  const [activeSection, setActiveSection] = useState('#community-overview');

  useEffect(() => {
    const syncHash = () => {
      const hash = window.location.hash;
      if (sections.some((section) => section.href === hash)) {
        setActiveSection(hash);
      }
    };
    syncHash();
    window.addEventListener('hashchange', syncHash);

    // Live scroll observation to sync active anchor
    const sectionIds = ['community-overview', 'community-announcements', 'community-providers', 'community-newly-approved', 'community-handbook'];
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length > 0) {
      const observer = new IntersectionObserver(
        (entries) => {
          const visible = entries.find((entry) => entry.isIntersecting);
          if (visible) {
            setActiveSection(`#${visible.target.id}`);
          }
        },
        { rootMargin: '-20% 0px -60% 0px', threshold: 0.1 }
      );
      elements.forEach((el) => observer.observe(el));
      return () => {
        window.removeEventListener('hashchange', syncHash);
        observer.disconnect();
      };
    }

    return () => window.removeEventListener('hashchange', syncHash);
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
    <nav
      aria-label="Community sections"
      className={`sticky top-14 sm:top-20 z-30 max-w-full overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden rounded-2xl p-1 sm:p-1.5 backdrop-blur-md touch-pan-x transition-all ${
        isDark ? 'bg-charcoal-inset/90 border border-neutral-800/80 shadow-lg' : 'bg-white/90 border border-slate-200/80 shadow-xs'
      }`}
    >
      <div className="flex w-max min-w-full items-center gap-1 sm:justify-start">
        {sections.map(({ label, href, icon: Icon }) => {
          const active = activeSection === href;
          return (
            <a
              key={href}
              href={href}
              onClick={(e) => handleNavClick(e, href)}
              aria-current={active ? 'location' : undefined}
              className={`inline-flex min-h-8.5 sm:min-h-9 shrink-0 items-center gap-1.5 sm:gap-2 rounded-xl px-3 sm:px-4 text-xs font-bold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-focus ${
                active
                  ? isDark
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30 shadow-xs'
                    : 'bg-orange-50 text-orange-700 border border-orange-200 shadow-xs'
                  : isDark
                    ? 'text-ink-subtle hover:bg-charcoal/60 hover:text-white border border-transparent'
                    : 'text-ink-muted hover:bg-slate-100/70 hover:text-ink border border-transparent'
              }`}
            >
              <Icon size={15} weight={active ? 'fill' : 'regular'} aria-hidden="true" />
              <span>{label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
