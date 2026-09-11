import Image from 'next/image';
import { BadgeCheck, CircleAlert, MessagesSquare } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

interface LandingTrustProps { isDark: boolean; }
const safeguards = [{ title: 'Residency verification', copy: 'Approved Cordova residency is required before users start new marketplace transactions.', icon: BadgeCheck }, { title: 'Visible trust history', copy: 'Trust changes follow documented system events, while provider ratings come from completed service reviews.', icon: CircleAlert }, { title: 'Transaction-linked messaging', copy: 'Messaging unlocks according to booking and offer rules instead of operating as an unrestricted public inbox.', icon: MessagesSquare }];

export default function LandingTrust({ isDark }: LandingTrustProps) {
  return (
    <section id="trust" data-theme={isDark ? 'dark' : 'light'} className="scroll-mt-20 border-b border-stone-200 bg-stone-100/60 px-5 py-20 dark:border-white/10 dark:bg-[#1b1b18] sm:px-8 lg:px-10 lg:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
        <ScrollReveal className="relative min-h-[520px] overflow-hidden rounded-[2rem]"><Image src="/images/servicehub-auth.png" alt="A resident and local provider reviewing completed work" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" /><p className="absolute inset-x-6 bottom-6 max-w-md text-sm font-semibold leading-6 text-white">Trust is not a decorative badge. It is connected to verification, completed work, reviews, and recorded marketplace actions.</p></ScrollReveal>
        <div><ScrollReveal><h2 className="font-serif text-4xl font-semibold tracking-[-0.035em] text-slate-950 dark:text-white sm:text-5xl">Trust signals with practical limits.</h2><p className="mt-5 text-base leading-7 text-slate-600 dark:text-stone-300">ServiceHub makes important status visible while keeping private verification proof and payment secrets out of public views.</p></ScrollReveal><div className="mt-9 divide-y divide-stone-200 border-y border-stone-200 dark:divide-white/10 dark:border-white/10">{safeguards.map((item) => { const Icon = item.icon; return <ScrollReveal key={item.title} className="flex gap-4 py-6"><Icon className="mt-0.5 size-5 shrink-0 text-emerald-600" /><div><h3 className="text-sm font-extrabold text-slate-950 dark:text-white">{item.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600 dark:text-stone-300">{item.copy}</p></div></ScrollReveal>; })}</div></div>
      </div>
    </section>
  );
}
