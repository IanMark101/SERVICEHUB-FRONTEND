import React from 'react';
import { Landmark, ShieldCheck } from 'lucide-react';

interface CommunityHeaderProps {
  isDark?: boolean;
}

export default function CommunityHeader({ isDark = false }: CommunityHeaderProps) {
  return (
    <div
      className={`rounded-2xl p-5 sm:p-6 border flex items-start justify-between relative overflow-hidden shadow-sm transition-colors duration-200 ${
        isDark
          ? 'bg-blue-950/15 border-blue-900/30 text-[#f2efe9]'
          : 'bg-blue-50/70 border-blue-200 text-slate-900'
      }`}
    >
      <div className="flex items-start space-x-4">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm border transition-colors ${
            isDark ? 'bg-blue-950/40 border-blue-800/40 text-blue-300' : 'bg-white border-blue-200 text-blue-700'
          }`}
        >
          <Landmark className="w-6 h-6" />
        </div>

        <div className="space-y-1 max-w-xl">
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl font-extrabold tracking-tight leading-none">
              Community Hub
            </h1>
            <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
              isDark ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}>
              Civic Information
            </span>
          </div>
          <p className={`text-xs font-semibold leading-relaxed ${isDark ? 'text-[#b4b0a9]' : 'text-slate-600'}`}>
            Official notices, newly approved categories, and weekly provider recognition for Cordova, Cebu.
          </p>
          <p className={`text-[11px] leading-relaxed hidden sm:block ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>
            Content is published or calculated by ServiceHub Cordova. This is not a public social feed.
          </p>
        </div>
      </div>

      <div className="opacity-[0.03] pointer-events-none hidden md:block select-none">
        <ShieldCheck className="w-28 h-28" />
      </div>
    </div>
  );
}
