import React from 'react';
import { Check, X } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

interface LandingComparisonProps {
  isDark: boolean;
}

export default function LandingComparison({ isDark }: LandingComparisonProps) {
  return (
    <section id="comparison" className="py-20 px-6 md:px-12 w-full relative scroll-mt-20">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 glow-bubble-orange -z-10 opacity-30 animate-pulse-glow" />
      <div className="max-w-4xl mx-auto space-y-10">
        <ScrollReveal className="text-center space-y-3">
          <span className="text-[10px] font-bold text-seeker-primary uppercase tracking-widest block font-sans">Comparison</span>
          <h2 className={`text-3xl md:text-4xl font-extrabold tracking-tight transition-colors duration-300 ${
            isDark ? 'text-[#f2efe9]' : 'text-slate-900'
          }`}>
            Not just another Facebook group
          </h2>
          <p className={`text-sm max-w-xl mx-auto leading-relaxed transition-colors duration-300 ${
            isDark ? 'text-[#b4b0a9]' : 'text-slate-500'
          }`}>
            Why local residents choose ServiceHub Cordova over standard social networks.
          </p>
        </ScrollReveal>

        <ScrollReveal className={`rounded-[24px] border overflow-hidden shadow-lg backdrop-blur-xl ${
          isDark
            ? 'bg-[#1f1e1a]/30 border-[#33322e]/45 shadow-[0_8px_30px_rgb(0,0,0,0.2)]'
            : 'bg-white/40 border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)]'
        }`}>
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className={`border-b transition-colors duration-300 ${
                isDark ? 'border-neutral-850 bg-neutral-850/50' : 'border-slate-200 bg-slate-50/50'
              }`}>
                <th className="p-4 md:p-6 font-extrabold">Feature</th>
                <th className="p-4 md:p-6 font-extrabold text-center w-1/4">Facebook Groups</th>
                <th className="p-4 md:p-6 font-extrabold text-center w-1/4 text-seeker-primary">ServiceHub Cordova</th>
              </tr>
            </thead>
            <tbody>
              <tr className={`border-b transition-colors duration-300 ${isDark ? 'border-neutral-855' : 'border-slate-100/50'}`}>
                <td className="p-4 md:p-6 font-semibold">Verified residents only</td>
                <td className="p-4 md:p-6 text-center text-red-500 font-extrabold"><X className="w-4 h-4 mx-auto" /></td>
                <td className="p-4 md:p-6 text-center text-emerald-500 font-extrabold"><Check className="w-4.5 h-4.5 mx-auto" /></td>
              </tr>
              <tr className={`border-b transition-colors duration-300 ${isDark ? 'border-neutral-855' : 'border-slate-100/50'}`}>
                <td className="p-4 md:p-6 font-semibold">Visible trust scores</td>
                <td className="p-4 md:p-6 text-center text-red-500 font-extrabold"><X className="w-4 h-4 mx-auto" /></td>
                <td className="p-4 md:p-6 text-center text-emerald-500 font-extrabold"><Check className="w-4.5 h-4.5 mx-auto" /></td>
              </tr>
              <tr className={`border-b transition-colors duration-300 ${isDark ? 'border-neutral-855' : 'border-slate-100/50'}`}>
                <td className="p-4 md:p-6 font-semibold">Fair, real queue</td>
                <td className="p-4 md:p-6 text-center text-red-500 font-extrabold"><X className="w-4 h-4 mx-auto" /></td>
                <td className="p-4 md:p-6 text-center text-emerald-500 font-extrabold"><Check className="w-4.5 h-4.5 mx-auto" /></td>
              </tr>
              <tr className={`border-b transition-colors duration-300 ${isDark ? 'border-neutral-855' : 'border-slate-100/50'}`}>
                <td className="p-4 md:p-6 font-semibold">Secure held payments</td>
                <td className="p-4 md:p-6 text-center text-red-500 font-extrabold"><X className="w-4 h-4 mx-auto" /></td>
                <td className="p-4 md:p-6 text-center text-emerald-500 font-extrabold"><Check className="w-4.5 h-4.5 mx-auto" /></td>
              </tr>
              <tr className="transition-colors duration-300">
                <td className="p-4 md:p-6 font-semibold">Dispute resolution</td>
                <td className="p-4 md:p-6 text-center text-red-500 font-extrabold"><X className="w-4 h-4 mx-auto" /></td>
                <td className="p-4 md:p-6 text-center text-emerald-500 font-extrabold"><Check className="w-4.5 h-4.5 mx-auto" /></td>
              </tr>
            </tbody>
          </table>
        </ScrollReveal>
      </div>
    </section>
  );
}
