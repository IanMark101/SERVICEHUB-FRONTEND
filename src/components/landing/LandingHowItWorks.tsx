'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowDown, BriefcaseBusiness, CheckCircle2, MessageSquare, Search, UserRoundSearch, WalletCards } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import ScrollReveal from './ScrollReveal';

type Role = 'seeker' | 'provider';

const seekerFlow = [
  {
    step: 'Discovery & Posting',
    title: 'Browse or post a request',
    description: 'Browse nearby services, or post what you need and compare offers from local providers.',
    icon: Search,
  },
  {
    step: 'Payment Choice',
    title: 'Choose an available payment option',
    description: 'Check the service terms, select a supported payment method, and follow the booking instructions.',
    icon: WalletCards,
  },
  {
    step: 'Delivery & Confirmation',
    title: 'Track and verify the work',
    description: 'Follow progress in Activity, stay in touch about the task, and confirm the result when the work is finished.',
    icon: CheckCircle2,
  },
];

const providerFlow = [
  {
    step: 'Service Listing',
    title: 'Create a service listing',
    description: 'Add your service details and operating area in Offer Services so people can discover what you do.',
    icon: BriefcaseBusiness,
  },
  {
    step: 'Request Intake',
    title: 'Respond to custom requests',
    description: 'Browse Service Requests and send an offer with the terms you propose for a specific task.',
    icon: UserRoundSearch,
  },
  {
    step: 'Delivery & Completion',
    title: 'Deliver the agreed work',
    description: 'Manage accepted bookings in Activity and send finished work for Seeker confirmation.',
    icon: MessageSquare,
  },
];

const helpLinks = [
  { href: '/help/queue/how-the-queue-works', label: 'Payment and queue rules' },
  { href: '/help/verification/why-verification-is-required', label: 'Verification and messaging' },
  { href: '/help/reviews/how-reviews-and-ratings-work', label: 'How reviews work' },
];

export default function LandingHowItWorks({ isDark }: { isDark: boolean }) {
  const [role, setRole] = useState<Role>('seeker');
  const reduce = useReducedMotion();
  const flow = role === 'seeker' ? seekerFlow : providerFlow;
  const roleColor = role === 'seeker'
    ? 'text-brand-text focus-visible:outline-brand-focus'
    : 'text-provider-hover dark:text-emerald-400 focus-visible:outline-provider-navigation';

  return (
    <section id="how-it-works" data-theme={isDark ? 'dark' : 'light'} aria-labelledby="journey-heading" className="scroll-mt-20 border-b border-black/[0.06] bg-transparent px-5 py-20 dark:border-white/10 sm:px-8 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-7xl" data-landing-anchor>
        <ScrollReveal className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <h2 id="journey-heading" className="font-sans text-3xl font-extrabold tracking-tight text-[#0a0a0a] dark:text-white sm:text-4xl lg:text-5xl lg:leading-[1.12]">
              A straightforward path from need to completed work.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-neutral-600 dark:text-zinc-400">
              Switch between Seeker and Provider to see what happens on each side.
            </p>
          </div>
          <div className="inline-grid w-fit max-w-full grid-cols-2 rounded-xl border border-slate-200 bg-white p-1 shadow-xs dark:border-zinc-800 dark:bg-charcoal" role="group" aria-label="Choose how you use ServiceHub">
            {(['seeker', 'provider'] as const).map(item => {
              const active = role === item;
              return (
                <button key={item} type="button" onClick={() => setRole(item)} aria-pressed={active} aria-controls="service-journey" className={`relative min-h-11 rounded-lg px-4 py-2 text-xs font-bold capitalize transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-4 ${item === 'seeker' ? 'focus-visible:outline-brand-focus' : 'focus-visible:outline-provider-navigation'} ${active ? 'text-white' : 'text-neutral-600 hover:text-[#0a0a0a] dark:text-zinc-400 dark:hover:text-white'}`}>
                  {active && <motion.span aria-hidden="true" layoutId="active-role-tab" className={`absolute inset-0 rounded-lg shadow-xs ${item === 'seeker' ? 'bg-seeker-primary' : 'bg-provider-navigation'}`} transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 350, damping: 30 }} />}
                  <span className="relative z-10">{item === 'seeker' ? 'Seeking services' : 'Offering services'}</span>
                </button>
              );
            })}
          </div>
        </ScrollReveal>

        <motion.ol id="service-journey" key={role} aria-label={role === 'seeker' ? 'Seeker service steps' : 'Provider service steps'} data-role={role} initial={false} animate={reduce ? undefined : { opacity: [0.85, 1] }} transition={{ duration: .25 }} className="mt-12 grid list-none gap-6 p-0 md:grid-cols-3">
          {flow.map((item, index) => {
            const Icon = item.icon;
            return (
              <li key={item.title} className="relative flex flex-col rounded-2xl border border-slate-200/90 bg-white p-7 shadow-xs dark:border-zinc-800 dark:bg-charcoal/70 sm:p-8">
                <div className="flex items-center justify-between">
                  <span className={`grid size-12 place-items-center rounded-xl ${role === 'seeker' ? 'bg-seeker-light text-brand-text dark:bg-orange-950/40' : 'bg-provider-light text-provider-hover dark:bg-emerald-950/40 dark:text-emerald-400'}`}><Icon size={22} aria-hidden="true" /></span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-neutral-600 dark:bg-charcoal dark:text-zinc-400">0{index + 1}</span>
                </div>
                <p className="mt-7 text-xs font-bold text-neutral-500 dark:text-zinc-400">{item.step}</p>
                <h3 className="mt-2 text-lg font-bold text-[#0a0a0a] dark:text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-zinc-400">{item.description}</p>
              </li>
            );
          })}
        </motion.ol>

        <nav id="queue" aria-label="Service rules" className="mt-10 flex flex-wrap gap-x-8 gap-y-3.5 border-t border-slate-200/80 pt-6 text-xs font-semibold text-neutral-600 dark:border-zinc-800 dark:text-zinc-400">
          {helpLinks.map(({ href, label }) => (
            <Link key={href} href={href} className={`group inline-flex min-h-11 items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-4 ${role === 'seeker' ? 'hover:text-brand-text focus-visible:outline-brand-focus' : 'hover:text-provider-hover dark:hover:text-emerald-400 focus-visible:outline-provider-navigation'}`}>
              <ArrowDown size={16} className={roleColor} aria-hidden="true" />{label}
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
