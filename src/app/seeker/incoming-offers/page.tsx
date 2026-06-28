"use client";
import React from 'react';
import { useApp } from '../../../context/AppContext';
import IncomingOffers from '../../../components/seeker/IncomingOffers';

export default function IncomingOffersPage() {
  const { user } = useApp();
  return <IncomingOffers currentUserId={user?.id} />;
}
