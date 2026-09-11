import { ArrowDown, CheckCircle2 } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

interface LandingProblemProps { isDark: boolean; }

const outcomes = [
  'Know whether a resident has been verified before transacting',
  'See the status of a request, booking, queue, or review in one place',
  'Keep Seeker and Provider activity connected to one accountable identity',
];

export default function LandingProblem({ isDark }: LandingProblemProps) {
  return (
    <section id="problem" data-theme={isDark ? 'dark' : 'light'} className="scroll-mt-20 border-b border-stone-200 bg-stone-100/60 px-5 py-20 dark:border-white/10 dark:bg-[#1b1b18] sm:px-8 lg:px-10 lg:py-28">
      <ScrollReveal className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div>
          <p className="text-sm font-bold text-[#c86544]">Why ServiceHub exists</p>
          <h2 className="mt-4 max-w-lg font-serif text-4xl font-semibold leading-tight tracking-[-0.035em] text-slate-950 dark:text-white sm:text-5xl">Local service work deserves more structure than a social post.</h2>
        </div>
        <div className="lg:pt-10">
          <p className="max-w-2xl text-base leading-7 text-slate-600 dark:text-stone-300">ServiceHub brings discovery, verification, service requests, provider offers, bookings, messages, completion, and reviews into one understandable path for Cordova residents.</p>
          <div className="mt-8 divide-y divide-stone-200 border-y border-stone-200 dark:divide-white/10 dark:border-white/10">
            {outcomes.map((outcome) => <div key={outcome} className="flex items-start gap-4 py-5"><CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" /><span className="text-sm font-semibold leading-6 text-slate-800 dark:text-stone-100">{outcome}</span></div>)}
          </div>
          <a href="#how-it-works" className="mt-7 inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-[#c86544] dark:text-stone-200"><ArrowDown size={15} /> Follow the marketplace flow</a>
        </div>
      </ScrollReveal>
    </section>
  );
}
