import React from 'react';
import { BookOpen } from '@phosphor-icons/react';
import PlatformGuides from './PlatformGuides';

interface PlatformHandbookProps {
  isDark?: boolean;
}

export default function PlatformHandbook({ isDark = false }: PlatformHandbookProps) {
  return (
    <section id="community-handbook" className="scroll-mt-28 space-y-4" aria-labelledby="platform-handbook-title">
      <div className="flex items-center gap-2.5">
        <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-orange-500/15 text-brand-text dark:text-orange-400">
          <BookOpen size={19} weight="fill" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 id="platform-handbook-title" className={`text-lg sm:text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-ink'}`}>
            Using ServiceHub handbook
          </h2>
          <p className={`text-[11px] sm:text-xs leading-relaxed ${isDark ? 'text-ink-subtle' : 'text-ink-muted'}`}>
            Essential rules on identity and residency verification, online queues, and reusable services
          </p>
        </div>
      </div>

      <div className={`rounded-3xl border p-4 sm:p-7 transition-all ${
        isDark
          ? 'bg-charcoal-inset border-neutral-800/90 shadow-xl shadow-black/40'
          : 'bg-white border-slate-200/90 shadow-sm shadow-slate-900/5'
      }`}>
        <PlatformGuides isDark={isDark} />
      </div>
    </section>
  );
}
