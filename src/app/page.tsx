"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LandingPage from '../components/LandingPage';
import { apiGetMe } from '../api/auth.api';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      apiGetMe()
        .then((res) => {
          if (res.success) {
            const finalRole = res.data.user.role === 'admin' ? 'admin' : (localStorage.getItem('workspaceRole') || 'seeker');
            router.push(`/${finalRole}`);
          } else {
            setLoading(false);
          }
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fbfaf7] dark:bg-[#191919]">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return <LandingPage onGetStarted={() => router.push('/login')} />;
}
