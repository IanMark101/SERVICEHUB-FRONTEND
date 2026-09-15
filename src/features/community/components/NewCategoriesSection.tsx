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
    <section className={`rounded-2xl border p-5 sm:p-6 ${isDark ? 'border-white/10 bg-[#201f1c]' : 'border-black/8 bg-[#fffdfa]'}`} aria-labelledby="new-categories-title">
      <div className="flex items-center justify-between gap-3 border-b border-black/10 pb-4 dark:border-white/10">
        <div className="flex items-center gap-2">
          <Tag size={18} className="text-[#c86544]" aria-hidden="true" />
          <h3 id="new-categories-title" className={`text-base font-semibold tracking-[-0.02em] ${isDark ? 'text-[#f5f4f2]' : 'text-[#171716]'}`}>New categories</h3>
        </div>
        <span className={`text-xs ${isDark ? 'text-[#aaa59d]' : 'text-[#6f6a64]'}`}>{categories.length} approved</span>
      </div>

      {categories.length === 0 ? (
        <div className="pt-5">
          <CommunityEmptyState title="No new categories have been added recently" description="When the administration approves community category suggestions, they will be highlighted here." isDark={isDark} />
        </div>
      ) : (
        <div className="divide-y divide-black/8 dark:divide-white/10">
          {categories.map((category) => (
            <button
              type="button"
              key={category.id}
              onClick={() => onSelectCategory(category.name)}
              aria-label={`Browse ${category.name} services`}
              className="group flex w-full items-start gap-3 py-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c86544]"
            >
              <span className="min-w-0 flex-1">
                <span className={`block text-sm font-semibold leading-5 tracking-[-0.02em] transition-colors group-hover:text-[#aa5032] dark:group-hover:text-[#e9a58c] ${isDark ? 'text-[#f5f4f2]' : 'text-[#171716]'}`}>{category.name}</span>
                {category.description && <span className={`mt-1 block text-xs leading-5 ${isDark ? 'text-[#aaa59d]' : 'text-[#625d57]'}`}>{category.description}</span>}
                {category.reviewedAt && <span className={`mt-2 block text-[11px] ${isDark ? 'text-[#8f8a82]' : 'text-[#6f6a64]'}`}>Approved {new Date(category.reviewedAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
              </span>
              <ArrowUpRight size={16} className="mt-0.5 shrink-0 text-[#827c75] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
