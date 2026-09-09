import { Check, Circle, ShieldCheck, UserRound } from 'lucide-react';
import type { OnboardingStepProps } from '../../types/onboarding.types';

interface ProfileStepProps extends OnboardingStepProps {
  onOpenProfile: () => void;
  onOpenVerification: () => void;
  saving: boolean;
}

export default function ProfileStep({ user, isDark, onOpenProfile, onOpenVerification, saving }: ProfileStepProps) {
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
  const profileItems = [
    { label: 'Full name', complete: Boolean(fullName) },
    { label: 'Phone number', complete: Boolean(user.phone?.trim()) },
    { label: 'Cordova location', complete: Boolean(user.location?.trim()) },
    { label: 'Profile photo', complete: Boolean(user.avatarUrl?.trim()), optional: true },
    { label: 'Short bio', complete: Boolean(user.bio?.trim()), optional: true },
  ];
  const verificationApproved = user.verificationStatus === 'APPROVED';

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Your profile</p>
        <h2 id="onboarding-title" className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 dark:text-[#f2efe9]">Start with a clear, trustworthy profile</h2>
        <p id="onboarding-description" className="mt-2 text-sm leading-6 text-slate-600 dark:text-[#b4b0a9]">We use what you already provided. Optional details can be added later, and verification remains a separate secure process.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <section className={`rounded-2xl border p-4 ${isDark ? 'border-neutral-800 bg-[#1c1b18]' : 'border-slate-200 bg-slate-50/70'}`} aria-labelledby="profile-checklist-title">
          <div className="mb-3 flex items-center gap-2"><UserRound className="h-4 w-4 text-slate-500" aria-hidden="true" /><h3 id="profile-checklist-title" className="text-sm font-bold text-slate-900 dark:text-[#f2efe9]">Profile checklist</h3></div>
          <ul className="space-y-2">
            {profileItems.map((item) => (
              <li key={item.label} className="flex items-center gap-2 text-xs text-slate-600 dark:text-[#b4b0a9]">
                {item.complete ? <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" /> : <Circle className="h-4 w-4 text-slate-400" aria-hidden="true" />}
                <span>{item.label}{item.optional ? ' (optional)' : ''}</span>
              </li>
            ))}
          </ul>
          <button type="button" disabled={saving} onClick={onOpenProfile} className="mt-4 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 disabled:opacity-60 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800">Review profile</button>
        </section>

        <section className={`rounded-2xl border p-4 ${isDark ? 'border-neutral-800 bg-[#1c1b18]' : 'border-slate-200 bg-slate-50/70'}`} aria-labelledby="verification-next-title">
          <div className="mb-3 flex items-center gap-2"><ShieldCheck className={`h-4 w-4 ${verificationApproved ? 'text-emerald-600' : 'text-amber-600'}`} aria-hidden="true" /><h3 id="verification-next-title" className="text-sm font-bold text-slate-900 dark:text-[#f2efe9]">Residency verification</h3></div>
          <p className="text-xs leading-5 text-slate-600 dark:text-[#b4b0a9]">{verificationApproved ? 'Your Cordova residency is approved. Marketplace actions remain subject to normal booking and account rules.' : 'Complete this when you are ready to book, post requests, submit offers, or publish a listing.'}</p>
          {!verificationApproved && (
            <button type="button" disabled={saving} onClick={onOpenVerification} className="mt-4 w-full rounded-xl bg-slate-950 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 disabled:opacity-60 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-white">Complete verification</button>
          )}
        </section>
      </div>
    </div>
  );
}
