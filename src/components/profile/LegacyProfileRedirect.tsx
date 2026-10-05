"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import BrandLoading from '../ui/BrandLoading';

export default function LegacyProfileRedirect({ role }: { role: 'seeker' | 'provider' }) {
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

  return <BrandLoading label="Opening marketplace profile" role={role} />;
}
