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
    <div className="hidden md:flex md:w-1/2 h-screen relative bg-[#faf8f5] dark:bg-[#0f1115] flex-col justify-between p-12 overflow-hidden border-r border-slate-200 dark:border-slate-800 select-none transition-colors duration-300 flex-shrink-0">

      {/* Subtle Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.06)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff0c_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0c_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0"></div>

      {/* Header Bar */}
      <div className="relative z-10 flex items-center justify-between w-full">
        <div className="flex items-center gap-5">
          <button
            onClick={onBackToHome}
            className="w-10 h-10 rounded-xl bg-slate-200/40 dark:bg-slate-800/40 border border-slate-300 dark:border-slate-700 flex items-center justify-center hover:bg-slate-350/60 dark:hover:bg-slate-700 transition-all text-slate-650 dark:text-slate-300 backdrop-blur-sm focus:outline-none cursor-pointer"
            title="Back to Landing Page"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="ServiceHub Cordova Logo" 
              className="h-10 w-10 object-contain rounded-lg shadow-md"
            />
            <span className="font-bold text-xl tracking-tight text-slate-800 dark:text-white">
              ServiceHub Cordova
            </span>
          </div>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-xl bg-slate-200/40 dark:bg-slate-800/40 border border-slate-300 dark:border-slate-700 flex items-center justify-center hover:bg-slate-350/60 dark:hover:bg-slate-700 transition-all text-slate-550 dark:text-slate-400 backdrop-blur-sm focus:outline-none cursor-pointer"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      {/* Main Left Marketing/Intro Content */}
      <div className="relative z-10 w-full max-w-xl my-auto flex flex-col items-center text-center">
        {/* Marketing Info Box */}
        <div className="flex flex-col items-center space-y-3 mb-8 animate-fade-in">
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight text-center">
            {mode === 'signup' ? 'Join the ServiceHub Cordova Community' : 'Where Talent Meets Opportunity'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md leading-relaxed text-center">
            {mode === 'signup'
              ? 'Create your account to connect with verified residents of Cordova, Cebu.'
              : 'Connect with trusted local talent, request community services, or showcase your skills within the Cordova community—all through secure escrow-protected transactions.'}
          </p>
        </div>

        {/* Feature Bullets (Signup only) */}
        {mode === 'signup' && (
          <div className="flex flex-col items-start space-y-3 mx-auto mb-8 text-left text-xs text-slate-500 dark:text-[#b4b0a9] bg-white/40 dark:bg-slate-900/30 backdrop-blur-sm border border-slate-200 dark:border-slate-850 rounded-2xl p-5 shadow-sm max-w-md">
            <div className="flex items-start space-x-2">
              <span className="text-[#FF5A1F] font-bold">✓</span>
              <div>
                <strong className="text-slate-700 dark:text-slate-200">One Account</strong> — Switch between Seeker and Provider anytime.
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-[#FF5A1F] font-bold">✓</span>
              <div>
                <strong className="text-slate-700 dark:text-slate-200">Verified Community</strong> — Built exclusively for Cordova residents.
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-[#FF5A1F] font-bold">✓</span>
              <div>
                <strong className="text-slate-700 dark:text-slate-200">Safe Transactions</strong> — Resident verification and trust score system.
              </div>
            </div>
          </div>
        )}

        {/* Cordova area network badge */}
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-3.5 py-2 rounded-full w-max text-xs font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(16,185,129,0.05)] mx-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          {mode === 'signup' ? 'Verified Cordova Community' : 'Trusted Local Service Network'}
        </div>
      </div>

      {/* Footer Branding Indicator */}
      <div className="relative z-10 text-center text-[10px] text-slate-400 dark:text-slate-600 font-medium">
        © 2026 ServiceHub Cordova. All rights reserved.
      </div>
    </div>
  );
}
