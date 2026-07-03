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

  const isGreen = accentBg.includes('emerald');

  return (
    <div className="md:w-1/2 bg-slate-50/50 dark:bg-[#1c1b18]/40 p-6 sm:p-10 md:p-12 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200 dark:border-neutral-800/80 relative overflow-hidden min-h-[40vh] md:h-screen transition-colors duration-300 select-none">
      
      {/* Self-contained CSS styles for static dot grid background and transitions */}
      <style dangerouslySetInnerHTML={{ __html: `
        .dot-grid {
          background-image: radial-gradient(${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'} 1.5px, transparent 1.5px);
          background-size: 24px 24px;
        }
      `}} />

      {/* Grid Pattern Background */}
      <div className="absolute inset-0 dot-grid pointer-events-none z-0" />

      {/* Branding Logo & Theme switchers */}
      <div className="relative z-10 flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToHome}
          className="flex items-center space-x-2 group hover:opacity-90 transition-all focus:outline-none cursor-pointer"
          title="Back to Landing Page"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-neutral-800/80 border border-slate-200 dark:border-neutral-700/60 text-slate-500 dark:text-[#b4b0a9] group-hover:bg-slate-200 dark:group-hover:bg-[#22211e] group-hover:shadow-sm transition-all">
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          </div>
          <div className={`p-1.5 rounded-lg ${accentBg} text-white flex items-center justify-center font-extrabold text-base shadow-sm transition-colors w-9 h-9`}>
            S
          </div>
          <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-[#f2efe9]">
            ServiceHub Cordova
          </span>
        </button>

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 h-9 w-9 rounded-xl border transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer bg-white dark:bg-[#22211e] border-slate-200 dark:border-neutral-800/80 text-slate-500 dark:text-amber-500 hover:text-slate-800 dark:hover:text-amber-400 shadow-sm"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Left Content Container */}
      <div className="mt-12 md:mt-auto space-y-8 relative z-10">
        {mode === 'signup' ? (
          <>
            {/* SIGNUP MODE: Classic Stepper */}
            <div className="space-y-2 border-b border-slate-200 dark:border-neutral-800/80 pb-4">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-[#f2efe9] leading-tight tracking-tight">
                Get Started with Us
              </h2>
              <p className="text-slate-500 dark:text-[#b4b0a9] text-xs leading-relaxed max-w-sm">
                Complete these easy steps to register your account.
              </p>
            </div>

            <div className="flex">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold tracking-wide">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                <span>CORDOVA AREA NETWORK ACTIVE</span>
              </div>
            </div>

            {/* Stepper Cards */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { s: 1, label: 'Sign Up' },
                { s: 2, label: 'Contact Info' },
                { s: 3, label: 'Profile Setup' },
              ].map((item) => (
                <div
                  key={item.s}
                  className={`p-4 rounded-2xl flex flex-col justify-between min-h-[120px] transition-all duration-300 border ${
                    step === item.s
                      ? 'bg-white dark:bg-[#22211e] text-slate-950 dark:text-[#f2efe9] shadow-md border-orange-500/50 dark:border-neutral-800 scale-[1.02]'
                      : 'bg-slate-100/50 dark:bg-[#1c1b18]/40 text-slate-400 dark:text-[#b4b0a9] border-slate-300 dark:border-neutral-800/40 hover:border-slate-400 dark:hover:border-neutral-800/60'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                      step === item.s ? `${accentBg} text-white` : 'bg-slate-200 dark:bg-[#2b2a26] text-slate-500 dark:text-[#b4b0a9]'
                    }`}
                  >
                    {item.s}
                  </div>
                  <div className="mt-4">
                    <h4 className="font-bold text-[10px] uppercase tracking-wider leading-none text-slate-400 dark:text-[#b4b0a9]">
                      Step {item.s}
                    </h4>
                    <p className="text-xs font-bold mt-1.5 leading-snug">{item.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* LOGIN, FORGOT, RESET MODES: Clean, Formal Grid Option Cards */
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-4xl font-extrabold text-slate-900 dark:text-[#f2efe9] leading-tight tracking-tight">
                Welcome Back!
              </h2>
              <p className="text-slate-500 dark:text-[#b4b0a9] text-xs leading-relaxed max-w-sm">
                Connect with skilled local providers, coordinate service jobs in real-time, and manage secure transactions.
              </p>
            </div>

            {/* Active Cordova Area Badge */}
            <div className="flex">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold tracking-wide">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                <span>CORDOVA AREA NETWORK ACTIVE</span>
              </div>
            </div>

            {/* Styled Welcome Option Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-4">
              {/* Find Help Today Card */}
              <div className="p-4 rounded-2xl flex flex-col justify-between min-h-[125px] transition-all duration-300 border bg-white dark:bg-[#22211e] text-slate-950 dark:text-[#f2efe9] border-slate-200 dark:border-neutral-800 hover:border-orange-500/40 hover:scale-[1.01] shadow-sm">
                <div className="w-7 h-7 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold text-xs">
                  🔍
                </div>
                <div className="mt-4">
                  <h4 className="font-bold text-[10px] uppercase tracking-wider leading-none text-orange-600 dark:text-orange-500">Find Help Today</h4>
                  <p className="text-[11px] text-slate-400 dark:text-[#b4b0a9] mt-2 leading-relaxed">
                    Post job requests and hire skilled Cordova locals.
                  </p>
                </div>
              </div>

              {/* Offer Skills Today Card */}
              <div className="p-4 rounded-2xl flex flex-col justify-between min-h-[125px] transition-all duration-300 border bg-white dark:bg-[#22211e] text-slate-950 dark:text-[#f2efe9] border-slate-200 dark:border-neutral-800 hover:border-emerald-500/40 hover:scale-[1.01] shadow-sm">
                <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-xs">
                  🛠️
                </div>
                <div className="mt-4">
                  <h4 className="font-bold text-[10px] uppercase tracking-wider leading-none text-emerald-600 dark:text-emerald-400">Offer Skills Today</h4>
                  <p className="text-[11px] text-slate-400 dark:text-[#b4b0a9] mt-2 leading-relaxed">
                    Publish services, submit offers, and grow earnings.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
