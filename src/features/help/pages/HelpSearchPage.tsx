"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, ArrowRight } from 'lucide-react';
import HelpSearch from '../components/HelpSearch';
import HelpBreadcrumbs from '../components/HelpBreadcrumbs';
import { searchHelpArticles } from '../utils/helpSearch';
import { SearchResult } from '../types/help.types';
import { HELP_CATEGORIES } from '../data/categories';

export default function HelpSearchPage() {
  const searchParams = useSearchParams();
  const rawQuery = searchParams.get('q') || '';

  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    if (rawQuery) {
      const res = searchHelpArticles(rawQuery);
      setResults(res);
    } else {
      setResults([]);
    }
  }, [rawQuery]);

  const filteredResults = selectedCategory === 'all'
    ? results
    : results.filter((r) => r.article.category === selectedCategory);

  return (
    <div className="max-w-3xl mx-auto py-2 space-y-8 animate-in fade-in duration-200">
      <HelpBreadcrumbs items={[{ label: 'Search Results' }]} />

      {/* Search Header */}
      <div className="space-y-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Search Results
        </h1>
        <HelpSearch initialQuery={rawQuery} autoFocus={true} size="md" showLiveDropdown={false} />
      </div>

      {/* Results Section */}
      <div className="space-y-6">
        {rawQuery ? (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-neutral-800 text-xs">
              <span className="font-medium text-slate-600 dark:text-neutral-400">
                {results.length} {results.length === 1 ? 'result' : 'results'} for "{rawQuery}"
              </span>

              {/* Category Filter Pills */}
              {results.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                      selectedCategory === 'all'
                        ? 'bg-orange-600 text-white'
                        : 'bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 hover:bg-slate-200 dark:hover:bg-neutral-700'
                    }`}
                  >
                    All ({results.length})
                  </button>
                  {HELP_CATEGORIES.map((cat) => {
                    const count = results.filter((r) => r.article.category === cat.slug).length;
                    if (count === 0) return null;
                    return (
                      <button
                        key={cat.slug}
                        onClick={() => setSelectedCategory(cat.slug)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                          selectedCategory === cat.slug
                            ? 'bg-orange-600 text-white'
                            : 'bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 hover:bg-slate-200 dark:hover:bg-neutral-700'
                        }`}
                      >
                        {cat.shortTitle || cat.title} ({count})
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {filteredResults.length > 0 ? (
              <div className="space-y-3">
                {filteredResults.map((res) => (
                  <Link
                    key={res.article.slug}
                    href={`/help/${res.article.category}/${res.article.slug}`}
                    className="flex items-center justify-between p-4 sm:p-5 rounded-xl border transition-colors group bg-white dark:bg-[#1e1d1a] border-slate-200 dark:border-neutral-800/80 hover:border-slate-300 dark:hover:border-neutral-700 text-slate-800 dark:text-neutral-200 shadow-xs"
                  >
                    <div className="min-w-0 pr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                          {res.category.title}
                        </span>
                        <span className="text-slate-300 dark:text-neutral-700">·</span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {res.article.readTimeMinutes} min read
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                        {res.article.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-neutral-400 line-clamp-2 mt-1 leading-relaxed">
                        {res.article.description}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center space-y-3 rounded-xl border border-dashed border-slate-200 dark:border-neutral-800">
                <p className="text-sm font-semibold text-slate-700 dark:text-neutral-300">
                  No articles matched your search query.
                </p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Try searching for general terms like "verification", "queue", "escrow", or "trust score".
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="p-8 text-center text-xs text-slate-400 border rounded-xl border-dashed border-slate-200 dark:border-neutral-800">
            Type keywords above to search across all ServiceHub Cordova documentation.
          </div>
        )}
      </div>
    </div>
  );
}
