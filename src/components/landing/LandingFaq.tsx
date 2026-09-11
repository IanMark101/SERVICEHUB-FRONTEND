'use client';

import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import ScrollReveal from './ScrollReveal';

interface LandingFaqProps { isDark: boolean; }

const faqs = [
  { q: 'Can I use ServiceHub before residency verification?', a: 'Yes. Limited Mode allows signed-in users to browse public marketplace content, search, view profiles, and read the Community Hub. New marketplace transactions remain unavailable until email and Cordova residency verification are approved.' },
  { q: 'How can a Seeker find help?', a: 'A Seeker can browse approved service listings and request a provider directly, or post a service request and compare offers. Every provider offer must link to that provider’s active, category-compatible service listing.' },
  { q: 'Does every booking need provider acceptance?', a: 'No. A direct on-site cash request requires provider acceptance. A successfully verified online payment creates an accepted booking and queue entry, so the provider does not accept it a second time. An accepted provider offer is already the provider’s commitment.' },
  { q: 'How does the online queue work?', a: 'Only successfully confirmed GCash Test Mode payments enter a listing-specific FCFS queue. A provider may offer several services, but may perform only one active job at a time and cannot skip the first eligible waiting entry within a service.' },
  { q: 'Does GCash send real money to a provider?', a: 'No. The capstone uses PayMongo Test Mode. PAID_HELD, RELEASED, FROZEN_HELD, and REFUNDED are internal workflow records, not legal escrow or real provider payouts. On-site cash is settled directly between the parties.' },
  { q: 'When can users message and review?', a: 'Messaging unlocks according to the booking and offer lifecycle. Reviews are created only from eligible completed-service relationships and contribute to the system’s visible reputation history under its existing rules.' },
];

export default function LandingFaq({ isDark }: LandingFaqProps) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" data-theme={isDark ? 'dark' : 'light'} className="scroll-mt-20 border-b border-stone-200 px-5 py-20 dark:border-white/10 sm:px-8 lg:px-10 lg:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
        <ScrollReveal>
          <h2 className="font-serif text-4xl font-semibold tracking-[-0.035em] text-slate-950 dark:text-white sm:text-5xl">The important details, stated plainly.</h2>
          <p className="mt-5 text-base leading-7 text-slate-600 dark:text-stone-300">These answers match the implemented capstone scope. The Help Center contains the longer workflow guides.</p>
          <Link href="/help" className="mt-7 inline-flex text-sm font-bold text-[#c86544] underline decoration-[#c86544]/30 underline-offset-4 hover:decoration-[#c86544]">Open the Help Center</Link>
        </ScrollReveal>
        <div className="divide-y divide-stone-200 border-y border-stone-200 dark:divide-white/10 dark:border-white/10">
          {faqs.map((item, index) => {
            const expanded = open === index;
            return (
              <ScrollReveal key={item.q}>
                <h3><button type="button" onClick={() => setOpen(expanded ? null : index)} className="flex w-full items-center justify-between gap-6 py-5 text-left text-sm font-extrabold text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c86544] dark:text-white" aria-expanded={expanded} aria-controls={`faq-panel-${index}`}><span>{item.q}</span><ChevronDown size={18} className={`shrink-0 text-stone-400 transition-transform ${expanded ? 'rotate-180' : ''}`} /></button></h3>
                {expanded && <div id={`faq-panel-${index}`} className="pb-6 pr-10 text-sm leading-6 text-slate-600 dark:text-stone-300">{item.a}</div>}
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
