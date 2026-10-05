import React, { Suspense } from 'react';
import { Metadata } from 'next';
import HelpSearchPage from '@/features/help/pages/HelpSearchPage';
import BrandLoading from '@/components/ui/BrandLoading';

export const metadata: Metadata = {
  title: 'Search Help & Documentation | ServiceHub Cordova',
  description: 'Search guides and articles across ServiceHub Cordova.',
};

export default function Page() {
  return (
    <Suspense fallback={<BrandLoading compact label="Searching help guides" />}>
      <HelpSearchPage />
    </Suspense>
  );
}
