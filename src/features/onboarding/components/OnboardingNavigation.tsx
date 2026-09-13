import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';

interface OnboardingNavigationProps {
  step: number;
  totalSteps: number;
  saving: boolean;
  onBack: () => void;
  onContinue: () => void;
  onSkip: () => void;
}

export default function OnboardingNavigation({ step, totalSteps, saving, onBack, onContinue, onSkip }: OnboardingNavigationProps) {
  const isLast = step === totalSteps - 1;

  return (
    <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-white px-5 py-4 dark:border-neutral-800 dark:bg-[#22211e] sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <button type="button" onClick={onSkip} disabled={saving} className="rounded-xl px-3 py-2 text-xs font-bold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 disabled:opacity-60 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100">Skip for now</button>
      <div className="flex gap-2">
        {step > 0 && (
          <button type="button" onClick={onBack} disabled={saving} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 disabled:opacity-60 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800 sm:flex-none"><ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />Back</button>
        )}
        <button type="button" onClick={onContinue} disabled={saving} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 disabled:opacity-60 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-white sm:flex-none">
          {saving ? <><Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />Saving</> : isLast ? <>Get Started<ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></> : <>Continue<ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></>}
        </button>
      </div>
    </footer>
  );
}
