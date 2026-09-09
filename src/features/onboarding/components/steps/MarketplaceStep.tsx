import { ArrowRight, ListChecks, Store } from 'lucide-react';
import type { OnboardingStepProps } from '../../types/onboarding.types';

const Flow = ({ title, description, steps, icon: Icon, isDark }: {
  title: string;
  description: string;
  steps: string[];
  icon: typeof Store;
  isDark: boolean;
}) => (
  <article className={`rounded-2xl border p-4 ${isDark ? 'border-neutral-800 bg-[#1c1b18]' : 'border-slate-200 bg-slate-50/70'}`}>
    <div className="flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 dark:border-neutral-700 dark:bg-[#22211e] dark:text-neutral-300">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-[#f2efe9]">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-[#b4b0a9]">{description}</p>
      </div>
    </div>
    <ol className="mt-4 flex flex-wrap items-center gap-2" aria-label={`${title} steps`}>
      {steps.map((step, index) => (
        <li key={step} className="flex items-center gap-2">
          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:border-neutral-700 dark:bg-[#22211e] dark:text-neutral-300">{step}</span>
          {index < steps.length - 1 && <ArrowRight className="h-3 w-3 text-slate-400" aria-hidden="true" />}
        </li>
      ))}
    </ol>
  </article>
);

export default function MarketplaceStep({ isDark }: OnboardingStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">How it works</p>
        <h2 id="onboarding-title" className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 dark:text-[#f2efe9]">Two simple ways to get work done</h2>
        <p id="onboarding-description" className="mt-2 text-sm leading-6 text-slate-600 dark:text-[#b4b0a9]">Choose an existing listing or describe a custom need. Each accepted job becomes its own booking.</p>
      </div>
      <div className="space-y-3">
        <Flow
          title="Browse and book"
          description="Choose an approved listing. Cash requests wait for provider approval; successful online Test Mode payments create an accepted booking."
          steps={['Find a service', 'Request or pay', 'Provider starts', 'Confirm', 'Review']}
          icon={Store}
          isDark={isDark}
        />
        <Flow
          title="Post a request"
          description="Share the task and budget, compare offers tied to approved provider listings, then select the best fit."
          steps={['Post request', 'Receive offers', 'Select offer', 'Booking', 'Service']}
          icon={ListChecks}
          isDark={isDark}
        />
      </div>
    </div>
  );
}
