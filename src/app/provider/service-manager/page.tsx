"use client";
import React, { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../../context/AppContext';
import ServiceManager from '../../../components/provider/ServiceManager';
import BrandLoading from '@/components/ui/BrandLoading';

function ServiceManagerContent() {
  const router = useRouter();
  const { user } = useApp();

  return (
    <ServiceManager 
      currentProviderId={user?.id} 
      onNavigateToOffer={() => router.push('/provider/offer-services')} 
    />
  );
}

export default function ServiceManagerPage() {
  return (
    <Suspense fallback={<BrandLoading compact label="Loading service manager" role="provider" />}>
      <ServiceManagerContent />
    </Suspense>
  );
}
