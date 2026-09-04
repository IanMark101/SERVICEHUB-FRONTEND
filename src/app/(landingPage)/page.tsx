"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LandingPage from '@/components/landing/LandingPage';
import { useApp } from '@/context/AppContext';

export default function Home() {
  const router = useRouter();
  const { authLoading, isAuthenticated, user } = useApp();

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      router.replace(`/${user.role}`);
    }
  }, [authLoading, isAuthenticated, router, user]);

  if (authLoading || (isAuthenticated && user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fbfaf7] dark:bg-[#191919]">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return <LandingPage onGetStarted={() => router.push('/login')} />;
}
