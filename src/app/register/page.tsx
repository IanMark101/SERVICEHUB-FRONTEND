"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import RegisterContainer from '../../components/auth/RegisterContainer';
import { UserSession } from '../../components/auth/LoginContainer';

export default function RegisterPage() {
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
      <div className="min-h-screen flex items-center justify-center bg-[#fbfaf7] dark:bg-[#191919]">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#fbfaf7] dark:bg-[#191919]">
      <RegisterContainer
        onLoginSuccess={handleLoginSuccess}
        onBackToHome={handleBackToHome}
      />
    </div>
  );
}
