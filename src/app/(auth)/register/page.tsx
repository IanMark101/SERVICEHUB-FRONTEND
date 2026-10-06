"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import RegisterContainer from '@/components/auth/RegisterContainer';
import { UserSession } from '@/components/auth/LoginContainer';

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, setUser, setIsAuthenticated, user, authLoading } = useApp();

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
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
    <div className="min-h-screen w-full overflow-x-clip bg-[#f5f4f2] dark:bg-[#121211]">
      <RegisterContainer
        onLoginSuccess={handleLoginSuccess}
        onBackToHome={handleBackToHome}
      />
    </div>
  );
}
