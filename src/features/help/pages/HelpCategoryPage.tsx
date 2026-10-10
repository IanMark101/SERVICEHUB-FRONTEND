"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, BookOpen, FolderOpen } from '@phosphor-icons/react';
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
      <div className="mx-auto max-w-3xl py-16 text-center">
        <FolderOpen size={34} className="mx-auto text-brand-text" aria-hidden="true" />
        <h1 className="mt-5 text-3xl font-semibold tracking-[-0.035em] text-ink dark:text-white">
          Collection not found
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink-muted dark:text-white/58">
          This collection is unavailable. Return to the Help Center to browse the available guides.
        </p>
        <Link
          href="/help"
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-charcoal px-5 py-3 text-xs font-semibold text-white shadow-[0_8px_20px_rgba(23,23,22,0.16)] transition-colors hover:bg-charcoal active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-focus dark:bg-[#f5f4f2] dark:text-charcoal dark:hover:bg-white"
        >
          <ArrowLeft size={15} aria-hidden="true" />
          Browse Help Center
        </Link>
      </div>
    );
  }

  const totalReadingMinutes = articles.reduce((total, article) => total + article.readTimeMinutes, 0);
  const firstArticle = articles[0];

  return (
    <div className="space-y-14 pb-4 sm:space-y-18">
      <HelpBreadcrumbs items={[{ label: category.title }]} />

      <section className="relative isolate grid gap-5 lg:grid-cols-[minmax(0,1.18fr)_minmax(18rem,0.82fr)] lg:gap-7">
        <div aria-hidden="true" className="pointer-events-none absolute -left-12 top-8 -z-10 h-72 w-[39rem] max-w-[86vw] rounded-full bg-brand/8 blur-[120px] dark:bg-brand/6" />

        <header className="rounded-2xl border border-black/8 bg-[#fffdfa]/96 p-7 shadow-[0_16px_42px_color-mix(in_srgb,var(--color-brand)_6.5%,transparent)] dark:border-white/10 dark:bg-charcoal/96 sm:p-10">
          <div className="flex items-center gap-2 text-xs font-medium text-ink-subtle dark:text-white/48">
            <BookOpen size={16} className="text-brand-text dark:text-brand-on-dark" aria-hidden="true" />
            <span>{articles.length} {articles.length === 1 ? 'guide' : 'guides'}</span>
            <span aria-hidden="true">/</span>
            <span>{totalReadingMinutes} min to read</span>
          </div>
          <h1 className="mt-7 max-w-[13ch] text-[clamp(2.5rem,4.7vw,4.5rem)] font-medium leading-[0.99] tracking-[-0.04em] text-ink dark:text-white">
            {category.title}
          </h1>
          <p className="mt-6 max-w-2xl text-sm leading-6 text-ink-muted dark:text-white/64 sm:text-base sm:leading-7">
            {category.description}
          </p>
        </header>

        <aside className="flex flex-col justify-between rounded-2xl bg-charcoal p-7 text-white shadow-[0_18px_45px_rgba(23,23,22,0.14)] sm:p-9">
          <div>
            <h2 className="text-xl font-semibold tracking-[-0.025em]">Start with this collection</h2>
            <p className="mt-2 text-xs leading-5 text-white/58">Read the guides in any order, or begin with the route below.</p>
          </div>
          {firstArticle ? (
            <Link
              href={`/help/${firstArticle.category}/${firstArticle.slug}`}
              className="group mt-8 border-y border-white/12 py-5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-on-dark"
            >
              <span className="block text-[11px] font-medium text-orange-300">Recommended first read</span>
              <span className="mt-2 block text-base font-semibold tracking-[-0.02em] text-white transition-colors group-hover:text-orange-300">
                {firstArticle.title}
              </span>
              <span className="mt-2 block text-xs leading-5 text-white/56">{firstArticle.description}</span>
              <span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-orange-300">
                Open guide
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </Link>
          ) : (
            <p className="mt-8 border-y border-white/12 py-5 text-sm leading-6 text-white/58">Guides will appear here when this collection is published.</p>
          )}
        </aside>
      </section>

      <section aria-labelledby="collection-guides-heading">
        <div className="mb-7 flex flex-col gap-3 border-b border-black/10 pb-5 dark:border-white/10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="collection-guides-heading" className="text-3xl font-semibold tracking-[-0.035em] text-ink dark:text-white sm:text-4xl">
              Guides in this collection
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-muted dark:text-white/58">Choose the question that best matches what you need to do next.</p>
          </div>
          <span className="text-xs font-medium text-ink-subtle dark:text-white/48">{articles.length} available</span>
        </div>

        {articles.length > 0 ? (
          <div className="grid gap-x-10 md:grid-cols-2">
            {articles.map((article) => (
              <Link
                key={article.slug}
                href={`/help/${article.category}/${article.slug}`}
                className="group grid grid-cols-[minmax(0,1fr)_auto] gap-5 border-b border-black/8 py-6 text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-focus dark:border-white/10 dark:text-white"
              >
                <span>
                  <span className="text-[11px] font-medium text-ink-subtle dark:text-white/48">{article.readTimeMinutes} min read</span>
                  <span className="mt-2 block text-lg font-semibold leading-6 tracking-[-0.025em] transition-colors group-hover:text-brand-text dark:group-hover:text-brand-on-dark">
                    {article.title}
                  </span>
                  <span className="mt-2 block text-sm leading-6 text-ink-muted dark:text-white/58">{article.description}</span>
                  <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-brand-text dark:text-brand-on-dark">
                    Read guide
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-black/12 bg-[#fffdfa]/72 px-6 py-12 text-center dark:border-white/12 dark:bg-charcoal">
            <p className="text-sm font-semibold text-ink dark:text-white">No guides are available in this collection yet.</p>
            <Link href="/help" className="mt-3 inline-flex text-xs font-semibold text-brand-text hover:text-brand-action-hover dark:text-brand-on-dark">Browse another collection</Link>
          </div>
        )}
      </section>

      <div className="border-t border-black/8 pt-6 dark:border-white/10">
        <Link
          href="/help"
          className="inline-flex items-center gap-2 text-xs font-semibold text-ink-muted transition-colors hover:text-brand-text focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-focus dark:text-white/58 dark:hover:text-brand-on-dark"
        >
          <ArrowLeft size={15} aria-hidden="true" />
          All Help Center collections
        </Link>
      </div>
    </div>
  );
}
