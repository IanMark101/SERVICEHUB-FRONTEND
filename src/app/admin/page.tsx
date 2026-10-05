"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import WorkspacePageSkeleton from '@/components/ui/WorkspacePageSkeleton';

export default function AdminPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/overview');
  }, [router]);

  return <WorkspacePageSkeleton label="Opening Admin overview" role="admin" variant="overview" />;
}
