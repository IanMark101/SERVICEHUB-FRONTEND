'use client';

import type { ComponentProps } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { getWorkspaceEntryPath } from '@/lib/workspaceEntry';

/** A real link remains usable before hydration; unresolved sessions use the gateway. */
export default function GetStartedLink(props: Omit<ComponentProps<typeof Link>, 'href'>) {
  const { authLoading, authError, isAuthenticated, user } = useApp();
  const href = authLoading || authError
    ? '/get-started'
    : isAuthenticated && user ? getWorkspaceEntryPath(user) : '/register';

  return <Link {...props} href={href} />;
}
