import React from 'react';
import { Megaphone, Bell } from '@phosphor-icons/react';
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
      <div className="space-y-5">
        <h2 className={`text-xl font-semibold tracking-[-0.025em] sm:text-2xl ${isDark ? 'text-[#f5f4f2]' : 'text-[#171716]'}`}>Guidance and notices</h2>
        <UpdatesSkeleton isDark={isDark} />
      </div>
    );
  }

  return (
    <section className="space-y-5" aria-labelledby="community-updates-title">
      <div>
        <h2 id="community-updates-title" className={`text-xl font-semibold tracking-[-0.025em] sm:text-2xl ${isDark ? 'text-[#f5f4f2]' : 'text-[#171716]'}`}>Guidance and notices</h2>
        <p className={`mt-2 text-sm leading-6 ${isDark ? 'text-[#aaa59d]' : 'text-[#625d57]'}`}>Practical guides and official updates from ServiceHub Cordova.</p>
      </div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <aside className="rounded-2xl bg-[#171716] p-6 text-[#f5f4f2] shadow-[0_18px_40px_-22px_rgba(23,23,22,0.5)] sm:p-7">
          <h3 className="text-base font-semibold tracking-[-0.02em]">Using ServiceHub</h3>
          <p className="mt-2 text-xs leading-5 text-[#aaa59d]">A few useful routes before you request or offer work.</p>
          <PlatformGuides />
        </aside>
        <div className={`rounded-2xl border p-6 sm:p-7 ${isDark ? 'border-white/10 bg-[#201f1c]' : 'border-black/8 bg-[#fffdfa]'}`}>
          <div className="flex items-center justify-between gap-3 border-b border-black/10 pb-4 dark:border-white/10">
            <div className="flex items-center gap-2">
              <Megaphone size={18} className="text-[#c86544]" aria-hidden="true" />
              <h3 className={`text-base font-semibold tracking-[-0.02em] ${isDark ? 'text-[#f5f4f2]' : 'text-[#171716]'}`}>Official announcements</h3>
            </div>
            <span className={`text-xs ${isDark ? 'text-[#aaa59d]' : 'text-[#827c75]'}`}>{announcements.length} published</span>
          </div>
          {announcements.length === 0 ? (
            <CommunityEmptyState icon={Bell} title="No official announcements at this time" description="Important ServiceHub Cordova notices will be published here." isDark={isDark} />
          ) : (
            <div className="divide-y divide-black/8 dark:divide-white/10">
              {announcements.map((item) => <CommunityUpdateCard key={item.id} item={item} isDark={isDark} />)}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
