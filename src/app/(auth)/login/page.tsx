"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import LoginContainer, { UserSession } from '@/components/auth/LoginContainer';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, setUser, setIsAuthenticated, user, authLoading } = useApp();

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      if (user.moderationStatus === 'BANNED') {
        router.replace('/account-banned');
        return;
      }
      if (user.role !== 'admin' && user.emailVerified !== true) {
        router.replace('/email-verification-required');
        return;
      }
      const finalRole = user.role === 'admin' ? 'admin' : (localStorage.getItem('workspaceRole') || 'seeker');
      router.replace(`/${finalRole}`);
    }
  }, [isAuthenticated, user, authLoading, router]);

  const handleLoginSuccess = (userData: UserSession) => {
    setUser(userData);
    setIsAuthenticated(true);
    if (userData.moderationStatus === 'BANNED') {
      router.replace('/account-banned');
      return;
    }
    if (userData.role !== 'admin' && userData.emailVerified !== true) {
      router.replace('/email-verification-required');
      return;
    }
    const finalRole = userData.role === 'admin' ? 'admin' : (localStorage.getItem('workspaceRole') || 'seeker');
    router.replace(`/${finalRole}`);
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#f5f4f2] dark:bg-[#121211]">
      <LoginContainer
        onLoginSuccess={handleLoginSuccess}
        onBackToHome={handleBackToHome}
      />
    </div>
  );
}
