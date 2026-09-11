import React from 'react';
import Image from 'next/image';
import { ArrowLeft, Sun, Moon, ShieldCheck, CheckCircle2, MapPin } from 'lucide-react';
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
    <aside aria-label="Branding and community overview" className="hidden md:flex md:w-1/2 min-h-screen relative bg-[#f5f4f2] dark:bg-[#121211] flex-col justify-between p-6 lg:p-10 xl:p-12 overflow-y-auto border-r border-black/[0.06] dark:border-white/10 select-none transition-colors duration-300 flex-shrink-0">

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
        
        {/* Top Active Eyebrow Pill (Exact Landing Hero Spec) */}
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#c86544]/35 bg-[#c86544]/[0.08] px-3.5 py-1 text-[12px] font-medium tracking-tight text-[#aa5032] dark:border-orange-500/30 dark:bg-orange-950/40 dark:text-orange-300">
          <span className="relative flex size-1.5">
            <span className="absolute inset-0 animate-ping rounded-full bg-[#c86544]/70" />
            <span className="relative inline-flex size-1.5 rounded-full bg-[#c86544]" />
          </span>
          <span>{mode === 'signup' ? 'Civic registration open' : 'Cordova verified network active'}</span>
        </div>

        {/* Display Title (Identical Sans Scale to Landing Hero) */}
        <h1 className="font-sans text-3xl lg:text-[2.35rem] xl:text-[2.65rem] font-semibold tracking-tight text-[#0a0a0a] dark:text-white leading-[1.08]">
          {mode === 'signup'
            ? 'Join your local Cordova service community.'
            : 'Local service work, with a clearer way to trust.'}
        </h1>

        {/* Subhead and Tagline */}
        <p className="mt-2.5 text-base font-normal leading-snug tracking-tight text-neutral-800 dark:text-neutral-200">
          {mode === 'signup'
            ? 'One verified account connects you to honest queues, transparent rates, and trusted neighbors.'
            : 'Transparent rates, honest online queues, and accountable payments in one local marketplace.'}
        </p>
        <p className="mt-1.5 text-sm font-medium text-[#c86544] dark:text-orange-400">
          Less guesswork, genuine local accountability.
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

            {/* Floating Status Pill on Top Right of Photo */}
            <div className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[10.5px] font-medium text-white backdrop-blur-md border border-white/20 shadow-xs">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
              </span>
              <span>Poblacion &middot; Active</span>
            </div>

            {/* Bottom Content within Photo Card */}
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 flex flex-col justify-end text-white">
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold mb-1">
                <ShieldCheck size={14} />
                <span>Cordova Resident & Trades Network</span>
              </div>
              <p className="text-xs sm:text-[13px] font-normal leading-relaxed text-white/90">
                &ldquo;Direct booking with verified neighbors and fair queue sequence without social post-bumping.&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* 3 Civic Pillars Grid (Clean, structured, purposeful density) */}
        <div className="mt-4 w-full grid grid-cols-3 gap-2 sm:gap-2.5 text-left">
          <div className="rounded-xl border border-black/[0.06] bg-white/80 dark:border-white/10 dark:bg-zinc-900/60 p-2.5 backdrop-blur-xs">
            <div className="flex items-center gap-1.5">
              <MapPin size={13} className="text-[#c86544]" />
              <p className="font-mono text-xs font-bold text-[#0a0a0a] dark:text-white">14</p>
            </div>
            <p className="mt-1 text-[11px] font-semibold text-neutral-800 dark:text-neutral-200 leading-tight">
              Barangays
            </p>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
              Cordova-wide
            </p>
          </div>

          <div className="rounded-xl border border-black/[0.06] bg-white/80 dark:border-white/10 dark:bg-zinc-900/60 p-2.5 backdrop-blur-xs">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400" />
              <p className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">100%</p>
            </div>
            <p className="mt-1 text-[11px] font-semibold text-neutral-800 dark:text-neutral-200 leading-tight">
              Verified
            </p>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
              Residency gate
            </p>
          </div>

          <div className="rounded-xl border border-black/[0.06] bg-white/80 dark:border-white/10 dark:bg-zinc-900/60 p-2.5 backdrop-blur-xs">
            <div className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-[#c86544]" />
              <p className="font-mono text-xs font-bold text-[#c86544]">FCFS</p>
            </div>
            <p className="mt-1 text-[11px] font-semibold text-neutral-800 dark:text-neutral-200 leading-tight">
              Fair Queue
            </p>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
              Protected escrow
            </p>
          </div>
        </div>

      </div>

      {/* Footer Assurance */}
      <div className="relative z-10 flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 pt-3 border-t border-black/[0.06] dark:border-white/10">
        <span>Cordova, Cebu, Philippines</span>
        <span>Hyperlocal Verified Marketplace</span>
      </div>
    </aside>
  );
}
