'use client';

import { useApp } from '@/context/AppContext';
import { SUSPENSION_BROWSING_NOTICE } from '@/lib/marketplaceAccess';
import { ShieldAlert } from 'lucide-react';

export default function AccountSuspensionBanner() {
  const { user } = useApp();
  if (user?.moderationStatus !== 'SUSPENDED') return null;
  return (
    <div role="status" className="mx-auto mt-2 flex w-full max-w-[1440px] items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
      <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200">
        <ShieldAlert className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <p className="min-w-0 leading-relaxed">
        <strong>Limited Mode — account suspended.</strong> {SUSPENSION_BROWSING_NOTICE} You can still review and resolve eligible existing bookings in Activity.
      </p>
    </div>
  );
}
