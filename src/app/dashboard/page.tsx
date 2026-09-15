"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import BrandLoading from '@/components/ui/BrandLoading';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user, authLoading } = useApp();

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated && user) {
        router.replace(`/${user.role}`);
      } else {
        router.replace('/login');
      }
    }
  }, [isAuthenticated, user, authLoading, router]);

  return <BrandLoading label="Opening your workspace" />;
}
