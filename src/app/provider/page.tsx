"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BrandLoading from '@/components/ui/BrandLoading';

export default function ProviderPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/provider/browse-services');
  }, [router]);

  return <BrandLoading compact label="Opening Provider services" role="provider" />;
}
