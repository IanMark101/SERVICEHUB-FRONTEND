'use client';

import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import GetStartedLink from './GetStartedLink';

/** Shared header/hero action treatment; session-aware navigation stays in GetStartedLink. */
export default function LandingActionLink({ children, size = 'compact' }: { children: ReactNode; size?: 'compact' | 'hero' }) {
  return (
    <GetStartedLink className={`group/btn relative inline-flex items-center justify-center gap-1.5 overflow-hidden rounded-full bg-[#0a0a0a] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_6px_14px_-3px_rgba(0,0,0,0.4)] ring-1 ring-black/20 transition-all hover:bg-[#161616] motion-safe:hover:scale-[1.02] motion-safe:active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0a0a0a] dark:bg-white dark:text-[#0a0a0a] dark:hover:bg-neutral-100 dark:focus-visible:outline-white motion-reduce:transition-none ${size === 'hero' ? 'min-h-13 px-6 py-3 text-[15px] max-md:text-sm' : 'px-4 py-1.5 text-xs'}`}>
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-full dark:hidden" style={{ background: 'radial-gradient(120% 80% at 50% 0%, rgba(255,255,255,0.16), transparent 60%)' }} />
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 ease-out group-hover/btn:translate-x-full motion-reduce:hidden" />
      <span className="relative z-10">{children}</span>
      <ArrowRight size={size === 'hero' ? 17 : 13} aria-hidden="true" className="relative z-10 transition-transform duration-300 motion-safe:group-hover/btn:translate-x-0.5 motion-reduce:transition-none" />
    </GetStartedLink>
  );
}
