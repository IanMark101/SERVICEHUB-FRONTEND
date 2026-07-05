import React from 'react';
import { ShieldCheck, Eye, Lock } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

interface LandingTrustProps {
  isDark: boolean;
}

export default function LandingTrust({ isDark }: LandingTrustProps) {
  return (
    <section id="trust" className={`py-20 border-y transition-colors duration-500 px-6 md:px-12 w-full scroll-mt-20 ${
      isDark ? 'bg-[#22211e]/40 border-neutral-850' : 'bg-slate-50/50 border-slate-200/60'
    }`}>
      <div className="max-w-6xl mx-auto space-y-12">
        <ScrollReveal className="text-center space-y-3">
          <span className="text-[10px] font-bold text-provider-primary uppercase tracking-widest block font-sans">Security First</span>
          <h2 className={`text-3xl md:text-4xl font-extrabold tracking-tight transition-colors duration-300 ${
            isDark ? 'text-[#f2efe9]' : 'text-slate-900'
          }`}>
            Built on trust, not luck
          </h2>
          <p className={`text-sm max-w-xl mx-auto leading-relaxed transition-colors duration-300 ${
            isDark ? 'text-[#b4b0a9]' : 'text-slate-500'
          }`}>
            We protect your time and money at every stage of the transaction.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <ScrollReveal className={`p-6 rounded-[24px] border backdrop-blur-xl shadow-lg space-y-4 hover:-translate-y-1.5 transition-all duration-500 ${
            isDark
              ? 'bg-[#1f1e1a]/30 border-[#33322e]/45 shadow-[0_8px_30px_rgb(0,0,0,0.2)]'
              : 'bg-white/40 border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)]'
          }`}>
            <div className={`p-3 rounded-2xl w-12 h-12 flex items-center justify-center shadow-inner ${
              isDark ? 'text-emerald-450 bg-emerald-950/40 border border-neutral-855' : 'text-emerald-600 bg-emerald-50 border border-emerald-100'
            }`}>
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className={`font-bold text-base sm:text-lg tracking-tight transition-colors duration-300 ${
              isDark ? 'text-[#f2efe9]' : 'text-slate-900'
            }`}>
              Verified Residents Only
            </h3>
            <p className={`text-xs leading-relaxed font-medium transition-colors duration-300 ${
              isDark ? 'text-[#b4b0a9]' : 'text-slate-500'
            }`}>
              Every provider — and every seeker who wants to book — proves they actually live in Cordova before they can transact.
            </p>
          </ScrollReveal>

          <ScrollReveal className={`p-6 rounded-[24px] border backdrop-blur-xl shadow-lg space-y-4 hover:-translate-y-1.5 transition-all duration-500 ${
            isDark
              ? 'bg-[#1f1e1a]/30 border-[#33322e]/45 shadow-[0_8px_30px_rgb(0,0,0,0.2)]'
              : 'bg-white/40 border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)]'
          }`}>
            <div className={`p-3 rounded-2xl w-12 h-12 flex items-center justify-center shadow-inner ${
              isDark ? 'text-emerald-450 bg-emerald-950/40 border border-neutral-855' : 'text-emerald-600 bg-emerald-50 border border-emerald-100'
            }`}>
              <Eye className="w-6 h-6" />
            </div>
            <h3 className={`font-bold text-base sm:text-lg tracking-tight transition-colors duration-300 ${
              isDark ? 'text-[#f2efe9]' : 'text-slate-900'
            }`}>
              Trust Scores You Can See
            </h3>
            <p className={`text-xs leading-relaxed font-medium transition-colors duration-300 ${
              isDark ? 'text-[#b4b0a9]' : 'text-slate-500'
            }`}>
              Every user has a visible trust score from 0–100, built from completed jobs, reviews, and history. No guessing who's reliable.
            </p>
          </ScrollReveal>

          <ScrollReveal className={`p-6 rounded-[24px] border backdrop-blur-xl shadow-lg space-y-4 hover:-translate-y-1.5 transition-all duration-500 ${
            isDark
              ? 'bg-[#1f1e1a]/30 border-[#33322e]/45 shadow-[0_8px_30px_rgb(0,0,0,0.2)]'
              : 'bg-white/40 border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)]'
          }`}>
            <div className={`p-3 rounded-2xl w-12 h-12 flex items-center justify-center shadow-inner ${
              isDark ? 'text-emerald-455 bg-emerald-955/40 border border-neutral-855' : 'text-emerald-600 bg-emerald-50 border border-emerald-100'
            }`}>
              <Lock className="w-6 h-6" />
            </div>
            <h3 className={`font-bold text-base sm:text-lg tracking-tight transition-colors duration-300 ${
              isDark ? 'text-[#f2efe9]' : 'text-slate-900'
            }`}>
              Payments Held Until the Job's Done
            </h3>
            <p className={`text-xs leading-relaxed font-medium transition-colors duration-300 ${
              isDark ? 'text-[#b4b0a9]' : 'text-slate-500'
            }`}>
              Online payments are held securely and only released once you confirm the work is actually complete.
            </p>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
