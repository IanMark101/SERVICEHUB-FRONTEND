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
    q: 'Do providers need admin approval to publish a service?',
    a: 'No. Eligible Providers can publish a service themselves. If a detail does not meet the listing rules, you will be asked to correct it before trying again.',
  },
  {
    q: 'Do I need a service listing to send an offer?',
    a: 'No listing is needed for an open Seeker request. A suitable listing can prefill your offer terms. If the request is tied to a specific listing, your offer must use that listing.',
  },
  {
    q: 'Does every booking need provider acceptance?',
    a: "Not always. On-site cash requests sent directly to a Provider need that Provider's approval. For GCash Test Mode, a booking is confirmed after the payment succeeds. If you accept a Provider's offer, that offer already confirms the Provider's commitment.",
  },
  {
    q: 'Does GCash send real money to a provider?',
    a: 'No. ServiceHub currently uses PayMongo Test Mode, so no real online payment or Provider payout takes place. On-site cash is paid directly between the Seeker and Provider.',
  },
];

export default function LandingFaq({ isDark }: LandingFaqProps) {
  const [open, setOpen] = useState<number | null>(0);
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      id="faq"
      data-theme={isDark ? 'dark' : 'light'}
      className="scroll-mt-20 border-b border-black/[0.06] bg-transparent px-5 pt-16 pb-20 dark:border-white/10 sm:px-8 lg:px-10 lg:pb-28"
    >
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
        <ScrollReveal>
          <h2 className="font-sans text-3xl font-extrabold tracking-tight text-[#0a0a0a] dark:text-white sm:text-4xl lg:text-5xl lg:leading-[1.12]">
            The important details, stated plainly.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-neutral-600 dark:text-zinc-400">
            Answers to the practical questions about publishing, offers, booking acceptance, and Test Mode payments.
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
                    className="flex w-full items-center justify-between gap-6 py-4.5 text-left text-sm font-bold text-[#0a0a0a] transition-colors hover:text-[#c86544] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c86544] dark:text-white dark:hover:text-orange-300"
                    aria-expanded={expanded}
                    aria-controls={`faq-panel-${index}`}
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      size={18}
                      className={`shrink-0 text-neutral-400 transition-transform duration-200 ${
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
                      <p className="pb-5 pr-8 text-sm leading-relaxed text-neutral-600 dark:text-zinc-400">
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
