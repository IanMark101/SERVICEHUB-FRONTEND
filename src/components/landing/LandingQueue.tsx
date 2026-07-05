import React from 'react';
import { HelpCircle } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

interface LandingQueueProps {
  isDark: boolean;
}

export default function LandingQueue({ isDark }: LandingQueueProps) {
  return (
    <section id="queue" className="py-20 px-6 md:px-12 w-full relative overflow-hidden scroll-mt-20">
      {/* Soft background glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 glow-bubble-green -z-10 opacity-30 animate-pulse-glow" />
      <div className="max-w-4xl mx-auto space-y-10">
        <ScrollReveal className="text-center space-y-3">
          <span className="text-[10px] font-bold text-seeker-primary uppercase tracking-widest block font-sans">Platform Innovation</span>
          <h2 className={`text-3xl md:text-4xl font-extrabold tracking-tight transition-colors duration-300 ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'
            }`}>
            A queue that's actually fair
          </h2>
          <p className={`text-sm max-w-xl mx-auto leading-relaxed transition-colors duration-300 ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'
            }`}>
            When a provider is busy, ServiceHub Cordova places you in a real first-come, first-served line — not "whoever texts back fastest." You'll always see your exact position and how long you're likely to wait.
          </p>
        </ScrollReveal>

        {/* Visual Queue Illustration with glassmorphism */}
        <ScrollReveal className={`p-8 rounded-[24px] border backdrop-blur-xl shadow-lg relative overflow-hidden ${isDark
            ? 'bg-[#1f1e1a]/30 border-[#33322e]/45 shadow-[0_8px_30px_rgb(0,0,0,0.2)]'
            : 'bg-white/40 border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)]'
          }`}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-4 relative">
            {/* Client A */}
            <div className="flex flex-col items-center text-center space-y-2.5 z-10 w-full md:w-1/4">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center relative font-bold text-xs border-2 ${isDark ? 'bg-neutral-850 border-emerald-500 text-emerald-450' : 'bg-slate-50 border-emerald-500 text-emerald-700'
                }`}>
                Client A
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
                </span>
              </div>
              <div>
                <h5 className="font-extrabold text-xs">Currently Serving</h5>
                <p className={`text-[10px] font-semibold ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>In progress</p>
              </div>
            </div>

            {/* Arrow Line 1 */}
            <div className={`hidden md:block h-0.5 flex-1 -mt-8 ${isDark ? 'bg-neutral-855' : 'bg-slate-100'}`}></div>

            {/* Client B */}
            <div className="flex flex-col items-center text-center space-y-2.5 z-10 w-full md:w-1/4">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-xs border ${isDark ? 'bg-[#2c2b27] border-neutral-855 text-neutral-400' : 'bg-slate-50 border-slate-200/60 text-slate-500'
                }`}>
                Client B
              </div>
              <div>
                <h5 className="font-extrabold text-xs">Position #2</h5>
                <p className={`text-[10px] font-semibold ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>Next in line</p>
              </div>
            </div>

            {/* Arrow Line 2 */}
            <div className={`hidden md:block h-0.5 flex-1 -mt-8 ${isDark ? 'bg-neutral-855' : 'bg-slate-100'}`}></div>

            {/* Client C */}
            <div className="flex flex-col items-center text-center space-y-2.5 z-10 w-full md:w-1/4">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-xs border ${isDark ? 'bg-[#2c2b27] border-neutral-855 text-neutral-400' : 'bg-slate-50 border-slate-200/60 text-slate-500'
                }`}>
                Client C
              </div>
              <div>
                <h5 className="font-extrabold text-xs">Position #3</h5>
                <p className={`text-[10px] font-semibold ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>Wait: ~45 mins</p>
              </div>
            </div>

            {/* Arrow Line 3 */}
            <div className={`hidden md:block h-0.5 flex-1 -mt-8 ${isDark ? 'bg-neutral-855' : 'bg-slate-100'}`}></div>

            {/* You */}
            <div className="flex flex-col items-center text-center space-y-2.5 z-10 w-full md:w-1/4">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-xs border-2 shadow-sm ${isDark ? 'bg-neutral-850 border-orange-500 text-orange-400' : 'bg-orange-50 border-orange-500 text-orange-700'
                }`}>
                You
              </div>
              <div>
                <h5 className="font-extrabold text-xs text-seeker-primary">Position #4</h5>
                <p className={`text-[10px] font-semibold ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>Wait: ~1 hr 15 mins</p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Callout Box */}
        <ScrollReveal className={`p-5 rounded-2xl border backdrop-blur-md flex items-start space-x-3.5 ${isDark ? 'bg-[#2c2b27]/60 border-neutral-855 text-amber-500/90' : 'bg-amber-50/60 border-amber-200/30 text-amber-900'
          }`}>
          <HelpCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
          <p className="text-xs leading-relaxed font-semibold">
            Queue spots are reserved only for online payments. This guarantees every spot in line is a real, committed booking — not a no-show waiting to happen. Cash bookings are arranged directly with the provider instead.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
