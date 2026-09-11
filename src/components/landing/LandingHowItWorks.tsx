'use client';

import { BadgeCheck, Banknote, BriefcaseBusiness, CheckCircle2, MessageSquare, Search, Star, UserRoundSearch, WalletCards } from 'lucide-react';
import { useState } from 'react';
import ScrollReveal from './ScrollReveal';

interface LandingHowItWorksProps { isDark: boolean; }
type Role = 'seeker' | 'provider';

const seekerFlow = [
  { title: 'Browse or post a request', description: 'Search approved service listings, or describe a job and receive offers from eligible providers.', icon: Search },
  { title: 'Choose the right payment path', description: 'On-site cash is coordinated directly. Eligible GCash Test Mode payments are confirmed by the backend before queue entry.', icon: WalletCards },
  { title: 'Track the work', description: 'Follow booking status, use booking-scoped messages, confirm completion, and review completed service.', icon: CheckCircle2 },
];
const providerFlow = [
  { title: 'Publish an approved service', description: 'Set a supported price, duration, queue capacity, and accepted GCash Test Mode or on-site cash methods.', icon: BriefcaseBusiness },
  { title: 'Receive work two ways', description: 'Handle direct service requests, or send an offer linked to one of your active, category-compatible listings.', icon: UserRoundSearch },
  { title: 'Serve the eligible booking', description: 'Accept direct cash requests when required. Start only the first eligible paid queue entry, then mark the work complete.', icon: MessageSquare },
];

export default function LandingHowItWorks({ isDark }: LandingHowItWorksProps) {
  const [role, setRole] = useState<Role>('seeker');
  const flow = role === 'seeker' ? seekerFlow : providerFlow;
  return (
    <section id="how-it-works" data-theme={isDark ? 'dark' : 'light'} className="scroll-mt-20 border-b border-stone-200 px-5 py-20 dark:border-white/10 sm:px-8 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div className="max-w-2xl"><h2 className="font-serif text-4xl font-semibold tracking-[-0.035em] text-slate-950 dark:text-white sm:text-5xl">A simple path from need to completed work.</h2><p className="mt-4 text-base leading-7 text-slate-600 dark:text-stone-300">Choose a workspace to see what the implemented flow expects from each side.</p></div>
          <div className="inline-flex w-fit rounded-xl border border-stone-200 bg-stone-100 p-1 dark:border-white/10 dark:bg-white/[0.04]" role="group" aria-label="Marketplace role">
            {(['seeker', 'provider'] as Role[]).map((item) => <button key={item} type="button" onClick={() => setRole(item)} aria-pressed={role === item} className={`rounded-lg px-5 py-2.5 text-xs font-bold capitalize transition-colors ${role === item ? (item === 'seeker' ? 'bg-[#c86544] text-white' : 'bg-emerald-600 text-white') : 'text-slate-600 hover:text-slate-950 dark:text-stone-300 dark:hover:text-white'}`}>{item}</button>)}
          </div>
        </ScrollReveal>
        <div className="mt-12 grid border-y border-stone-200 dark:border-white/10 lg:grid-cols-3">
          {flow.map((item, index) => { const Icon = item.icon; return <ScrollReveal key={item.title} className="border-b border-stone-200 px-2 py-8 last:border-b-0 lg:border-b-0 lg:border-r lg:px-8 lg:last:border-r-0 dark:border-white/10"><div className={`grid size-11 place-items-center rounded-xl ${role === 'seeker' ? 'bg-orange-50 text-[#c86544] dark:bg-orange-950/30' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'}`}><Icon size={20} /></div><p className="mt-7 text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400">{index + 1} of 3</p><h3 className="mt-2 text-lg font-extrabold text-slate-950 dark:text-white">{item.title}</h3><p className="mt-3 text-sm leading-6 text-slate-600 dark:text-stone-300">{item.description}</p></ScrollReveal>; })}
        </div>
        <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-xs font-semibold text-slate-600 dark:text-stone-300"><span className="flex items-center gap-2"><BadgeCheck size={16} className="text-emerald-600" /> Approved residency unlocks new transactions</span><span className="flex items-center gap-2"><Banknote size={16} className="text-[#c86544]" /> Cash never enters the online queue</span><span className="flex items-center gap-2"><Star size={16} className="text-amber-500" /> Reviews follow completed service</span></div>
      </div>
    </section>
  );
}
