import React from 'react';
import { AlertTriangle, Clock, Lock } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

interface LandingProblemProps {
  isDark: boolean;
}

export default function LandingProblem({ isDark }: LandingProblemProps) {
  return (
    <section id="problem" className={`py-20 border-y transition-colors duration-500 px-6 md:px-12 w-full relative scroll-mt-20 ${
      isDark ? 'bg-[#22211e]/40 border-neutral-850' : 'bg-slate-50/50 border-slate-200/60'
    }`}>
      {/* Ambient glow decoration */}
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-80 h-80 glow-bubble-orange -z-10 opacity-40 animate-pulse-glow" />

      <div className="max-w-6xl mx-auto space-y-12">
        <ScrollReveal className="text-center space-y-3">
          <span className="text-[10px] font-bold text-seeker-primary uppercase tracking-widest block font-sans">Why This Exists</span>
          <h2 className={`text-3xl md:text-4xl font-extrabold tracking-tight transition-colors duration-300 ${
            isDark ? 'text-[#f2efe9]' : 'text-slate-900'
          }`}>
            Finding reliable help in Cordova shouldn't be guesswork
          </h2>
          <p className={`text-sm max-w-xl mx-auto leading-relaxed transition-colors duration-300 ${
            isDark ? 'text-[#b4b0a9]' : 'text-slate-500'
          }`}>
            Traditional social groups leave both seekers and providers vulnerable to flakes, scams, and unfair delays.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <ScrollReveal className={`p-6 rounded-[24px] border backdrop-blur-xl shadow-lg space-y-4 hover:-translate-y-1.5 transition-all duration-500 ${
            isDark
              ? 'bg-[#1f1e1a]/30 border-[#33322e]/45 shadow-[0_8px_30px_rgb(0,0,0,0.2)]'
              : 'bg-white/40 border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)]'
          }`}>
            <div className={`p-3 rounded-2xl w-12 h-12 flex items-center justify-center shadow-inner ${
              isDark ? 'text-amber-505 bg-amber-955/40 border border-neutral-855' : 'text-amber-600 bg-amber-50 border border-amber-100'
            }`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className={`font-bold text-base sm:text-lg tracking-tight transition-colors duration-300 ${
              isDark ? 'text-[#f2efe9]' : 'text-slate-900'
            }`}>
              No way to know who's reliable
            </h3>
            <p className={`text-xs leading-relaxed font-medium transition-colors duration-300 ${
              isDark ? 'text-[#b4b0a9]' : 'text-slate-505'
            }`}>
              Posting in a Facebook group means hoping a stranger shows up, with no rating, no history, no accountability if it goes wrong.
            </p>
          </ScrollReveal>

          <ScrollReveal className={`p-6 rounded-[24px] border backdrop-blur-xl shadow-lg space-y-4 hover:-translate-y-1.5 transition-all duration-500 ${
            isDark
              ? 'bg-[#1f1e1a]/30 border-[#33322e]/45 shadow-[0_8px_30px_rgb(0,0,0,0.2)]'
              : 'bg-white/40 border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)]'
          }`}>
            <div className={`p-3 rounded-2xl w-12 h-12 flex items-center justify-center shadow-inner ${
              isDark ? 'text-amber-505 bg-amber-955/40 border border-neutral-855' : 'text-amber-600 bg-amber-50 border border-amber-100'
            }`}>
              <Clock className="w-6 h-6" />
            </div>
            <h3 className={`font-bold text-base sm:text-lg tracking-tight transition-colors duration-300 ${
              isDark ? 'text-[#f2efe9]' : 'text-slate-900'
            }`}>
              First come, first served... in theory
            </h3>
            <p className={`text-xs leading-relaxed font-medium transition-colors duration-300 ${
              isDark ? 'text-[#b4b0a9]' : 'text-slate-455'
            }`}>
              Without a real queue, it's whoever messages back fastest — not whoever asked first. That's not actually fair.
            </p>
          </ScrollReveal>

          <ScrollReveal className={`p-6 rounded-[24px] border backdrop-blur-xl shadow-lg space-y-4 hover:-translate-y-1.5 transition-all duration-500 ${
            isDark
              ? 'bg-[#1f1e1a]/30 border-[#33322e]/45 shadow-[0_8px_30px_rgb(0,0,0,0.2)]'
              : 'bg-white/40 border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)]'
          }`}>
            <div className={`p-3 rounded-2xl w-12 h-12 flex items-center justify-center shadow-inner ${
              isDark ? 'text-amber-505 bg-amber-955/40 border border-neutral-855' : 'text-amber-600 bg-amber-50 border border-amber-100'
            }`}>
              <Lock className="w-6 h-6" />
            </div>
            <h3 className={`font-bold text-base sm:text-lg tracking-tight transition-colors duration-300 ${
              isDark ? 'text-[#f2efe9]' : 'text-slate-900'
            }`}>
              Payment is always a leap of faith
            </h3>
            <p className={`text-xs leading-relaxed font-medium transition-colors duration-300 ${
              isDark ? 'text-[#b4b0a9]' : 'text-slate-505'
            }`}>
              Pay upfront and hope they show up, or pay after and hope they don't ghost you. There's no safe middle ground.
            </p>
          </ScrollReveal>
        </div>

        <ScrollReveal className="text-center pt-4">
          <p className={`text-xs font-bold transition-colors duration-300 ${
            isDark ? 'text-emerald-450' : 'text-emerald-700'
          }`}>
            ServiceHub Cordova was built to fix exactly these three problems — for the community, by the community.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
