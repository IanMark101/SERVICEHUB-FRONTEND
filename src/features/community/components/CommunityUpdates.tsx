import React from 'react';
import { Megaphone, Bell } from 'lucide-react';
import { CommunityAnnouncement } from '../types/community.types';
import { UpdatesSkeleton } from './CommunitySkeletons';
import CommunityEmptyState from './CommunityEmptyState';
import CommunityUpdateCard from './CommunityUpdateCard';
import PlatformGuides from './PlatformGuides';

interface CommunityUpdatesProps {
  announcements: CommunityAnnouncement[];
  loading?: boolean;
  isDark?: boolean;
}

export default function CommunityUpdates({
  announcements = [],
  loading = false,
  isDark = false,
}: CommunityUpdatesProps) {
  if (loading) {
    return (
      <div className="space-y-3.5">
        <div className="flex items-center space-x-2">
          <Megaphone className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          <h2 className={`workspace-section-title ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
            Community Updates
          </h2>
        </div>
        <UpdatesSkeleton isDark={isDark} />
      </div>
    );
  }

  return (
    <section className="space-y-5" aria-labelledby="community-updates-title">
      <div>
        <div className="flex items-center space-x-2">
          <Megaphone className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          <h2 id="community-updates-title" className={`workspace-section-title ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
            Community Updates
          </h2>
        </div>
        <p className={`mt-1 text-xs ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>Current ServiceHub guidance and official notices from the platform.</p>
      </div>

      <div className="space-y-3">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-neutral-400">Using ServiceHub</h3>
        <PlatformGuides isDark={isDark} />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-neutral-400">Official announcements</h3>
          <span className={`text-[10px] font-semibold ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>{announcements.length} published</span>
        </div>

        {announcements.length === 0 ? (
          <CommunityEmptyState icon={Bell} title="No official announcements at this time" description="Important ServiceHub Cordova notices will be published here." isDark={isDark} />
        ) : (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            {announcements.map((item) => <CommunityUpdateCard key={item.id} item={item} isDark={isDark} />)}
          </div>
        )}
      </div>
    </section>
  );
}
