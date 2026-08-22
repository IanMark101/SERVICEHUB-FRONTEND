"use client";
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { HelpArticle } from '../types/help.types';
import { useApp } from '@/context/AppContext';

interface HelpArticleNavigationProps {
  prevArticle?: HelpArticle;
  nextArticle?: HelpArticle;
}

export default function HelpArticleNavigation({
  prevArticle,
  nextArticle,
}: HelpArticleNavigationProps) {
  const { isDark } = useApp();

  if (!prevArticle && !nextArticle) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
      {prevArticle ? (
        <Link
          href={`/help/${prevArticle.category}/${prevArticle.slug}`}
          className={`p-4 rounded-2xl border transition-all flex flex-col justify-between group hover:border-orange-500/50 hover:scale-[1.01] ${
            isDark ? 'bg-[#22211e] border-neutral-800/80' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500 flex items-center gap-1">
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
            <span>Previous Guide</span>
          </span>
          <span className="text-xs font-bold mt-1 text-slate-900 dark:text-[#f2efe9] group-hover:text-orange-500 transition-colors line-clamp-1">
            {prevArticle.title}
          </span>
        </Link>
      ) : (
        <div className="hidden sm:block" />
      )}

      {nextArticle && (
        <Link
          href={`/help/${nextArticle.category}/${nextArticle.slug}`}
          className={`p-4 rounded-2xl border transition-all flex flex-col justify-between items-end text-right group hover:border-orange-500/50 hover:scale-[1.01] ${
            isDark ? 'bg-[#22211e] border-neutral-800/80' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500 flex items-center gap-1">
            <span>Next Guide</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </span>
          <span className="text-xs font-bold mt-1 text-slate-900 dark:text-[#f2efe9] group-hover:text-orange-500 transition-colors line-clamp-1">
            {nextArticle.title}
          </span>
        </Link>
      )}
    </div>
  );
}
