import React from 'react';

interface LandingFooterProps {
  isDark: boolean;
  onGetStarted: () => void;
}

export default function LandingFooter({ isDark, onGetStarted }: LandingFooterProps) {
  return (
    <footer className={`py-16 px-6 md:px-12 w-full border-t transition-colors duration-500 ${
      isDark ? 'bg-[#121212] text-[#b4b0a9] border-neutral-900/60' : 'bg-slate-900 text-slate-400 border-slate-950'
    }`}>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start justify-between gap-8">
        {/* Brand Column */}
        <div className="space-y-4">
          <h4 className={`font-extrabold text-lg tracking-tight transition-colors duration-300 ${
            isDark ? 'text-[#f2efe9]' : 'text-white'
          }`}>
            ServiceHub Cordova
          </h4>
          <p className={`text-xs max-w-xs leading-relaxed font-medium transition-colors duration-300 ${
            isDark ? 'text-[#918d84]' : 'text-slate-400'
          }`}>
            Serving the residents of Cordova, Cebu
          </p>
        </div>

        {/* Links Column */}
        <div className="flex gap-16">
          <div className="space-y-3">
            <ul className="flex items-center space-x-6 text-xs font-semibold">
              <li>
                <button
                  onClick={onGetStarted}
                  className={`transition-colors duration-250 text-left cursor-pointer ${
                    isDark ? 'hover:text-[#f2efe9]' : 'hover:text-white'
                  }`}
                >
                  Log In
                </button>
              </li>
              <li>
                <button
                  onClick={onGetStarted}
                  className={`transition-colors duration-250 text-left cursor-pointer ${
                    isDark ? 'hover:text-[#f2efe9]' : 'hover:text-white'
                  }`}
                >
                  Sign Up
                </button>
              </li>
              <li>
                <a
                  href="mailto:admin@servicehub-cordova.local"
                  className={`transition-colors duration-250 ${
                    isDark ? 'hover:text-[#f2efe9]' : 'hover:text-white'
                  }`}
                >
                  Contact Admin
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className={`max-w-6xl mx-auto border-t mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs font-medium gap-4 transition-colors duration-300 ${
        isDark ? 'border-t border-neutral-800/40 text-[#918d84]' : 'border-t border-slate-800/60 text-slate-500'
      }`}>
        <span>© 2026 ServiceHub Cordova — A community capstone project</span>
      </div>
    </footer>
  );
}
