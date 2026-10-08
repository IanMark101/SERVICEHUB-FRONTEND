"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import ProfilePageSkeleton from './ProfilePageSkeleton';

export default function LegacyProfileRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useApp();
  const targetId = searchParams.get('id') || user?.id;

  useEffect(() => {
    if (!targetId) return;
    const tab = searchParams.get('verify') === 'true' ? 'verification' : searchParams.get('tab');
    if (tab === 'settings') { router.replace('/account/settings'); return; }
    const query = tab ? `?tab=${encodeURIComponent(tab)}` : '';
    router.replace(`/profile/${encodeURIComponent(targetId)}${query}`);
  }, [router, searchParams, targetId]);

  return <ProfilePageSkeleton isOwnProfile={targetId === user?.id} />;
}
