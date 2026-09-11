import Image from 'next/image';
import { ArrowLeft, Moon, Sun } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AuthLeftPanelProps {
  mode: 'login' | 'signup' | 'forgot' | 'reset';
  step: number;
  accentBg: string;
  onBackToHome?: () => void;
}

export default function AuthLeftPanel({ mode, onBackToHome }: AuthLeftPanelProps) {
  const { isDark, toggleTheme } = useApp();
  const isSignup = mode === 'signup';

  return (
    <aside className="relative hidden min-h-[100dvh] overflow-hidden border-r border-black/10 bg-stone-900 md:flex md:flex-col">
      <Image src="/images/servicehub-auth.png" alt="A Cordova resident reviewing a home repair with a local service provider" fill sizes="45vw" className="object-cover object-center" priority />
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/20 to-black/85" />

      <div className="relative z-10 flex items-center justify-between p-8 lg:p-10">
        <button type="button" onClick={onBackToHome} className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-black/25 px-3 py-2.5 text-xs font-bold text-white backdrop-blur-sm transition-colors hover:bg-black/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" aria-label="Back to landing page">
          <ArrowLeft size={16} /> Home
        </button>
        <button type="button" onClick={toggleTheme} className="grid size-10 place-items-center rounded-xl border border-white/20 bg-black/25 text-white backdrop-blur-sm transition-colors hover:bg-black/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
          {isDark ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>

      <div className="relative z-10 mt-auto max-w-xl p-8 text-white lg:p-10">
        <div className="mb-6 flex items-center gap-3">
          <Image src="/logo.svg" alt="" width={42} height={42} className="size-10 rounded-xl" />
          <div>
            <p className="text-sm font-extrabold">ServiceHub Cordova</p>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-200">Local service marketplace</p>
          </div>
        </div>
        <h1 className="max-w-lg font-serif text-4xl font-semibold leading-[1.05] tracking-[-0.035em] lg:text-5xl">
          {isSignup ? 'One account for local work and local help.' : 'Welcome back to your Cordova community.'}
        </h1>
        <p className="mt-5 max-w-lg text-sm leading-6 text-stone-200 lg:text-base lg:leading-7">
          {isSignup
            ? 'Create one identity, then move between Seeker and Provider workspaces without splitting your profile, verification, or trust history.'
            : 'Continue as a Seeker or Provider with your profile, verification, bookings, messages, and activity kept together.'}
        </p>
        <p className="mt-8 border-t border-white/20 pt-5 text-xs leading-5 text-stone-300">
          Marketplace transactions require verified email and approved Cordova residency. Browsing remains available in Limited Mode.
        </p>
      </div>
    </aside>
  );
}
