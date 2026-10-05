'use client';

import { useApp } from '@/context/AppContext';

export default function AccountSuspensionBanner() {
  const { user } = useApp();
  if (user?.moderationStatus !== 'SUSPENDED') return null;
  return <div role="status" className="mx-auto mt-2 w-full max-w-[1440px] rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">Your account is suspended. New marketplace activity and starting a job are unavailable. You can review and resolve eligible existing engagements.</div>;
}
