import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

interface LandingCtaProps { isDark: boolean; onGetStarted: () => void; }

export default function LandingCta({ isDark, onGetStarted }: LandingCtaProps) {
  return (
    <section data-theme={isDark ? 'dark' : 'light'} className="px-5 py-20 sm:px-8 lg:px-10 lg:py-28"><ScrollReveal className="mx-auto grid max-w-7xl gap-8 rounded-[2rem] bg-[#c86544] px-7 py-12 text-white sm:px-12 lg:grid-cols-[1fr_auto] lg:items-end lg:px-16 lg:py-16"><div><h2 className="max-w-3xl font-serif text-4xl font-semibold leading-tight tracking-[-0.035em] sm:text-5xl">Start with one account. Choose your workspace inside.</h2><p className="mt-5 max-w-2xl text-sm leading-6 text-orange-50/90">Browse first, complete verification when you are ready to transact, and keep your local service activity under one identity.</p></div><div className="flex flex-col gap-3 sm:flex-row lg:flex-col"><button type="button" onClick={onGetStarted} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-bold text-[#a4472d] transition-colors hover:bg-orange-50">Continue to ServiceHub <ArrowRight size={16} /></button><Link href="/register" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/35 px-6 text-sm font-bold text-white transition-colors hover:bg-white/10">Create account</Link></div></ScrollReveal></section>
  );
}
