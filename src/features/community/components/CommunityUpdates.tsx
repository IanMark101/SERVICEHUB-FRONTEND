import React from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Bell } from 'lucide-react';
import { CommunityUpdateItem } from '../types/community.types';
import { UpdatesSkeleton } from './CommunitySkeletons';
import CommunityEmptyState from './CommunityEmptyState';
import CommunityUpdateCard from './CommunityUpdateCard';

interface CommunityUpdatesProps {
  updates: CommunityUpdateItem[];
  loading?: boolean;
  isDark?: boolean;
}

export default function CommunityUpdates({
  updates = [],
  loading = false,
  isDark = false,
}: CommunityUpdatesProps) {
  const router = useRouter();

  if (loading) {
    return (
      <div className="space-y-3.5">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-orange-500" />
          <h2 className={`font-extrabold text-sm uppercase tracking-wider ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
            Community Updates
          </h2>
        </div>
        <UpdatesSkeleton isDark={isDark} />
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-orange-500" />
          <h2 className={`font-extrabold text-sm uppercase tracking-wider ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
            Community Updates
          </h2>
        </div>
        <span className={`text-[10px] font-semibold ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>
          Important community notices & marketplace capabilities
        </span>
      </div>

      {updates.length === 0 ? (
        <CommunityEmptyState
          icon={Bell}
          title="No community updates yet"
          description="Platform announcements and community milestones will appear here."
          isDark={isDark}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {updates.map((item) => (
            <CommunityUpdateCard
              key={item.id}
              item={item}
              isDark={isDark}
              onAction={(link) => router.push(link)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
