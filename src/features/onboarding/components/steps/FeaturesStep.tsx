import { Banknote, MessageSquareText, Star, TimerReset, TrendingUp } from 'lucide-react';
import type { OnboardingStepProps } from '../../types/onboarding.types';

const features = [
  { title: 'Trust Score', icon: TrendingUp, text: 'A shared 0–100 reputation signal shaped by verification, completed provider work, reviews, and moderated conduct.' },
  { title: 'Service Queue', icon: TimerReset, text: 'Successful online Test Mode bookings use FCFS within that listing. Wait times are estimates, and a provider performs only one active job at a time.' },
  { title: 'Messaging', icon: MessageSquareText, text: 'Booking-scoped chat unlocks after a booking is accepted, then keeps coordination and evidence connected to that job.' },
  { title: 'Payments', icon: Banknote, text: 'On-site cash is arranged directly with the provider. Eligible fixed-price GCash checkout uses PayMongo Test Mode and a simulated ServiceHub hold—not real escrow.' },
  { title: 'Reviews', icon: Star, text: 'After a service is completed, both participants can leave one review tied to that completed booking.' },
];

export default function FeaturesStep({ isDark }: OnboardingStepProps) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Core features</p>
        <h2 id="onboarding-title" className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 dark:text-[#f2efe9]">What to know before your first transaction</h2>
        <p id="onboarding-description" className="mt-2 text-sm leading-6 text-slate-600 dark:text-[#b4b0a9]">These features support trust and coordination without changing who controls each decision.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {features.map(({ title, icon: Icon, text }, index) => (
          <article key={title} className={`rounded-2xl border p-4 ${index === features.length - 1 ? 'sm:col-span-2' : ''} ${isDark ? 'border-neutral-800 bg-[#1c1b18]' : 'border-slate-200 bg-slate-50/70'}`}>
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 dark:border-neutral-700 dark:bg-[#22211e] dark:text-neutral-300"><Icon className="h-4 w-4" aria-hidden="true" /></span>
              <div><h3 className="text-sm font-bold text-slate-900 dark:text-[#f2efe9]">{title}</h3><p className="mt-1 text-xs leading-5 text-slate-600 dark:text-[#b4b0a9]">{text}</p></div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
