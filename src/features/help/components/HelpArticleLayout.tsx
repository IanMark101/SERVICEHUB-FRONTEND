"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import {
  Share2,
  Check,
  Smile,
  Meh,
  Frown,
  ArrowRight,
  Info,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
} from 'lucide-react';
import { HelpArticle, ArticleCallout, ArticleExample } from '../types/help.types';
import { getCategoryBySlug, getRelatedArticles } from '../data';
import HelpBreadcrumbs from './HelpBreadcrumbs';

interface HelpArticleLayoutProps {
  article: HelpArticle;
  prevArticle?: HelpArticle;
  nextArticle?: HelpArticle;
}

export default function HelpArticleLayout({
  article,
  prevArticle,
  nextArticle,
}: HelpArticleLayoutProps) {
  const category = getCategoryBySlug(article.category);
  const relatedArticles = getRelatedArticles(article, 4);
  const [feedbackGiven, setFeedbackGiven] = useState<'positive' | 'neutral' | 'negative' | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const renderCallout = (callout: ArticleCallout) => {
    const configs = {
      tip: {
        border: 'border-l-4 border-amber-500',
        bg: 'bg-amber-50/70 dark:bg-amber-950/20 text-slate-800 dark:text-neutral-200',
        icon: Lightbulb,
        iconColor: 'text-amber-500',
        defaultTitle: 'Tip',
      },
      info: {
        border: 'border-l-4 border-blue-500',
        bg: 'bg-blue-50/70 dark:bg-blue-950/20 text-slate-800 dark:text-neutral-200',
        icon: Info,
        iconColor: 'text-blue-500',
        defaultTitle: 'Note',
      },
      warning: {
        border: 'border-l-4 border-red-500',
        bg: 'bg-red-50/70 dark:bg-red-950/20 text-slate-800 dark:text-neutral-200',
        icon: AlertTriangle,
        iconColor: 'text-red-500',
        defaultTitle: 'Important',
      },
      important: {
        border: 'border-l-4 border-emerald-500',
        bg: 'bg-emerald-50/70 dark:bg-emerald-950/20 text-slate-800 dark:text-neutral-200',
        icon: CheckCircle2,
        iconColor: 'text-emerald-500',
        defaultTitle: 'Requirement',
      },
    };

    const cfg = configs[callout.type] || configs.info;
    const Icon = cfg.icon;

    return (
      <div className={`my-6 p-5 rounded-r-2xl ${cfg.border} ${cfg.bg}`}>
        <div className="flex items-start gap-3.5">
          <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${cfg.iconColor}`} />
          <div className="space-y-1 text-sm sm:text-base leading-relaxed">
            <p className="font-bold text-xs sm:text-sm uppercase tracking-wider opacity-90">
              {callout.title || cfg.defaultTitle}
            </p>
            <p>{callout.text}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderExample = (example: ArticleExample) => {
    return (
      <div className="my-6 p-5 sm:p-6 rounded-2xl border bg-slate-50 dark:bg-[#1a1916] border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-300 shadow-2xs">
        <p className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 mb-2">
          {example.title}
        </p>
        <p className="text-sm sm:text-base leading-relaxed">
          {example.description}
        </p>
      </div>
    );
  };

  return (
    <div className="max-w-4xl lg:max-w-5xl mx-auto py-2">
      {/* Breadcrumbs */}
      <HelpBreadcrumbs
        items={[
          {
            label: category?.title || 'Collection',
            href: category ? `/help/${category.slug}` : undefined,
          },
          { label: article.title },
        ]}
      />

      {/* Article Header */}
      <header className="space-y-4 pb-8 border-b border-slate-200 dark:border-neutral-800">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          {article.title}
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-neutral-300 leading-relaxed font-normal">
          {article.description}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs sm:text-sm text-slate-500 dark:text-neutral-400">
          <div className="flex items-center gap-3">
            <span>Updated {article.lastUpdated}</span>
            <span>·</span>
            <span>{article.readTimeMinutes} min read</span>
          </div>

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 font-semibold text-slate-600 dark:text-neutral-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
            <span>{copied ? 'Link copied' : 'Share'}</span>
          </button>
        </div>
      </header>

      {/* Article Body */}
      <div className="prose dark:prose-invert max-w-none pt-8 space-y-10">
        {article.sections.map((section, idx) => (
          <section key={idx} className="space-y-4">
            {section.heading && (
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight pt-2">
                {section.heading}
              </h2>
            )}

            {section.paragraphs && section.paragraphs.map((p, pIdx) => (
              <p key={pIdx} className="text-sm sm:text-base leading-relaxed text-slate-700 dark:text-neutral-300">
                {p}
              </p>
            ))}

            {section.bullets && (
              <ul className="list-disc pl-6 space-y-2.5 text-sm sm:text-base text-slate-700 dark:text-neutral-300">
                {section.bullets.map((bullet, bIdx) => (
                  <li key={bIdx} className="leading-relaxed">
                    {bullet}
                  </li>
                ))}
              </ul>
            )}

            {section.steps && (
              <ol className="list-decimal pl-6 space-y-3 text-sm sm:text-base text-slate-700 dark:text-neutral-300 my-4">
                {section.steps.map((step, sIdx) => (
                  <li key={sIdx} className="leading-relaxed pl-1">
                    {step}
                  </li>
                ))}
              </ol>
            )}

            {section.callout && renderCallout(section.callout)}
            {section.example && renderExample(section.example)}
          </section>
        ))}
      </div>

      {/* Intercom / Sharetribe Style Feedback Box */}
      <div className="mt-16 pt-10 border-t border-slate-200 dark:border-neutral-800 text-center space-y-4">
        <p className="text-base font-bold text-slate-900 dark:text-white">
          Did this answer your question?
        </p>

        {feedbackGiven ? (
          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            Thank you for your feedback!
          </p>
        ) : (
          <div className="flex items-center justify-center gap-4 pt-1">
            <button
              onClick={() => setFeedbackGiven('negative')}
              className="p-3 rounded-2xl border border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-800 text-slate-500 hover:text-red-500 transition-colors cursor-pointer"
              title="Not helpful"
            >
              <Frown className="w-5 h-5" />
            </button>
            <button
              onClick={() => setFeedbackGiven('neutral')}
              className="p-3 rounded-2xl border border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-800 text-slate-500 hover:text-amber-500 transition-colors cursor-pointer"
              title="Neutral"
            >
              <Meh className="w-5 h-5" />
            </button>
            <button
              onClick={() => setFeedbackGiven('positive')}
              className="p-3 rounded-2xl border border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-800 text-slate-500 hover:text-emerald-500 transition-colors cursor-pointer"
              title="Helpful"
            >
              <Smile className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Related Articles in Collection (2-Column Grid) */}
      {relatedArticles.length > 0 && (
        <div className="mt-14 pt-10 border-t border-slate-200 dark:border-neutral-800 space-y-5">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Related Articles in {category?.title || 'this collection'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relatedArticles.map((rel) => (
              <Link
                key={rel.slug}
                href={`/help/${rel.category}/${rel.slug}`}
                className="flex items-center justify-between p-5 rounded-2xl border transition-all duration-200 group bg-white dark:bg-[#1a1916] border-slate-200 dark:border-neutral-800 hover:border-orange-500/60 text-slate-800 dark:text-neutral-200 shadow-xs"
              >
                <div className="min-w-0 pr-4">
                  <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors truncate">
                    {rel.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-neutral-400 line-clamp-1 mt-1">
                    {rel.description}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
