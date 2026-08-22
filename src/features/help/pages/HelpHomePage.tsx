"use client";
import React from 'react';
import Link from 'next/link';
import {
  Compass,
  ShieldCheck,
  Award,
  Hourglass,
  MessageSquare,
  DollarSign,
  Sparkles,
  BookOpen,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import HelpSearch from '../components/HelpSearch';
import HelpCategoryCard from '../components/HelpCategoryCard';
import HelpArticleCard from '../components/HelpArticleCard';
import { HELP_CATEGORIES } from '../data/categories';
import { getArticlesByCategory, getPopularArticles } from '../data';
import { useApp } from '@/context/AppContext';

export default function HelpHomePage() {
  const { isDark } = useApp();
  const popularArticles = getPopularArticles(6);

  const quickTopics = [
    { label: 'Residency Verification', href: '/help/verification/why-verification-is-required', icon: ShieldCheck },
    { label: 'Trust Score System', href: '/help/trust-reputation/what-is-trust-score', icon: Award },
    { label: 'How the Queue Works', href: '/help/queue/how-the-queue-works', icon: Hourglass },
    { label: 'Direct Booking Steps', href: '/help/bookings/how-direct-booking-works', icon: Compass },
    { label: 'When Messaging Unlocks', href: '/help/messaging/when-messaging-unlocks', icon: MessageSquare },
    { label: 'Escrow Payments', href: '/help/payments/how-escrow-works', icon: DollarSign },
  ];

  return (
    <div className="space-y-12 sm:space-y-16 animate-in fade-in duration-300">
      {/* ─── Hero Section ────────────────────────────────────────── */}
      <section className="text-center space-y-6 pt-4 sm:pt-8 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>ServiceHub Cordova Documentation &amp; User Guides</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-[#f2efe9] leading-tight">
          How can we help you today?
        </h1>

        <p className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-[#b4b0a9] max-w-xl mx-auto font-medium">
          Everything you need to know about Cordova residency verification, Trust Scores, service queues, bookings, and payments.
        </p>

        {/* Global Search Box */}
        <div className="pt-2">
          <HelpSearch size="lg" autoFocus={false} />
        </div>

        {/* Quick Topic Chips */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs font-bold text-slate-400 dark:text-neutral-500 mr-1">
            Popular:
          </span>
          {quickTopics.map((topic) => {
            const Icon = topic.icon;
            return (
              <Link
                key={topic.label}
                href={topic.href}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all hover:scale-105 cursor-pointer ${
                  isDark
                    ? 'bg-[#22211e] border-neutral-800 text-[#d4cfc7] hover:text-white hover:border-orange-500/50'
                    : 'bg-white border-slate-200 text-slate-700 hover:text-orange-600 hover:border-orange-300 shadow-xs'
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-orange-500" />
                <span>{topic.label}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ─── Popular Guides ─────────────────────────────────────── */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-[#f2efe9]">
              Frequently Read Guides
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-400 dark:text-neutral-500">
            Top recommendations for new users
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {popularArticles.map((art) => (
            <HelpArticleCard key={art.slug} article={art} showCategory={true} />
          ))}
        </div>
      </section>

      {/* ─── Browse by Category ─────────────────────────────────── */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-[#f2efe9]">
              Browse by Category
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-400 dark:text-neutral-500">
            {HELP_CATEGORIES.length} Help Topics
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* ─── Bottom Support Banner ──────────────────────────────── */}
      <section
        className={`rounded-[28px] p-8 sm:p-10 border shadow-xs relative overflow-hidden transition-colors ${
          isDark
            ? 'bg-[#22211e] border-neutral-800/80 text-[#f2efe9]'
            : 'bg-white border-slate-200 text-slate-900 shadow-sm'
        }`}
      >
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-xl font-black tracking-tight">
              Can't find what you're looking for?
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-500 dark:text-neutral-400 font-medium">
              The ServiceHub Cordova moderation and municipal admin team is here to help with verification issues, dispute arbitration, or account inquiries.
            </p>
          </div>

          <a
            href="mailto:admin@servicehub-cordova.local"
            className="px-6 py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer shrink-0 flex items-center gap-2"
          >
            <span>Contact Municipal Support</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>
    </div>
  );
}
