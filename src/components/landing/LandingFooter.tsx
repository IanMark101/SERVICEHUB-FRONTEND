'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin } from 'lucide-react';

const links = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Workspaces', href: '#workspaces' },
  { label: 'Queue rules', href: '#queue' },
  { label: 'Trust ledger', href: '#trust' },
  { label: 'Community Hub', href: '#community' },
  { label: 'Help Center', href: '/help' },
];

export default function LandingFooter() {
  return (
    <footer className="border-t border-zinc-800/80 bg-zinc-950 text-zinc-400">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
        <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr]">
          <div className="max-w-md">
            <div className="flex items-center gap-3">
              <Image src="/logo.svg?v=3" alt="" width={40} height={40} className="size-10 rounded-xl" />
              <div>
                <p className="text-sm font-extrabold text-white">ServiceHub Cordova</p>
                <p className="mt-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#c86544]">
                  <MapPin size={12} /> Cordova, Cebu
                </p>
              </div>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-zinc-400">
              A hyperlocal marketplace for finding and offering local services through verified resident identities, accountable booking lifecycles, and fair online-payment queues.
            </p>
          </div>

          <div className="flex flex-col justify-between">
            <nav className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3" aria-label="Footer">
              {links.map((link) =>
                link.href.startsWith('/') ? (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-xs font-semibold text-zinc-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-xs font-semibold text-zinc-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </a>
                )
              )}
              <Link href="/terms" className="text-xs font-semibold text-zinc-400 transition-colors hover:text-white">
                Terms
              </Link>
              <Link href="/privacy" className="text-xs font-semibold text-zinc-400 transition-colors hover:text-white">
                Privacy
              </Link>
            </nav>

            <div className="mt-10 border-t border-zinc-900 pt-6 text-[11px] text-zinc-500 sm:flex sm:items-center sm:justify-between">
              <p>(c) 2026 ServiceHub Cordova. Capstone implementation scoped for Cordova, Cebu.</p>
              <p className="mt-2 sm:mt-0">Local community accountability platform.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
