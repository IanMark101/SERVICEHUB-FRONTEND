import Link from 'next/link';
import { ArrowUpRight, CreditCard, Repeat2, ShieldCheck } from 'lucide-react';

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
    icon: Repeat2,
  },
];

export default function PlatformGuides({ isDark = false }: { isDark?: boolean }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {guides.map(({ title, description, href, icon: Icon }) => (
        <Link
          key={title}
          href={href}
          className={`group rounded-2xl border p-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 ${isDark ? 'border-neutral-800 bg-[#22211e] hover:bg-neutral-800/60' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
        >
          <div className="flex items-start justify-between gap-3">
            <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${isDark ? 'bg-neutral-800 text-neutral-300' : 'bg-slate-100 text-slate-700'}`}><Icon className="h-4 w-4" aria-hidden="true" /></span>
            <ArrowUpRight className="h-4 w-4 text-slate-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
          </div>
          <h3 className="mt-4 text-sm font-bold text-slate-900 dark:text-[#f2efe9]">{title}</h3>
          <p className="mt-1.5 text-xs leading-5 text-slate-600 dark:text-[#b4b0a9]">{description}</p>
          <span className="mt-3 inline-block text-[11px] font-bold text-slate-600 dark:text-neutral-300">Read guide</span>
        </Link>
      ))}
    </div>
  );
}
