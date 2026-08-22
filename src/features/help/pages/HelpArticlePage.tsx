"use client";
import React from 'react';
import Link from 'next/link';
import HelpArticleLayout from '../components/HelpArticleLayout';
import { getArticleByCategoryAndSlug, getArticlesByCategory, getArticleBySlug } from '../data';
import { HelpCategorySlug } from '../types/help.types';
import { ArrowLeft } from 'lucide-react';

interface HelpArticlePageProps {
  categorySlug: string;
  articleSlug: string;
}

export default function HelpArticlePage({ categorySlug, articleSlug }: HelpArticlePageProps) {
  let article = getArticleByCategoryAndSlug(categorySlug, articleSlug);
  if (!article) {
    article = getArticleBySlug(articleSlug);
  }

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center space-y-4">
        <h1 className="text-2xl font-bold">Article Not Found</h1>
        <p className="text-xs text-slate-500">
          The help article you are looking for does not exist or may have been moved.
        </p>
        <Link
          href="/help"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-600 text-white rounded-lg text-xs font-bold shadow-xs hover:bg-orange-500 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Help Center</span>
        </Link>
      </div>
    );
  }

  const categoryArticles = getArticlesByCategory(article.category as HelpCategorySlug);
  const currentIndex = categoryArticles.findIndex((a) => a.slug === article?.slug);

  const prevArticle = currentIndex > 0 ? categoryArticles[currentIndex - 1] : undefined;
  const nextArticle =
    currentIndex >= 0 && currentIndex < categoryArticles.length - 1
      ? categoryArticles[currentIndex + 1]
      : undefined;

  return (
    <div className="animate-in fade-in duration-200">
      <HelpArticleLayout
        article={article}
        prevArticle={prevArticle}
        nextArticle={nextArticle}
      />
    </div>
  );
}
