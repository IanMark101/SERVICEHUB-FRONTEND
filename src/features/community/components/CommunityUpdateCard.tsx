import React from 'react';
import { Megaphone, SealCheck } from '@phosphor-icons/react';
import type { CommunityAnnouncement } from '../types/community.types';

interface CommunityUpdateCardProps {
  item: CommunityAnnouncement;
  isDark?: boolean;
}

export default function CommunityUpdateCard({ item, isDark = false }: CommunityUpdateCardProps) {
  return (
    <article className="flex gap-3 py-4 first:pt-4 last:pb-0">
      <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${isDark ? 'bg-[#c86544]/15 text-[#e9a58c]' : 'bg-[#f5ebe6] text-[#aa5032]'}`} aria-hidden="true"><Megaphone size={16} /></span>
      <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
        <h4 className={`text-sm font-semibold leading-5 tracking-[-0.02em] ${isDark ? 'text-white' : 'text-ink'}`}>{item.title}</h4>
        <time dateTime={item.publishedAt} className={`shrink-0 text-xs ${isDark ? 'text-ink-muted' : 'text-ink-muted'}`}>
          {new Date(item.publishedAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
        </time>
      </div>
      <p className={`mt-1.5 text-sm leading-6 ${isDark ? 'text-ink-secondary' : 'text-ink-muted'}`}>{item.body}</p>
      <p className={`mt-2.5 flex items-center gap-1.5 text-xs ${isDark ? 'text-ink-muted' : 'text-ink-muted'}`}>
        <SealCheck size={15} className="text-[#c86544]" aria-hidden="true" />
        Posted by {item.author?.name || 'ServiceHub Cordova Administration'}
      </p>
      </div>
    </article>
  );
}
