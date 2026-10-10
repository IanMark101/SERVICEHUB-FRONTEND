"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Article, MagnifyingGlass, X } from '@phosphor-icons/react';
import Link from 'next/link';
import { searchHelpArticles } from '../utils/helpSearch';
import { SearchResult } from '../types/help.types';

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
  size = 'md',
  placeholder = 'Search help articles, guides, or questions...',
  showLiveDropdown = true,
}: HelpSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setQuery(initialQuery), 0);
    return () => window.clearTimeout(timer);
  }, [initialQuery]);

  const results: SearchResult[] = query.trim() && showLiveDropdown
    ? searchHelpArticles(query.trim()).slice(0, 5)
    : [];

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setSelectedIndex(-1);
    setIsOpen(Boolean(value.trim() && showLiveDropdown && searchHelpArticles(value.trim()).length));
  };

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
    md: 'py-2.5 px-4 text-xs sm:text-sm',
    lg: 'py-3.5 px-5 text-sm sm:text-base',
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSearchSubmit} className="relative w-full group">
        <div className="form-control-group flex w-full items-center rounded-2xl border border-black/10 bg-[#fffdfa] shadow-[0_10px_28px_rgba(23,23,22,0.06)] transition-colors focus-within:border-brand-focus focus-within:ring-2 focus-within:ring-brand/15 dark:border-white/12 dark:bg-charcoal">
          <MagnifyingGlass
            className={`ml-4 shrink-0 text-ink-subtle transition-colors dark:text-white/48 ${
              size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'
            }`}
            aria-hidden="true"
          />

          <input
            data-form-unstyled
            ref={inputRef}
            type="text"
            value={query}
            autoFocus={autoFocus}
            onChange={(e) => handleQueryChange(e.target.value)}
            onFocus={() => {
              if (results.length > 0 && showLiveDropdown) setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            aria-label="Search the ServiceHub help center"
            className={`w-full bg-transparent font-medium text-ink outline-none placeholder:text-ink-subtle dark:text-white dark:placeholder:text-white/42 ${sizeClasses[size]}`}
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setIsOpen(false);
                inputRef.current?.focus();
              }}
              aria-label="Clear help search"
              className="mr-2 cursor-pointer rounded-lg p-1 text-ink-subtle transition-colors hover:text-ink dark:text-white/48 dark:hover:text-white"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )}

          <button
            type="submit"
            className="servicehub-dark-cta mr-1.5 hidden shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-charcoal px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-charcoal active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-focus sm:flex dark:bg-[#f5f4f2] dark:text-charcoal dark:hover:bg-white"
          >
            <span className="relative z-10">Search</span>
            <ArrowRight className="relative z-10 w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </form>

      {/* Live autocomplete dropdown */}
      {isOpen && results.length > 0 && showLiveDropdown && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-black/10 bg-[#fffdfa] text-ink shadow-[0_18px_50px_rgba(23,23,22,0.13)] dark:border-white/12 dark:bg-charcoal dark:text-white">
          <div className="p-2 space-y-1">
            <div className="flex items-center justify-between px-3 py-2 text-[11px] font-medium text-ink-subtle dark:text-white/48">
              <span>Matching articles</span>
              <span>Arrow keys to move</span>
            </div>

            {results.map((res, index) => {
              const isSelected = selectedIndex === index;
              return (
                <Link
                  key={res.article.slug}
                  href={`/help/${res.article.category}/${res.article.slug}`}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-start gap-3 p-2.5 rounded-lg transition-colors ${
                    isSelected
                      ? 'bg-orange-100 text-brand-action-hover dark:bg-brand/18 dark:text-orange-300'
                      : 'hover:bg-[#f5f4f2] dark:hover:bg-charcoal'
                  }`}
                >
                  <div className="mt-0.5 shrink-0 rounded-lg bg-orange-100 p-1.5 text-brand-text dark:bg-charcoal dark:text-brand-on-dark">
                    <Article className="w-3.5 h-3.5" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h5 className="truncate text-xs font-semibold text-ink dark:text-white">
                        {res.article.title}
                      </h5>
                      <span className="shrink-0 text-[10px] font-medium text-ink-subtle dark:text-white/48">
                        {res.category.shortTitle || res.category.title}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-[11px] text-ink-muted dark:text-white/58">
                      {res.article.description}
                    </p>
                  </div>
                </Link>
              );
            })}

            <div className="flex items-center justify-between border-t border-black/8 px-3 pb-1 pt-2 text-xs dark:border-white/10">
              <button
                type="button"
                onClick={() => handleSearchSubmit()}
                className="flex items-center gap-1 text-[11px] font-semibold text-brand-text  dark:text-brand-on-dark"
              >
                <span>View all search results for &quot;{query}&quot;</span>
                <ArrowRight className="w-3 h-3" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
