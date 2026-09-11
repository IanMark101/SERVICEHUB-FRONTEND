import { Check, Minus } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

interface LandingComparisonProps { isDark: boolean; }
const rows = [['Cordova residency gate', true], ['Unified Seeker and Provider identity', true], ['Listing-specific paid queue', true], ['Booking-linked messages and activity', true], ['Admin moderation and audit records', true]] as const;

export default function LandingComparison({ isDark }: LandingComparisonProps) {
  return (
    <section id="comparison" data-theme={isDark ? 'dark' : 'light'} className="scroll-mt-20 border-b border-stone-200 px-5 py-20 dark:border-white/10 sm:px-8 lg:px-10 lg:py-28"><div className="mx-auto max-w-5xl"><ScrollReveal className="text-center"><h2 className="font-serif text-4xl font-semibold tracking-[-0.035em] text-slate-950 dark:text-white sm:text-5xl">More than a public listing board.</h2><p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-stone-300">The value is the connected workflow around each local service relationship.</p></ScrollReveal><ScrollReveal className="mt-12 overflow-hidden rounded-[1.75rem] border border-stone-200 bg-white dark:border-white/10 dark:bg-[#20201d]"><div className="grid grid-cols-[1fr_110px_110px] border-b border-stone-200 bg-stone-100 px-5 py-4 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-400"><span>Capability</span><span className="text-center">Social post</span><span className="text-center">ServiceHub</span></div>{rows.map(([label]) => <div key={label} className="grid grid-cols-[1fr_110px_110px] items-center border-b border-stone-200 px-5 py-4 last:border-b-0 dark:border-white/10"><span className="text-sm font-semibold text-slate-800 dark:text-stone-100">{label}</span><span className="grid place-items-center text-stone-300 dark:text-stone-600"><Minus size={17} /></span><span className="grid place-items-center text-emerald-600"><Check size={18} /></span></div>)}</ScrollReveal></div></section>
  );
}
