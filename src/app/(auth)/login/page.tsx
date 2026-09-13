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
      const finalRole = user.role === 'admin' ? 'admin' : (localStorage.getItem('workspaceRole') || 'seeker');
      router.push(`/${finalRole}`);
    }
  }, [isAuthenticated, user, authLoading, router]);

  const handleLoginSuccess = (userData: UserSession) => {
    setUser(userData);
    setIsAuthenticated(true);
    const finalRole = userData.role === 'admin' ? 'admin' : (localStorage.getItem('workspaceRole') || 'seeker');
    router.push(`/${finalRole}`);
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f4f2] dark:bg-[#121211]">
        <div className="w-8 h-8 border-3 border-[#c86544] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#f5f4f2] dark:bg-[#121211]">
      <LoginContainer
        onLoginSuccess={handleLoginSuccess}
        onBackToHome={handleBackToHome}
      />
    </div>
  );
}
