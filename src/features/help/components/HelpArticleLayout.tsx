"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import {
  Clock,
  Calendar,
  CheckCircle2,
  Info,
  AlertTriangle,
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { HelpArticle, ArticleCallout, ArticleExample } from '../types/help.types';
import { getCategoryBySlug, getRelatedArticles } from '../data';
import HelpBreadcrumbs from './HelpBreadcrumbs';
import HelpArticleNavigation from './HelpArticleNavigation';
import RelatedArticles from './RelatedArticles';
import { useApp } from '@/context/AppContext';

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
  const { isDark } = useApp();
  const category = getCategoryBySlug(article.category);
  const relatedArticles = getRelatedArticles(article, 3);
  const [feedbackGiven, setFeedbackGiven] = useState<'yes' | 'no' | null>(null);
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
        icon: Lightbulb,
        bg: isDark ? 'bg-amber-950/20 border-amber-900/40 text-[#f2efe9]' : 'bg-amber-50/80 border-amber-200 text-amber-950',
        iconColor: 'text-amber-500',
        titleDefault: 'Helpful Tip',
      },
      info: {
        icon: Info,
        bg: isDark ? 'bg-blue-950/20 border-blue-900/40 text-[#f2efe9]' : 'bg-blue-50/80 border-blue-200 text-blue-950',
        iconColor: 'text-blue-500',
        titleDefault: 'Good to Know',
      },
      warning: {
        icon: AlertTriangle,
        bg: isDark ? 'bg-red-950/20 border-red-900/40 text-[#f2efe9]' : 'bg-red-50/80 border-red-200 text-red-950',
        iconColor: 'text-red-500',
        titleDefault: 'Important Notice',
      },
      important: {
        icon: CheckCircle2,
        bg: isDark ? 'bg-emerald-950/20 border-emerald-900/40 text-[#f2efe9]' : 'bg-emerald-50/80 border-emerald-200 text-emerald-950',
        iconColor: 'text-emerald-500',
        titleDefault: 'Key Requirement',
      },
    };

    const cfg = configs[callout.type] || configs.info;
    const Icon = cfg.icon;

    return (
      <div className={`rounded-2xl p-4 sm:p-5 border my-5 ${cfg.bg}`}>
        <div className="flex items-start gap-3">
          <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${cfg.iconColor}`} />
          <div className="space-y-1 text-xs leading-relaxed">
            <h5 className="font-bold text-xs">{callout.title || cfg.titleDefault}</h5>
            <p className="opacity-90">{callout.text}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderExample = (example: ArticleExample) => {
    return (
      <div className={`rounded-2xl p-4 sm:p-5 border my-5 ${
        isDark
          ? 'bg-neutral-800/30 border-neutral-700/60 text-[#f2efe9]'
          : 'bg-slate-50 border-slate-200 text-slate-800'
      }`}>
        <div className="flex items-center gap-2 mb-2 text-xs font-bold text-orange-600 dark:text-orange-400">
          <BookOpen className="w-4 h-4" />
          <span>{example.title}</span>
        </div>
        <p className="text-xs leading-relaxed text-slate-600 dark:text-neutral-300">
          {example.description}
        </p>
      </div>
    );
  };

  return (
    <article className="space-y-8">
      {/* Breadcrumbs */}
      <HelpBreadcrumbs
        items={[
          {
            label: category?.title || 'Category',
            href: category ? `/help/${category.slug}` : undefined,
          },
          { label: article.title },
        ]}
      />

      {/* Article Header Card */}
      <div className={`rounded-[26px] p-6 sm:p-8 border shadow-xs ${
        isDark ? 'bg-[#22211e] border-neutral-800/80' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {category && (
            <Link
              href={`/help/${category.slug}`}
              className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 hover:bg-orange-500/20 transition-colors"
            >
              {category.title}
            </Link>
          )}

          <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-neutral-500 font-medium">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{article.readTimeMinutes} min read</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Updated {article.lastUpdated}</span>
            </span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-[#f2efe9] leading-tight">
          {article.title}
        </h1>

        <p className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-[#b4b0a9] mt-3 font-medium">
          {article.description}
        </p>

        {/* Share / Copy button */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-neutral-500">
              Keywords:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {article.keywords.slice(0, 4).map((kw) => (
                <span
                  key={kw}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-slate-500 dark:text-neutral-400"
                >
                  #{kw}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copied ? 'Link Copied!' : 'Share Article'}</span>
          </button>
        </div>
      </div>

      {/* Main Article Body Sections */}
      <div className={`rounded-[26px] p-6 sm:p-8 border shadow-xs space-y-8 ${
        isDark ? 'bg-[#22211e] border-neutral-800/80' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        {article.sections.map((section, idx) => (
          <section key={idx} className="space-y-4">
            {section.heading && (
              <h3 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-[#f2efe9] border-b pb-2 border-slate-100 dark:border-neutral-800">
                {section.heading}
              </h3>
            )}

            {section.paragraphs && section.paragraphs.map((p, pIdx) => (
              <p key={pIdx} className="text-sm leading-relaxed text-slate-700 dark:text-[#d4cfc7]">
                {p}
              </p>
            ))}

            {section.bullets && (
              <ul className="space-y-2 text-sm text-slate-700 dark:text-[#d4cfc7] pl-1">
                {section.bullets.map((bullet, bIdx) => (
                  <li key={bIdx} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 shrink-0" />
                    <span className="leading-relaxed">{bullet}</span>
                  </li>
                ))}
              </ul>
            )}

            {section.steps && (
              <ol className="space-y-3 my-3">
                {section.steps.map((step, sIdx) => (
                  <li key={sIdx} className="flex items-start gap-3 text-sm text-slate-700 dark:text-[#d4cfc7]">
                    <span className="w-6 h-6 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {sIdx + 1}
                    </span>
                    <span className="leading-relaxed pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            )}

            {section.callout && renderCallout(section.callout)}
            {section.example && renderExample(section.example)}
          </section>
        ))}

        {/* Feedback Section */}
        <div className={`mt-10 pt-6 border-t border-slate-100 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4`}>
          <div>
            <h5 className="font-bold text-xs text-slate-900 dark:text-[#f2efe9]">
              Was this guide helpful to you?
            </h5>
            <p className="text-[11px] text-slate-400 dark:text-neutral-500">
              Your feedback helps improve documentation for Cordova residents.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {feedbackGiven ? (
              <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 animate-in fade-in">
                ✓ Thank you for your feedback!
              </span>
            ) : (
              <>
                <button
                  onClick={() => setFeedbackGiven('yes')}
                  className="px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-slate-50 dark:bg-neutral-800 border-slate-200 dark:border-neutral-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-600 hover:border-emerald-300"
                >
                  <ThumbsUp className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Yes</span>
                </button>
                <button
                  onClick={() => setFeedbackGiven('no')}
                  className="px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-slate-50 dark:bg-neutral-800 border-slate-200 dark:border-neutral-700 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 hover:border-red-300"
                >
                  <ThumbsDown className="w-3.5 h-3.5 text-red-500" />
                  <span>No</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Prev / Next Article Navigation */}
      <HelpArticleNavigation prevArticle={prevArticle} nextArticle={nextArticle} />

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <RelatedArticles articles={relatedArticles} />
      )}
    </article>
  );
}
