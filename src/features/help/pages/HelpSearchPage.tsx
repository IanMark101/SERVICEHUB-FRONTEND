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
    <div className="w-full space-y-8 animate-in fade-in duration-200">
      <HelpBreadcrumbs items={[{ label: 'Search Results' }]} />

      {/* Search Header */}
      <div className="space-y-4 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Search Documentation
        </h1>
        <HelpSearch initialQuery={rawQuery} autoFocus={true} size="lg" showLiveDropdown={false} />
      </div>

      {/* Results Section */}
      <div className="space-y-6">
        {rawQuery ? (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-neutral-800 text-xs">
              <span className="font-semibold text-slate-700 dark:text-neutral-300 text-sm">
                {results.length} {results.length === 1 ? 'result' : 'results'} found for "{rawQuery}"
              </span>

              {/* Category Filter Pills */}
              {results.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
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
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {filteredResults.map((res) => (
                  <Link
                    key={res.article.slug}
                    href={`/help/${res.article.category}/${res.article.slug}`}
                    className="flex flex-col justify-between p-6 rounded-2xl border transition-all duration-200 group bg-white dark:bg-[#1a1916] border-slate-200 dark:border-neutral-800/80 hover:border-orange-500/60 hover:-translate-y-0.5 text-slate-800 dark:text-neutral-200 shadow-xs hover:shadow-md"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                          {res.category.title}
                        </span>
                        <span className="text-slate-300 dark:text-neutral-700">·</span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {res.article.readTimeMinutes} min read
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                        {res.article.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 line-clamp-3 mt-2 leading-relaxed">
                        {res.article.description}
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-neutral-800/60 flex items-center justify-between text-xs font-bold text-orange-600 dark:text-orange-400">
                      <span>Read article</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center space-y-3 rounded-2xl border border-dashed border-slate-200 dark:border-neutral-800">
                <p className="text-base font-bold text-slate-700 dark:text-neutral-300">
                  No articles matched your search query.
                </p>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                  Try searching for general terms like "verification", "queue", "payment hold", or "trust score".
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="p-12 text-center text-xs sm:text-sm text-slate-400 border rounded-2xl border-dashed border-slate-200 dark:border-neutral-800">
            Type keywords above to search across all ServiceHub Cordova documentation.
          </div>
        )}
      </div>
    </div>
  );
}
