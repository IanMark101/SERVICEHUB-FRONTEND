import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  theme?: 'green' | 'orange';
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="auth-shell relative flex min-h-[100dvh] w-full flex-col overflow-x-hidden bg-[#f5f4f2] font-sans text-slate-900 transition-colors duration-300 dark:bg-[#121211] dark:text-zinc-100 lg:h-[100dvh] lg:flex-row lg:overflow-hidden">
      {children}
    </div>
  );
}
