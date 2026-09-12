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

        <section
          aria-label="How ServiceHub access works"
          className="mt-6 w-full overflow-hidden rounded-2xl border border-black/10 bg-[#171716] p-5 text-white shadow-[0_16px_36px_-18px_rgba(15,15,15,0.35)] dark:border-white/10"
        >
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#e18463]">
            <ShieldCheck size={15} aria-hidden="true" />
            <span>One local marketplace</span>
          </div>
          <h2 className="mt-3 max-w-md text-xl font-semibold leading-tight tracking-tight">
            Browse first. Verify when you are ready to transact.
          </h2>

          <ol className="mt-5 grid grid-cols-3 border-y border-white/10 py-4">
            {[
              ['01', 'Browse', 'Explore public services'],
              ['02', 'Verify', 'Confirm local eligibility'],
              ['03', 'Participate', 'Request or offer work'],
            ].map(([number, title, detail], index) => (
              <li
                key={number}
                className={`min-w-0 px-3 first:pl-0 last:pr-0 ${index > 0 ? 'border-l border-white/10' : ''}`}
              >
                <span className="text-[10px] font-semibold tracking-[0.16em] text-white/45">{number}</span>
                <span className="mt-1 block text-sm font-semibold">{title}</span>
                <span className="mt-1 block text-[11px] leading-snug text-white/55">{detail}</span>
              </li>
            ))}
          </ol>

          <div className="mt-4 flex items-center gap-5 text-xs font-medium">
            <span className="text-[#e18463]">Seek services</span>
            <span className="h-3 w-px bg-white/15" aria-hidden="true" />
            <span className="text-emerald-400">Offer services</span>
          </div>
        </section>

      </div>

      {/* Footer Assurance */}
      <div className="relative z-10 flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 pt-3 border-t border-black/[0.06] dark:border-white/10">
        <span>Cordova, Cebu, Philippines</span>
        <span>Online payments use PayMongo Test Mode</span>
      </div>
    </aside>
  );
}
