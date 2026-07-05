import React from 'react';
import { MapPin, Mail, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LandingFooterProps {
  isDark: boolean;
  onGetStarted: () => void;
}

const BARANGAYS = [
  'Alegria', 'Bangbang', 'Buagsong', 'Catarman',
  'Cogon', 'Dapitan', 'Day-as', 'Gabi',
  'Gilutongan', 'Ibabao', 'Pilipog', 'Poblacion',
  'San Miguel',
];

function scrollTo(id: string) {
  if (typeof window === 'undefined') return;
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function LandingFooter({ isDark, onGetStarted }: LandingFooterProps) {
  const router = useRouter();

  const text    = isDark ? 'text-[#9a9590]' : 'text-slate-400';
  const hover   = isDark ? 'hover:text-[#f2efe9]' : 'hover:text-white';
  const heading = `text-xs font-semibold uppercase tracking-[0.15em] mb-5 ${isDark ? 'text-[#c5c0b7]' : 'text-slate-200'}`;
  const divider = isDark ? 'border-neutral-800' : 'border-slate-700/60';

  return (
    <footer className={`w-full border-t ${isDark ? 'bg-[#0f0f0e] border-neutral-900' : 'bg-slate-950 border-slate-900'}`}>

      {/* Main footer body */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">

        {/* Column 1 — Brand & Contact */}
        <div className="md:col-span-1 space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <img src="/logo.png" alt="ServiceHub Cordova" className="h-8 w-8 rounded-lg object-contain" />
              <span className={`font-extrabold text-base tracking-tight ${isDark ? 'text-[#f2efe9]' : 'text-white'}`}>
                ServiceHub Cordova
              </span>
            </div>
            <p className={`text-sm leading-relaxed ${text}`}>
              A transparent, community-driven service platform built for the residents of Cordova, Cebu.
            </p>
          </div>

          <div className={`space-y-2.5 border-t pt-5 ${divider}`}>
            <div className={`flex items-start gap-2.5 text-sm ${text}`}>
              <MapPin size={14} className="mt-0.5 shrink-0 opacity-60" />
              <span>Cordova, Cebu, Philippines 6017</span>
            </div>
            <div className={`flex items-start gap-2.5 text-sm ${text}`}>
              <Mail size={14} className="mt-0.5 shrink-0 opacity-60" />
              <a href="mailto:admin@servicehub-cordova.local" className={`transition-colors ${hover}`}>
                admin@servicehub-cordova.local
              </a>
            </div>
          </div>
        </div>

        {/* Column 2 — Navigation */}
        <div>
          <p className={heading}>Platform</p>
          <ul className="space-y-3">
            {[
              { label: 'How It Works',   id: 'how-it-works' },
              { label: 'Live Queue System', id: 'queue' },
              { label: 'Why ServiceHub', id: 'problem' },
              { label: 'FAQ',            id: 'faq' },
            ].map((l) => (
              <li key={l.id}>
                <button
                  onClick={() => scrollTo(l.id)}
                  className={`text-sm transition-colors cursor-pointer text-left ${text} ${hover}`}
                >
                  {l.label}
                </button>
              </li>
            ))}
          </ul>

          <p className={`${heading} mt-8`}>Account</p>
          <ul className="space-y-3">
            <li>
              <button onClick={() => router.push('/register')} className={`text-sm cursor-pointer transition-colors ${text} ${hover}`}>
                Create an Account
              </button>
            </li>
            <li>
              <button onClick={() => router.push('/login')} className={`text-sm cursor-pointer transition-colors ${text} ${hover}`}>
                Log In to Dashboard
              </button>
            </li>
          </ul>
        </div>

        {/* Column 3 & 4 — Service Coverage (spans 2 cols) */}
        <div className="md:col-span-2">
          <p className={heading}>
            <span className="flex items-center gap-2">
              <MapPin size={11} />
              Service Coverage — Municipality of Cordova
            </span>
          </p>
          <p className={`text-sm mb-5 ${text}`}>
            ServiceHub Cordova is available to all residents across every barangay in the Municipality of Cordova, Cebu Province.
          </p>
          <div className={`grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2.5 pb-6 mb-6 border-b ${divider}`}>
            {BARANGAYS.map((brgy) => (
              <div key={brgy} className={`flex items-center gap-2 text-sm ${text}`}>
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isDark ? 'bg-amber-500/40' : 'bg-slate-500/50'}`} />
                {brgy}
              </div>
            ))}
          </div>
          <p className={`text-xs leading-relaxed ${isDark ? 'text-[#55524e]' : 'text-slate-600'}`}>
            <strong className={isDark ? 'text-[#7a7670]' : 'text-slate-500'}>About the Municipality: </strong>
            Cordova is a 1st-class municipality on Mactan Island, Cebu Province, Philippines. With 13 barangays, a growing residential population, and close proximity to Mactan-Cebu International Airport, Cordova residents deserve a reliable and transparent way to access local services — which is exactly what ServiceHub was built for.
          </p>
        </div>
      </div>

      {/* Bottom strip */}
      <div className={`border-t ${divider}`}>
        <div className={`max-w-6xl mx-auto px-6 md:px-12 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${isDark ? 'text-[#4a4741]' : 'text-slate-600'}`}>
          <span>© 2026 ServiceHub Cordova. A capstone project serving the Municipality of Cordova, Cebu Province, Philippines.</span>
          <span className={`shrink-0 ${isDark ? 'text-[#3a3733]' : 'text-slate-700'}`}>
            Built for the Cordova Local Government Unit
          </span>
        </div>
      </div>
    </footer>
  );
}
