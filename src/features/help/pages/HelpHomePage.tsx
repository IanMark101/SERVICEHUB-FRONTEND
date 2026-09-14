"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ChatCenteredText, PlayCircle } from '@phosphor-icons/react';
import HelpSearch from '../components/HelpSearch';
import HelpCategoryCard from '../components/HelpCategoryCard';
import { HELP_CATEGORIES } from '../data/categories';
import { getArticlesByCategory, getPopularArticles } from '../data';
import { HelpCategorySlug } from '../types/help.types';
import { useApp } from '../../../context/AppContext';

const quickTopics = [
  { label: 'Residency verification', detail: 'Why local eligibility matters', href: '/help/verification/why-verification-is-required' },
  { label: 'Trust Score system', detail: 'How reputation changes over time', href: '/help/trust-reputation/what-is-trust-score' },
  { label: 'Service queues', detail: 'How first-come, first-served works', href: '/help/queue/how-the-queue-works' },
  { label: 'Direct bookings', detail: 'Request a listed service safely', href: '/help/bookings/how-direct-booking-works' },
  { label: 'Messaging rules', detail: 'When a conversation becomes available', href: '/help/messaging/when-messaging-unlocks' },
  { label: 'Payment records', detail: 'Understand internal payment holds', href: '/help/payments/how-escrow-works' },
];

const categoryGroups: Array<{
  title: string;
  description: string;
  slugs: HelpCategorySlug[];
}> = [
  {
    title: 'Start safely',
    description: 'Learn the account, verification, reputation, and safety foundations first.',
    slugs: ['getting-started', 'verification', 'trust-reputation', 'safety'],
  },
  {
    title: 'Find and arrange work',
    description: 'Understand listings, bookings, offers, queues, and transaction messaging.',
    slugs: ['services', 'bookings', 'offers-requests', 'queue', 'messaging'],
  },
  {
    title: 'Manage active work',
    description: 'Track payments, reviews, notifications, and marketplace activity.',
    slugs: ['payments', 'reviews', 'notifications', 'activity'],
  },
];

