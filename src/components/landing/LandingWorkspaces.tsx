import React from 'react';
import { ArrowLeftRight, UserCheck, ShieldCheck, RefreshCw } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

interface LandingWorkspacesProps {
  isDark: boolean;
}

export default function LandingWorkspaces({ isDark }: LandingWorkspacesProps) {
  return (
    <section className={`py-20 md:py-28 px-6 md:px-12 border-b transition-colors duration-500 relative overflow-hidden ${
      isDark ? 'bg-[#191919] border-neutral-850/40 text-[#f2efe9]' : 'bg-[#fbfaf7] border-slate-200 text-slate-800'
    }`}>
      {/* Glow backgrounds */}
      <div className={`absolute top-1/2 left-1/4 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-3xl -z-10 pointer-events-none ${
        isDark ? 'bg-orange-955/5' : 'bg-orange-50/15'
      }`} />
      <div className={`absolute top-1/2 right-1/4 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-3xl -z-10 pointer-events-none ${
        isDark ? 'bg-emerald-955/5' : 'bg-emerald-50/15'
      }`} />

      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <ScrollReveal className="flex flex-col items-center space-y-3">
            <span className={`inline-flex items-center space-x-1 px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border backdrop-blur-md shadow-sm transition-all duration-300 ${
              isDark
                ? 'bg-neutral-855/40 border-neutral-850/50 text-orange-400'
                : 'bg-orange-50 text-orange-600 border-orange-200/50'
            }`}>
              Dual-Workspace System
            </span>
            <h2 className={`text-3xl md:text-4xl font-extrabold tracking-tight transition-colors duration-300 ${
              isDark ? 'text-[#f2efe9]' : 'text-slate-900'
            }`}>
              One Unified Account.<br/>Two Distinct Workspaces.
            </h2>
            <p className={`text-sm max-w-xl mx-auto leading-relaxed transition-colors duration-300 ${
              isDark ? 'text-[#b4b0a9]' : 'text-slate-500'
            }`}>
              In a tight-knit community like Cordova, Cebu, residents don't just consume or just work — they do both. Here is why our system lets you switch workspaces seamlessly with a single profile.
            </p>
          </ScrollReveal>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          
          {/* Feature 1 */}
          <ScrollReveal className="h-full">
            <div className={`p-8 rounded-[24px] border h-full transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between ${
              isDark 
                ? 'bg-[#22211e]/40 border-neutral-800/80 hover:bg-[#2c2b27]/40' 
                : 'bg-white border-slate-200/60 shadow-sm hover:shadow-md'
            }`}>
              <div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border ${
                  isDark 
                    ? 'bg-orange-950/20 border-orange-900/30 text-orange-400' 
                    : 'bg-orange-50 border-orange-100 text-orange-600'
                }`}>
                  <UserCheck className="w-5 h-5" />
                </div>
                <h3 className={`font-bold text-base sm:text-lg tracking-tight mb-2.5 ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
                  The Fluid Community Citizen
                </h3>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-[#b4b0a9]' : 'text-slate-550'}`}>
                  A certified electrician might need a math tutor for their child. A house cleaner might hire a plumber. Since neighbors act as both **clients** (Seekers) and **providers**, forcing separate logins creates friction and fragments trust.
                </p>
              </div>
              <div className="pt-6 border-t border-slate-100 dark:border-neutral-850 mt-6 text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-neutral-500">
                Eliminates account splitting
              </div>
            </div>
          </ScrollReveal>

          {/* Feature 2 */}
          <ScrollReveal className="h-full">
            <div className={`p-8 rounded-[24px] border h-full transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between ${
              isDark 
                ? 'bg-[#22211e]/40 border-neutral-800/80 hover:bg-[#2c2b27]/40' 
                : 'bg-white border-slate-200/60 shadow-sm hover:shadow-md'
            }`}>
              <div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border ${
                  isDark 
                    ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400' 
                    : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                }`}>
                  <ArrowLeftRight className="w-5 h-5" />
                </div>
                <h3 className={`font-bold text-base sm:text-lg tracking-tight mb-2.5 ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
                  Instant Workspace Switcher
                </h3>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-[#b4b0a9]' : 'text-slate-550'}`}>
                  Switch roles instantly from the sidebar. When switching from Seeker to Provider, your active viewport shifts theme (Orange to Emerald), adjusts layouts, and loads matching tasks, keeping workflows neatly divided.
                </p>
              </div>
              <div className="pt-6 border-t border-slate-100 dark:border-neutral-850 mt-6 text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-neutral-500">
                One-click toggle experience
              </div>
            </div>
          </ScrollReveal>

          {/* Feature 3 */}
          <ScrollReveal className="h-full">
            <div className={`p-8 rounded-[24px] border h-full transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between ${
              isDark 
                ? 'bg-[#22211e]/40 border-neutral-800/80 hover:bg-[#2c2b27]/40' 
                : 'bg-white border-slate-200/60 shadow-sm hover:shadow-md'
            }`}>
              <div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border ${
                  isDark 
                    ? 'bg-purple-950/20 border-purple-900/30 text-purple-400' 
                    : 'bg-purple-50 border-purple-100 text-purple-600'
                }`}>
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className={`font-bold text-base sm:text-lg tracking-tight mb-2.5 ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
                  Unified Identity & Trust
                </h3>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-[#b4b0a9]' : 'text-slate-550'}`}>
                  Your trust scores, verified credentials, chat messages, and transaction records remain linked under one single profile. Your community reputation travels with you, whether you are seeking help or offering skills.
                </p>
              </div>
              <div className="pt-6 border-t border-slate-100 dark:border-neutral-850 mt-6 text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-neutral-500">
                One Profile, Seamless Trust
              </div>
            </div>
          </ScrollReveal>

        </div>
      </div>
    </section>
  );
}
