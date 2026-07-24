import React from 'react';
import { ArrowRight, Star, ChevronDown } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

interface LandingHeroProps {
  isDark: boolean;
  onGetStarted: () => void;
}

export default function LandingHero({ isDark, onGetStarted }: LandingHeroProps) {
  const scrollToNext = () => {
    const el = document.getElementById('problem');
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 68;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between pt-4 pb-4 md:pt-6 md:pb-6 px-6 md:px-12 max-w-6xl mx-auto w-full overflow-hidden">
      {/* Soft decorative background glows */}
      <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full blur-3xl -z-10 pointer-events-none transition-colors duration-500 ${isDark ? 'bg-amber-955/10' : 'bg-amber-100/25'
        }`} />

      <div className="flex-1 flex items-center py-4 md:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <ScrollReveal className="space-y-6">
              <span className={`inline-flex items-center space-x-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border backdrop-blur-md shadow-sm transition-all duration-300 ${isDark
                ? 'bg-[#2c2b27]/60 border-neutral-850/50 text-amber-505'
                : 'bg-amber-50/60 text-amber-700 border-amber-200/40'
                }`}>
                <span>★</span>
                <span>Cordova, Cebu Local Services</span>
              </span>

              <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12] transition-colors duration-300 ${isDark ? 'text-[#f2efe9]' : 'text-slate-950'
                }`}>
                Cordova's trusted <br className="hidden sm:inline" />
                <span className="text-seeker-primary bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent">
                  local service
                </span>{" "}
                marketplace
              </h1>

              <p className={`text-sm md:text-base leading-relaxed font-medium transition-colors duration-300 ${isDark ? 'text-[#b4b0a9]' : 'text-slate-505'
                }`}>
                Find help from verified neighbors, or offer your own skills to the community — with fair queues, secure payments, and trust scores you can actually see.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
                <button
                  onClick={onGetStarted}
                  className="w-full sm:w-auto bg-seeker-primary hover:bg-seeker-hover text-white font-extrabold text-sm py-3.5 px-8 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg active:scale-98 cursor-pointer flex items-center justify-center space-x-2"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href="#how-it-works"
                  className={`w-full sm:w-auto border backdrop-blur-md font-bold text-sm py-3.5 px-8 rounded-xl transition-all duration-300 shadow-sm flex items-center justify-center ${isDark
                    ? 'bg-[#2c2b27]/60 hover:bg-[#33322e]/60 border-neutral-855/50 text-[#f2efe9]'
                    : 'bg-white/60 hover:bg-slate-50/60 text-slate-700 border-slate-200/50'
                    }`}
                >
                  See How It Works
                </a>
              </div>

              <p className={`text-[11px] font-semibold transition-colors duration-300 ${isDark ? 'text-neutral-500' : 'text-slate-400'
                }`}>
                Built exclusively for verified residents of Cordova, Cebu.
              </p>
            </ScrollReveal>
          </div>

          {/* Right Column: Illustrative Card with premium float animation & glassmorphism */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <ScrollReveal className="w-full max-w-[380px]">
              <div className={`p-6 rounded-[24px] border backdrop-blur-xl shadow-xl relative overflow-hidden transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl hover:-translate-y-2 ${isDark ? 'bg-[#1f1e1a]/30 border-[#33322e]/45 text-[#f2efe9]' : 'bg-white/45 border-white/20 text-[#1c1b18]'
                }`}>
                {/* Header / Badge */}
                <div className="flex justify-between items-center mb-4">
                  <span className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full ${isDark ? 'bg-provider-primary/25 text-emerald-400 border border-emerald-900/30' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    }`}>
                    ● Verified Provider
                  </span>
                  <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${isDark ? 'bg-neutral-855/60 text-neutral-400' : 'bg-slate-100/60 text-slate-500'
                    }`}>
                    Illustrative Mock
                  </span>
                </div>

                {/* Profile info */}
                <div className="flex items-center space-x-3.5 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-lg shadow-inner shadow-black/10">
                    JB
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm tracking-tight">Junrel Bacalso</h4>
                    <p className={`text-[11px] font-semibold ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>Electrical & Appliance Repair</p>
                  </div>
                </div>

                {/* Platform stats */}
                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div className={`p-3 rounded-xl border ${isDark ? 'bg-neutral-850/45 border-neutral-855/50' : 'bg-slate-50/70 border-slate-100/50'}`}>
                    <span className={`text-[10px] block font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>Trust Score</span>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-black text-lg text-emerald-500">85</span>
                      <span className={`text-[10px] font-bold ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>/100</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl border ${isDark ? 'bg-neutral-850/45 border-neutral-855/50' : 'bg-slate-50/70 border-slate-100/50'}`}>
                    <span className={`text-[10px] block font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>Active Queue</span>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-black text-lg text-seeker-primary">2</span>
                      <span className={`text-[10px] font-bold ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>in line</span>
                    </div>
                  </div>
                </div>

                {/* Price & Rating */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <span className={`text-[10px] block font-bold uppercase tracking-wider ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>Hourly Rate</span>
                    <span className="font-black text-base">₱350/hr</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] block font-bold uppercase tracking-wider ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>Rating</span>
                    <div className="flex items-center justify-end space-x-1">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span className="font-extrabold text-sm">4.9</span>
                    </div>
                  </div>
                </div>

                {/* Action */}
                <button
                  onClick={onGetStarted}
                  className="w-full bg-provider-primary hover:bg-provider-hover text-white font-bold text-xs py-3 rounded-xl transition-all duration-300 shadow-sm cursor-pointer"
                >
                  Book Now
                </button>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <div className="flex justify-center pb-2 pt-2">
        <button
          onClick={scrollToNext}
          className={`flex flex-col items-center gap-1 text-[11px] font-semibold transition-all duration-300 hover:scale-105 cursor-pointer ${isDark ? 'text-neutral-500 hover:text-amber-400' : 'text-slate-400 hover:text-slate-700'
            }`}
          aria-label="Scroll to content"
        >
          <span className="tracking-wider uppercase text-[9px]">Explore More</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </button>
      </div>
    </section>
  );
}
