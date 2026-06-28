"use client";
import React from 'react';
import { useApp } from '../../../context/AppContext';
import ProviderActivity from '../../../components/provider/ProviderActivity';

export default function ProviderActivityPage() {
  const { user } = useApp();
  return <ProviderActivity currentProviderId={user?.id} />;
}
