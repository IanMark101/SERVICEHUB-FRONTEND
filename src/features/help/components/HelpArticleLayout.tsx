"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Info,
  Lightbulb,
  SealCheck,
  ShareNetwork,
  Smiley,
  SmileyMeh,
  SmileySad,
  Warning,
} from '@phosphor-icons/react';
import { HelpArticle, ArticleCallout, ArticleExample } from '../types/help.types';
import { getCategoryBySlug, getRelatedArticles } from '../data';
import HelpBreadcrumbs from './HelpBreadcrumbs';

interface HelpArticleLayoutProps {
  article: HelpArticle;
  prevArticle?: HelpArticle;
  nextArticle?: HelpArticle;
}

type CopyState = 'idle' | 'copied' | 'failed';

export default function HelpArticleLayout({ article, prevArticle, nextArticle }: HelpArticleLayoutProps) {
  const category = getCategoryBySlug(article.category);
  const relatedArticles = getRelatedArticles(article, 4);
  const [feedbackGiven, setFeedbackGiven] = useState<'positive' | 'neutral' | 'negative' | null>(null);
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const guideHeadings = article.sections.flatMap((section, index) =>
    section.heading ? [{ id: `article-section-${index}`, label: section.heading }] : [],
  );

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyState('copied');
    } catch {
      setCopyState('failed');
    }

    window.setTimeout(() => setCopyState('idle'), 2200);
  };

  const renderCallout = (callout: ArticleCallout) => {
    const configs = {
      tip: {
        background: 'border-amber-200/80 bg-amber-50/70 dark:border-amber-900/50 dark:bg-amber-950/20',
        icon: Lightbulb,
        iconColor: 'text-amber-700 dark:text-amber-300',
        defaultTitle: 'Tip',
      },
      info: {
        background: 'border-[#d9d3cc] bg-[#f5f4f2] dark:border-white/12 dark:bg-white/[0.05]',
        icon: Info,
        iconColor: 'text-[#c86544] dark:text-[#e18463]',
        defaultTitle: 'Note',
      },
      warning: {
        background: 'border-red-200/80 bg-red-50/70 dark:border-red-900/45 dark:bg-red-950/20',
        icon: Warning,
        iconColor: 'text-red-700 dark:text-red-300',
        defaultTitle: 'Important',
      },
      important: {
        background: 'border-emerald-200/80 bg-emerald-50/70 dark:border-emerald-900/45 dark:bg-emerald-950/20',
        icon: SealCheck,
        iconColor: 'text-emerald-700 dark:text-emerald-300',
        defaultTitle: 'Requirement',
      },
    };

    const config = configs[callout.type] || configs.info;
    const Icon = config.icon;

    return (
      <aside className={`my-8 rounded-2xl border p-5 sm:p-6 ${config.background}`}>
        <div className="flex items-start gap-3.5">
          <Icon size={20} weight="regular" className={`mt-0.5 shrink-0 ${config.iconColor}`} aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-[#171716] dark:text-[#f5f4f2]">{callout.title || config.defaultTitle}</p>
            <p className="mt-2 text-sm leading-6 text-[#514d48] dark:text-white/68">{callout.text}</p>
          </div>
        </div>
      </aside>
    );
  };

  const renderExample = (example: ArticleExample) => (
    <aside className="my-8 rounded-2xl border border-black/8 bg-[#fffdfa] p-5 shadow-[0_10px_26px_rgba(23,23,22,0.045)] dark:border-white/10 dark:bg-white/[0.04] sm:p-6">
      <p className="text-sm font-semibold text-[#171716] dark:text-[#f5f4f2]">{example.title}</p>
      <p className="mt-2 text-sm leading-6 text-[#625d57] dark:text-white/64">{example.description}</p>
    </aside>
  );

  const shareLabel = copyState === 'copied' ? 'Link copied' : copyState === 'failed' ? 'Copy unavailable' : 'Share guide';

  return (
    <div className="space-y-14 pb-4 sm:space-y-18">
      <HelpBreadcrumbs
        items={[
          { label: category?.title || 'Collection', href: category ? `/help/${category.slug}` : undefined },
          { label: article.title },
        ]}
      />

      <header className="relative max-w-5xl border-b border-black/10 pb-9 dark:border-white/10 sm:pb-11">
        <div aria-hidden="true" className="pointer-events-none absolute -left-16 -top-20 -z-10 h-72 w-[42rem] max-w-[90vw] rounded-full bg-[#d97757]/8 blur-[120px] dark:bg-[#c86544]/6" />
        <div className="flex items-center gap-2 text-xs font-medium text-[#827c75] dark:text-white/48">
          <BookOpen size={16} className="text-[#c86544] dark:text-[#e18463]" aria-hidden="true" />
          <span>{category?.title || 'Help guide'}</span>
        </div>
        <h1 className="mt-6 max-w-[20ch] text-[clamp(2.5rem,4.8vw,5rem)] font-medium leading-[0.98] tracking-[-0.04em] text-[#171716] dark:text-[#f5f4f2]">
          {article.title}
        </h1>
        <p className="mt-6 max-w-3xl text-base leading-7 text-[#625d57] dark:text-white/64 sm:text-lg sm:leading-8">
          {article.description}
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs text-[#827c75] dark:text-white/48">
          <span>{article.readTimeMinutes} min read</span>
          <span>Updated {article.lastUpdated}</span>
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-2 font-semibold text-[#625d57] transition-colors hover:text-[#c86544] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c86544] dark:text-white/64 dark:hover:text-[#e18463]"
          >
            {copyState === 'copied' ? <Check size={16} aria-hidden="true" /> : <ShareNetwork size={16} aria-hidden="true" />}
            {shareLabel}
          </button>
        </div>
      </header>

      <div className="grid gap-10 lg:grid-cols-[11rem_minmax(0,1fr)] lg:gap-14">
        <aside className="hidden lg:sticky lg:top-24 lg:block">
          {guideHeadings.length > 0 && (
            <nav aria-label="In this guide" className="border-l border-black/10 pl-4 dark:border-white/10">
              <p className="text-sm font-semibold text-[#171716] dark:text-[#f5f4f2]">In this guide</p>
              <div className="mt-4 space-y-3">
                {guideHeadings.map((heading) => (
                  <a key={heading.id} href={`#${heading.id}`} className="block text-xs leading-5 text-[#6f6a64] transition-colors hover:text-[#c86544] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#c86544] dark:text-white/56 dark:hover:text-[#e18463]">
                    {heading.label}
                  </a>
                ))}
              </div>
            </nav>
          )}
        </aside>

        <article className="max-w-3xl">
        <div className="space-y-10 text-[#514d48] dark:text-white/72">
          {article.sections.map((section, index) => (
            <section id={`article-section-${index}`} key={`${section.heading || 'section'}-${index}`} className="scroll-mt-24 space-y-4">
              {section.heading && (
                <h2 className="pt-2 text-2xl font-semibold tracking-[-0.03em] text-[#171716] dark:text-[#f5f4f2] sm:text-3xl">
                  {section.heading}
                </h2>
              )}
              {section.paragraphs?.map((paragraph, paragraphIndex) => (
                <p key={paragraphIndex} className="text-sm leading-7 sm:text-base sm:leading-8">{paragraph}</p>
              ))}
              {section.bullets && (
                <ul className="space-y-3 pl-5 text-sm leading-7 marker:text-[#c86544] dark:marker:text-[#e18463] sm:text-base sm:leading-8">
                  {section.bullets.map((bullet, bulletIndex) => <li key={bulletIndex}>{bullet}</li>)}
                </ul>
              )}
              {section.steps && (
                <ol className="space-y-3 pl-5 text-sm leading-7 marker:font-semibold marker:text-[#c86544] dark:marker:text-[#e18463] sm:text-base sm:leading-8">
                  {section.steps.map((step, stepIndex) => <li key={stepIndex}>{step}</li>)}
                </ol>
              )}
              {section.callout && renderCallout(section.callout)}
              {section.example && renderExample(section.example)}
            </section>
          ))}
        </div>

        <section className="mt-14 border-t border-black/8 pt-8 dark:border-white/10" aria-labelledby="article-feedback-heading">
          <h2 id="article-feedback-heading" className="text-xl font-semibold tracking-[-0.025em] text-[#171716] dark:text-[#f5f4f2]">Was this guide useful?</h2>
          {feedbackGiven ? (
            <p className="mt-3 text-sm font-medium text-emerald-700 dark:text-emerald-300">Thank you. Your feedback helps improve this documentation.</p>
          ) : (
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <FeedbackButton label="Not helpful" onClick={() => setFeedbackGiven('negative')}><SmileySad size={19} /></FeedbackButton>
              <FeedbackButton label="Partly helpful" onClick={() => setFeedbackGiven('neutral')}><SmileyMeh size={19} /></FeedbackButton>
              <FeedbackButton label="Helpful" onClick={() => setFeedbackGiven('positive')}><Smiley size={19} /></FeedbackButton>
            </div>
          )}
        </section>
        </article>
      </div>

      {(prevArticle || nextArticle) && (
        <nav className="grid gap-4 border-y border-black/8 py-6 dark:border-white/10 sm:grid-cols-2" aria-label="Guide navigation">
          {prevArticle ? (
            <Link href={`/help/${prevArticle.category}/${prevArticle.slug}`} className="group rounded-xl p-4 transition-colors hover:bg-[#fffdfa] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c86544] dark:hover:bg-white/[0.04]">
              <span className="flex items-center gap-2 text-xs font-medium text-[#827c75] dark:text-white/48"><ArrowLeft size={14} aria-hidden="true" />Previous guide</span>
              <span className="mt-2 block text-sm font-semibold text-[#171716] transition-colors group-hover:text-[#c86544] dark:text-[#f5f4f2] dark:group-hover:text-[#e18463]">{prevArticle.title}</span>
            </Link>
          ) : <div aria-hidden="true" />}
          {nextArticle ? (
            <Link href={`/help/${nextArticle.category}/${nextArticle.slug}`} className="group rounded-xl p-4 text-right transition-colors hover:bg-[#fffdfa] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c86544] dark:hover:bg-white/[0.04]">
              <span className="flex items-center justify-end gap-2 text-xs font-medium text-[#827c75] dark:text-white/48">Next guide<ArrowRight size={14} aria-hidden="true" /></span>
              <span className="mt-2 block text-sm font-semibold text-[#171716] transition-colors group-hover:text-[#c86544] dark:text-[#f5f4f2] dark:group-hover:text-[#e18463]">{nextArticle.title}</span>
            </Link>
          ) : <div aria-hidden="true" />}
        </nav>
      )}

      {relatedArticles.length > 0 && (
        <section aria-labelledby="related-guides-heading">
          <div className="mb-6 border-b border-black/8 pb-5 dark:border-white/10">
            <h2 id="related-guides-heading" className="text-2xl font-semibold tracking-[-0.03em] text-[#171716] dark:text-[#f5f4f2]">Related guides</h2>
          </div>
          <div className="grid gap-x-10 md:grid-cols-2">
            {relatedArticles.map((relatedArticle) => (
              <Link
                key={relatedArticle.slug}
                href={`/help/${relatedArticle.category}/${relatedArticle.slug}`}
                className="group grid grid-cols-[minmax(0,1fr)_auto] gap-4 border-b border-black/8 py-5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c86544] dark:border-white/10"
              >
                <span>
                  <span className="block text-sm font-semibold text-[#171716] transition-colors group-hover:text-[#c86544] dark:text-[#f5f4f2] dark:group-hover:text-[#e18463]">{relatedArticle.title}</span>
                  <span className="mt-1.5 block text-xs leading-5 text-[#6f6a64] dark:text-white/58">{relatedArticle.description}</span>
                </span>
                <ArrowRight size={16} className="mt-1 text-[#827c75] transition-transform group-hover:translate-x-0.5 group-hover:text-[#c86544] dark:text-white/44 dark:group-hover:text-[#e18463]" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function FeedbackButton({ children, label, onClick }: { children: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-[#fffdfa] px-4 py-2.5 text-xs font-medium text-[#514d48] transition-colors hover:border-[#c86544]/40 hover:text-[#c86544] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c86544] dark:border-white/12 dark:bg-white/[0.04] dark:text-white/64 dark:hover:border-[#e18463]/45 dark:hover:text-[#e18463]"
    >
      <span aria-hidden="true">{children}</span>
      {label}
    </button>
  );
}
