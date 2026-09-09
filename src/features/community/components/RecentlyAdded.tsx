import React from 'react';
import { useRouter } from 'next/navigation';
import { FolderPlus } from 'lucide-react';
import { RecentCategory } from '../types/community.types';
import { RecentGridSkeleton } from './CommunitySkeletons';
import NewCategoriesSection from './NewCategoriesSection';

interface RecentlyAddedProps {
  categories: RecentCategory[];
  loading?: boolean;
  isDark?: boolean;
  workspaceRole?: 'seeker' | 'provider' | 'admin';
}

export default function RecentlyAdded({
  categories = [],
  loading = false,
  isDark = false,
  workspaceRole = 'seeker',
}: RecentlyAddedProps) {
  const router = useRouter();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <h2 className={`font-extrabold text-sm uppercase tracking-wider flex items-center space-x-2 ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
            <FolderPlus className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span>Newly Added Categories</span>
          </h2>
          <RecentGridSkeleton isDark={isDark} />
        </div>
      </div>
    );
  }

  const handleSelectCategory = (name: string) => {
    const prefix = workspaceRole === 'provider' ? '/provider/browse-services' : '/seeker/seek-services';
    router.push(`${prefix}?category=${encodeURIComponent(name)}`);
  };

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FolderPlus className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          <h2 className={`workspace-section-title ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
            Newly Added Categories
          </h2>
        </div>
        <span className={`text-[10px] font-semibold ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>
          {categories.length} recently approved
        </span>
      </div>

      <div>
        <NewCategoriesSection
          categories={categories}
          isDark={isDark}
          onSelectCategory={handleSelectCategory}
        />
      </div>
    </div>
  );
}
