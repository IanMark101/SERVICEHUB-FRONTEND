import React from 'react';
import { Tag, ArrowUpRight, Calendar, FolderPlus } from 'lucide-react';
import { RecentCategory } from '../types/community.types';
import CommunityEmptyState from './CommunityEmptyState';

interface NewCategoriesSectionProps {
  categories: RecentCategory[];
  isDark?: boolean;
  onSelectCategory: (name: string) => void;
}

export default function NewCategoriesSection({
  categories = [],
  isDark = false,
  onSelectCategory,
}: NewCategoriesSectionProps) {
  return (
    <div
      className={`rounded-2xl p-5 border shadow-sm space-y-4 ${
        isDark ? 'bg-[#22211e] border-neutral-800/80' : 'bg-white border-slate-200'
      }`}
    >
      <div className="flex items-center justify-between border-b pb-3 dark:border-neutral-800/80">
        <h3 className={`font-extrabold text-xs uppercase tracking-wider flex items-center space-x-2 ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
          <Tag className="w-3.5 h-3.5 text-orange-500" />
          <span>New Categories</span>
        </h3>
        <span className={`text-[10px] font-bold ${isDark ? 'text-[#b4b0a9]' : 'text-slate-400'}`}>
          {categories.length} approved
        </span>
      </div>

      {categories.length === 0 ? (
        <CommunityEmptyState
          icon={FolderPlus}
          title="No new categories have been added recently"
          description="When the administration approves community category suggestions, they will be highlighted here."
          isDark={isDark}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {categories.map((cat) => (
            <button
              type="button"
              key={cat.id}
              onClick={() => onSelectCategory(cat.name)}
              className={`w-full text-left border rounded-xl p-3.5 space-y-1.5 transition-all duration-200 cursor-pointer select-none group/cat hover:border-orange-500/50 hover:shadow-sm ${
                isDark
                  ? 'bg-[#191919] border-neutral-800/80 hover:bg-neutral-800/40 text-[#f2efe9]'
                  : 'bg-slate-50 border-slate-200/80 hover:bg-white text-slate-900'
              }`}
              title={`Browse ${cat.name} services`}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-xs uppercase tracking-wide truncate group-hover/cat:text-orange-500 transition-colors">
                  {cat.name}
                </h4>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover/cat:text-orange-500 transition-colors" />
              </div>
              {cat.description && (
                <p className={`text-[10.5px] font-medium leading-relaxed line-clamp-2 ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>
                  {cat.description}
                </p>
              )}
              {cat.reviewedAt && (
                <div className={`text-[9px] font-bold flex items-center pt-1 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>
                    Approved {new Date(cat.reviewedAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
