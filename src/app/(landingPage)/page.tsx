"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LandingPage from '@/components/landing/LandingPage';
import { useApp } from '@/context/AppContext';
import BrandLoading from '@/components/ui/BrandLoading';

export default function Home() {
  const router = useRouter();
  const { authLoading, isAuthenticated, user } = useApp();

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      router.replace(`/${user.role}`);
    }
  }, [authLoading, isAuthenticated, router, user]);

  if (authLoading || (isAuthenticated && user)) {
    return <BrandLoading label={authLoading ? 'Checking your session' : 'Opening your workspace'} />;
  }

  return <LandingPage onGetStarted={() => router.push('/login')} />;
}
