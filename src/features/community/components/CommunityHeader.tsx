import React from 'react';
import { Globe, ShieldCheck } from 'lucide-react';

interface CommunityHeaderProps {
  isDark?: boolean;
}

export default function CommunityHeader({ isDark = false }: CommunityHeaderProps) {
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
            <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
              isDark ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}>
              Official Updates
            </span>
          </div>
          <p className={`text-xs font-semibold leading-relaxed ${isDark ? 'text-[#b4b0a9]' : 'text-slate-600'}`}>
            Official notices, provider recognition, and marketplace progress for Cordova, Cebu.
          </p>
          <p className={`text-[11px] leading-relaxed hidden sm:block ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>
            This is an information space managed by ServiceHub Cordova—not a public social feed.
          </p>
        </div>
      </div>

      <div className="opacity-[0.03] pointer-events-none hidden md:block select-none">
        <ShieldCheck className="w-28 h-28" />
      </div>
    </div>
  );
}
