'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../../lib/api/axios';
import type { RecentService } from '../types/community.types';
import NewServicesSection from './NewServicesSection';

export default function FeaturedServices({ isDark }: { isDark: boolean }) {
  const [services, setServices] = useState<RecentService[]>([]);
  const router = useRouter();
  useEffect(() => {
    const controller = new AbortController();
    void api.get('/community/featured-services', { signal: controller.signal }).then(response => { if (!controller.signal.aborted && Array.isArray(response.data.data)) setServices(response.data.data); }).catch(() => { /* Optional discovery section must not block the Community Hub. */ });
    return () => controller.abort();
  }, []);
  if (!services.length) return null;
  return <section aria-label="Featured services" className="space-y-4">
    <NewServicesSection services={services} isDark={isDark} heading="Featured services" onSelectService={id => { localStorage.setItem('workspaceRole', 'seeker'); router.push(`/seeker/seek-services?serviceId=${encodeURIComponent(id)}`); }} onSelectProvider={id => router.push(`/profile/${encodeURIComponent(id)}`)} />
  </section>;
}
