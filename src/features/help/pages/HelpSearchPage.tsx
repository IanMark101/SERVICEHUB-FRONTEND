"use client";

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, MagnifyingGlass } from '@phosphor-icons/react';
import HelpSearch from '../components/HelpSearch';
import HelpBreadcrumbs from '../components/HelpBreadcrumbs';
import { searchHelpArticles } from '../utils/helpSearch';
import { SearchResult } from '../types/help.types';
import { HELP_CATEGORIES } from '../data/categories';

export default function HelpSearchPage() {
  const searchParams = useSearchParams();
  const rawQuery = searchParams.get('q') || '';
  const results: SearchResult[] = rawQuery ? searchHelpArticles(rawQuery) : [];
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const filteredResults = selectedCategory === 'all'
    ? results
    : results.filter((result) => result.article.category === selectedCategory);

  return (
    <div className="space-y-14 pb-4 sm:space-y-18">
      <HelpBreadcrumbs items={[{ label: 'Search help' }]} />

      <header className="relative max-w-5xl border-b border-black/10 pb-9 dark:border-white/10 sm:pb-11">
        <div aria-hidden="true" className="pointer-events-none absolute -left-14 -top-20 -z-10 h-72 w-[42rem] max-w-[90vw] rounded-full bg-[#d97757]/8 blur-[120px] dark:bg-[#c86544]/6" />
        <div className="flex items-center gap-2 text-xs font-medium text-ink-subtle dark:text-white/48">
          <MagnifyingGlass size={16} className="text-[#c86544] dark:text-[#e18463]" aria-hidden="true" />
          Search the Help Center
        </div>
        <h1 className="mt-6 max-w-[14ch] text-[clamp(2.5rem,4.8vw,5rem)] font-medium leading-[0.98] tracking-[-0.04em] text-ink dark:text-white">
          Find the answer you need.
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-6 text-ink-muted dark:text-white/64 sm:text-base sm:leading-7">
          Search verified guidance for accounts, local services, bookings, queues, messages, and payment records.
        </p>
        <div className="mt-8 max-w-3xl">
          <HelpSearch initialQuery={rawQuery} autoFocus size="lg" showLiveDropdown={false} />
        </div>
      </header>

      {rawQuery ? (
        <section aria-labelledby="search-results-heading">
          <div className="flex flex-col gap-5 border-b border-black/10 pb-5 dark:border-white/10 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 id="search-results-heading" className="text-2xl font-semibold tracking-[-0.03em] text-ink dark:text-white sm:text-3xl">
                {results.length} {results.length === 1 ? 'result' : 'results'} for &quot;{rawQuery}&quot;
              </h2>
              <p className="mt-2 text-sm leading-6 text-ink-muted dark:text-white/58">Narrow the results to a documentation collection when useful.</p>
            </div>

            {results.length > 0 && (
              <div className="flex max-w-full gap-2 overflow-x-auto pb-1" aria-label="Filter search results by collection">
                <FilterButton active={selectedCategory === 'all'} onClick={() => setSelectedCategory('all')}>All ({results.length})</FilterButton>
                {HELP_CATEGORIES.map((category) => {
                  const count = results.filter((result) => result.article.category === category.slug).length;
                  return count > 0 ? (
                    <FilterButton key={category.slug} active={selectedCategory === category.slug} onClick={() => setSelectedCategory(category.slug)}>
                      {category.shortTitle || category.title} ({count})
                    </FilterButton>
                  ) : null;
                })}
              </div>
            )}
          </div>

          {filteredResults.length > 0 ? (
            <div className="grid gap-x-10 md:grid-cols-2">
              {filteredResults.map((result) => (
                <Link
                  key={result.article.slug}
                  href={`/help/${result.article.category}/${result.article.slug}`}
                  className="group grid grid-cols-[minmax(0,1fr)_auto] gap-5 border-b border-black/8 py-6 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c86544] dark:border-white/10"
                >
                  <span>
                    <span className="text-[11px] font-medium text-ink-subtle dark:text-white/48">
                      {result.category.shortTitle || result.category.title} / {result.article.readTimeMinutes} min read
                    </span>
                    <span className="mt-2 block text-lg font-semibold leading-6 tracking-[-0.025em] text-ink transition-colors group-hover:text-[#c86544] dark:text-white dark:group-hover:text-[#e18463]">
                      {result.article.title}
                    </span>
                    <span className="mt-2 block text-sm leading-6 text-ink-muted dark:text-white/58">{result.article.description}</span>
                    <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#c86544] dark:text-[#e18463]">
                      Read guide
                      <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <EmptySearchState query={rawQuery} />
          )}
        </section>
      ) : (
        <section className="border-y border-black/8 py-10 dark:border-white/10">
          <p className="text-xl font-semibold tracking-[-0.025em] text-ink dark:text-white">Search across every guide</p>
          <p className="mt-3 max-w-xl text-sm leading-6 text-ink-muted dark:text-white/58">Try a topic such as verification, queue, payment hold, trust score, or direct booking.</p>
        </section>
      )}
    </div>
  );
}

function FilterButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#c86544] ${
        active
          ? 'border-[#171716] bg-charcoal text-white dark:border-[#f5f4f2] dark:bg-[#f5f4f2] dark:text-charcoal'
          : 'border-black/10 bg-[#fffdfa] text-ink-muted hover:border-[#c86544]/40 hover:text-[#c86544] dark:border-white/12 dark:bg-charcoal dark:text-white/64 dark:hover:border-[#e18463]/45 dark:hover:text-[#e18463]'
      }`}
    >
      {children}
    </button>
  );
}

function EmptySearchState({ query }: { query: string }) {
  return (
    <div className="border-b border-black/8 py-12 dark:border-white/10">
      <p className="text-xl font-semibold tracking-[-0.025em] text-ink dark:text-white">No guides matched &quot;{query}&quot;.</p>
      <p className="mt-3 max-w-xl text-sm leading-6 text-ink-muted dark:text-white/58">Try a broader term such as verification, queue, payment hold, or trust score.</p>
      <Link href="/help" className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-[#c86544] hover:text-[#aa5032] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c86544] dark:text-[#e18463]">
        Browse all collections
        <ArrowRight size={14} aria-hidden="true" />
      </Link>
    </div>
  );
}
