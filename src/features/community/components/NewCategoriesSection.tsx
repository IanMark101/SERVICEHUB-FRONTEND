import React from 'react';
import { ArrowUpRight, Tag } from '@phosphor-icons/react';
import type { RecentCategory } from '../types/community.types';
import CommunityEmptyState from './CommunityEmptyState';

interface NewCategoriesSectionProps {
  categories: RecentCategory[];
  isDark?: boolean;
  onSelectCategory: (name: string) => void;
}

export default function NewCategoriesSection({ categories = [], isDark = false, onSelectCategory }: NewCategoriesSectionProps) {
  return (
    <section className={`min-w-0 rounded-3xl border p-4 sm:p-6 transition-all ${
      isDark
        ? 'bg-charcoal-inset border-neutral-800/90 shadow-xl shadow-black/40'
        : 'bg-white border-slate-200/90 shadow-sm shadow-slate-900/5'
    }`} aria-labelledby="new-categories-title">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-neutral-800/80 pb-3.5">
        <div className="flex items-center gap-2">
          <Tag size={18} className="text-[#c86544]" aria-hidden="true" />
          <h3 id="new-categories-title" className={`text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-ink'}`}>New categories</h3>
        </div>
        <span className={`text-xs font-semibold ${isDark ? 'text-ink-subtle' : 'text-ink-muted'}`}>{categories.length} approved</span>
      </div>

      {categories.length === 0 ? (
        <div className="pt-4">
          <CommunityEmptyState title="No new categories have been added recently" description="New categories appear here after admins approve a category suggestion." isDark={isDark} />
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-neutral-800/80">
          {categories.map((category) => (
            <button
              type="button"
              key={category.id}
              onClick={() => onSelectCategory(category.name)}
              aria-label={`Browse ${category.name} services`}
              className="group flex w-full items-start gap-3 py-3.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c86544]"
            >
              <span className="min-w-0 flex-1">
                <span className={`block text-sm font-semibold leading-5 tracking-[-0.02em] transition-colors group-hover:text-[#aa5032] dark:group-hover:text-[#e9a58c] ${isDark ? 'text-white' : 'text-ink'}`}>{category.name}</span>
                {category.description && <span className={`mt-1 block text-xs leading-5 ${isDark ? 'text-ink-muted' : 'text-ink-muted'}`}>{category.description}</span>}
                {category.reviewedAt && <span className={`mt-2 block text-[11px] ${isDark ? 'text-ink-subtle' : 'text-ink-muted'}`}>Approved {new Date(category.reviewedAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
              </span>
              <ArrowUpRight size={16} className="mt-0.5 shrink-0 text-ink-subtle transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
