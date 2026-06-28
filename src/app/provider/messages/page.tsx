"use client";
import React from 'react';
import { MessageSquare } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export default function ProviderMessagesPage() {
  const { isDark } = useApp();
  
  return (
    <div className={`rounded-[24px] p-8 border shadow-sm flex flex-col items-center justify-center text-center min-h-[350px] ${
      isDark ? 'bg-[#22211e] border-neutral-800/80 text-[#f2efe9]' : 'bg-white border-slate-200 text-slate-800'
    }`}>
      <div className="p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 mb-5 shadow-inner">
        <MessageSquare className="w-10 h-10 animate-pulse" />
      </div>
      
      <span className="px-3 py-1 text-[10px] font-bold tracking-widest uppercase rounded-full border bg-emerald-950/20 text-emerald-400 border-emerald-900/30">
        Phase 5 (Shared Modules & Profiles)
      </span>
      
      <h3 className="text-base font-bold mt-4 tracking-wide">Direct Split-Screen Chat Interface</h3>
      
      <p className="text-slate-500 dark:text-[#b4b0a9] text-xs max-w-md mt-2 leading-relaxed">
        Split-screen communications center allowing clients and providers to message, share file screenshots, and finalize transaction rates.
      </p>
    </div>
  );
}
