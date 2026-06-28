"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProviderPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/provider/browse-services');
  }, [router]);

  return null;
}
