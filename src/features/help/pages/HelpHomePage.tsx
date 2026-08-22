"use client";
import React from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import HelpSearch from '../components/HelpSearch';
import HelpCategoryCard from '../components/HelpCategoryCard';
import { HELP_CATEGORIES } from '../data/categories';
import { getArticlesByCategory, getPopularArticles } from '../data';

export default function HelpHomePage() {
  const popularArticles = getPopularArticles(6);

  const quickTopics = [
    { label: 'Residency Verification', href: '/help/verification/why-verification-is-required' },
    { label: 'Trust Score System', href: '/help/trust-reputation/what-is-trust-score' },
    { label: 'How the Queue Works', href: '/help/queue/how-the-queue-works' },
    { label: 'Direct Bookings', href: '/help/bookings/how-direct-booking-works' },
    { label: 'Messaging Rules', href: '/help/messaging/when-messaging-unlocks' },
    { label: 'Escrow Payments', href: '/help/payments/how-escrow-works' },
  ];

  return (
    <div className="space-y-14 sm:space-y-18 w-full py-4 sm:py-6">
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-4 pb-2 max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          Advice and answers from ServiceHub Cordova
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-neutral-300 max-w-2xl mx-auto leading-relaxed font-normal">
          Learn how Cordova residency verification, Trust Scores, service queues, direct bookings, and escrow payments work.
        </p>

        {/* Big Prominent Search Bar */}
        <div className="pt-3 w-full">
          <HelpSearch size="lg" autoFocus={false} />
        </div>

        {/* Quick Topic Chips */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-slate-400 dark:text-neutral-500 font-bold uppercase tracking-wider text-[11px] mr-1">
            Popular Topics:
          </span>
          {quickTopics.map((topic) => (
            <Link
              key={topic.label}
              href={topic.href}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all bg-white dark:bg-[#1e1d1a] border border-slate-200 dark:border-neutral-800 hover:border-orange-500/60 dark:hover:border-orange-500/60 text-slate-700 dark:text-neutral-200 shadow-2xs hover:scale-105 cursor-pointer"
            >
              {topic.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Collections / Categories Grid (Spans full wide layout: 4 columns on large screens) */}
      <section className="space-y-5">
        <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-neutral-800">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
            All Collections ({HELP_CATEGORIES.length})
          </h2>
          <span className="text-xs text-slate-400 dark:text-neutral-500 font-medium">
            Browse guides by feature area
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
          {HELP_CATEGORIES.map((category) => {
            const count = getArticlesByCategory(category.slug).length;
            return (
              <HelpCategoryCard
                key={category.slug}
                category={category}
                articleCount={count}
              />
            );
          })}
        </div>
      </section>

      {/* Frequently Viewed Articles (3-Column Grid) */}
      <section className="space-y-5 pt-4 border-t border-slate-200 dark:border-neutral-800">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
            Frequently Read Guides
          </h2>
          <span className="text-xs text-slate-400 dark:text-neutral-500 font-medium">
            Recommended for new users
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {popularArticles.map((article) => (
            <Link
              key={article.slug}
              href={`/help/${article.category}/${article.slug}`}
              className="flex flex-col justify-between p-5 rounded-2xl border transition-all duration-200 group bg-white dark:bg-[#1e1d1a] border-slate-200 dark:border-neutral-800/80 hover:border-orange-500/60 text-slate-800 dark:text-neutral-200 shadow-xs hover:shadow-sm"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 block mb-2">
                  {article.category.replace('-', ' ')}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                  {article.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-neutral-400 line-clamp-2 mt-2 leading-relaxed">
                  {article.description}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-neutral-800/60 flex items-center justify-between text-xs font-semibold text-orange-600 dark:text-orange-400">
                <span>Read article</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Support footer banner */}
      <section className="p-8 sm:p-10 rounded-3xl border bg-white dark:bg-[#161616] border-slate-200 dark:border-neutral-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
            Still need assistance with your account?
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 max-w-xl">
            Our Cordova Municipal Moderation team is available to assist with residency verification audits and dispute arbitration.
          </p>
        </div>
        <a
          href="mailto:admin@servicehub-cordova.local"
          className="px-5 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs transition-colors shadow-xs shrink-0 flex items-center gap-2 cursor-pointer"
        >
          <span>Contact Municipal Support</span>
          <ArrowRight className="w-4 h-4" />
        </a>
      </section>
    </div>
  );
}
