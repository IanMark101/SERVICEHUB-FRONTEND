"use client";
import React from 'react';
import Link from 'next/link';
import {
  Compass,
  ShieldCheck,
  Award,
  Briefcase,
  CalendarCheck,
  Inbox,
  Hourglass,
  MessageSquare,
  DollarSign,
  Star,
  Bell,
  TrendingUp,
  AlertTriangle,
  HelpCircle,
  BookOpen,
} from 'lucide-react';
import HelpBreadcrumbs from '../components/HelpBreadcrumbs';
import HelpSidebar from '../components/HelpSidebar';
import HelpArticleCard from '../components/HelpArticleCard';
import { HelpCategorySlug } from '../types/help.types';
import { getCategoryBySlug, getArticlesByCategory } from '../data';
import { useApp } from '@/context/AppContext';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Compass,
  ShieldCheck,
  Award,
  Briefcase,
  CalendarCheck,
  Inbox,
  Hourglass,
  MessageSquare,
  DollarSign,
  Star,
  Bell,
  TrendingUp,
  AlertTriangle,
};

interface HelpCategoryPageProps {
  categorySlug: string;
}

export default function HelpCategoryPage({ categorySlug }: HelpCategoryPageProps) {
  const { isDark } = useApp();
  const category = getCategoryBySlug(categorySlug);
  const articles = category ? getArticlesByCategory(category.slug as HelpCategorySlug) : [];

  if (!category) {
    return (
      <div className="space-y-6 text-center py-16">
        <h1 className="text-2xl font-bold">Category Not Found</h1>
        <p className="text-xs text-slate-500">The category you requested does not exist.</p>
        <Link href="/help" className="inline-block px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold">
          Return to Help Center
        </Link>
      </div>
    );
  }

  const IconComponent = ICON_MAP[category.iconName] || HelpCircle;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <HelpBreadcrumbs items={[{ label: category.title }]} />

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Navigation Sidebar */}
        <HelpSidebar currentCategorySlug={category.slug} />

        {/* Right Main Content */}
        <div className="flex-1 w-full space-y-6">
          {/* Category Banner Card */}
          <div
            className={`rounded-[26px] p-6 sm:p-8 border shadow-xs transition-colors ${
              isDark ? 'bg-[#22211e] border-neutral-800/80' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center shadow-xs ${category.color}`}>
                <IconComponent className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500">
                  Topic Guide ({articles.length} {articles.length === 1 ? 'Article' : 'Articles'})
                </span>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-[#f2efe9]">
                  {category.title}
                </h1>
              </div>
            </div>

            <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-[#b4b0a9] font-medium max-w-2xl">
              {category.description}
            </p>
          </div>

          {/* Articles Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-neutral-800">
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-[#f2efe9] uppercase tracking-wider text-[11px]">
                Available Guides in this Section
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {articles.map((article) => (
                <HelpArticleCard
                  key={article.slug}
                  article={article}
                  showCategory={false}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
