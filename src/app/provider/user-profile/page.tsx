"use client";
import React, { Suspense } from 'react';
import LegacyProfileRedirect from '../../../components/profile/LegacyProfileRedirect';
import BrandLoading from '../../../components/ui/BrandLoading';

export default function ProviderUserProfilePage() {
  return (
    <Suspense fallback={<BrandLoading label="Opening marketplace profile" role="provider" />}>
      <LegacyProfileRedirect role="provider" />
    </Suspense>
  );
}
