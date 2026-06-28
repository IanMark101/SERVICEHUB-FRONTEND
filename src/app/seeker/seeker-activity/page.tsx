"use client";
import React from 'react';
import { useApp } from '../../../context/AppContext';
import SeekerActivity from '../../../components/seeker/SeekerActivity';

export default function SeekerActivityPage() {
  const { user } = useApp();
  return <SeekerActivity currentUserId={user?.id} />;
}
