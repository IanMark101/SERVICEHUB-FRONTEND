"use client";
import React from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import HelpBreadcrumbs from '../components/HelpBreadcrumbs';
import { HelpCategorySlug } from '../types/help.types';
import { getCategoryBySlug, getArticlesByCategory } from '../data';

interface HelpCategoryPageProps {
  categorySlug: string;
}

export default function HelpCategoryPage({ categorySlug }: HelpCategoryPageProps) {
  const category = getCategoryBySlug(categorySlug);
  const articles = category ? getArticlesByCategory(category.slug as HelpCategorySlug) : [];

  if (!category) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold">Collection Not Found</h1>
        <p className="text-xs text-slate-500">The collection you requested does not exist.</p>
        <Link href="/help" className="inline-block px-4 py-2 bg-orange-600 text-white rounded-lg text-xs font-bold">
          Return to Help Center
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-200">
      <HelpBreadcrumbs items={[{ label: category.title }]} />

      {/* Collection Header */}
      <header className="space-y-3 pb-8 border-b border-slate-200 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <span className="text-xs font-extrabold uppercase tracking-wider text-orange-600 dark:text-orange-400">
            Documentation Collection
          </span>
          <span className="text-slate-300 dark:text-neutral-700">·</span>
          <span className="text-xs font-medium text-slate-500 dark:text-neutral-400">
            {articles.length} {articles.length === 1 ? 'article' : 'articles'}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          {category.title}
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-neutral-400 leading-relaxed font-normal max-w-3xl">
          {category.description}
        </p>
      </header>

      {/* Articles Grid (2-3 columns on wide screens) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/help/${article.category}/${article.slug}`}
            className="flex flex-col justify-between p-6 rounded-2xl border transition-all duration-200 group bg-white dark:bg-[#1a1916] border-slate-200 dark:border-neutral-800/80 hover:border-orange-500/60 hover:-translate-y-0.5 text-slate-800 dark:text-neutral-200 shadow-xs hover:shadow-md"
          >
            <div>
              <span className="text-[11px] font-semibold text-slate-400 dark:text-neutral-500 mb-2 block">
                {article.readTimeMinutes} min read
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                {article.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 line-clamp-3 mt-2 leading-relaxed">
                {article.description}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-neutral-800/60 flex items-center justify-between text-xs font-bold text-orange-600 dark:text-orange-400">
              <span>Read article</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      {/* Back to all collections */}
      <div className="pt-6 border-t border-slate-200 dark:border-neutral-800">
        <Link
          href="/help"
          className="inline-flex items-center gap-2 text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Collections</span>
        </Link>
      </div>
    </div>
  );
}
