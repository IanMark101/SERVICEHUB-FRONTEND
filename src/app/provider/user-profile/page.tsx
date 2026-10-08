"use client";
import React, { Suspense } from 'react';
import LegacyProfileRedirect from '../../../components/profile/LegacyProfileRedirect';
import ProfilePageSkeleton from '../../../components/profile/ProfilePageSkeleton';

export default function ProviderUserProfilePage() {
  return (
    <Suspense fallback={<ProfilePageSkeleton />}>
      <LegacyProfileRedirect />
    </Suspense>
  );
}
