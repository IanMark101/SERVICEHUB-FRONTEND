import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  theme: 'green' | 'orange';
}

export default function AuthLayout({ children, theme }: AuthLayoutProps) {
  const isGreen = theme === 'green';

  return (
    <div className="h-screen w-full flex flex-col md:flex-row bg-[#faf8f5] dark:bg-[#0a0a0a] relative overflow-hidden font-sans select-none text-slate-800 dark:text-[#f2efe9] transition-colors duration-300">
      {/* Decorative Glowing Orbs */}
      <div
        className={`absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-15 dark:opacity-10 blur-[120px] transition-all duration-700 ${
          isGreen ? 'bg-emerald-500/10 dark:bg-emerald-500/20' : 'bg-orange-500/10 dark:bg-orange-500/20'
        } pointer-events-none`}
      />
      <div
        className={`absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-15 dark:opacity-10 blur-[120px] transition-all duration-700 ${
          isGreen ? 'bg-emerald-500/10 dark:bg-emerald-500/20' : 'bg-orange-500/10 dark:bg-orange-500/20'
        } pointer-events-none`}
        style={{ animationDelay: '-5s' }}
      />
      {children}
    </div>
  );
}
