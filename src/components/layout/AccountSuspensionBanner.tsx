'use client';

import { useApp } from '@/context/AppContext';
import { SUSPENSION_BROWSING_NOTICE } from '@/lib/marketplaceAccess';

export default function AccountSuspensionBanner() {
  const { user } = useApp();
  if (user?.moderationStatus !== 'SUSPENDED') return null;
  return <div role="status" className="mx-auto mt-2 w-full max-w-[1440px] rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100"><strong>Limited Mode — account suspended.</strong> {SUSPENSION_BROWSING_NOTICE} You can still review and resolve eligible existing bookings in Activity.</div>;
}
