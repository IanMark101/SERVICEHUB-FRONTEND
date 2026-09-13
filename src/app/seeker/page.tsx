"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SeekerPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/seeker/seek-services');
  }, [router]);

  return null;
}
