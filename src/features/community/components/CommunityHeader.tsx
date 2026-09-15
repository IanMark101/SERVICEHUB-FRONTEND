import React from 'react';

interface CommunityHeaderProps {
  isDark?: boolean;
}

export default function CommunityHeader({ isDark = false }: CommunityHeaderProps) {
  return (
    <header className="relative border-b border-black/10 pb-7 dark:border-white/10">
      <div aria-hidden="true" className="pointer-events-none absolute -left-8 -top-16 -z-10 h-48 w-80 rounded-full bg-[#c86544]/8 blur-[90px]" />
      <h1 className={`text-[clamp(1.8rem,2.6vw,2.5rem)] font-semibold leading-tight tracking-[-0.035em] ${isDark ? 'text-[#f5f4f2]' : 'text-[#171716]'}`}>
        Community activity in Cordova.
      </h1>
      <p className={`mt-3 max-w-[65ch] text-sm leading-6 sm:text-base sm:leading-7 ${isDark ? 'text-[#aaa59d]' : 'text-[#625d57]'}`}>
        Local activity in Cordova: approved services, official notices, and recognized providers.
      </p>
    </header>
  );
}
