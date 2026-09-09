import React from 'react';
import { UsersRound } from 'lucide-react';

interface CommunityHeaderProps {
  isDark?: boolean;
}

export default function CommunityHeader({ isDark = false }: CommunityHeaderProps) {
  return (
    <div
      className={`rounded-2xl p-5 border flex items-start justify-between relative overflow-hidden shadow-sm transition-colors duration-200 ${
        isDark
          ? 'bg-slate-950/15 border-slate-900/30 text-[#f2efe9]'
          : 'bg-white border-slate-200 text-slate-900'
      }`}
    >
      <div className="flex items-start space-x-4">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border transition-colors ${
            isDark ? 'bg-slate-950/40 border-slate-800/40 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
          }`}
        >
          <UsersRound className="w-5 h-5" />
        </div>

        <div className="space-y-1 max-w-xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-base font-extrabold tracking-tight leading-none">Across ServiceHub Cordova</h2>
            <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
              isDark ? 'bg-neutral-800 border-neutral-700 text-neutral-300' : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}>
              Community overview
            </span>
          </div>
          <p className={`text-xs font-semibold leading-relaxed ${isDark ? 'text-[#b4b0a9]' : 'text-slate-600'}`}>
            Discover what is happening across the ServiceHub Cordova community.
          </p>
          <p className={`text-[11px] leading-relaxed hidden sm:block ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>
            See verified marketplace activity, official updates, recently approved services, and weekly provider recognition.
          </p>
        </div>
      </div>

    </div>
  );
}
