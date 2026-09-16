"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import WorkspacePageSkeleton from '@/components/ui/WorkspacePageSkeleton';

export default function ProviderPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/provider/browse-services');
  }, [router]);

  return <WorkspacePageSkeleton label="Opening Provider services" role="provider" />;
}
