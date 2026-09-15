import Link from 'next/link';
import { ArrowUpRight, CreditCard, ArrowsClockwise, ShieldCheck } from '@phosphor-icons/react';

const guides = [
  {
    title: 'Residency verification',
    description: 'Browsing stays open in Limited Mode. Verified email and approved Cordova residency unlock new marketplace transactions.',
    href: '/help/verification/why-verification-is-required',
    icon: ShieldCheck,
  },
  {
    title: 'Payments and service queues',
    description: 'Online Test Mode bookings use listing-specific FCFS queues. On-site cash arrangements never enter the online queue.',
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

export default function PlatformGuides() {
  return (
    <div className="mt-5 divide-y divide-white/12">
      {guides.map(({ title, description, href, icon: Icon }) => (
        <Link
          key={title}
          href={href}
          className="group flex gap-3 py-4 text-[#f5f4f2] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e9a58c]"
        >
          <Icon size={18} className="mt-0.5 shrink-0 text-[#e9a58c]" aria-hidden="true" />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold tracking-[-0.02em] group-hover:text-[#e9a58c]">{title}</span>
            <span className="mt-1 block text-xs leading-5 text-[#aaa59d]">{description}</span>
          </span>
          <ArrowUpRight size={15} className="mt-0.5 shrink-0 text-[#aaa59d] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      ))}
    </div>
  );
}
