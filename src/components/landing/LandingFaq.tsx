'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import ScrollReveal from './ScrollReveal';

interface LandingFaqProps {
  isDark: boolean;
}

const faqs = [
  {
    q: 'Can I use ServiceHub before residency verification?',
    a: 'Yes. Limited Mode allows signed-in users to browse approved marketplace listings, search, view profiles, and read the Community Hub. New marketplace transactions remain locked until email and Cordova residency verification are officially approved.',
  },
  {
    q: 'How can a Seeker find help?',
    a: "A Seeker can browse approved service listings and request a provider directly, or post a service request and compare incoming offers. Every provider offer must link to that provider's active, category-compatible service listing.",
  },
  {
    q: 'Does every booking need provider acceptance?',
    a: "No. A direct on-site cash request requires explicit provider acceptance. A successfully verified online payment automatically creates an accepted booking and queue entry. An accepted provider offer is already the provider's formal commitment.",
  },
  {
    q: 'How does the online queue work?',
    a: 'Only successfully confirmed GCash Test Mode payments enter a listing-specific FCFS queue. A provider may offer several services, but may perform only one active job at a time and cannot skip the first eligible waiting entry within a service.',
  },
  {
    q: 'Does GCash send real money to a provider?',
    a: 'No. The capstone runs in PayMongo Test Mode. The PAID_HELD, RELEASED, FROZEN_HELD, and REFUNDED states are internal workflow simulations, not real provider payouts. On-site cash is settled directly between the parties.',
  },
  {
    q: 'When can users message and review?',
    a: "Messaging unlocks according to the booking and offer lifecycle. Reviews are created only from eligible completed-service relationships and contribute to the system's visible reputation history under its existing rules.",
  },
];

export default function LandingFaq({ isDark }: LandingFaqProps) {
  const [open, setOpen] = useState<number | null>(0);
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      id="faq"
      data-theme={isDark ? 'dark' : 'light'}
      className="scroll-mt-20 border-b border-black/[0.06] bg-transparent px-5 py-20 dark:border-white/10 sm:px-8 lg:px-10 lg:py-28"
    >
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
        <ScrollReveal>
          <h2 className="font-sans text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-4xl lg:text-5xl lg:leading-[1.12]">
            The important details, stated plainly.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-slate-600 dark:text-zinc-400">
            Clear operational answers reflecting the implemented capstone architecture for Cordova, Cebu.
          </p>
          <Link
            href="/help"
            className="mt-8 inline-flex items-center text-sm font-bold text-[#c86544] underline decoration-[#c86544]/30 underline-offset-4 hover:decoration-[#c86544] active:scale-[0.98]"
          >
            Open the Help Center
          </Link>
        </ScrollReveal>

        <div className="divide-y divide-slate-200/80 border-y border-slate-200/80 dark:divide-zinc-800 dark:border-zinc-800">
          {faqs.map((item, index) => {
            const expanded = open === index;
            return (
              <ScrollReveal key={item.q} className="py-2">
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpen(expanded ? null : index)}
                    className="flex w-full items-center justify-between gap-6 py-4.5 text-left text-sm font-bold text-slate-950 transition-colors hover:text-[#c86544] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c86544] dark:text-white dark:hover:text-orange-300"
                    aria-expanded={expanded}
                    aria-controls={`faq-panel-${index}`}
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      size={18}
                      className={`shrink-0 text-slate-400 transition-transform duration-200 ${
                        expanded ? 'rotate-180 text-[#c86544]' : ''
                      }`}
                    />
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.div
                      id={`faq-panel-${index}`}
                      initial={shouldReduceMotion ? false : { height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={shouldReduceMotion ? undefined : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="pb-5 pr-8 text-sm leading-relaxed text-slate-600 dark:text-zinc-400">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
