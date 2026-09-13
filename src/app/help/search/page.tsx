import React, { Suspense } from 'react';
import { Metadata } from 'next';
import HelpSearchPage from '@/features/help/pages/HelpSearchPage';

export const metadata: Metadata = {
  title: 'Search Help & Documentation | ServiceHub Cordova',
  description: 'Search guides and articles across ServiceHub Cordova.',
};

export default function Page() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-xs text-slate-400">Loading search...</div>}>
      <HelpSearchPage />
    </Suspense>
  );
}
