'use client';

import React, { useState } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import ScrollReveal from './ScrollReveal';

interface LandingFaqProps {
  isDark: boolean;
}

const faqs = [
  {
    q: 'How can a Customer discover Providers?',
    a: 'Open Find Services in the Customer workspace, choose your search location and radius, then search by task or category. Compare service details, prices, reviews and Provider Trust Scores before booking. You can also post a Service Request so Providers can send you offers.',
  },
  {
    q: 'How can a Provider discover Customer requests?',
    a: 'Open Find Work in the Provider workspace and set your search location, radius and category. Review nearby tasks, budgets and schedules, then send an offer for work you can do. Open requests do not require your own service listing; a request tied to a specific listing requires that matching listing.',
  },
  {
    q: 'How do I use the map to choose a search area?',
    a: 'Select Change location and start typing a city or barangay. Matching places appear as you type; select one, or use the arrow keys and Enter. You can also choose a map pin or use your device location. Confirm the pin, choose a radius, then select Apply location to update your results. Your search pin is separate from your profile area and service address.',
  },
  {
    q: 'How does the discovery radius work?',
    a: 'Choose a radius from 0.5 to 30 km around your search pin. Presets include 0.5, 1, 2, 5, 10, 15, 20 or 30 km. Eligible physical services and requests inside that circle appear; online services and requests can appear regardless of radius. Distance is measured in a straight line, not by driving route. There is no fixed Provider travel limit; Providers decide whether to offer or accept the work.',
  },
  {
    q: 'How does ServiceHub decide which results appear first?',
    a: 'Your location, radius, search terms and category filter the results first. Services show nearest first, with higher Provider Trust Scores breaking equal-distance ties. Requests normally show nearest first, with newer requests breaking ties. High Budget and Few Offers prioritize their respective criteria instead.',
  },
  {
    q: 'What is Trust Score, and how does it change?',
    a: 'Trust Score is a reputation score from 0 to 100 for both Customers and Providers. New accounts start at 50. Approved verification, eligible confirmed and settled work, and reasoned administrator decisions can change it. Review ratings do not change trust points. The same two accounts can earn a completion reward once per rolling seven days, even when they swap roles. Your profile\u2019s Trust History shows the reason for each recorded change.',
  },
  {
    q: 'Do I need verification to book or offer services?',
    a: 'Yes. Confirm your email and submit identity or residency documents for administrator approval before posting services or requests, booking, or sending and accepting offers. You can browse in Limited Mode while completing verification. One approved account can use both workspaces, and verification documents are not shown publicly.',
  },
  {
    q: 'How do both members follow a booking\u2019s progress?',
    a: 'My Bookings shows the status in both workspaces, including when the Provider starts the job and submits the finished work. The Customer confirms completion, then the booking is saved in History and both members can leave a review. Booking chat becomes available after acceptance.',
  },
  {
    q: 'Do Providers need a paid plan?',
    a: 'Providers start with a 30-day Free plan: 1 active listing and a 10% GCash fee. Basic costs ₱99 per month for 3 listings, full analytics and an 8% fee. Pro costs ₱199 per month for unlimited listings, full analytics, eligible featured placement and a 5% fee. After expiry, renew to accept new customers; confirmed bookings remain available. Customers stay free.',
  },
  {
    q: 'How do GCash fees and cash payments work?',
    a: 'The GCash fee is deducted from the agreed booking total, including any travel charge. It is not added on top of what the Customer pays. Checkout shows the fee and Provider share before payment. Cash is paid directly to the Provider with no ServiceHub platform fee. GCash currently runs in Test Mode, so no real money is transferred.',
  },
];

export default function LandingFaq({ isDark }: LandingFaqProps) {
  const [open, setOpen] = useState<number | null>(0);
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      data-theme={isDark ? 'dark' : 'light'}
      className="scroll-mt-20 border-b border-black/[0.06] bg-transparent px-5 pt-16 pb-20 dark:border-white/10 sm:px-8 lg:px-10 lg:pb-28"
    >
      <div data-landing-anchor className="mx-auto grid w-full min-w-0 max-w-7xl gap-12 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-20">
        <ScrollReveal direction="left" distance={64}>
          <h2 id="faq-heading" className="max-w-[15ch] font-sans text-3xl font-bold tracking-tight text-[#0a0a0a] dark:text-white sm:text-4xl lg:text-5xl lg:leading-[1.12]">
            Frequently asked questions.
          </h2>
          <p className="mt-5 max-w-[42ch] text-base leading-relaxed text-neutral-600 dark:text-zinc-400">
            Find services, understand bookings and payments, and compare Provider plans.
          </p>
          <Link
            href="/help"
            className="mt-8 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-neutral-900 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-focus dark:text-zinc-100 [&_svg]:text-brand active:scale-[0.98]"
          >
            Open the Help Center <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </ScrollReveal>

        <div className="divide-y divide-slate-200/80 border-y border-slate-200/80 dark:divide-zinc-800 dark:border-zinc-800">
          {faqs.map((item, index) => {
            const expanded = open === index;
            return (
              <ScrollReveal key={item.q} className="py-2" direction="right" distance={56}>
                <h3>
                  <button
                    type="button"
                    id={`faq-question-${index}`}
                    onClick={() => setOpen(expanded ? null : index)}
                    className="flex min-h-14 w-full items-center justify-between gap-6 py-4.5 text-left text-base font-semibold leading-relaxed text-[#0a0a0a] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-focus dark:text-white"
                    aria-expanded={expanded}
                    aria-controls={`faq-panel-${index}`}
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      size={18}
                      aria-hidden="true"
                      className={`shrink-0 text-neutral-400 transition-transform duration-200 ${
                        expanded ? 'rotate-180 text-brand' : ''
                      }`}
                    />
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.div
                      id={`faq-panel-${index}`}
                      role="region"
                      aria-labelledby={`faq-question-${index}`}
                      initial={shouldReduceMotion ? false : { height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={shouldReduceMotion ? undefined : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-[74ch] pb-5 pr-6 text-sm leading-relaxed text-neutral-600 dark:text-zinc-400">
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
