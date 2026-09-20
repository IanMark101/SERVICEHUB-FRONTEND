'use client';

import Link from 'next/link';
import { LockKey, SignIn, SquaresFour } from '@phosphor-icons/react';
import { useApp } from '@/context/AppContext';
import BrandLoading from '@/components/ui/BrandLoading';
import SystemState from '@/components/ui/SystemState';

export default function AccessDeniedPage() {
  const { authLoading, isAuthenticated, user } = useApp();

  if (authLoading) return <BrandLoading label="Checking access" />;

  const isAdmin = user?.role === 'admin';
  const destination = isAdmin ? '/admin/overview' : '/dashboard';

  return (
    <SystemState
      code="403"
      tone={isAdmin ? 'neutral' : 'warning'}
      role="alert"
      icon={<LockKey size={28} weight="duotone" />}
      title={isAuthenticated ? 'This workspace is not available to your account' : 'Sign in to continue'}
      description={
        isAuthenticated
          ? isAdmin
            ? 'Community workspaces are reserved for standard ServiceHub accounts. Continue in the administrator workspace.'
            : 'This page is restricted to ServiceHub administrators. Your account and workspace access have not been changed.'
          : 'Your session is not active. Sign in with an authorized ServiceHub account to open this page.'
      }
      actions={
        isAuthenticated ? (
          <Link href={destination} className="system-state-primary-action">
            <SquaresFour size={17} weight="bold" aria-hidden="true" />
            Open my workspace
          </Link>
        ) : (
          <Link href="/login" className="system-state-primary-action">
            <SignIn size={17} weight="bold" aria-hidden="true" />
            Sign in
          </Link>
        )
      }
      detail={<p>If you believe this is incorrect, sign out and use the account assigned to this workspace.</p>}
    />
  );
}
