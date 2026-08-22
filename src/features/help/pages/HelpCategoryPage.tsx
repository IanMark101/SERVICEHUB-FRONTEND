"use client";
import React from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import HelpBreadcrumbs from '../components/HelpBreadcrumbs';
import { HelpCategorySlug } from '../types/help.types';
import { getCategoryBySlug, getArticlesByCategory } from '../data';
import { useApp } from '@/context/AppContext';

interface HelpCategoryPageProps {
  categorySlug: string;
}

export default function HelpCategoryPage({ categorySlug }: HelpCategoryPageProps) {
  const { isDark } = useApp();
  const category = getCategoryBySlug(categorySlug);
  const articles = category ? getArticlesByCategory(category.slug as HelpCategorySlug) : [];

  if (!category) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold">Collection Not Found</h1>
        <p className="text-xs text-slate-500">The collection you requested does not exist.</p>
        <Link href="/help" className="inline-block px-4 py-2 bg-orange-600 text-white rounded-lg text-xs font-bold">
          Return to Help Center
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-2 space-y-8 animate-in fade-in duration-200">
      <HelpBreadcrumbs items={[{ label: category.title }]} />

      {/* Collection Header */}
      <header className="space-y-2 pb-6 border-b border-slate-200 dark:border-neutral-800">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {category.title}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-neutral-400 leading-relaxed font-normal">
          {category.description}
        </p>
        <div className="pt-1 text-xs text-slate-400 font-medium">
          {articles.length} {articles.length === 1 ? 'article' : 'articles'} in this collection
        </div>
      </header>

      {/* Articles List */}
      <div className="space-y-3">
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/help/${article.category}/${article.slug}`}
            className={`flex items-center justify-between p-4 sm:p-5 rounded-xl border transition-colors group ${
              isDark
                ? 'bg-[#1e1d1a] border-neutral-800/80 hover:border-neutral-700 text-neutral-200'
                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800 shadow-xs'
            }`}
          >
            <div className="min-w-0 pr-4">
              <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                {article.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400 line-clamp-2 mt-1 leading-relaxed">
                {article.description}
              </p>
              <span className="inline-block text-[11px] text-slate-400 dark:text-neutral-500 mt-2 font-medium">
                {article.readTimeMinutes} min read
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all shrink-0" />
          </Link>
        ))}
      </div>

      {/* Back to all collections */}
      <div className="pt-4">
        <Link
          href="/help"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Collections</span>
        </Link>
      </div>
    </div>
  );
}
