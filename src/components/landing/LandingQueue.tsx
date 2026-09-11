import { CircleDollarSign, Clock3, LockKeyhole, Play } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

interface LandingQueueProps { isDark: boolean; }
const queue = [{ label: 'Payment verified', detail: 'Backend confirms GCash Test Mode', icon: CircleDollarSign }, { label: 'Waiting', detail: 'FCFS within this service listing', icon: Clock3 }, { label: 'Eligible to start', detail: 'Only the first waiting entry may begin', icon: Play }];

export default function LandingQueue({ isDark }: LandingQueueProps) {
  return (
    <section id="queue" data-theme={isDark ? 'dark' : 'light'} className="scroll-mt-20 border-b border-stone-200 px-5 py-20 dark:border-white/10 sm:px-8 lg:px-10 lg:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-20">
        <ScrollReveal><p className="text-sm font-bold text-[#c86544]">Fair service queues</p><h2 className="mt-4 font-serif text-4xl font-semibold tracking-[-0.035em] text-slate-950 dark:text-white sm:text-5xl">First paid, first waiting, first eligible.</h2><p className="mt-5 text-base leading-7 text-slate-600 dark:text-stone-300">The queue removes guesswork for eligible online-paid work without pretending every provider has one global line.</p><div className="mt-7 flex gap-3 rounded-2xl border border-stone-200 bg-stone-100 p-5 dark:border-white/10 dark:bg-white/[0.04]"><LockKeyhole className="mt-0.5 size-5 shrink-0 text-[#c86544]" /><p className="text-xs leading-5 text-slate-600 dark:text-stone-300">On-site cash is arranged directly with the provider and never occupies online queue capacity.</p></div></ScrollReveal>
        <ScrollReveal className="rounded-[1.75rem] border border-stone-200 bg-stone-100/70 p-6 dark:border-white/10 dark:bg-[#20201d] sm:p-8"><div className="space-y-3">{queue.map((item, index) => { const Icon = item.icon; return <div key={item.label} className="grid grid-cols-[44px_1fr_auto] items-center gap-4 rounded-2xl bg-white p-4 dark:bg-white/[0.04]"><div className="grid size-11 place-items-center rounded-xl bg-orange-50 text-[#c86544] dark:bg-orange-950/30"><Icon size={18} /></div><div><p className="text-sm font-bold text-slate-950 dark:text-white">{item.label}</p><p className="mt-1 text-xs leading-5 text-slate-500 dark:text-stone-400">{item.detail}</p></div><span className="text-xs font-bold text-stone-400">0{index + 1}</span></div>; })}</div><p className="mt-6 text-xs font-semibold leading-5 text-slate-600 dark:text-stone-300">Your queue position is FCFS within this specific service. Providers can offer several services but may perform only one active job at a time.</p></ScrollReveal>
      </div>
    </section>
  );
}
