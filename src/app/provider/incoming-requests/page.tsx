"use client";
import React from 'react';
import { useApp } from '../../../context/AppContext';
import IncomingRequests from '../../../components/provider/IncomingRequests';

export default function IncomingRequestsPage() {
  const { user } = useApp();
  return <IncomingRequests currentProviderId={user?.id} />;
}
