"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BrandLoading from '@/components/ui/BrandLoading';

export default function SeekerPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/seeker/seek-services');
  }, [router]);

  return <BrandLoading compact label="Opening Seeker services" role="seeker" />;
}
