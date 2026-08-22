"use client";
import React from 'react';
import { BookOpen } from 'lucide-react';
import { HelpArticle } from '../types/help.types';
import HelpArticleCard from './HelpArticleCard';
import { useApp } from '@/context/AppContext';

interface RelatedArticlesProps {
  articles: HelpArticle[];
}

export default function RelatedArticles({ articles }: RelatedArticlesProps) {
  const { isDark } = useApp();

  if (!articles || articles.length === 0) return null;

  return (
    <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-neutral-800">
      <div className="flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-orange-500" />
        <h4 className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-[#f2efe9]">
          Related Help Topics
        </h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {articles.map((art) => (
          <HelpArticleCard key={art.slug} article={art} showCategory={false} />
        ))}
      </div>
    </div>
  );
}
