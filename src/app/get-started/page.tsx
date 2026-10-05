'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { getWorkspaceEntryPath } from '@/lib/workspaceEntry';
import BrandLoading from '@/components/ui/BrandLoading';

/** Only an explicit account action opens this route. The public root stays public. */
export default function GetStartedPage() {
  const router = useRouter();
  const { authLoading, authError, isAuthenticated, user } = useApp();
  const destination = authLoading
    ? null
    : !authError && isAuthenticated && user ? getWorkspaceEntryPath(user) : '/register';

  useEffect(() => {
    if (destination) router.replace(destination);
  }, [destination, router]);

  return <BrandLoading label="Opening ServiceHub" />;
}
