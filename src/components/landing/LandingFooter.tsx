import React from 'react';
import { MapPin, Mail } from 'lucide-react';
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

const PLATFORM_LINKS = [
  { label: 'How It Works', href: 'how-it-works' },
  { label: 'Live Queue',   href: 'queue' },
  { label: 'Why ServiceHub', href: 'problem' },
  { label: 'FAQ',          href: 'faq' },
];

function scrollTo(id: string) {
  if (typeof window === 'undefined') return;
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function LandingFooter({ isDark, onGetStarted }: LandingFooterProps) {
  const router = useRouter();

  const mutedText = isDark ? 'text-[#6e6a62]' : 'text-slate-400';
  const bodyText  = isDark ? 'text-[#8f8b83]' : 'text-slate-400';
  const heading   = `text-xs font-bold uppercase tracking-widest mb-5 ${isDark ? 'text-[#c5c0b7]' : 'text-slate-300'}`;
  const linkBtn   = `text-sm font-medium text-left cursor-pointer transition-colors duration-200 ${isDark ? 'text-[#8f8b83] hover:text-[#f2efe9]' : 'text-slate-400 hover:text-white'}`;

  return (
    <footer className={`pt-16 pb-8 px-6 md:px-12 w-full border-t transition-colors duration-500 ${
      isDark ? 'bg-[#111110] border-neutral-900/60' : 'bg-slate-900 border-slate-950'
    }`}>
      <div className="max-w-6xl mx-auto">

        {/* Main grid — 3 columns */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-12 pb-12 border-b ${isDark ? 'border-neutral-800/50' : 'border-slate-700/40'}`}>

          {/* Col 1 — Brand */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="ServiceHub logo" className="h-8 w-8 object-contain rounded-lg" />
              <span className={`font-extrabold text-base tracking-tight ${isDark ? 'text-[#f2efe9]' : 'text-white'}`}>
                ServiceHub Cordova
              </span>
            </div>
            <p className={`text-sm leading-relaxed max-w-[240px] ${bodyText}`}>
              A hyperlocal service marketplace for the residents of Cordova, Cebu. Verified providers, fair queuing, and secure payments.
            </p>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5">
                <MapPin size={13} className={isDark ? 'text-amber-500/70' : 'text-slate-500'} />
                <span className={`text-sm ${bodyText}`}>Cordova, Cebu, Philippines 6017</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail size={13} className={isDark ? 'text-amber-500/70' : 'text-slate-500'} />
                <a
                  href="mailto:admin@servicehub-cordova.local"
                  className={`text-sm transition-colors duration-200 ${isDark ? 'text-[#8f8b83] hover:text-[#f2efe9]' : 'text-slate-400 hover:text-white'}`}
                >
                  admin@servicehub-cordova.local
                </a>
              </div>
            </div>
          </div>

          {/* Col 2 — Navigation */}
          <div>
            <p className={heading}>Navigate</p>
            <ul className="space-y-3">
              {PLATFORM_LINKS.map((l) => (
                <li key={l.href}>
                  <button onClick={() => scrollTo(l.href)} className={linkBtn}>{l.label}</button>
                </li>
              ))}
            </ul>

            <p className={`${heading} mt-8`}>Account</p>
            <ul className="space-y-3">
              <li>
                <button onClick={() => router.push('/register')} className={linkBtn}>Create Account</button>
              </li>
              <li>
                <button onClick={() => router.push('/login')} className={linkBtn}>Log In</button>
              </li>
            </ul>
          </div>

          {/* Col 3 — Coverage Area */}
          <div>
            <p className={heading}>
              <span className="flex items-center gap-1.5">
                <MapPin size={11} />
                Service Coverage Area
              </span>
            </p>
            <p className={`text-sm mb-4 ${bodyText}`}>
              Available to all residents across the 13 barangays of Cordova, Cebu:
            </p>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
              {BARANGAYS.map((brgy) => (
                <li key={brgy} className={`text-sm flex items-center gap-2 ${bodyText}`}>
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isDark ? 'bg-amber-500/50' : 'bg-slate-500/50'}`} />
                  {brgy}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* About Cordova blurb */}
        <div className={`mt-8 p-5 rounded-2xl text-sm leading-relaxed ${isDark ? 'bg-white/3 border border-neutral-800/50' : 'bg-white/5 border border-slate-700/30'}`}>
          <strong className={`block mb-1 text-xs uppercase tracking-widest ${isDark ? 'text-[#7a7670]' : 'text-slate-500'}`}>About Cordova, Cebu</strong>
          <p className={bodyText}>
            Cordova is a 1st-class municipality on Mactan Island, Cebu Province, Philippines — adjacent to Lapu-Lapu City and served by Mactan-Cebu International Airport. With a growing population spread across its 13 barangays and rapid residential development, access to reliable hyperlocal services has never been more critical. ServiceHub Cordova was built to serve this community.
          </p>
        </div>

        {/* Copyright */}
        <div className={`mt-7 flex flex-col sm:flex-row items-center justify-between text-xs font-medium gap-3 ${mutedText}`}>
          <span>© 2026 ServiceHub Cordova — A community capstone project for Cordova, Cebu</span>
          <span>Built for <strong className={isDark ? 'text-[#7a7670]' : 'text-slate-500'}>Cordova Local Government Unit</strong></span>
        </div>
      </div>
    </footer>
  );
}
