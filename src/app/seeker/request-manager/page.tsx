"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../../context/AppContext';
import RequestManager from '../../../components/seeker/RequestManager';

export default function RequestManagerPage() {
  const router = useRouter();
  const { user } = useApp();

  return (
    <RequestManager 
      currentUserId={user?.id}
      onNavigateToPost={() => router.push('/seeker/post-request')}
      onNavigateToActivity={() => router.push('/seeker/seeker-activity')}
    />
  );
}
