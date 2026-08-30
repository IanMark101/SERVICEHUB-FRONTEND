import React from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { RecentCategory, RecentService } from '../types/community.types';
import { RecentGridSkeleton } from './CommunitySkeletons';
import NewCategoriesSection from './NewCategoriesSection';
import NewServicesSection from './NewServicesSection';

interface RecentlyAddedProps {
  categories: RecentCategory[];
  services: RecentService[];
  loading?: boolean;
  isDark?: boolean;
  workspaceRole?: 'seeker' | 'provider' | 'admin';
}

export default function RecentlyAdded({
  categories = [],
  services = [],
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
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span>Recently Added</span>
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

  const handleSelectService = (title: string) => {
    const prefix = workspaceRole === 'provider' ? '/provider/browse-services' : '/seeker/seek-services';
    router.push(`${prefix}?search=${encodeURIComponent(title)}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-orange-500" />
          <h2 className={`font-extrabold text-sm uppercase tracking-wider ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
            Recently Added
          </h2>
        </div>
        <span className={`text-[10px] font-semibold ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>
          Newly approved categories & marketplace listings
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NewCategoriesSection
          categories={categories}
          isDark={isDark}
          onSelectCategory={handleSelectCategory}
        />

        <NewServicesSection
          services={services}
          isDark={isDark}
          onSelectService={handleSelectService}
        />
      </div>
    </div>
  );
}
