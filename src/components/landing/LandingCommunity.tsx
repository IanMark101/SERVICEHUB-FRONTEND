import Link from 'next/link';
import { ArrowRight, Megaphone, Sparkles, UsersRound } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

interface LandingCommunityProps { isDark: boolean; }
const items = [{ title: 'Community updates', copy: 'Administrator announcements and genuine database-backed milestones.', icon: Megaphone }, { title: 'Recently added', copy: 'Newly approved categories and newly public service listings.', icon: Sparkles }, { title: 'Local providers', copy: 'Public provider information shown under marketplace visibility rules.', icon: UsersRound }];

export default function LandingCommunity({ isDark }: LandingCommunityProps) {
  return (
    <section id="community" data-theme={isDark ? 'dark' : 'light'} className="scroll-mt-20 border-b border-stone-200 bg-[#20201d] px-5 py-20 text-white dark:border-white/10 sm:px-8 lg:px-10 lg:py-28"><div className="mx-auto max-w-7xl"><ScrollReveal className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end"><div><p className="text-sm font-bold text-orange-300">Community Hub</p><h2 className="mt-4 font-serif text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">See what is happening across ServiceHub Cordova.</h2></div><p className="max-w-2xl text-base leading-7 text-stone-300">The authenticated hub uses live backend data for community statistics, updates, recently added marketplace content, and visible local providers. If live data cannot be loaded, the page shows a clear unavailable state instead of a misleading count.</p></ScrollReveal><div className="mt-12 grid gap-px overflow-hidden rounded-[1.75rem] bg-white/10 md:grid-cols-3">{items.map((item) => { const Icon = item.icon; return <ScrollReveal key={item.title} className="bg-[#272724] p-7 sm:p-8"><Icon className="size-5 text-orange-300" /><h3 className="mt-7 text-lg font-extrabold">{item.title}</h3><p className="mt-3 text-sm leading-6 text-stone-300">{item.copy}</p></ScrollReveal>; })}</div><ScrollReveal className="mt-8"><Link href="/login" className="inline-flex items-center gap-2 text-sm font-bold text-white underline decoration-white/30 underline-offset-4 hover:decoration-white">Sign in to view the Community Hub <ArrowRight size={16} /></Link></ScrollReveal></div></section>
  );
}
