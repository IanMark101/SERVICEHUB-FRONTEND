import { ArrowLeftRight, BriefcaseBusiness, Search, ShieldCheck } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

interface LandingWorkspacesProps { isDark: boolean; }

export default function LandingWorkspaces({ isDark }: LandingWorkspacesProps) {
  return (
    <section id="workspaces" data-theme={isDark ? 'dark' : 'light'} className="scroll-mt-20 border-b border-stone-200 bg-stone-100/60 px-5 py-20 dark:border-white/10 dark:bg-[#1b1b18] sm:px-8 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal className="max-w-3xl"><h2 className="font-serif text-4xl font-semibold tracking-[-0.035em] text-slate-950 dark:text-white sm:text-5xl">One resident identity. Two focused workspaces.</h2><p className="mt-5 text-base leading-7 text-slate-600 dark:text-stone-300">Switch roles without creating a second account. Profile details, residency status, trust history, messages, and activity remain connected.</p></ScrollReveal>
        <div className="mt-12 grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
          <ScrollReveal className="rounded-[1.75rem] border border-orange-200 bg-white p-7 dark:border-orange-900/50 dark:bg-[#20201d] sm:p-9"><div className="flex items-center justify-between"><div className="grid size-12 place-items-center rounded-2xl bg-orange-50 text-[#c86544] dark:bg-orange-950/30"><Search size={21} /></div><span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#c86544]">Seeker workspace</span></div><h3 className="mt-10 text-2xl font-extrabold text-slate-950 dark:text-white">Find help or describe what you need.</h3><p className="mt-4 max-w-xl text-sm leading-6 text-slate-600 dark:text-stone-300">Browse approved listings, post service requests, compare provider offers, track bookings, and confirm completed work.</p></ScrollReveal>
          <ScrollReveal className="rounded-[1.75rem] border border-emerald-200 bg-[#123129] p-7 text-white dark:border-emerald-900/70 dark:bg-[#10251f] sm:p-9"><div className="flex items-center justify-between"><div className="grid size-12 place-items-center rounded-2xl bg-white/10 text-emerald-300"><BriefcaseBusiness size={21} /></div><span className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">Provider workspace</span></div><h3 className="mt-10 text-2xl font-extrabold">Offer skills and manage accountable work.</h3><p className="mt-4 text-sm leading-6 text-emerald-50/80">Publish services for admin review, respond to jobs, manage direct requests, serve eligible queue entries, and track payment records.</p></ScrollReveal>
        </div>
        <ScrollReveal className="mt-5 flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-6 dark:border-white/10 dark:bg-[#20201d] sm:flex-row sm:items-center"><div className="grid size-11 shrink-0 place-items-center rounded-xl bg-stone-100 text-slate-700 dark:bg-white/[0.06] dark:text-stone-200"><ArrowLeftRight size={19} /></div><div className="flex-1"><p className="font-bold text-slate-950 dark:text-white">Switching changes your tools, not your identity.</p><p className="mt-1 text-sm leading-6 text-slate-600 dark:text-stone-300">The verification and trust layers follow the same account across both workspaces.</p></div><ShieldCheck size={21} className="hidden text-emerald-600 sm:block" /></ScrollReveal>
      </div>
    </section>
  );
}
