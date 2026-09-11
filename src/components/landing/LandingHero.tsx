import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, MapPin, ShieldCheck } from 'lucide-react';

interface LandingHeroProps {
  isDark: boolean;
  onGetStarted: () => void;
}

export default function LandingHero({ onGetStarted }: LandingHeroProps) {
  return (
    <section id="top" className="relative min-h-[calc(100svh-68px)] overflow-hidden border-b border-stone-200 bg-[#fbfaf7] dark:border-white/10 dark:bg-[#171715]">
      <div className="mx-auto grid min-h-[calc(100svh-68px)] max-w-7xl items-center gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[0.96fr_1.04fr] lg:gap-14 lg:px-10 lg:py-8">
        <div className="relative z-10 max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-300 lg:mb-6">
            <MapPin size={13} className="text-[#c86544]" />
            Built for Cordova, Cebu
          </div>
          <h1 className="font-serif text-[clamp(3rem,5.2vw,4.8rem)] font-semibold leading-[0.97] tracking-[-0.05em] text-slate-950 dark:text-white">
            Local help, with a clearer way to trust.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 dark:text-stone-300 sm:text-lg">
            ServiceHub connects Cordova residents with local service providers. Browse openly, complete residency verification to transact, then request, pay, queue, message, and review in one accountable marketplace.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={onGetStarted} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#c86544] px-6 text-sm font-bold text-white transition-colors hover:bg-[#b95738] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c86544]">
              Get started <ArrowRight size={17} />
            </button>
            <a href="#how-it-works" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-stone-300 bg-transparent px-6 text-sm font-bold text-slate-800 transition-colors hover:bg-white dark:border-white/15 dark:text-stone-100 dark:hover:bg-white/5">
              See how it works
            </a>
          </div>
          <div className="mt-7 grid max-w-xl gap-3 border-t border-stone-200 pt-5 text-xs leading-5 text-slate-600 dark:border-white/10 dark:text-stone-300 sm:grid-cols-2">
            <span className="flex items-start gap-2"><BadgeCheck size={17} className="mt-0.5 shrink-0 text-emerald-600" /> One identity for Seeker and Provider workspaces</span>
            <span className="flex items-start gap-2"><ShieldCheck size={17} className="mt-0.5 shrink-0 text-emerald-600" /> Limited Mode keeps browsing open before verification</span>
          </div>
        </div>

        <div className="relative min-h-[440px] lg:min-h-[clamp(460px,66vh,560px)]">
          <div className="absolute inset-0 overflow-hidden rounded-[2rem] bg-stone-200 dark:bg-stone-800">
            <Image src="/images/servicehub-hero.png" alt="A Cordova homeowner speaking with a local electrical service professional" fill sizes="(max-width: 1024px) 100vw, 48vw" className="object-cover object-center" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
          </div>
          <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/20 bg-black/65 p-5 text-white backdrop-blur-sm sm:inset-x-auto sm:left-5 sm:max-w-sm">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-200">One local marketplace</p>
            <p className="mt-2 text-sm leading-6 text-stone-100">Seek help in orange. Offer services in green. Your verification, trust, activity, and profile stay connected.</p>
            <Link href="/help" className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white">Read the Help Center <ArrowRight size={14} /></Link>
          </div>
        </div>
      </div>
    </section>
  );
}
