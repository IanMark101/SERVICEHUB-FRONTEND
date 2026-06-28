"use client";
import React from 'react';
import { useApp } from '../../../context/AppContext';
import BrowseJobs from '../../../components/provider/BrowseJobs';

export default function BrowseServicesPage() {
  const { user } = useApp();
  return <BrowseJobs currentProviderId={user?.id} />;
}
