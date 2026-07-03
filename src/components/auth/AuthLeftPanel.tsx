import React, { useEffect, useState } from 'react';
import { ArrowLeft, Sun, Moon } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AuthLeftPanelProps {
  mode: 'login' | 'signup' | 'forgot' | 'reset';
  step: number;
  accentBg: string;
  onBackToHome?: () => void;
}

export default function AuthLeftPanel({
  mode,
  step,
  accentBg,
  onBackToHome,
}: AuthLeftPanelProps) {
  const { isDark, toggleTheme } = useApp();

  // Self-animating counter stats on page load
  const [barangays, setBarangays] = useState(0);
  const [rating, setRating] = useState(0.0);
  const [bookings, setBookings] = useState(0);

  useEffect(() => {
    if (mode !== 'login') return;

    // Fast count-up animations
    const bInterval = setInterval(() => {
      setBarangays((prev) => {
        if (prev >= 11) {
          clearInterval(bInterval);
          return 11;
        }
        return prev + 1;
      });
    }, 80);

    const rInterval = setInterval(() => {
      setRating((prev) => {
        if (prev >= 4.8) {
          clearInterval(rInterval);
          return 4.8;
        }
        return parseFloat((prev + 0.3).toFixed(1));
      });
    }, 50);

    const bkInterval = setInterval(() => {
      setBookings((prev) => {
        if (prev >= 200) {
          clearInterval(bkInterval);
          return 200;
        }
        return prev + 12;
      });
    }, 40);

    return () => {
      clearInterval(bInterval);
      clearInterval(rInterval);
      clearInterval(bkInterval);
    };
  }, [mode]);

  return (
    <div className="md:w-1/2 bg-slate-50/50 dark:bg-[#1a1917]/70 p-6 sm:p-10 md:p-12 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200 dark:border-neutral-800/80 relative overflow-hidden min-h-[40vh] md:h-screen transition-colors duration-300 select-none">
      
      {/* Self-contained CSS styles for drifting gradient background blobs and floating cards */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes drift {
          0% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(40px, -60px) scale(1.2); }
          100% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50% { transform: translateY(-8px) rotate(-1.5deg); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translateY(0px) rotate(1deg); }
          50% { transform: translateY(-6px) rotate(1.5deg); }
        }
        @keyframes float-fast {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50% { transform: translateY(-7px) rotate(0deg); }
        }
        @keyframes line-draw {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-drift-orange {
          animation: drift 15s ease-in-out infinite alternate;
        }
        .animate-drift-green {
          animation: drift 18s ease-in-out infinite alternate-reverse;
        }
        .animate-float-1 {
          animation: float-slow 7s ease-in-out infinite;
        }
        .animate-float-2 {
          animation: float-medium 6s ease-in-out infinite;
        }
        .animate-float-3 {
          animation: float-fast 6.5s ease-in-out infinite;
        }
        .animate-line {
          animation: line-draw 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .dot-grid {
          background-image: radial-gradient(${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'} 1.5px, transparent 1.5px);
          background-size: 24px 24px;
        }
      `}} />

      {/* Grid Pattern Background */}
      <div className="absolute inset-0 dot-grid pointer-events-none z-0" />

      {/* Cinematic drift glow blobs */}
      {mode === 'login' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[20%] left-[10%] w-[320px] h-[320px] rounded-full bg-orange-500/10 dark:bg-orange-600/15 blur-[90px] animate-drift-orange" />
          <div className="absolute bottom-[20%] right-[10%] w-[350px] h-[350px] rounded-full bg-emerald-500/10 dark:bg-emerald-600/15 blur-[100px] animate-drift-green" />
        </div>
      )}

      {/* Branding Logo & Theme switchers */}
      <div className="relative z-10 flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToHome}
          className="flex items-center space-x-2 group hover:opacity-90 transition-all focus:outline-none cursor-pointer"
          title="Back to Landing Page"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-neutral-800/80 border border-slate-200 dark:border-neutral-700/60 text-slate-500 dark:text-[#b4b0a9] group-hover:bg-slate-200 dark:group-hover:bg-[#22211e] group-hover:shadow-sm transition-all">
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          </div>
          <div className={`p-1.5 rounded-lg ${accentBg} text-white flex items-center justify-center font-extrabold text-base shadow-sm transition-colors w-9 h-9`}>
            S
          </div>
          <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-[#f2efe9]">
            ServiceHub
          </span>
        </button>

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 h-9 w-9 rounded-xl border transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer bg-white dark:bg-[#22211e] border-slate-200 dark:border-neutral-800/80 text-slate-500 dark:text-amber-500 hover:text-slate-800 dark:hover:text-amber-400 shadow-sm"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Left Content Container */}
      <div className="mt-8 md:mt-auto space-y-6 relative z-10">
        {mode === 'signup' ? (
          <>
            {/* SIGNUP MODE: Classic Stepper */}
            <div className="space-y-2 border-b border-slate-200 dark:border-neutral-800/80 pb-4">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-[#f2efe9] leading-tight tracking-tight">
                Get Started with Us
              </h2>
              <p className="text-slate-500 dark:text-[#b4b0a9] text-xs leading-relaxed max-w-sm">
                Complete these easy steps to register your account.
              </p>
            </div>

            <div className="flex">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold tracking-wide">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                <span>CORDOVA AREA NETWORK ACTIVE</span>
              </div>
            </div>

            {/* Stepper Cards */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { s: 1, label: 'Sign Up' },
                { s: 2, label: 'Contact Info' },
                { s: 3, label: 'Profile Setup' },
              ].map((item) => (
                <div
                  key={item.s}
                  className={`p-4 rounded-2xl flex flex-col justify-between min-h-[120px] transition-all duration-300 border ${
                    step === item.s
                      ? 'bg-white dark:bg-[#22211e] text-slate-950 dark:text-[#f2efe9] shadow-md border-orange-500/50 dark:border-neutral-800 scale-[1.02]'
                      : 'bg-slate-100/50 dark:bg-[#1c1b18]/40 text-slate-400 dark:text-[#b4b0a9] border-slate-300 dark:border-neutral-800/40'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                      step === item.s ? `${accentBg} text-white` : 'bg-slate-200 dark:bg-[#2b2a26] text-slate-500'
                    }`}
                  >
                    {item.s}
                  </div>
                  <div className="mt-4">
                    <h4 className="font-bold text-[10px] uppercase tracking-wider leading-none text-slate-400 dark:text-[#b4b0a9]">
                      Step {item.s}
                    </h4>
                    <p className="text-xs font-bold mt-1.5 leading-snug">{item.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* LOGIN, FORGOT, RESET MODES: Redesigned Premium "Living Map" Visual */
          <div className="space-y-8 py-4">
            
            {/* Hero Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-[#f2efe9] leading-tight tracking-tight relative">
                  Your Local <br />
                  <span className="bg-gradient-to-r from-orange-500 to-amber-500 dark:from-orange-400 dark:to-amber-400 bg-clip-text text-transparent relative">
                    Service Network
                    {/* Sliding underline accent */}
                    <span className="absolute bottom-1 left-0 h-[4px] bg-gradient-to-r from-orange-500 to-amber-500 animate-line" style={{ width: '100%' }} />
                  </span>
                </h1>
                <p className="text-slate-500 dark:text-[#b4b0a9] text-sm leading-relaxed max-w-sm pt-2 font-medium">
                  Connecting verified residents and skilled providers in Cordova, Cebu.
                </p>
              </div>
            </div>

            {/* Living Cards Grid Showcase (Floating Mock Cards) */}
            <div className="space-y-4 relative">
              
              {/* Card 1 */}
              <div className="p-4 rounded-2xl flex items-center justify-between shadow-sm border backdrop-blur-md bg-white/70 dark:bg-[#22211e]/75 border-slate-250 dark:border-neutral-800/80 max-w-sm animate-float-1 transform transition-all duration-300 hover:scale-[1.03]">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-lg shadow-inner">🔧</div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-[#f2efe9]">Plumbing & Leak Repair</h4>
                    <p className="text-[10px] text-slate-400 dark:text-[#b4b0a9] font-medium mt-0.5">Jane Doe • Ibabao</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-orange-600 dark:text-orange-400">₱350/fix</div>
                  <div className="inline-flex items-center text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 dark:bg-emerald-950/20 px-1.5 py-0.5 rounded-md mt-1 border border-emerald-500/15">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
                    Available Now
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="p-4 rounded-2xl flex items-center justify-between shadow-sm border backdrop-blur-md bg-white/70 dark:bg-[#22211e]/75 border-slate-250 dark:border-neutral-800/80 max-w-sm animate-float-2 ml-4 transform transition-all duration-300 hover:scale-[1.03]">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-lg shadow-inner">🏠</div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-[#f2efe9]">House Deep Cleaning</h4>
                    <p className="text-[10px] text-slate-400 dark:text-[#b4b0a9] font-medium mt-0.5">Elena Del Mar • Gabi</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">₱800/session</div>
                  <div className="text-[9px] font-bold text-slate-400 dark:text-[#b4b0a9] bg-slate-100 dark:bg-neutral-800/80 px-1.5 py-0.5 rounded-md mt-1 border border-slate-200 dark:border-neutral-700/30">
                    2 in queue
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="p-4 rounded-2xl flex items-center justify-between shadow-sm border backdrop-blur-md bg-white/70 dark:bg-[#22211e]/75 border-slate-250 dark:border-neutral-800/80 max-w-sm animate-float-3 transform transition-all duration-300 hover:scale-[1.03]">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-lg shadow-inner">⚡</div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-[#f2efe9]">Electrical Care & Wiring</h4>
                    <p className="text-[10px] text-slate-400 dark:text-[#b4b0a9] font-medium mt-0.5">John Francisco • Poblacion</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-amber-600 dark:text-amber-400">₱450/hr</div>
                  <div className="inline-flex items-center text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 dark:bg-emerald-950/20 px-1.5 py-0.5 rounded-md mt-1 border border-emerald-500/15">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
                    Available Now
                  </div>
                </div>
              </div>

            </div>

            {/* Quick Stats Summary Row */}
            <div className="flex flex-wrap gap-2.5 pt-2">
              <div className="px-3.5 py-1.5 bg-slate-105/70 dark:bg-[#22211e]/40 border border-slate-200 dark:border-neutral-800/60 rounded-full text-[10px] font-extrabold text-slate-600 dark:text-[#f2efe9] shadow-sm">
                🏘️ {barangays} Barangays
              </div>
              <div className="px-3.5 py-1.5 bg-slate-105/70 dark:bg-[#22211e]/40 border border-slate-200 dark:border-neutral-800/60 rounded-full text-[10px] font-extrabold text-slate-600 dark:text-[#f2efe9] shadow-sm">
                ⭐ {rating.toFixed(1)} Avg Rating
              </div>
              <div className="px-3.5 py-1.5 bg-slate-105/70 dark:bg-[#22211e]/40 border border-slate-200 dark:border-neutral-800/60 rounded-full text-[10px] font-extrabold text-slate-600 dark:text-[#f2efe9] shadow-sm">
                ✓ {bookings}+ Bookings
              </div>
            </div>

            {/* Cordova Active Network Badge */}
            <div className="flex">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border bg-emerald-500/5 dark:bg-emerald-955/20 border-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                <span>CORDOVA AREA NETWORK ACTIVE</span>
              </div>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
