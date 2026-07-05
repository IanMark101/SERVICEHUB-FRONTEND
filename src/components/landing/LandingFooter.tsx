import React from 'react';
import { MapPin, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LandingFooterProps {
  isDark: boolean;
  onGetStarted: () => void;
}

function scrollTo(id: string) {
  if (typeof window === 'undefined') return;
  const el = document.getElementById(id);
  if (!el) return;
  // Account for the 64px fixed header so the section isn't hidden behind it
  const top = el.getBoundingClientRect().top + window.scrollY - 68;
  window.scrollTo({ top, behavior: 'smooth' });
}

const COLUMNS: { heading: string; links: { label: string; type: 'scroll' | 'route' | 'none'; target: string }[] }[] = [
  {
    heading: 'Platform',
    links: [
      { label: 'How It Works',        type: 'scroll', target: 'how-it-works' },
      { label: 'Live Queue System',   type: 'scroll', target: 'queue' },
      { label: 'Why ServiceHub',      type: 'scroll', target: 'problem' },
      { label: 'Features & Roles',    type: 'scroll', target: 'workspaces' },
      { label: 'Trust & Security',    type: 'scroll', target: 'trust' },
      { label: 'Platform Comparison', type: 'scroll', target: 'comparison' },
      { label: 'Cordova Community',   type: 'scroll', target: 'community' },
      { label: 'Community Reviews',   type: 'scroll', target: 'reviews' },
      { label: 'FAQ',                 type: 'scroll', target: 'faq' },
      { label: 'Create Account',      type: 'route',  target: '/register' },
      { label: 'Log In',              type: 'route',  target: '/login' },
    ],
  },
  {
    heading: 'For Service Seekers',
    links: [
      { label: 'Seek Services',        type: 'route',  target: '/login' },
      { label: 'Post a Request',       type: 'route',  target: '/login' },
      { label: 'Track Live Queue',     type: 'scroll', target: 'queue' },
      { label: 'Escrow Payment',       type: 'scroll', target: 'how-it-works' },
      { label: 'Rate & Review',        type: 'scroll', target: 'how-it-works' },
      { label: 'Residency Verification', type: 'scroll', target: 'how-it-works' },
    ],
  },
  {
    heading: 'For Service Providers',
    links: [
      { label: 'Browse Jobs',          type: 'route',  target: '/login' },
      { label: 'Create a Listing',     type: 'route',  target: '/login' },
      { label: 'Manage Bookings',      type: 'route',  target: '/login' },
      { label: 'Queue Management',     type: 'scroll', target: 'queue' },
      { label: 'Escrow Disbursement',  type: 'scroll', target: 'how-it-works' },
      { label: 'Residency Verification', type: 'scroll', target: 'how-it-works' },
    ],
  },
  {
    heading: 'Coverage Area',
    links: [
      { label: 'Municipality of Cordova', type: 'none', target: '' },
      { label: 'Brgy. Alegria',        type: 'none', target: '' },
      { label: 'Brgy. Bangbang',       type: 'none', target: '' },
      { label: 'Brgy. Buagsong',       type: 'none', target: '' },
      { label: 'Brgy. Catarman',       type: 'none', target: '' },
      { label: 'Brgy. Cogon',          type: 'none', target: '' },
      { label: 'Brgy. Dapitan',        type: 'none', target: '' },
      { label: 'Brgy. Day-as',         type: 'none', target: '' },
      { label: 'Brgy. Gabi',           type: 'none', target: '' },
      { label: 'Brgy. Gilutongan',     type: 'none', target: '' },
      { label: 'Brgy. Ibabao',         type: 'none', target: '' },
      { label: 'Brgy. Pilipog',        type: 'none', target: '' },
      { label: 'Brgy. Poblacion',      type: 'none', target: '' },
      { label: 'Brgy. San Miguel',     type: 'none', target: '' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { label: 'Contact Admin',        type: 'none', target: '' },
      { label: 'Help Center',          type: 'none', target: '' },
      { label: 'System Status',        type: 'none', target: '' },
      { label: 'Report an Issue',      type: 'none', target: '' },
    ],
  },
  {
    heading: 'Legal & Policies',
    links: [
      { label: 'Privacy Policy',       type: 'none', target: '' },
      { label: 'Terms of Service',     type: 'none', target: '' },
      { label: 'Data Protection',      type: 'none', target: '' },
      { label: 'Acceptable Use Policy', type: 'none', target: '' },
      { label: 'Cookie Policy',        type: 'none', target: '' },
    ],
  },
];

export default function LandingFooter({ isDark, onGetStarted }: LandingFooterProps) {
  const router = useRouter();

  const bg      = 'bg-[#0d0d0c]';
  const border  = 'border-neutral-800/60';
  const heading = 'text-slate-400';
  const link    = 'text-slate-200 hover:text-white';
  const muted   = 'text-slate-500';

  function handleLink(type: string, target: string) {
    if (type === 'scroll') scrollTo(target);
    else if (type === 'route') router.push(target);
  }

  return (
    <footer className={`w-full ${bg}`}>
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-16 pb-0">

        {/* Top section: brand left + columns right */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">

          {/* Brand block */}
          <div className="lg:w-56 shrink-0 space-y-5">
            <div className="flex items-center gap-2.5">
              <img src="/logo.png" alt="ServiceHub Cordova" className="h-7 w-7 rounded-lg object-contain" />
              <span className={`font-extrabold text-sm tracking-tight text-white`}>
                ServiceHub<br />Cordova
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              A hyperlocal service marketplace for Cordova, Cebu. Connecting verified providers with residents across all 13 barangays.
            </p>
            <div className="space-y-2 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin size={12} className="opacity-60 shrink-0" />
                <span>Cordova, Cebu 6017</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={12} className="opacity-60 shrink-0" />
                <a href="mailto:admin@servicehub-cordova.local" className="hover:text-white transition-colors">
                  admin@servicehub-cordova.local
                </a>
              </div>
            </div>
          </div>

          {/* Link columns grid */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">
            {COLUMNS.map((col) => (
              <div key={col.heading}>
                <p className={`text-[11px] font-semibold uppercase tracking-widest mb-4 ${heading}`}>
                  {col.heading}
                </p>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      {l.type === 'none' ? (
                        <span className={`text-[13px] ${isDark ? 'text-[#7a7670]' : 'text-slate-500'}`}>
                          {l.label}
                        </span>
                      ) : (
                        <button
                          onClick={() => handleLink(l.type, l.target)}
                          className={`text-[13px] text-left transition-colors cursor-pointer ${link}`}
                        >
                          {l.label}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className={`mt-14 border-t ${border}`} />

        {/* Bottom bar */}
        <div className="py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <p className={`text-[11px] font-semibold uppercase tracking-widest ${isDark ? 'text-[#4a4741]' : 'text-slate-700'}`}>
              By ServiceHub Cordova
            </p>
            <p className={`text-[11px] ${muted}`}>
              © 2026 ServiceHub Cordova — A capstone project for the Municipality of Cordova, Cebu Province, Philippines.
            </p>
          </div>
          <p className={`text-[11px] shrink-0 ${muted}`}>
            Serving Cordova Local Government Unit
          </p>
        </div>
      </div>
    </footer>
  );
}
