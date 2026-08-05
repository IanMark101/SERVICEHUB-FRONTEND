"use client";
import React, { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../../context/AppContext';
import ServiceManager from '../../../components/provider/ServiceManager';

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
    <Suspense fallback={
      <div className="p-8 text-center text-xs font-semibold text-slate-400">
        Loading Service Manager...
      </div>
    }>
      <ServiceManagerContent />
    </Suspense>
  );
}
