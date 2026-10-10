import React from 'react';
import { useRouter } from 'next/navigation';
import { Sparkle } from '@phosphor-icons/react';
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
      <section id="community-newly-approved" className="scroll-mt-24 space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
          <div className="flex items-center gap-2.5"><Sparkle size={18} className="text-brand-text" aria-hidden="true" /><h2 className={`text-lg font-black tracking-tight sm:text-2xl ${isDark ? 'text-white' : 'text-ink'}`}>Recently added</h2></div>
          <span className="text-xs text-ink-muted">Added in the last 30 days</span>
        </div>
        <RecentGridSkeleton isDark={isDark} />
      </section>
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

  const handleSelectProvider = (id: string) => {
    router.push(`/profile/${encodeURIComponent(id)}`);
  };

  return (
    <section id="community-newly-approved" className="scroll-mt-24 space-y-4" aria-labelledby="recently-added-title">
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
        <div className="flex items-center gap-2.5">
          <Sparkle size={18} className="text-brand-text" aria-hidden="true" />
          <h2 id="recently-added-title" className={`text-lg sm:text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-ink'}`}>
            Recently added
          </h2>
        </div>
        <span className={`text-xs ${isDark ? 'text-ink-muted' : 'text-ink-muted'}`}>
          Added in the last 30 days
        </span>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(17rem,0.85fr)]">
        <NewServicesSection
          services={services}
          isDark={isDark}
          onSelectService={handleSelectService}
          onSelectProvider={handleSelectProvider}
        />
        <NewCategoriesSection
          categories={categories}
          isDark={isDark}
          onSelectCategory={handleSelectCategory}
        />
      </div>
    </section>
  );
}
