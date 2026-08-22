import React, { useState, useEffect } from 'react';
import { ArrowRight, Star, ChevronDown, ShieldCheck, CheckCircle2, RefreshCw, Banknote, Smartphone } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

interface LandingHeroProps {
  isDark: boolean;
  onGetStarted: () => void;
}

export default function LandingHero({ isDark, onGetStarted }: LandingHeroProps) {
  const [providerAvatar, setProviderAvatar] = useState<string>('');
  const [cardPov, setCardPov] = useState<'seeker' | 'provider'>('seeker');

  useEffect(() => {
    // Fetch live avatar for BUENAFLOR IAN MARK J. if available
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    fetch(`${apiBase}/users?search=BUENAFLOR`)
      .then(res => res.json())
      .then(data => {
        if (data?.data?.[0]?.avatarUrl) {
          setProviderAvatar(data.data[0].avatarUrl);
        }
      })
      .catch(() => { });
  }, []);

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

          {/* Right Column: 3D Flip Showcase Card */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <ScrollReveal className="w-full max-w-[390px] [perspective:1200px]">
              <div
                onClick={() => setCardPov(prev => prev === 'seeker' ? 'provider' : 'seeker')}
                className={`relative w-full transition-transform duration-700 [transform-style:preserve-3d] cursor-pointer select-none ${cardPov === 'provider' ? '[transform:rotateY(180deg)]' : ''
                  }`}
                title="Click anywhere on card to flip perspective"
              >
                {/* ─── FRONT FACE: SEEKER POV (SERVICE OFFER) ─── */}
                <div
                  className={`w-full p-5 rounded-[26px] border backdrop-blur-xl shadow-2xl relative overflow-hidden transition-all duration-300 hover:scale-[1.015] group/card [backface-visibility:hidden] flex flex-col justify-between ${isDark
                      ? 'bg-[#22211e]/95 border-neutral-800 text-[#f2efe9] hover:border-orange-500/40'
                      : 'bg-white/95 border-orange-500/30 text-slate-900 shadow-xl hover:border-orange-500/60'
                    }`}
                >
                  <div>
                    {/* Header: Provider Info */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3 select-none">
                        <div className="relative flex-shrink-0">
                          <img
                            src={providerAvatar || "https://ui-avatars.com/api/?name=BUENAFLOR+IAN+MARK+J&background=0D8ABC&color=fff"}
                            alt="BUENAFLOR IAN MARK J."
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://ui-avatars.com/api/?name=BUENAFLOR+IAN+MARK+J&background=0D8ABC&color=fff";
                            }}
                            className="w-11 h-11 rounded-2xl object-cover border-2 border-orange-500/40 shadow-sm group-hover/card:scale-105 transition-transform"
                          />
                        </div>
                        <div>
                          <h4 className={`font-black text-xs leading-tight tracking-wide ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
                            BUENAFLOR IAN MARK J.
                          </h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="inline-flex items-center text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                              <ShieldCheck className="w-3.5 h-3.5 mr-0.5 text-emerald-500 fill-emerald-500/20" />
                              Verified
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 dark:text-neutral-500">• Day-as</span>
                          </div>
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-col items-end gap-1 select-none">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                          NEW
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 flex items-center gap-1">
                          🛡️ Verified Member
                        </span>
                      </div>
                    </div>

                    {/* Category & Tags */}
                    <div className="mt-4 flex items-center justify-between">
                      <span className="inline-block px-2.5 py-1 text-[9px] font-extrabold rounded-lg border uppercase tracking-wider text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/30">
                        TUTORING
                      </span>
                      <span className="text-[10.5px] font-bold text-amber-500 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>5.0</span>
                        <span className="text-slate-400 dark:text-neutral-500 font-normal">(12 reviews)</span>
                      </span>
                    </div>

                    {/* Service Details */}
                    <div className="mt-3">
                      <h3 className={`font-black text-base leading-snug tracking-tight ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
                        High School Math & Algebra Tutoring
                      </h3>
                      <p className={`text-xs mt-1.5 line-clamp-2 leading-relaxed ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>
                        One-on-one session covering algebra, trigonometry, or calculus fundamentals.
                      </p>
                    </div>
                  </div>

                  <div>
                    {/* Divider Line */}
                    <div className={`border-t my-3.5 ${isDark ? 'border-neutral-800/80' : 'border-slate-100'}`} />

                    {/* Availability & Price */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                          <span>Available Now</span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[9.5px] font-bold px-2 py-0.5 rounded-md border w-fit bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                          <RefreshCw className="w-2.5 h-2.5 animate-spin-slow" />
                          Session-based
                        </span>
                      </div>

                      <div className="text-right">
                        <span className={`text-lg font-black ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
                          ₱250
                        </span>
                        <span className={`text-[11px] font-bold ml-1 ${isDark ? 'text-[#b4b0a9]' : 'text-slate-400'}`}>
                          / session
                        </span>
                      </div>
                    </div>

                    {/* Payment Options */}
                    <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10px] font-bold bg-slate-50 dark:bg-neutral-800/60 border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-neutral-300">
                        <Banknote className="w-3 h-3 text-slate-400" />
                        On-site Cash
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10px] font-bold bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400">
                        <Smartphone className="w-3 h-3 text-orange-500" />
                        GCash
                      </span>
                    </div>

                    {/* Action CTA */}
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onGetStarted();
                        }}
                        className="w-full bg-seeker-primary hover:bg-seeker-hover text-white font-extrabold text-xs py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-orange-500/20 active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span>Request Service</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Flip hint footer */}
                    <div className="mt-3.5 flex items-center justify-between text-[10px] text-slate-400 dark:text-neutral-500 font-bold border-t pt-2 border-slate-100 dark:border-neutral-800/80 select-none">
                      <span className="flex items-center gap-1.5 text-orange-500 font-extrabold">
                        <span>👤</span> Seeker View
                      </span>
                      <span className="flex items-center gap-1 text-slate-400 dark:text-neutral-400 group-hover/card:text-orange-500 transition-colors">
                        🔄 Click to flip card
                      </span>
                    </div>
                  </div>
                </div>

                {/* ─── BACK FACE: PROVIDER POV (JOB REQUEST) ─── */}
                <div
                  className={`absolute inset-0 w-full p-5 rounded-[26px] border backdrop-blur-xl shadow-2xl overflow-hidden transition-all duration-300 hover:scale-[1.015] group/card [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col justify-between ${
                    isDark
                      ? 'bg-[#22211e] border-neutral-855 text-[#f2efe9] hover:border-emerald-500/40'
                      : 'bg-white border-slate-300 text-slate-900 shadow-xl hover:border-emerald-500/40'
                  }`}
                >
                  <div>
                    {/* Header: Client Info */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3 select-none">
                        <div className="relative flex-shrink-0">
                          <img
                            src={providerAvatar || "https://ui-avatars.com/api/?name=BUENAFLOR+IAN+MARK+J&background=0D8ABC&color=fff"}
                            alt="BUENAFLOR IAN MARK J."
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://ui-avatars.com/api/?name=BUENAFLOR+IAN+MARK+J&background=0D8ABC&color=fff";
                            }}
                            className="w-10 h-10 rounded-full object-cover border border-slate-100 dark:border-neutral-700 shadow-sm"
                          />
                        </div>
                        <div>
                          <h4 className={`font-bold text-xs leading-tight ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
                            BUENAFLOR IAN MARK J.
                          </h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`inline-flex items-center text-[10px] font-semibold border px-1.5 py-0.25 rounded-md ${
                              isDark
                                ? 'text-orange-400 bg-orange-950/20 border-orange-900/30'
                                : 'text-orange-600 bg-orange-50 border-orange-200'
                            }`}>
                              <CheckCircle2 className={`w-3 h-3 mr-0.5 ${isDark ? 'fill-orange-950/20 text-orange-400' : 'fill-orange-50 text-orange-600'}`} />
                              Client
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 dark:text-neutral-500">• Day-as</span>
                          </div>
                        </div>
                      </div>

                      {/* Proposals counter & Trust */}
                      <div className="text-right flex flex-col items-end gap-0.5 select-none">
                        <span className={`text-[10px] font-bold block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-400'}`}>
                          0 proposals
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          🛡️ Verified Member
                        </span>
                      </div>
                    </div>

                    {/* Category & Urgency */}
                    <div className="mt-4 flex items-center justify-between">
                      <span className={`inline-block px-2.5 py-1 text-[9px] font-bold rounded-lg border uppercase tracking-wider ${
                        isDark
                          ? 'text-emerald-400 bg-emerald-950/20 border-emerald-900/30'
                          : 'text-emerald-600 bg-emerald-50 border-slate-300'
                      }`}>
                        PLUMBING
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-extrabold rounded-lg border ${
                        isDark
                          ? 'text-amber-400 bg-amber-955/30 border-amber-900/40'
                          : 'text-amber-700 bg-amber-50 border-amber-200'
                      }`}>
                        <span>⏰ Needed:</span>
                        <span className="font-black">Needs Tomorrow</span>
                      </span>
                    </div>

                    {/* Request Details */}
                    <div className="mt-3">
                      <h3 className={`font-extrabold text-sm leading-snug ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
                        Need help fixing our pipe leaking
                      </h3>
                      <p className={`text-xs mt-2 line-clamp-2 leading-relaxed ${isDark ? 'text-[#b4b0a9]' : 'text-slate-455'}`}>
                        Water pipe under kitchen sink is leaking and causing low pressure. Available after 5 PM in Day-as.
                      </p>
                    </div>
                  </div>

                  <div>
                    {/* Divider Line */}
                    <div className={`border-t my-3.5 ${isDark ? 'border-neutral-850' : 'border-slate-200/80'}`} />

                    {/* Budget & Escrow status */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col space-y-0.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-400'}`}>
                          Client Budget
                        </span>
                        <span className={`text-lg font-black ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
                          ₱350
                        </span>
                      </div>

                      <span className="inline-flex items-center gap-1 text-[9.5px] font-bold px-2 py-0.5 rounded-md border w-fit bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        Escrow Protected
                      </span>
                    </div>

                    {/* Payment Options */}
                    <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10px] font-bold bg-slate-50 dark:bg-neutral-800/60 border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-neutral-300">
                        <Banknote className="w-3 h-3 text-slate-400" />
                        On-site Cash
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10px] font-bold bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                        <Smartphone className="w-3 h-3 text-emerald-500" />
                        GCash Ready
                      </span>
                    </div>

                    {/* Action CTA */}
                    <div className="mt-3.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onGetStarted();
                        }}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-emerald-500/25 active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span>Send Offer</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Flip hint footer */}
                    <div className="mt-3.5 flex items-center justify-between text-[10px] text-slate-400 dark:text-neutral-500 font-bold border-t pt-2 border-slate-100 dark:border-neutral-800/80 select-none">
                      <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-extrabold">
                        <span>🛠️</span> Provider View
                      </span>
                      <span className="flex items-center gap-1 text-slate-400 dark:text-neutral-400 group-hover/card:text-emerald-500 transition-colors">
                        🔄 Click to flip card
                      </span>
                    </div>
                  </div>
                </div>
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
