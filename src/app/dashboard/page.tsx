"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user, authLoading } = useApp();

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated && user) {
        router.replace(`/${user.role}`);
      } else {
        const savedRole = localStorage.getItem('workspaceRole');
        const token = localStorage.getItem('accessToken');
        if (token && savedRole) {
          router.replace(`/${savedRole}`);
        } else {
          router.replace('/login');
        }
      }
    }
  }, [isAuthenticated, user, authLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fbfaf7] dark:bg-[#191919]">
      <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