export default function HelpHomePage() {
  const { user } = useApp();
  const popularArticles = getPopularArticles(6);
  const quickTourHref = user?.role === 'provider'
    ? '/provider/browse-services?onboarding=1'
    : '/seeker/seek-services?onboarding=1';

  return (
    <div className="space-y-24 pb-4 sm:space-y-28">
      <section className="grid items-stretch gap-5 pt-3 lg:grid-cols-[1.08fr_0.92fr] lg:gap-7 lg:pt-8">
        <div className="flex min-h-[30rem] flex-col justify-center rounded-2xl border border-black/8 bg-[#fffdfa] p-7 shadow-[0_14px_40px_rgba(23,23,22,0.06)] dark:border-white/10 dark:bg-[#171716] sm:p-10 lg:p-12">
          <h1 className="max-w-[12ch] text-[clamp(2.6rem,5.1vw,4.8rem)] font-medium leading-[0.99] tracking-[-0.04em] text-[#171716] dark:text-[#f5f4f2]">
            Help for every step of local work.
          </h1>
          <p className="mt-6 max-w-[37rem] text-sm leading-6 text-[#625d57] dark:text-white/64 sm:text-base sm:leading-7">
            Find clear guidance for verification, Trust Scores, bookings, queues, messages, and payment records across ServiceHub Cordova.
          </p>
          <div className="mt-8 max-w-[39rem]">
            <HelpSearch size="lg" autoFocus={false} placeholder="What do you need help with?" />
          </div>
          {user && user.role !== 'admin' && (
            <Link
              href={quickTourHref}
              className="mt-6 inline-flex w-fit items-center gap-2 text-xs font-semibold text-[#c86544] transition-colors hover:text-[#aa5032] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c86544] dark:text-[#e18463]"
            >
              <PlayCircle size={17} aria-hidden="true" />
              Open your quick start
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          )}
        </div>

        <div className="flex flex-col rounded-2xl bg-[#171716] p-7 text-[#f5f4f2] shadow-[0_18px_45px_rgba(23,23,22,0.14)] sm:p-9 lg:p-10">
          <div className="flex items-start justify-between gap-6 border-b border-white/12 pb-5">
            <div>
              <h2 className="text-xl font-semibold tracking-[-0.025em]">Start with a common question</h2>
              <p className="mt-2 max-w-[31rem] text-xs leading-5 text-white/58">Six useful routes for the moments residents ask about most.</p>
            </div>
            <ChatCenteredText size={24} className="shrink-0 text-[#e18463]" aria-hidden="true" />
          </div>
          <div className="flex-1">
            {quickTopics.map((topic) => (
              <Link
                key={topic.label}
                href={topic.href}
                className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-white/10 py-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e18463]"
              >
                <span>
                  <span className="block text-sm font-semibold text-white/92 transition-colors group-hover:text-[#e9a58c]">{topic.label}</span>
                  <span className="mt-1 block text-[11px] leading-4 text-white/52">{topic.detail}</span>
                </span>
                <ArrowRight size={15} className="text-white/42 transition-transform group-hover:translate-x-0.5 group-hover:text-[#e18463]" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="help-collections-heading">
        <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h2 id="help-collections-heading" className="text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">Browse by what you need</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6f6a64] dark:text-white/58">Thirteen help collections, organized around the way marketplace work actually moves.</p>
          </div>
          <span className="text-xs font-medium text-[#827c75] dark:text-white/48">{HELP_CATEGORIES.length} collections</span>
        </div>

        <div className="grid items-start gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:gap-7">
          <CategoryGroup {...categoryGroups[0]} />
          <div className="grid gap-5 lg:gap-7">
            <CategoryGroup {...categoryGroups[1]} />
            <CategoryGroup {...categoryGroups[2]} />
          </div>
        </div>
      </section>

      <section aria-labelledby="frequent-guides-heading">
        <div className="mb-7 border-b border-black/10 pb-5 dark:border-white/10">
          <h2 id="frequent-guides-heading" className="text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">Frequently read guides</h2>
          <p className="mt-3 text-sm leading-6 text-[#6f6a64] dark:text-white/58">Good starting points for new residents and providers.</p>
        </div>
        <div className="grid gap-x-10 md:grid-cols-2">
          {popularArticles.map((article) => {
            const category = HELP_CATEGORIES.find((item) => item.slug === article.category);
            return (
              <Link
                key={article.slug}
                href={`/help/${article.category}/${article.slug}`}
                className="group grid grid-cols-[minmax(0,1fr)_auto] gap-5 border-b border-black/8 py-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c86544] dark:border-white/10"
              >
                <span>
                  <span className="block text-sm font-semibold tracking-[-0.015em] text-[#171716] transition-colors group-hover:text-[#c86544] dark:text-[#f5f4f2] dark:group-hover:text-[#e18463]">{article.title}</span>
                  <span className="mt-1.5 line-clamp-2 block text-xs leading-5 text-[#6f6a64] dark:text-white/58">{article.description}</span>
                  <span className="mt-3 block text-[11px] font-medium text-[#8a847d] dark:text-white/44">{category?.shortTitle || category?.title} / {article.readTimeMinutes} min read</span>
                </span>
                <ArrowRight size={16} className="mt-1 text-[#827c75] transition-transform group-hover:translate-x-0.5 group-hover:text-[#c86544]" aria-hidden="true" />
              </Link>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col items-start justify-between gap-7 rounded-2xl bg-[#171716] p-8 text-[#f5f4f2] shadow-[0_18px_45px_rgba(23,23,22,0.13)] sm:p-10 md:flex-row md:items-center">
        <div>
          <h2 className="max-w-[24ch] text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">Need help with an account or dispute?</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">Cordova Municipal Moderation can assist with residency verification reviews and dispute arbitration.</p>
        </div>
        <a
          href="mailto:admin@servicehub-cordova.local"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#c86544] px-5 py-3 text-xs font-semibold text-white transition-colors hover:bg-[#aa5032] active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fffdfa]"
        >
          Contact support
          <ArrowRight size={15} aria-hidden="true" />
        </a>
      </section>
    </div>
  );
}

function CategoryGroup({ title, description, slugs }: (typeof categoryGroups)[number]) {
  const categories = slugs
    .map((slug) => HELP_CATEGORIES.find((category) => category.slug === slug))
    .filter((category): category is NonNullable<typeof category> => Boolean(category));

  return (
    <section className="rounded-2xl border border-black/8 bg-[#fffdfa] p-6 shadow-[0_12px_32px_rgba(23,23,22,0.045)] dark:border-white/10 dark:bg-[#171716] sm:p-7">
      <h3 className="text-lg font-semibold tracking-[-0.025em]">{title}</h3>
      <p className="mt-2 max-w-xl text-xs leading-5 text-[#6f6a64] dark:text-white/58">{description}</p>
      <div className="mt-4">
        {categories.map((category) => (
          <HelpCategoryCard
            key={category.slug}
            category={category}
            articleCount={getArticlesByCategory(category.slug).length}
          />
        ))}
      </div>
    </section>
  );
}
