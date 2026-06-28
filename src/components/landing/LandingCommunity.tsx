import React from 'react';
import { Star } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

interface LandingCommunityProps {
  isDark: boolean;
}

export default function LandingCommunity({ isDark }: LandingCommunityProps) {
  return (
    <section className={`py-20 border-y transition-colors duration-500 px-6 md:px-12 w-full ${
      isDark ? 'bg-[#22211e]/40 border-neutral-855' : 'bg-slate-50/50 border-slate-200/60'
    }`}>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Side: Text Details */}
        <div className="lg:col-span-7 space-y-6 text-left">
          <ScrollReveal className="space-y-3">
            <span className="text-[10px] font-bold text-provider-primary uppercase tracking-widest block font-sans">Community Board</span>
            <h2 className={`text-3xl md:text-4xl font-extrabold tracking-tight transition-colors duration-300 ${
              isDark ? 'text-[#f2efe9]' : 'text-slate-900'
            }`}>
              A real, active Cordova community
            </h2>
            <p className={`text-sm leading-relaxed font-medium transition-colors duration-300 ${
              isDark ? 'text-[#b4b0a9]' : 'text-slate-500'
            }`}>
              See platform announcements, this week's top-rated providers, and real community stats — all in one place.
            </p>
            <div className="flex items-center space-x-6 pt-2">
              <div>
                <span className="block font-black text-2xl text-seeker-primary">150+</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>Verified Members</span>
              </div>
              <div>
                <span className="block font-black text-2xl text-provider-primary">98%</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>Job Completion</span>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Right Side: Static Preview Card with glassmorphism */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <ScrollReveal className="w-full max-w-[380px]">
            <div className={`p-6 rounded-[24px] border backdrop-blur-xl shadow-lg relative overflow-hidden transition-all duration-500 hover:scale-[1.03] ${
              isDark
                ? 'bg-[#1f1e1a]/30 border-[#33322e]/45 text-[#f2efe9]'
                : 'bg-white/45 border-white/20 text-[#1c1b18]'
            }`}>
              {/* Badge Header */}
              <div className="flex justify-between items-center mb-4">
                <span className="flex items-center space-x-1 text-xs font-black text-amber-500">
                  <span>🏆</span>
                  <span>This week's top provider</span>
                </span>
                <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${
                  isDark ? 'bg-neutral-855/60 text-neutral-400' : 'bg-slate-100/60 text-slate-500'
                }`}>
                  Sample preview
                </span>
              </div>

              {/* Profile info */}
              <div className="flex items-center space-x-3.5 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white font-black text-lg shadow-inner shadow-black/10">
                  MS
                </div>
                <div>
                  <h4 className="font-extrabold text-sm tracking-tight">Maria Santos</h4>
                  <p className={`text-[11px] font-semibold ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>Home Cleaning & Organizing</p>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-3.5">
                <div className={`p-3 rounded-xl border flex justify-between items-center ${
                  isDark ? 'bg-neutral-855/40 border-neutral-855' : 'bg-slate-50/70 border-slate-100'
                }`}>
                  <span className={`text-xs font-bold ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>Trust Score</span>
                  <span className="font-black text-emerald-500 text-sm">94/100</span>
                </div>

                <div className={`p-3 rounded-xl border flex justify-between items-center ${
                  isDark ? 'bg-neutral-855/40 border-neutral-855' : 'bg-slate-50/70 border-slate-100'
                }`}>
                  <span className={`text-xs font-bold ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>Completed Jobs</span>
                  <span className={`font-black text-sm ${isDark ? 'text-[#f2efe9]' : 'text-[#1c1b18]'}`}>47 jobs</span>
                </div>

                <div className={`p-3 rounded-xl border flex justify-between items-center ${
                  isDark ? 'bg-[#2c2b27]/60 border-neutral-855' : 'bg-slate-50/70 border-slate-100'
                }`}>
                  <span className={`text-xs font-bold ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>Rating</span>
                  <div className="flex items-center space-x-1 text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span className={`font-black text-sm ${isDark ? 'text-[#f2efe9]' : 'text-[#1c1b18]'}`}>4.9</span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
