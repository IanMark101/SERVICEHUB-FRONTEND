import React from 'react';
import Image from 'next/image';
import {
  ArrowLeft,
  Briefcase,
  Compass,
  MapPin,
  Moon,
  ShieldCheck,
  Sun,
} from '@phosphor-icons/react';
import { useApp } from '../../context/AppContext';

interface AuthLeftPanelProps {
  mode: 'login' | 'signup' | 'forgot' | 'reset';
  step?: number;
  accentBg?: string;
  onBackToHome?: () => void;
}

const accessPath = [
  {
    title: 'Browse',
    detail: 'Explore public services before signing in',
    status: 'Open access',
    icon: Compass,
    statusClass: 'text-[#c86544] dark:text-[#e18463]',
  },
  {
    title: 'Verify',
    detail: 'Confirm residency before marketplace activity',
    status: 'Trust gate',
    icon: ShieldCheck,
    statusClass: 'text-[#c86544] dark:text-[#e18463]',
  },
  {
    title: 'Participate',
    detail: 'Request help or offer local work with one profile',
    status: 'Two roles',
    icon: Briefcase,
    statusClass: 'text-emerald-700 dark:text-emerald-400',
  },
];

export default function AuthLeftPanel({
  mode,
  onBackToHome,
}: AuthLeftPanelProps) {
  const { isDark, toggleTheme } = useApp();
  const isSignup = mode === 'signup';

  return (
    <aside
      aria-label="ServiceHub Cordova overview"
      className="relative hidden min-h-[100dvh] flex-shrink-0 overflow-hidden bg-[#f5f4f2] p-5 text-[#171716] lg:flex lg:w-1/2 dark:bg-[#121211] dark:text-[#f5f4f2] xl:p-7"
    >
      <div className="relative flex min-h-0 w-full flex-1 flex-col rounded-2xl border border-black/8 bg-[#fffdfa] shadow-[0_18px_48px_rgba(23,23,22,0.07)] dark:border-white/10 dark:bg-[#171716] dark:shadow-none">
        <header className="flex min-h-20 items-center justify-between border-b border-black/8 px-5 dark:border-white/10 xl:px-7">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onBackToHome}
              className="grid size-10 cursor-pointer place-items-center rounded-xl border border-black/10 bg-[#f5f4f2] text-[#625d57] transition-colors hover:border-black/20 hover:text-[#171716] active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c86544] dark:border-white/12 dark:bg-white/[0.04] dark:text-white/68 dark:hover:border-white/24 dark:hover:text-white"
              title="Back to Landing Page"
              aria-label="Back to Landing Page"
            >
              <ArrowLeft size={18} aria-hidden="true" />
            </button>

            <div className="flex items-center gap-2.5">
              <Image
                src="/logo.svg?v=3"
                alt="ServiceHub Cordova"
                width={30}
                height={30}
                className="size-[30px] rounded-lg"
                priority
              />
              <div className="leading-none">
                <span className="block text-xs font-semibold tracking-tight text-[#171716] dark:text-white">
                  ServiceHub
                </span>
                <span className="mt-1 block text-[8px] font-bold uppercase tracking-[0.2em] text-[#c86544] dark:text-[#e18463]">
                  Cordova
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="grid size-10 cursor-pointer place-items-center rounded-xl border border-black/10 bg-[#f5f4f2] text-[#625d57] transition-colors hover:border-black/20 hover:text-[#171716] active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c86544] dark:border-white/12 dark:bg-white/[0.04] dark:text-white/68 dark:hover:border-white/24 dark:hover:text-white"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col justify-center px-7 py-8 xl:px-11 xl:py-10">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#d49b86]/55 bg-[#faf5f2] px-3 py-1.5 text-[11px] font-medium text-[#aa5032] dark:border-[#e18463]/35 dark:bg-[#e18463]/8 dark:text-[#e9a58c]">
            <MapPin size={14} aria-hidden="true" />
            <span>Built for Cordova, Cebu</span>
          </div>

          <h1 className="mt-7 max-w-[15ch] text-[clamp(2.35rem,3.05vw,3.25rem)] font-medium leading-[1.02] tracking-[-0.04em] text-[#171716] dark:text-[#f5f4f2]">
            {isSignup
              ? 'One account for local help and local work.'
              : 'Welcome back to your local service community.'}
          </h1>

          <p className="mt-5 max-w-[32rem] text-sm leading-6 text-[#625d57] dark:text-white/64 xl:text-[15px]">
            {isSignup
              ? 'Move between Seeker and Provider workspaces without splitting your profile, verification, or trust history.'
              : 'Manage requests, listings, messages, and bookings under one verified local identity.'}
          </p>

          <section aria-label="How ServiceHub access works" className="mt-9 max-w-[33rem] rounded-2xl border border-black/8 bg-[#f5f4f2] px-5 shadow-[0_10px_28px_rgba(23,23,22,0.04)] dark:border-white/10 dark:bg-white/[0.035] dark:shadow-none">
            <div className="flex items-center justify-between border-b border-black/8 py-4 dark:border-white/10">
              <h2 className="text-xs font-semibold text-[#171716] dark:text-white/88">
                How access works
              </h2>
              <span className="text-[10px] font-medium text-[#827c75] dark:text-white/48">One local account</span>
            </div>

            <ol>
              {accessPath.map(({ title, detail, status, icon: Icon, statusClass }) => (
                <li
                  key={title}
                  className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-black/8 py-3.5 last:border-b-0 dark:border-white/10"
                >
                  <span className="grid size-8 place-items-center rounded-lg bg-[#fffdfa] text-[#c86544] dark:bg-white/[0.055] dark:text-[#e18463]">
                    <Icon size={16} aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-[#171716] dark:text-white/90">{title}</span>
                    <span className="mt-0.5 block text-[11px] leading-4 text-[#6f6a64] dark:text-white/56">{detail}</span>
                  </span>
                  <span className={`pl-2 text-[10px] font-semibold ${statusClass}`}>{status}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <footer className="grid grid-cols-2 gap-5 border-t border-black/8 px-5 py-4 text-[10px] leading-4 text-[#827c75] dark:border-white/10 dark:text-white/48 xl:px-7">
          <span>Cordova, Cebu, Philippines</span>
          <span className="text-right">Online payments use PayMongo Test Mode</span>
        </footer>
      </div>
    </aside>
  );
}
