import React from 'react';
import { MapPin, Mail, Phone, ExternalLink } from 'lucide-react';
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
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Live Queue', href: '#queue' },
  { label: 'Why ServiceHub', href: '#problem' },
  { label: 'FAQ', href: '#faq' },
];

const ACCOUNT_LINKS = [
  { label: 'Create Account', href: '/register' },
  { label: 'Log In', href: '/login' },
];

const SERVICE_CATEGORIES = [
  'Home Cleaning', 'Laundry', 'Plumbing', 'Electrical Work',
  'Carpentry', 'Gardening', 'Errand & Delivery', 'Caregiving',
  'Tutoring', 'Pet Sitting',
];

function scrollToSection(href: string) {
  if (typeof window === 'undefined') return;
  const id = href.replace('#', '');
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function LandingFooter({ isDark, onGetStarted }: LandingFooterProps) {
  const router = useRouter();

  const linkClass = `transition-colors duration-200 text-left cursor-pointer text-xs
    ${isDark ? 'text-[#7a7670] hover:text-[#f2efe9]' : 'text-slate-400 hover:text-white'}
  `;
  const headingClass = `text-xs font-bold uppercase tracking-widest mb-4
    ${isDark ? 'text-[#c9c4bb]' : 'text-slate-300'}
  `;

  return (
    <footer className={`pt-16 pb-8 px-6 md:px-12 w-full border-t transition-colors duration-500 ${
      isDark ? 'bg-[#111110] text-[#b4b0a9] border-neutral-900/60' : 'bg-slate-900 text-slate-400 border-slate-950'
    }`}>
      <div className="max-w-6xl mx-auto">

        {/* Top grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8 pb-12 border-b border-dashed
          ${isDark ? 'border-neutral-800/60' : 'border-slate-700/50'}
        ">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <img src="/logo.png" alt="ServiceHub logo" className="h-7 w-7 object-contain rounded-lg" />
              <span className={`font-extrabold text-base tracking-tight ${isDark ? 'text-[#f2efe9]' : 'text-white'}`}>
                ServiceHub Cordova
              </span>
            </div>
            <p className={`text-xs leading-relaxed max-w-[220px] ${isDark ? 'text-[#7a7670]' : 'text-slate-500'}`}>
              A hyperlocal service marketplace for the residents of Cordova, Cebu. Verified providers. Fair queuing. Secure payments.
            </p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs">
                <MapPin size={11} className={isDark ? 'text-amber-500/70' : 'text-slate-500'} />
                <span className={isDark ? 'text-[#7a7670]' : 'text-slate-500'}>Cordova, Cebu, Philippines 6017</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Mail size={11} className={isDark ? 'text-amber-500/70' : 'text-slate-500'} />
                <a
                  href="mailto:admin@servicehub-cordova.local"
                  className={`transition-colors duration-200 ${isDark ? 'text-[#7a7670] hover:text-[#f2efe9]' : 'text-slate-500 hover:text-white'}`}
                >
                  admin@servicehub-cordova.local
                </a>
              </div>
            </div>
          </div>

          {/* Platform */}
          <div>
            <p className={headingClass}>Platform</p>
            <ul className="space-y-2.5">
              {PLATFORM_LINKS.map((l) => (
                <li key={l.href}>
                  <button onClick={() => scrollToSection(l.href)} className={linkClass}>
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>

            <p className={`${headingClass} mt-7`}>Account</p>
            <ul className="space-y-2.5">
              {ACCOUNT_LINKS.map((l) => (
                <li key={l.href}>
                  <button onClick={() => router.push(l.href)} className={linkClass}>
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Service Categories */}
          <div>
            <p className={headingClass}>Service Types</p>
            <ul className="space-y-2.5">
              {SERVICE_CATEGORIES.map((cat) => (
                <li key={cat}>
                  <span className={`text-xs ${isDark ? 'text-[#7a7670]' : 'text-slate-500'}`}>{cat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Barangays */}
          <div>
            <p className={headingClass}>
              <span className="flex items-center gap-1.5">
                <MapPin size={10} />
                Barangays We Serve
              </span>
            </p>
            <ul className="space-y-2">
              {BARANGAYS.map((brgy) => (
                <li key={brgy} className={`text-xs flex items-center gap-2 ${isDark ? 'text-[#7a7670]' : 'text-slate-500'}`}>
                  <span className={`w-1 h-1 rounded-full flex-shrink-0 ${isDark ? 'bg-amber-500/50' : 'bg-slate-500/50'}`} />
                  {brgy}
                </li>
              ))}
            </ul>
            <p className={`mt-4 text-[10px] leading-relaxed ${isDark ? 'text-[#55524e]' : 'text-slate-600'}`}>
              All 13 barangays of Cordova, Cebu covered.
            </p>
          </div>
        </div>

        {/* Info bar */}
        <div className={`mt-8 p-4 rounded-xl text-xs leading-relaxed ${isDark ? 'bg-white/3 border border-neutral-800/50' : 'bg-white/5 border border-slate-700/30'}`}>
          <p className={isDark ? 'text-[#5a5750]' : 'text-slate-600'}>
            <strong className={isDark ? 'text-[#7a7670]' : 'text-slate-500'}>About Cordova:</strong>{' '}
            Cordova is a 1st-class municipality on Mactan Island in Cebu Province, Philippines. It is adjacent to Lapu-Lapu City and is home to 13 barangays. With a growing population and proximity to Mactan-Cebu International Airport, Cordova has seen rapid residential and commercial development — making hyperlocal service access more important than ever.
          </p>
        </div>

        {/* Bottom copyright */}
        <div className={`mt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] font-medium gap-3 ${isDark ? 'text-[#4a4741]' : 'text-slate-600'}`}>
          <span>© 2026 ServiceHub Cordova — A community capstone project for Cordova, Cebu</span>
          <span className="flex items-center gap-1">
            Built for{' '}
            <span className={`font-bold ${isDark ? 'text-[#7a7670]' : 'text-slate-500'}`}>Cordova LGU</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
