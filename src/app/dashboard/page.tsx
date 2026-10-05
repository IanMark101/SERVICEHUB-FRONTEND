"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import BrandLoading from '@/components/ui/BrandLoading';
import { getWorkspaceEntryPath } from '@/lib/workspaceEntry';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user, authLoading } = useApp();

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated && user) {
        router.replace(getWorkspaceEntryPath(user));
      } else {
        router.replace('/login');
      }
    }
  }, [isAuthenticated, user, authLoading, router]);

  return <BrandLoading label="Opening your workspace" />;
}
