import React from 'react';
import { ArrowLeft, Sun, Moon } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AuthLeftPanelProps {
  mode: 'login' | 'signup' | 'forgot' | 'reset';
  step: number;
  accentBg: string;
  onBackToHome?: () => void;
}

export default function AuthLeftPanel({
  mode,
  step,
  accentBg,
  onBackToHome,
}: AuthLeftPanelProps) {
  const { isDark, toggleTheme } = useApp();

  return (
    <div className="hidden lg:flex w-1/2 relative bg-[#faf8f5] dark:bg-[#0f1115] flex-col justify-between p-12 overflow-hidden border-r border-slate-200 dark:border-slate-800 select-none transition-colors duration-300 min-h-screen">

      {/* Subtle Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0"></div>

      {/* Header Bar */}
      <div className="relative z-10 flex items-center justify-between w-full shrink-0">
        <div className="flex items-center gap-5">
          <button
            onClick={onBackToHome}
            className="w-10 h-10 rounded-xl bg-slate-200/40 dark:bg-slate-800/40 border border-slate-300 dark:border-slate-700 flex items-center justify-center hover:bg-slate-300/60 dark:hover:bg-slate-700 transition-all text-slate-650 dark:text-slate-300 backdrop-blur-sm focus:outline-none cursor-pointer"
            title="Back to Landing Page"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FF5A1F] flex items-center justify-center font-bold text-white shadow-lg shadow-orange-500/20">
              S
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800 dark:text-white">
              ServiceHub Cordova
            </span>
          </div>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-xl bg-slate-200/40 dark:bg-slate-800/40 border border-slate-300 dark:border-slate-700 flex items-center justify-center hover:bg-slate-300/60 dark:hover:bg-slate-700 transition-all text-slate-550 dark:text-slate-400 backdrop-blur-sm focus:outline-none cursor-pointer"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      {/* Centered Main Content Wrapper */}
      <div className="relative z-10 my-auto py-10 w-full max-w-xl flex flex-col justify-center">
        <div className="space-y-3">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight max-w-[360px]">
            {mode === 'signup' ? 'Get Started with Us' : 'Where Talent Meets Opportunity'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed max-w-[420px]">
            {mode === 'signup'
              ? 'Complete these easy steps to register your account.'
              : 'Connect with trusted local talent, request community services, or showcase your skills within the Cordova community—all through secure escrow-protected transactions.'}
          </p>
        </div>

        {/* Cordova area network badge */}
        <div className="mt-6">
          <div className="inline-flex items-center gap-2 bg-emerald-550/10 dark:bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(16,185,129,0.05)]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Trusted Local Service Network
          </div>
        </div>

        {mode === 'signup' ? (
          /* SIGNUP STEP CARDS */
          <div className="grid grid-cols-3 gap-4 mt-8">
            {[
              { s: 1, title: 'Sign up account' },
              { s: 2, title: 'Choose Role' },
              { s: 3, title: 'Set Profile Info' }
            ].map((item) => (
              <div
                key={item.s}
                className={`backdrop-blur-md border rounded-2xl p-5 hover:-translate-y-1 transition-all duration-300 cursor-default shadow-sm ${step === item.s
                    ? 'bg-white dark:bg-[#1a1917] border-[#FF5A1F]/50 dark:border-[#FF5A1F]/50 ring-1 ring-[#FF5A1F]/30 scale-[1.02]'
                    : 'bg-white/40 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800'
                  }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-4 border shadow-inner ${step === item.s
                    ? 'bg-[#FF5A1F] text-white border-[#FF5A1F]'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}>
                  {item.s}
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">Step {item.s}</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{item.title}</p>
              </div>
            ))}
          </div>
        ) : (
          /* LOGIN OPTION CARDS */
          <div className="grid grid-cols-2 gap-4 mt-8">
            {/* Find Help Card */}
            <div className="backdrop-blur-md border bg-white/40 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:-translate-y-1 hover:border-orange-500/45 transition-all cursor-default shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 dark:bg-orange-500/5 flex items-center justify-center text-sm mb-4 border border-orange-500/5 shadow-inner">
                🔍
              </div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-orange-650 dark:text-orange-500 mb-1.5">FIND TRUSTED SERVICES</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                Request help from skilled community members for your everyday needs.
              </p>
            </div>

            {/* Offer Skills Card */}
            <div className="backdrop-blur-md border bg-white/40 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:-translate-y-1 hover:border-emerald-500/45 transition-all cursor-default shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/5 flex items-center justify-center text-sm mb-4 border border-emerald-500/5 shadow-inner">
                🛠️
              </div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-650 dark:text-emerald-400 mb-1.5">SHOWCASE YOUR SKILLS</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                Offer your expertise, connect with local clients, and create meaningful opportunities within your community.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Branding Area */}
      <div className="shrink-0 relative z-10 text-[10px] text-slate-400 dark:text-slate-650 font-medium">
        &copy; {new Date().getFullYear()} ServiceHub. All rights reserved.
      </div>
    </div>
  );
}
