"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, FileText, ArrowRight, Sparkles, Filter, HelpCircle } from 'lucide-react';
import HelpSearch from '../components/HelpSearch';
import HelpBreadcrumbs from '../components/HelpBreadcrumbs';
import HelpArticleCard from '../components/HelpArticleCard';
import { searchHelpArticles } from '../utils/helpSearch';
import { SearchResult, HelpCategorySlug } from '../types/help.types';
import { HELP_CATEGORIES } from '../data/categories';
import { useApp } from '@/context/AppContext';

export default function HelpSearchPage() {
  const searchParams = useSearchParams();
  const rawQuery = searchParams.get('q') || '';
  const { isDark } = useApp();

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

  const popularQueries = ['Verification', 'Trust Score', 'Queue', 'GCash', 'Limited Mode', 'Direct Booking', 'Disputes'];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <HelpBreadcrumbs items={[{ label: 'Search Results' }]} />

      {/* Search Header */}
      <div className="space-y-4 text-center max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-[#f2efe9]">
          Search Documentation
        </h1>
        <HelpSearch initialQuery={rawQuery} autoFocus={true} size="md" showLiveDropdown={false} />

        {/* Quick query chips */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
          <span className="text-[11px] font-semibold text-slate-400 dark:text-neutral-500">
            Suggested:
          </span>
          {popularQueries.map((term) => (
            <Link
              key={term}
              href={`/help/search?q=${encodeURIComponent(term)}`}
              className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300 hover:text-orange-500 transition-colors"
            >
              {term}
            </Link>
          ))}
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-6">
        {rawQuery ? (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-slate-200 dark:border-neutral-800">
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-[#f2efe9]">
                  {results.length} {results.length === 1 ? 'result' : 'results'} found for "{rawQuery}"
                </h2>
                <p className="text-xs text-slate-400 dark:text-neutral-500 mt-0.5">
                  Ordered by relevance to your search terms.
                </p>
              </div>

              {/* Category Filter Pills */}
              {results.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                  <span className="text-[11px] font-bold text-slate-400 shrink-0">Filter:</span>
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      selectedCategory === 'all'
                        ? 'bg-orange-500 text-white shadow-xs'
                        : isDark
                        ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                          selectedCategory === cat.slug
                            ? 'bg-orange-500 text-white shadow-xs'
                            : isDark
                            ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredResults.map((res) => (
                  <HelpArticleCard
                    key={res.article.slug}
                    article={res.article}
                    showCategory={true}
                  />
                ))}
              </div>
            ) : (
              <div
                className={`rounded-[26px] p-10 sm:p-14 border text-center space-y-4 ${
                  isDark ? 'bg-[#22211e] border-neutral-800 text-[#f2efe9]' : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 mx-auto flex items-center justify-center">
                  <Search className="w-6 h-6" />
                </div>
                <div className="space-y-1 max-w-md mx-auto">
                  <h3 className="text-lg font-bold">No articles match your query</h3>
                  <p className="text-xs text-slate-500 dark:text-neutral-400 leading-relaxed">
                    Try checking your spelling, using more general keywords like "verification" or "queue", or browse topics by category.
                  </p>
                </div>
                <Link
                  href="/help"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <span>Browse All Categories</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </>
        ) : (
          <div
            className={`rounded-[26px] p-10 border text-center space-y-3 ${
              isDark ? 'bg-[#22211e] border-neutral-800 text-[#f2efe9]' : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <HelpCircle className="w-8 h-8 text-orange-500 mx-auto" />
            <h3 className="font-bold text-sm">Type a search query above to find guides</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Search by topics such as "How does escrow work", "Residency proof", or "Trust Score history".
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
