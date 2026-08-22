"use client";
import React from 'react';
import Link from 'next/link';
import HelpArticleLayout from '../components/HelpArticleLayout';
import HelpSidebar from '../components/HelpSidebar';
import { getArticleByCategoryAndSlug, getArticlesByCategory, getArticleBySlug } from '../data';
import { HelpCategorySlug } from '../types/help.types';
import { ArrowLeft } from 'lucide-react';

interface HelpArticlePageProps {
  categorySlug: string;
  articleSlug: string;
}

export default function HelpArticlePage({ categorySlug, articleSlug }: HelpArticlePageProps) {
  // Support both /help/:category/:slug and direct slug lookup
  let article = getArticleByCategoryAndSlug(categorySlug, articleSlug);
  if (!article) {
    article = getArticleBySlug(articleSlug);
  }

  if (!article) {
    return (
      <div className="space-y-6 text-center py-20 max-w-md mx-auto">
        <h1 className="text-2xl font-black">Article Not Found</h1>
        <p className="text-xs text-slate-500">
          The help article you are looking for does not exist or may have been moved.
        </p>
        <Link
          href="/help"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-orange-500 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Help Center</span>
        </Link>
      </div>
    );
  }

  // Calculate prev and next articles in the same category
  const categoryArticles = getArticlesByCategory(article.category as HelpCategorySlug);
  const currentIndex = categoryArticles.findIndex((a) => a.slug === article?.slug);

  const prevArticle = currentIndex > 0 ? categoryArticles[currentIndex - 1] : undefined;
  const nextArticle =
    currentIndex >= 0 && currentIndex < categoryArticles.length - 1
      ? categoryArticles[currentIndex + 1]
      : undefined;

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start animate-in fade-in duration-200">
      {/* Left Navigation Sidebar */}
      <HelpSidebar currentCategorySlug={article.category} />

      {/* Main Article Content */}
      <div className="flex-1 w-full min-w-0">
        <HelpArticleLayout
          article={article}
          prevArticle={prevArticle}
          nextArticle={nextArticle}
        />
      </div>
    </div>
  );
}
