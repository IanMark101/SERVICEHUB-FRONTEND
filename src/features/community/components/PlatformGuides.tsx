import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, CreditCard, ArrowsClockwise, ShieldCheck } from '@phosphor-icons/react';

interface PlatformGuidesProps {
  isDark?: boolean;
}

const guides = [
  {
    title: 'Residency verification',
    description: 'Browsing stays open in Limited Mode. Verified email and approved Cordova residency unlock new marketplace transactions.',
    href: '/help/verification/why-verification-is-required',
    icon: ShieldCheck,
  },
  {
    title: 'Payments and provider queues',
    description: 'Online Test Mode bookings share one FCFS paid queue per provider. On-site cash arrangements do not receive a numbered place.',
    href: '/help/queue/how-the-queue-works',
    icon: CreditCard,
  },
  {
    title: 'Reusable local services',
    description: 'Each request creates an independent one-time booking, and you can request the same listing again after the earlier job is resolved.',
    href: '/help/bookings/how-direct-booking-works',
    icon: ArrowsClockwise,
  },
];

export default function PlatformGuides({ isDark = false }: PlatformGuidesProps) {
  return (
    <div className={`divide-y ${isDark ? 'divide-neutral-800/80' : 'divide-slate-100'}`}>
      {guides.map(({ title, description, href, icon: Icon }) => (
        <Link
          key={title}
          href={href}
          className={`group flex items-start gap-2.5 sm:gap-3.5 py-3 sm:py-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c86544] ${
            isDark ? 'text-neutral-200 hover:text-white' : 'text-ink hover:text-ink'
          }`}
        >
          <div className={`grid size-8 sm:size-9 shrink-0 place-items-center rounded-xl transition-colors ${
            isDark
              ? 'bg-orange-500/15 text-orange-400 group-hover:bg-orange-500/25'
              : 'bg-orange-50 text-orange-600 group-hover:bg-orange-100'
          }`}>
            <Icon size={17} weight="duotone" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <span className={`block text-sm font-bold tracking-tight transition-colors ${
              isDark ? 'group-hover:text-orange-400' : 'group-hover:text-orange-600'
            }`}>
              {title}
            </span>
            <p className={`mt-1 text-xs leading-relaxed ${isDark ? 'text-ink-subtle' : 'text-ink-muted'}`}>
              {description}
            </p>
          </div>
          <ArrowUpRight
            size={16}
            className={`mt-1 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 ${
              isDark ? 'text-ink-muted group-hover:text-neutral-300' : 'text-ink-subtle group-hover:text-ink-muted'
            }`}
            aria-hidden="true"
          />
        </Link>
      ))}
    </div>
  );
}
