import React from 'react';
import { Calendar, Megaphone, ShieldCheck } from 'lucide-react';
import { CommunityAnnouncement } from '../types/community.types';

interface CommunityUpdateCardProps {
  item: CommunityAnnouncement;
  isDark?: boolean;
}

export default function CommunityUpdateCard({
  item,
  isDark = false,
}: CommunityUpdateCardProps) {
  return (
    <div
      className={`rounded-2xl p-5 border flex flex-col justify-between shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
        isDark
          ? 'bg-[#22211e] border-neutral-800/80 text-[#f2efe9]'
          : 'bg-white border-slate-200 text-slate-900'
      }`}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className={`text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border flex items-center space-x-1 ${
            isDark ? 'bg-orange-950/30 border-orange-800/40 text-orange-400' : 'bg-orange-50 border-orange-200 text-orange-700'
          }`}>
            <Megaphone className="w-3 h-3 mr-1" />
            <span>Official Notice</span>
          </span>

          <span className={`text-[9px] font-bold flex items-center ${isDark ? 'text-[#b4b0a9]' : 'text-slate-400'}`}>
            <Calendar className="w-3 h-3 mr-1" />
            {new Date(item.publishedAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        <h3 className="font-extrabold text-xs leading-snug tracking-tight">
          {item.title}
        </h3>

        <p className={`text-[11px] font-medium leading-relaxed ${isDark ? 'text-[#b4b0a9]' : 'text-slate-600'}`}>
          {item.body}
        </p>
      </div>

      <div className={`pt-3 mt-4 border-t text-[10px] font-semibold flex items-center gap-1.5 ${isDark ? 'border-neutral-800 text-[#b4b0a9]' : 'border-slate-100 text-slate-500'}`}>
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>Posted by {item.author?.name || 'ServiceHub Cordova Administration'}</span>
      </div>
    </div>
  );
}
