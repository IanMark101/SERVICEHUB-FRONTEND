import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  theme?: 'green' | 'orange';
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="min-h-[100dvh] w-full bg-[#f4f1eb] font-sans text-slate-900 transition-colors dark:bg-[#11110f] dark:text-stone-50">
      <div className="grid min-h-[100dvh] w-full md:grid-cols-[minmax(360px,0.92fr)_minmax(480px,1.08fr)]">
        {children}
      </div>
    </main>
  );
}
