import { useEffect, useRef, useState } from 'react';
import type { UserSession } from '../../../components/auth/LoginContainer';
import type { MarketplaceWorkspace, OnboardingDestination } from '../types/onboarding.types';
import FeaturesStep from './steps/FeaturesStep';
import MarketplaceStep from './steps/MarketplaceStep';
import ProfileStep from './steps/ProfileStep';
import VerificationStep from './steps/VerificationStep';
import WelcomeStep from './steps/WelcomeStep';
import OnboardingNavigation from './OnboardingNavigation';

interface OnboardingDialogProps {
  user: UserSession;
  workspace: MarketplaceWorkspace;
  isDark: boolean;
  saving: boolean;
  onSkip: () => void;
  onComplete: () => void;
  onNavigate: (destination: OnboardingDestination) => void;
}

const TOTAL_STEPS = 5;

export default function OnboardingDialog({ user, workspace, isDark, saving, onSkip, onComplete, onNavigate }: OnboardingDialogProps) {
  const [step, setStep] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleFocusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    titleFocusRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape' && !saving) {
      event.preventDefault();
      onSkip();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])');
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const common = { user, workspace, isDark };
  const content = [
    <WelcomeStep key="welcome" {...common} />,
    <MarketplaceStep key="marketplace" {...common} />,
    <VerificationStep key="verification" {...common} />,
    <FeaturesStep key="features" {...common} />,
    <ProfileStep key="profile" {...common} saving={saving} onOpenProfile={() => onNavigate('profile')} onOpenVerification={() => onNavigate('verification')} />,
  ][step];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 p-3 backdrop-blur-sm sm:p-6" role="presentation">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        aria-describedby="onboarding-description"
        onKeyDown={handleKeyDown}
        className={`flex max-h-[calc(100dvh-1.5rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border shadow-2xl sm:max-h-[calc(100dvh-3rem)] ${isDark ? 'border-neutral-800 bg-[#22211e]' : 'border-slate-200 bg-white'}`}
      >
        <div ref={titleFocusRef} tabIndex={-1} className="sr-only">ServiceHub first-time orientation</div>
        <header className="border-b border-slate-200 px-5 py-4 dark:border-neutral-800 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Getting started</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-neutral-400">{step + 1} of {TOTAL_STEPS}</p>
            </div>
            <div className="flex items-center gap-1.5" role="progressbar" aria-label="Onboarding progress" aria-valuemin={1} aria-valuemax={TOTAL_STEPS} aria-valuenow={step + 1}>
              {Array.from({ length: TOTAL_STEPS }, (_, index) => <span key={index} className={`h-1.5 rounded-full transition-all ${index <= step ? 'w-7 bg-slate-900 dark:bg-neutral-100' : 'w-4 bg-slate-200 dark:bg-neutral-700'}`} />)}
            </div>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">{content}</div>

        <OnboardingNavigation
          step={step}
          totalSteps={TOTAL_STEPS}
          saving={saving}
          onBack={() => setStep((current) => Math.max(0, current - 1))}
          onContinue={() => step === TOTAL_STEPS - 1 ? onComplete() : setStep((current) => Math.min(TOTAL_STEPS - 1, current + 1))}
          onSkip={onSkip}
        />
      </div>
    </div>
  );
}
