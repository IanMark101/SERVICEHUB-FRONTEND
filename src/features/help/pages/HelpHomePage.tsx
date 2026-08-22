"use client";
import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Award,
  Hourglass,
  MessageSquare,
  DollarSign,
  Compass,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import HelpSearch from '../components/HelpSearch';
import HelpCategoryCard from '../components/HelpCategoryCard';
import { HELP_CATEGORIES } from '../data/categories';
import { getArticlesByCategory, getPopularArticles } from '../data';
import { useApp } from '@/context/AppContext';

export default function HelpHomePage() {
  const { isDark } = useApp();
  const popularArticles = getPopularArticles(5);

  const quickTopics = [
    { label: 'Residency Verification', href: '/help/verification/why-verification-is-required' },
    { label: 'Trust Score System', href: '/help/trust-reputation/what-is-trust-score' },
    { label: 'How the Queue Works', href: '/help/queue/how-the-queue-works' },
    { label: 'Direct Bookings', href: '/help/bookings/how-direct-booking-works' },
    { label: 'Messaging Rules', href: '/help/messaging/when-messaging-unlocks' },
    { label: 'Escrow Payments', href: '/help/payments/how-escrow-works' },
  ];

  return (
    <div className="space-y-12 max-w-4xl mx-auto py-4">
      {/* Hero Section */}
      <section className="text-center space-y-5 pt-4 pb-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Advice and answers from ServiceHub Cordova
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-neutral-400 max-w-lg mx-auto">
          Learn how residency verification, Trust Scores, service queues, bookings, and escrow payments work.
        </p>

        {/* Search */}
        <div className="pt-2 max-w-xl mx-auto">
          <HelpSearch size="md" autoFocus={false} />
        </div>

        {/* Quick topic tags */}
        <div className="pt-1 flex flex-wrap items-center justify-center gap-1.5 text-xs">
          <span className="text-slate-400 dark:text-neutral-500 font-medium">Popular:</span>
          {quickTopics.map((topic) => (
            <Link
              key={topic.label}
              href={topic.href}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                isDark
                  ? 'bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {topic.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Collections / Categories Grid */}
      <section className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500">
          All Collections ({HELP_CATEGORIES.length})
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

      {/* Frequently Viewed Articles */}
      <section className="space-y-4 pt-4 border-t border-slate-200 dark:border-neutral-800">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500">
          Featured Guides
        </h2>

        <div className="space-y-2">
          {popularArticles.map((article) => (
            <Link
              key={article.slug}
              href={`/help/${article.category}/${article.slug}`}
              className={`flex items-center justify-between p-4 rounded-xl border transition-colors group ${
                isDark
                  ? 'bg-[#1e1d1a] border-neutral-800/80 hover:border-neutral-700 text-neutral-200'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800 shadow-xs'
              }`}
            >
              <div className="min-w-0 pr-4">
                <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                  {article.title}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-neutral-400 line-clamp-1 mt-0.5">
                  {article.description}
                </p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>
          ))}
        </div>
      </section>

      {/* Support footer note */}
      <section className={`p-6 rounded-2xl border text-center space-y-2 ${
        isDark ? 'bg-[#181818] border-neutral-800 text-neutral-300' : 'bg-slate-50 border-slate-200 text-slate-600'
      }`}>
        <p className="text-xs font-semibold text-slate-900 dark:text-white">
          Still need assistance?
        </p>
        <p className="text-[11px] text-slate-500 dark:text-neutral-400 max-w-md mx-auto">
          Contact the Cordova Municipal Administrators regarding residency verification or dispute arbitration.
        </p>
        <a
          href="mailto:admin@servicehub-cordova.local"
          className="inline-block text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline pt-1"
        >
          admin@servicehub-cordova.local
        </a>
      </section>
    </div>
  );
}
