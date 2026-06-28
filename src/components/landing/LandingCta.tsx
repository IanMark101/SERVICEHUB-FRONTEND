import React from 'react';
import ScrollReveal from './ScrollReveal';

interface LandingCtaProps {
  isDark: boolean;
  onGetStarted: () => void;
}

export default function LandingCta({ isDark, onGetStarted }: LandingCtaProps) {
  return (
    <section className="py-24 px-6 md:px-12 max-w-4xl mx-auto w-full text-center space-y-8 relative">
      {/* Decorative glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 glow-bubble-orange -z-10 opacity-30 animate-pulse-glow" />

      <ScrollReveal className="space-y-6 text-center">
        <h2 className={`text-3xl md:text-4xl font-extrabold tracking-tight transition-colors duration-300 ${
          isDark ? 'text-[#f2efe9]' : 'text-slate-900'
        }`}>
          Ready to find help, or start offering yours?
        </h2>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto bg-seeker-primary hover:bg-seeker-hover text-white font-extrabold text-sm py-4 px-8 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg active:scale-98 cursor-pointer"
          >
            I need a service
          </button>
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto bg-provider-primary hover:bg-provider-hover text-white font-extrabold text-sm py-4 px-8 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg active:scale-98 cursor-pointer"
          >
            I want to offer a service
          </button>
        </div>

        <p className={`text-xs font-semibold transition-colors duration-300 ${
          isDark ? 'text-neutral-500' : 'text-slate-400'
        }`}>
          Free to join. Verification required before booking or listing.
        </p>
      </ScrollReveal>
    </section>
  );
}
