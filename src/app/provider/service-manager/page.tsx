"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../../context/AppContext';
import ServiceManager from '../../../components/provider/ServiceManager';

export default function ServiceManagerPage() {
  const router = useRouter();
  const { user } = useApp();

  return (
    <ServiceManager 
      currentProviderId={user?.id} 
      onNavigateToOffer={() => router.push('/provider/offer-services')} 
    />
  );
}
