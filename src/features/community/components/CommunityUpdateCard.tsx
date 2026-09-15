import React from 'react';
import { SealCheck } from '@phosphor-icons/react';
import type { CommunityAnnouncement } from '../types/community.types';

interface CommunityUpdateCardProps {
  item: CommunityAnnouncement;
  isDark?: boolean;
}

export default function CommunityUpdateCard({ item, isDark = false }: CommunityUpdateCardProps) {
  return (
    <article className="py-5 first:pt-5 last:pb-0">
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
        <h4 className={`text-sm font-semibold leading-5 tracking-[-0.02em] ${isDark ? 'text-[#f5f4f2]' : 'text-[#171716]'}`}>{item.title}</h4>
        <time dateTime={item.publishedAt} className={`shrink-0 text-xs ${isDark ? 'text-[#aaa59d]' : 'text-[#6f6a64]'}`}>
          {new Date(item.publishedAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
        </time>
      </div>
      <p className={`mt-2 text-sm leading-6 ${isDark ? 'text-[#aaa59d]' : 'text-[#625d57]'}`}>{item.body}</p>
      <p className={`mt-3 flex items-center gap-1.5 text-xs ${isDark ? 'text-[#8f8a82]' : 'text-[#6f6a64]'}`}>
        <SealCheck size={15} className="text-[#c86544]" aria-hidden="true" />
        Posted by {item.author?.name || 'ServiceHub Cordova Administration'}
      </p>
    </article>
  );
}
