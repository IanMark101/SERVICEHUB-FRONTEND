'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { MouseEvent } from 'react';

export default function useLandingSectionNavigation() {
  const shellRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);

  const findSection = useCallback((hash: string) => {
    try {
      const section = document.getElementById(decodeURIComponent(hash.slice(1)));
      return section?.matches('section') && shellRef.current?.contains(section) ? section : null;
    } catch {
      return null;
    }
  }, []);

  const scrollToSection = useCallback((hash: string, behavior: ScrollBehavior, moveFocus = false) => {
    if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    // Let the mobile menu close before native scrolling. CSS owns the clearance.
    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null;
      const section = findSection(hash);
      if (!section) return;
      // Align the content container, avoiding section padding and reveal transforms.
      // Dedicated copy anchors keep a preceding strip or stacked illustration above view.
      const content = section.querySelector<HTMLElement>('[data-landing-anchor]')
        ?? section.firstElementChild;
      const target = section.id === 'top' || !(content instanceof HTMLElement) ? section : content;
      target.scrollIntoView({ behavior, block: 'start' });
      if (moveFocus) {
        section.tabIndex = -1;
        section.focus({ preventScroll: true });
      }
    });
  }, [findSection]);

  useEffect(() => {
    const restoreSection = () => scrollToSection(window.location.hash, 'auto');
    if (window.location.hash) restoreSection();
    window.addEventListener('hashchange', restoreSection);
    window.addEventListener('popstate', restoreSection);
    return () => {
      window.removeEventListener('hashchange', restoreSection);
      window.removeEventListener('popstate', restoreSection);
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    };
  }, [scrollToSection]);

  const handleSectionClick = useCallback((event: MouseEvent<HTMLDivElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href^="#"]') : null;
    const hash = link?.getAttribute('href');
    if (!hash || !findSection(hash) || link?.hasAttribute('download') || (link?.target && link.target !== '_self')) return;
    event.preventDefault();
    // Next preserves its own history fields. Passing them back marks this as
    // an internal action and skips synchronizing the router with the new URL.
    if (window.location.hash !== hash) window.history.pushState(null, '', hash);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    scrollToSection(hash, reducedMotion ? 'auto' : 'smooth', true);
  }, [findSection, scrollToSection]);

  return { shellRef, handleSectionClick };
}
