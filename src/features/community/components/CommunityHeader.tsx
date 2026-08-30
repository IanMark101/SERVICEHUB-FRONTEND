import React from 'react';
import { Globe, Users } from 'lucide-react';

interface CommunityHeaderProps {
  isDark?: boolean;
  workspaceRole?: 'seeker' | 'provider' | 'admin';
}

export default function CommunityHeader({ isDark = false, workspaceRole = 'seeker' }: CommunityHeaderProps) {
  const roleBadgeStyle =
    workspaceRole === 'provider'
      ? isDark
        ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-400'
        : 'bg-emerald-50 border-emerald-200 text-emerald-700'
      : workspaceRole === 'admin'
      ? isDark
        ? 'bg-red-950/30 border-red-800/40 text-red-400'
        : 'bg-red-50 border-red-200 text-red-700'
      : isDark
      ? 'bg-orange-950/30 border-orange-800/40 text-orange-400'
      : 'bg-orange-50 border-orange-200 text-orange-600';

  return (
    <div
      className={`rounded-[24px] p-6 border flex items-start justify-between relative overflow-hidden transition-all duration-200 ${
        isDark
          ? 'bg-[#22211e] border-neutral-800/80 text-[#f2efe9]'
          : 'bg-gradient-to-br from-slate-50 to-slate-100/60 border-slate-200 text-slate-900'
      }`}
    >
      <div className="flex items-start space-x-4">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm border transition-colors ${
            isDark ? 'bg-[#191919] border-neutral-800/80 text-[#f2efe9]' : 'bg-white border-slate-200 text-slate-800'
          }`}
        >
          <Globe className="w-6 h-6" />
        </div>

        <div className="space-y-1 max-w-xl">
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl font-extrabold tracking-tight leading-none">
              Community Hub
            </h1>
            <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${roleBadgeStyle}`}>
              {workspaceRole} View
            </span>
          </div>
          <p className={`text-xs font-semibold leading-relaxed ${isDark ? 'text-[#b4b0a9]' : 'text-slate-600'}`}>
            Discover what's happening across the ServiceHub Cordova community.
          </p>
          <p className={`text-[11px] leading-relaxed hidden sm:block ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>
            Explore new services, community updates, and trusted local providers.
          </p>
        </div>
      </div>

      <div className="opacity-[0.03] pointer-events-none hidden md:block select-none">
        <Users className="w-28 h-28" />
      </div>
    </div>
  );
}
