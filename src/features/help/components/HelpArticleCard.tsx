"use client";
import React from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, FileText, Sparkles } from 'lucide-react';
import { HelpArticle } from '../types/help.types';
import { getCategoryBySlug } from '../data';

interface HelpArticleCardProps {
  article: HelpArticle;
  showCategory?: boolean;
}

export default function HelpArticleCard({ article, showCategory = true }: HelpArticleCardProps) {
  const category = getCategoryBySlug(article.category);

  return (
    <Link
      href={`/help/${article.category}/${article.slug}`}
      className="group rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between hover:shadow-md hover:scale-[1.01] bg-white dark:bg-[#22211e] border-slate-200 dark:border-neutral-800/80 hover:border-slate-300 dark:hover:border-neutral-700 text-slate-900 dark:text-[#f2efe9] shadow-xs"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          {showCategory && category && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
              {category.shortTitle || category.title}
            </span>
          )}
          <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 dark:text-neutral-500 ml-auto">
            <Clock className="w-3 h-3" />
            <span>{article.readTimeMinutes} min read</span>
          </div>
        </div>

        <h4 className="text-sm font-bold tracking-tight group-hover:text-orange-500 transition-colors flex items-center gap-1.5">
          <span>{article.title}</span>
        </h4>
        <p className="text-xs leading-relaxed text-slate-500 dark:text-neutral-400 mt-1.5 line-clamp-2">
          {article.description}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-neutral-800/80 flex items-center justify-between text-[11px] font-bold text-orange-600 dark:text-orange-400">
        <span>Read guide</span>
        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}
