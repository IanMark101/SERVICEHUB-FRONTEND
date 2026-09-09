import React from 'react';
import { Megaphone, Bell } from 'lucide-react';
import { CommunityAnnouncement } from '../types/community.types';
import { UpdatesSkeleton } from './CommunitySkeletons';
import CommunityEmptyState from './CommunityEmptyState';
import CommunityUpdateCard from './CommunityUpdateCard';

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
            Official Announcements
          </h2>
        </div>
        <UpdatesSkeleton isDark={isDark} />
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <Megaphone className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          <h2 className={`workspace-section-title ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
            Official Announcements
          </h2>
        </div>
        <span className={`text-[10px] font-semibold ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>
          {announcements.length} published
        </span>
      </div>

      {announcements.length === 0 ? (
        <CommunityEmptyState
          icon={Bell}
          title="No official announcements at this time"
          description="Important ServiceHub Cordova notices will be published here."
          isDark={isDark}
        />
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {announcements.map((item) => (
            <CommunityUpdateCard
              key={item.id}
              item={item}
              isDark={isDark}
            />
          ))}
        </div>
      )}
    </div>
  );
}
