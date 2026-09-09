import React from 'react';
import { useRouter } from 'next/navigation';
import { FolderPlus } from 'lucide-react';
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
      <div className="space-y-6">
        <div className="space-y-3">
          <h2 className={`font-extrabold text-sm uppercase tracking-wider flex items-center space-x-2 ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
            <FolderPlus className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span>Recently Added</span>
          </h2>
          <div className="grid gap-4 xl:grid-cols-2"><RecentGridSkeleton isDark={isDark} /><RecentGridSkeleton isDark={isDark} /></div>
        </div>
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
    <section className="space-y-3.5" aria-labelledby="recently-added-title">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FolderPlus className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          <h2 id="recently-added-title" className={`workspace-section-title ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
            Recently Added
          </h2>
        </div>
        <span className={`text-[10px] font-semibold ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>
          Approved in the last 30 days
        </span>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
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
