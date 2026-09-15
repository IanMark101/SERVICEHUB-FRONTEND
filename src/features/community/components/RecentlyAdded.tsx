import React from 'react';
import { useRouter } from 'next/navigation';
import { FolderPlus } from '@phosphor-icons/react';
import { RecentCategory, RecentService } from '../types/community.types';
import { RecentGridSkeleton } from './CommunitySkeletons';
import NewCategoriesSection from './NewCategoriesSection';
import NewServicesSection from './NewServicesSection';

interface RecentlyAddedProps {
  categories: RecentCategory[];
  services: RecentService[];
  loading?: boolean;
  isDark?: boolean;
}

export default function RecentlyAdded({
  categories = [],
  services = [],
  loading = false,
  isDark = false,
}: RecentlyAddedProps) {
  const router = useRouter();

  if (loading) {
    return (
      <div className="space-y-5">
        <h2 className={`text-xl font-semibold tracking-[-0.025em] sm:text-2xl ${isDark ? 'text-[#f5f4f2]' : 'text-[#171716]'}`}>Newly approved</h2>
        <RecentGridSkeleton isDark={isDark} />
      </div>
    );
  }

  const handleSelectCategory = (name: string) => {
    if (typeof window !== 'undefined') localStorage.setItem('workspaceRole', 'seeker');
    router.push(`/seeker/seek-services?category=${encodeURIComponent(name)}`);
  };

  const handleSelectService = (id: string) => {
    if (typeof window !== 'undefined') localStorage.setItem('workspaceRole', 'seeker');
    router.push(`/seeker/seek-services?serviceId=${encodeURIComponent(id)}`);
  };

  return (
    <section className="space-y-5" aria-labelledby="recently-added-title">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FolderPlus className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          <h2 id="recently-added-title" className={`text-xl font-semibold tracking-[-0.025em] sm:text-2xl ${isDark ? 'text-[#f5f4f2]' : 'text-[#171716]'}`}>
            Newly approved
          </h2>
        </div>
        <span className={`text-[10px] font-semibold ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>
          Approved in the last 30 days
        </span>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <NewCategoriesSection
          categories={categories}
          isDark={isDark}
          onSelectCategory={handleSelectCategory}
        />
        <NewServicesSection services={services} isDark={isDark} onSelectService={handleSelectService} />
      </div>
    </section>
  );
}
