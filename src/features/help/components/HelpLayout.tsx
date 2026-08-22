"use client";
import React from 'react';
import Link from 'next/link';
import HelpNavbar from './HelpNavbar';
import { useApp } from '@/context/AppContext';
import { ShieldCheck, MapPin, Mail, BookOpen, ArrowRight } from 'lucide-react';

interface HelpLayoutProps {
  children: React.ReactNode;
}

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  const { isDark } = useApp();

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 font-sans ${
      isDark ? 'bg-[#191919] text-[#f2efe9]' : 'bg-[#fbfaf7] text-slate-800'
    }`}>
      {/* Top Fixed Header */}
      <HelpNavbar />

      {/* Decorative Orbs */}
      <div className="fixed top-20 left-1/4 w-96 h-96 rounded-full bg-orange-500/5 dark:bg-orange-500/10 blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-20 right-1/4 w-96 h-96 rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 blur-3xl pointer-events-none -z-10" />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
        {children}
      </main>

      {/* Help Center Clean Footer */}
      <footer className={`border-t mt-16 py-10 transition-colors ${
        isDark ? 'bg-[#131312] border-neutral-850 text-[#b4b0a9]' : 'bg-white border-slate-200 text-slate-500'
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-xs">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="ServiceHub Cordova" className="w-8 h-8 rounded-lg object-contain" />
            <div>
              <p className="font-extrabold text-slate-900 dark:text-[#f2efe9]">
                ServiceHub Cordova Help Center
              </p>
              <p className="text-[11px] text-slate-400 dark:text-neutral-500">
                Official documentation for the Municipality of Cordova, Cebu.
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-6 text-xs font-semibold">
            <Link href="/help" className="hover:text-orange-500 transition-colors">
              Help Home
            </Link>
            <Link href="/privacy" className="hover:text-orange-500 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-orange-500 transition-colors">
              Terms of Service
            </Link>
            <a
              href="mailto:admin@servicehub-cordova.local"
              className="hover:text-orange-500 transition-colors flex items-center gap-1"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Contact Support</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
