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
    statusClass: 'text-[#e18463]',
  },
  {
    title: 'Verify',
    detail: 'Confirm residency before marketplace activity',
    status: 'Trust gate',
    icon: ShieldCheck,
    statusClass: 'text-[#e18463]',
  },
  {
    title: 'Participate',
    detail: 'Request help or offer local work with one profile',
    status: 'Two roles',
    icon: Briefcase,
    statusClass: 'text-emerald-400',
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
      className="relative hidden min-h-[100dvh] flex-shrink-0 overflow-hidden bg-[#171716] p-5 text-[#f5f4f2] lg:flex lg:w-1/2 xl:p-7"
    >
      <div className="relative flex min-h-0 w-full flex-1 flex-col border border-white/12 bg-[#171716]">
        <header className="flex min-h-20 items-center justify-between border-b border-white/10 px-5 xl:px-7">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onBackToHome}
              className="grid size-10 cursor-pointer place-items-center rounded-xl border border-white/12 bg-white/[0.04] text-white/72 transition-colors hover:border-white/24 hover:bg-white/[0.08] hover:text-white active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e18463]"
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
                <span className="block text-xs font-semibold tracking-tight text-white">
                  ServiceHub
                </span>
                <span className="mt-1 block text-[8px] font-bold uppercase tracking-[0.2em] text-[#e18463]">
                  Cordova
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="grid size-10 cursor-pointer place-items-center rounded-xl border border-white/12 bg-white/[0.04] text-white/72 transition-colors hover:border-white/24 hover:bg-white/[0.08] hover:text-white active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e18463]"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col justify-center px-7 py-8 xl:px-10 xl:py-10">
          <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#e18463]">
            <MapPin size={14} aria-hidden="true" />
            <span>Built for Cordova, Cebu</span>
          </div>

          <h1 className="mt-7 max-w-[10.5ch] text-[clamp(2.5rem,3.45vw,3.65rem)] font-medium leading-[1.02] tracking-[-0.045em] text-[#f5f4f2]">
            {isSignup
              ? 'One account for local help and local work.'
              : 'Welcome back to your local service community.'}
          </h1>

          <p className="mt-5 max-w-[31rem] text-sm leading-6 text-white/68 xl:text-[15px]">
            {isSignup
              ? 'Move between Seeker and Provider workspaces without splitting your profile, verification, or trust history.'
              : 'Manage requests, listings, messages, and bookings under one verified local identity.'}
          </p>

          <section aria-label="How ServiceHub access works" className="mt-10 max-w-[32rem]">
            <div className="flex items-center justify-between border-b border-white/12 pb-3">
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/58">
                Marketplace access
              </h2>
              <span className="text-[10px] font-medium text-white/52">One local account</span>
            </div>

            <ol>
              {accessPath.map(({ title, detail, status, icon: Icon, statusClass }) => (
                <li
                  key={title}
                  className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-white/10 py-3.5"
                >
                  <span className="grid size-8 place-items-center rounded-lg border border-white/10 bg-white/[0.035] text-[#e18463]">
                    <Icon size={16} aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-white/92">{title}</span>
                    <span className="mt-0.5 block text-[11px] leading-4 text-white/58">{detail}</span>
                  </span>
                  <span className={`pl-2 text-[10px] font-semibold ${statusClass}`}>{status}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <footer className="grid grid-cols-2 gap-5 border-t border-white/10 px-5 py-4 text-[10px] leading-4 text-white/54 xl:px-7">
          <span>Cordova, Cebu, Philippines</span>
          <span className="text-right">Online payments use PayMongo Test Mode</span>
        </footer>
      </div>
    </aside>
  );
}
