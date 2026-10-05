import React from 'react';
import { Megaphone, Bell, BookOpen } from '@phosphor-icons/react';
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
      <section id="community-announcements" className="scroll-mt-24 space-y-4">
        <div>
          <h2 className={`text-xl font-extrabold tracking-tight sm:text-2xl ${isDark ? 'text-white' : 'text-ink'}`}>Guidance and notices</h2>
          <p className={`mt-1 text-sm leading-relaxed ${isDark ? 'text-ink-subtle' : 'text-ink-muted'}`}>Practical platform guides and official notices from ServiceHub Cordova.</p>
        </div>
        <UpdatesSkeleton isDark={isDark} columns={2} />
      </section>
    );
  }

  return (
    <section id="community-announcements" className="scroll-mt-24 space-y-4" aria-labelledby="community-updates-title">
      <div>
        <h2 id="community-updates-title" className={`text-xl font-extrabold tracking-tight sm:text-2xl ${isDark ? 'text-white' : 'text-ink'}`}>
          Guidance and notices
        </h2>
        <p className={`mt-1 text-sm leading-relaxed ${isDark ? 'text-ink-subtle' : 'text-ink-muted'}`}>
          Practical platform guides and official notices from ServiceHub Cordova.
        </p>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(18rem,0.9fr)]">
        {/* Column 1: Official Municipal Announcements */}
        <div className={`min-w-0 rounded-3xl border p-5 sm:p-6 transition-all ${
          isDark
            ? 'bg-[#1c1b18] border-neutral-800/90 shadow-xl shadow-black/40'
            : 'bg-white border-slate-200/90 shadow-sm shadow-slate-900/5'
        }`}>
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-neutral-800/80 pb-3.5">
            <div className="flex items-center gap-2">
              <Megaphone size={18} className="text-[#c86544]" aria-hidden="true" />
              <h3 className={`text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-ink'}`}>
                Official announcements
              </h3>
            </div>
            <span className={`text-xs font-semibold ${isDark ? 'text-ink-subtle' : 'text-ink-muted'}`}>
              {announcements.length} published
            </span>
          </div>
          {announcements.length === 0 ? (
            <div className="pt-4">
              <CommunityEmptyState
                icon={Bell}
                title="No official announcements at this time"
                description="Important ServiceHub Cordova notices will be published here."
                isDark={isDark}
              />
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-neutral-800/80">
              {announcements.map((item) => (
                <CommunityUpdateCard key={item.id} item={item} isDark={isDark} />
              ))}
            </div>
          )}
        </div>

        {/* Column 2: Platform Rules & Guides (Handbook) */}
        <div className={`min-w-0 rounded-3xl border p-5 sm:p-6 transition-all ${
          isDark
            ? 'bg-[#1c1b18] border-neutral-800/90 shadow-xl shadow-black/40'
            : 'bg-white border-slate-200/90 shadow-sm shadow-slate-900/5'
        }`}>
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-neutral-800/80 pb-3.5">
            <div className="flex items-center gap-2">
              <BookOpen size={18} className="text-[#c86544]" aria-hidden="true" />
              <h3 className={`text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-ink'}`}>
                Using ServiceHub
              </h3>
            </div>
            <span className={`text-xs font-semibold ${isDark ? 'text-ink-subtle' : 'text-ink-muted'}`}>
              Platform rules
            </span>
          </div>
          <div className="pt-1">
            <PlatformGuides isDark={isDark} />
          </div>
        </div>
      </div>
    </section>
  );
}

export function CommunityGuidancePanel() {
  return null;
}
