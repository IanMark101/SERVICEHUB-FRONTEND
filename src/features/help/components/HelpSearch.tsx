"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, ArrowRight, FileText, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { searchHelpArticles } from '../utils/helpSearch';
import { SearchResult } from '../types/help.types';
import { useApp } from '@/context/AppContext';

interface HelpSearchProps {
  initialQuery?: string;
  autoFocus?: boolean;
  size?: 'sm' | 'md' | 'lg';
  placeholder?: string;
  showLiveDropdown?: boolean;
}

export default function HelpSearch({
  initialQuery = '',
  autoFocus = false,
  size = 'lg',
  placeholder = 'Ask a question or search keywords (e.g. "Trust Score", "Queue", "Limited Mode")...',
  showLiveDropdown = true,
}: HelpSearchProps) {
  const router = useRouter();
  const { isDark } = useApp();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed || !showLiveDropdown) {
      setResults([]);
      setIsOpen(false);
      setSelectedIndex(-1);
      return;
    }

    const matched = searchHelpArticles(trimmed).slice(0, 5);
    setResults(matched);
    setIsOpen(matched.length > 0);
    setSelectedIndex(-1);
  }, [query, showLiveDropdown]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setIsOpen(false);
    router.push(`/help/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        e.preventDefault();
        const item = results[selectedIndex];
        setIsOpen(false);
        router.push(`/help/${item.article.category}/${item.article.slug}`);
      } else {
        handleSearchSubmit();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const sizeClasses = {
    sm: 'py-2 px-3.5 text-xs',
    md: 'py-3 px-4 text-sm',
    lg: 'py-4 px-5 text-sm sm:text-base',
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSearchSubmit} className="relative w-full group">
        <div
          className={`flex items-center w-full rounded-2xl border transition-all duration-300 shadow-sm ${
            isDark
              ? 'bg-[#22211e] border-neutral-800 focus-within:border-orange-500/80 focus-within:ring-2 focus-within:ring-orange-500/20'
              : 'bg-white border-slate-200 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20'
          }`}
        >
          <Search
            className={`ml-4 shrink-0 text-slate-400 dark:text-neutral-500 transition-colors ${
              size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'
            }`}
          />

          <input
            ref={inputRef}
            type="text"
            value={query}
            autoFocus={autoFocus}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (results.length > 0 && showLiveDropdown) setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`w-full bg-transparent outline-none font-medium placeholder:text-slate-400 dark:placeholder:text-neutral-500 text-slate-900 dark:text-[#f2efe9] ${sizeClasses[size]}`}
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setResults([]);
                setIsOpen(false);
                inputRef.current?.focus();
              }}
              className="p-1 mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            className="mr-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer shrink-0 hidden sm:flex items-center gap-1"
          >
            <span>Search</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </form>

      {/* Live autocomplete dropdown */}
      {isOpen && results.length > 0 && showLiveDropdown && (
        <div
          className={`absolute left-0 right-0 top-full mt-2 rounded-2xl border shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 ${
            isDark
              ? 'bg-[#22211e] border-neutral-800 text-[#f2efe9]'
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          <div className="p-2 space-y-1">
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500 flex items-center justify-between">
              <span>Matching Articles</span>
              <span>Use ↑↓ to navigate</span>
            </div>

            {results.map((res, index) => {
              const isSelected = selectedIndex === index;
              return (
                <Link
                  key={res.article.slug}
                  href={`/help/${res.article.category}/${res.article.slug}`}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${
                    isSelected
                      ? isDark
                        ? 'bg-orange-500/20 text-orange-400'
                        : 'bg-orange-50 text-orange-600'
                      : isDark
                      ? 'hover:bg-neutral-800/60'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h5 className="font-bold text-xs truncate">{res.article.title}</h5>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-md font-semibold bg-neutral-100 dark:bg-neutral-800 text-slate-500 dark:text-neutral-400 shrink-0">
                        {res.category.shortTitle || res.category.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-neutral-400 line-clamp-1 mt-0.5">
                      {res.article.description}
                    </p>
                  </div>
                </Link>
              );
            })}

            <div className="border-t border-slate-100 dark:border-neutral-800 pt-2 px-3 pb-1 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => handleSearchSubmit()}
                className="text-orange-600 dark:text-orange-400 font-bold hover:underline text-[11px] flex items-center gap-1"
              >
                <span>View all search results for "{query}"</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
