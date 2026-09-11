import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  theme?: 'green' | 'orange';
}

export function AuthLayout({ children, theme }: AuthLayoutProps) {
  const isGreen = theme === 'green';

  return (
    <div className="auth-shell min-h-screen h-full md:h-screen w-full flex flex-col md:flex-row bg-[#f5f4f2] dark:bg-[#121211] relative overflow-hidden font-sans text-slate-900 dark:text-zinc-100 transition-colors duration-300">
      {/* Subtle Warm Ambient Glows matching Landing Page */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#c86544]/[0.07] blur-3xl dark:bg-orange-500/[0.05] transition-all duration-700"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#c86544]/[0.05] blur-3xl dark:bg-orange-500/[0.04] transition-all duration-700"
      />
      {isGreen && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-1/3 -translate-y-1/2 w-80 h-80 rounded-full bg-emerald-500/[0.04] blur-3xl dark:bg-emerald-500/[0.03]"
        />
      )}
      {children}
    </div>
  );
}
