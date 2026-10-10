import React from 'react';
import { Metadata } from 'next';
import HelpSearchPage from '@/features/help/pages/HelpSearchPage';

export const metadata: Metadata = {
  title: 'Search Help & Documentation | ServiceHub',
  description: 'Search guides and articles across ServiceHub.',
};

export default async function Page({ searchParams }: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const { q } = await searchParams;
  const query = Array.isArray(q) ? q[0] || '' : q || '';
  return <HelpSearchPage query={query} />;
}
