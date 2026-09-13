import { BriefcaseBusiness, Search, SwitchCamera } from 'lucide-react';
import type { OnboardingStepProps } from '../../types/onboarding.types';

export default function WelcomeStep({ isDark }: OnboardingStepProps) {
  const card = isDark ? 'border-neutral-800 bg-[#1c1b18]' : 'border-slate-200 bg-slate-50/70';

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Welcome</p>
        <h2 id="onboarding-title" className="text-2xl font-extrabold tracking-tight text-slate-950 dark:text-[#f2efe9] sm:text-3xl">
          Welcome to ServiceHub Cordova
        </h2>
        <p id="onboarding-description" className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-[#b4b0a9]">
          ServiceHub connects Cordova residents with trusted local service providers through one community marketplace.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className={`rounded-2xl border p-4 ${card}`}>
          <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400">
            <Search className="h-4 w-4" aria-hidden="true" />
          </span>
          <h3 className="text-sm font-bold text-slate-900 dark:text-[#f2efe9]">Seeker</h3>
          <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-[#b4b0a9]">Find local services, post a request, compare provider offers, and manage your bookings.</p>
        </div>
        <div className={`rounded-2xl border p-4 ${card}`}>
          <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
            <BriefcaseBusiness className="h-4 w-4" aria-hidden="true" />
          </span>
          <h3 className="text-sm font-bold text-slate-900 dark:text-[#f2efe9]">Provider</h3>
          <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-[#b4b0a9]">Offer approved services, respond to open requests, and manage accepted work.</p>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-slate-200 px-4 py-3 dark:border-neutral-800">
        <SwitchCamera className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
        <p className="text-xs leading-5 text-slate-600 dark:text-[#b4b0a9]">
          You keep one identity, profile, verification status, and Trust Score. Switch workspaces whenever your goal changes.
        </p>
      </div>
    </div>
  );
}
