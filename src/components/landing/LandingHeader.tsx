import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LandingHeaderProps {
  isDark: boolean;
  toggleTheme: () => void;
  onGetStarted: () => void;
}

export default function LandingHeader({ isDark, toggleTheme }: LandingHeaderProps) {
  const router = useRouter();

  return (
    <header className={`sticky top-0 z-50 w-full h-16 backdrop-blur-xl flex items-center justify-between px-6 md:px-12 border-b transition-all duration-300 ${isDark ? 'bg-[#191919]/80 border-neutral-850/40' : 'bg-[#fbfaf7]/80 border-slate-300'
      }`}>
      <div className="flex items-center space-x-3">
        <img 
          src="/logo.png" 
          alt="ServiceHub Cordova Logo" 
          className="h-8 w-8 object-contain rounded-lg shadow-sm"
        />
        <span className={`font-extrabold text-lg tracking-tight transition-colors duration-300 ${isDark ? 'text-[#f2efe9]' : 'text-slate-955'
          }`}>
          ServiceHub Cordova
        </span>
      </div>

      {/* Action Controls */}
      <div className="flex items-center space-x-3">
        {/* Theme switcher toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className={`p-2.5 rounded-xl border transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer ${isDark
              ? 'bg-[#2c2b27] border-neutral-855 text-amber-500 hover:text-amber-400'
              : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800 shadow-sm'
            }`}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        <button
          onClick={() => router.push('/login')}
          className={`font-bold text-xs py-2.5 px-4 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${isDark
              ? 'text-[#f2efe9] hover:bg-neutral-850'
              : 'text-slate-700 hover:bg-slate-100/60'
            }`}
        >
          Log In
        </button>

        <button
          onClick={() => router.push('/register')}
          className="font-bold text-xs py-2.5 px-5 rounded-xl transition-all duration-300 shadow-sm hover:scale-[1.02] active:scale-[0.98] cursor-pointer bg-[#FF5A1F] hover:bg-[#e04f1a] text-white"
        >
          Sign Up
        </button>
      </div>
    </header>
  );
}
