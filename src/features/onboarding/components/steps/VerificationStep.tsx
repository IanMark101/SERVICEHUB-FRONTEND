import { CheckCircle2, Clock3, MailCheck, RotateCcw, ShieldCheck } from 'lucide-react';
import type { OnboardingStepProps } from '../../types/onboarding.types';

const statuses = [
  { label: 'Not Submitted', detail: 'Start when you are ready.', icon: ShieldCheck },
  { label: 'Pending Review', detail: 'An administrator is reviewing it.', icon: Clock3 },
  { label: 'Approved', detail: 'Restricted marketplace actions unlock.', icon: CheckCircle2 },
  { label: 'Rejected', detail: 'Read the reason and resubmit.', icon: RotateCcw },
];

export default function VerificationStep({ user, isDark }: OnboardingStepProps) {
  const current = user.verificationStatus || 'UNVERIFIED';
  const currentLabel = current === 'UNVERIFIED' ? 'Not Submitted' : current.replace('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink-muted">Important rules</p>
        <h2 id="onboarding-title" className="mt-2 text-2xl font-extrabold tracking-tight text-ink dark:text-white">Verification protects the local marketplace</h2>
        <p id="onboarding-description" className="mt-2 text-sm leading-6 text-ink-muted dark:text-ink-muted">
          You can browse in Limited Mode, but starting a new booking, request, offer, or listing requires a verified email and approved Cordova residency.
        </p>
      </div>

      <div className={`flex items-start gap-3 rounded-2xl border p-4 ${isDark ? 'border-neutral-800 bg-charcoal-inset' : 'border-slate-200 bg-slate-50/70'}`}>
        <MailCheck className={`mt-0.5 h-5 w-5 shrink-0 ${user.emailVerified ? 'text-emerald-600' : 'text-amber-600'}`} aria-hidden="true" />
        <div>
          <p className="text-sm font-bold text-ink dark:text-white">Email: {user.emailVerified ? 'Verified' : 'Verification needed'}</p>
          <p className="mt-1 text-xs leading-5 text-ink-muted dark:text-ink-muted">Email verification comes before residency verification and never approves residency automatically.</p>
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wide text-ink-secondary dark:text-ink-secondary">Residency status</h3>
          <span className="rounded-full border border-slate-300 px-2.5 py-1 text-[10px] font-bold text-ink-secondary dark:border-neutral-700 dark:text-ink-secondary">Current: {currentLabel}</span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {statuses.map(({ label, detail, icon: Icon }) => (
            <div key={label} className={`flex items-start gap-3 rounded-xl border px-3 py-3 ${isDark ? 'border-neutral-800' : 'border-slate-200'}`}>
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
              <div><p className="text-xs font-bold text-ink dark:text-white">{label}</p><p className="mt-0.5 text-[11px] leading-4 text-ink-muted dark:text-ink-muted">{detail}</p></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
