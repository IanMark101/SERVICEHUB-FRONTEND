"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import WorkspacePageSkeleton from '@/components/ui/WorkspacePageSkeleton';

export default function SeekerPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/seeker/seek-services');
  }, [router]);

  return <WorkspacePageSkeleton label="Opening Seeker services" role="seeker" />;
}
