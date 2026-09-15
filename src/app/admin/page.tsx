"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BrandLoading from '@/components/ui/BrandLoading';

export default function AdminPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/overview');
  }, [router]);

  return <BrandLoading compact label="Opening Admin overview" />;
}
