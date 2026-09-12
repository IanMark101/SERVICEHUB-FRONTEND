import React from 'react';
import Image from 'next/image';
import { ArrowLeft, MapPin, Moon, ShieldCheck, Sun } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AuthLeftPanelProps {
  mode: 'login' | 'signup' | 'forgot' | 'reset';
  step?: number;
  accentBg?: string;
  onBackToHome?: () => void;
}

export default function AuthLeftPanel({
  mode,
  onBackToHome,
}: AuthLeftPanelProps) {
  const { isDark, toggleTheme } = useApp();

  return (
    <aside aria-label="ServiceHub Cordova overview" className="hidden lg:flex lg:w-[46%] min-h-[100dvh] relative bg-[#f5f4f2] dark:bg-[#121211] flex-col justify-between p-8 xl:p-12 overflow-hidden border-r border-black/[0.06] dark:border-white/10 transition-colors duration-300 flex-shrink-0">

      {/* Top Header Bar */}
      <div className="relative z-10 flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="flex size-10 items-center justify-center rounded-2xl border border-neutral-200/80 bg-white/80 text-neutral-700 shadow-xs backdrop-blur-md transition-all hover:border-neutral-300 hover:bg-white active:scale-[0.98] dark:border-white/10 dark:bg-zinc-900/80 dark:text-zinc-200 cursor-pointer"
            title="Back to Landing Page"
            aria-label="Back to Landing Page"
          >
            <ArrowLeft size={18} />
          </button>

          {/* Floating Brand Pill Matching Landing Header */}
          <div className="flex items-center gap-2.5 rounded-2xl border border-neutral-200/80 bg-white/80 px-3 py-1.5 shadow-xs backdrop-blur-md dark:border-white/10 dark:bg-zinc-900/80">
            <Image
              src="/logo.svg?v=3"
              alt="ServiceHub Cordova"
              width={26}
              height={26}
              className="size-6.5 rounded-lg"
              priority
            />
            <div className="leading-none pr-1">
              <span className="block text-xs font-semibold tracking-tight text-[#0a0a0a] dark:text-white">
                ServiceHub
              </span>
              <span className="mt-0.5 block text-[8.5px] font-bold uppercase tracking-[0.2em] text-[#c86544]">
                Cordova
              </span>
            </div>
          </div>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex size-10 items-center justify-center rounded-2xl border border-neutral-200/80 bg-white/80 text-neutral-700 shadow-xs backdrop-blur-md transition-all hover:border-neutral-300 hover:bg-white active:scale-[0.98] dark:border-white/10 dark:bg-zinc-900/80 dark:text-zinc-200 cursor-pointer"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>

      {/* Main Showcase Centerpiece */}
      <div className="relative z-10 w-full max-w-lg mx-auto my-auto flex flex-col items-start text-left py-6">
        
        {/* Product context */}
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#c86544]/35 bg-[#c86544]/[0.08] px-3.5 py-1 text-[12px] font-medium tracking-tight text-[#aa5032] dark:border-orange-500/30 dark:bg-orange-950/40 dark:text-orange-300">
          <MapPin size={13} aria-hidden="true" />
          <span>Built for Cordova, Cebu</span>
        </div>

        {/* Display Title (Identical Sans Scale to Landing Hero) */}
        <h1 className="font-sans text-3xl lg:text-[2.35rem] xl:text-[2.65rem] font-semibold tracking-tight text-[#0a0a0a] dark:text-white leading-[1.08]">
          {mode === 'signup'
            ? 'One account for local help and local work.'
            : 'Welcome back to your local service community.'}
        </h1>

        {/* Subhead and Tagline */}
        <p className="mt-2.5 text-base font-normal leading-snug tracking-tight text-neutral-800 dark:text-neutral-200">
          {mode === 'signup'
            ? 'Move between Seeker and Provider workspaces without splitting your profile, verification, or trust history.'
            : 'Sign in to manage requests, service listings, messages, and booking activity under one identity.'}
        </p>

        {/* Authentic Editorial Photography Card per Design Skill Section 4.8 */}
        <div className="mt-6 w-full relative rounded-2xl overflow-hidden border border-black/[0.08] dark:border-white/10 shadow-[0_16px_36px_-12px_rgba(15,15,15,0.12)] bg-neutral-900 group">
          <div className="relative aspect-[16/10] sm:aspect-[16/9] lg:aspect-[16/10] w-full">
            <Image
              src="/images/servicehub-auth.png"
              alt="Cordova local service consultation between resident and verified tradesman"
              fill
              className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.02]"
              priority
              sizes="(min-width: 1024px) 500px, 100vw"
            />
            {/* Ambient Scrim Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

            {/* Bottom Content within Photo Card */}
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 flex flex-col justify-end text-white">
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold mb-1">
                <ShieldCheck size={14} />
                <span>One local marketplace</span>
              </div>
              <p className="text-xs sm:text-[13px] font-normal leading-relaxed text-white/90">
                Browse in Limited Mode, then complete email and residency verification before starting marketplace transactions.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Footer Assurance */}
      <div className="relative z-10 flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 pt-3 border-t border-black/[0.06] dark:border-white/10">
        <span>Cordova, Cebu, Philippines</span>
        <span>Online payments use PayMongo Test Mode</span>
      </div>
    </aside>
  );
}
