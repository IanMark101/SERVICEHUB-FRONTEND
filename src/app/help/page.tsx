import React from 'react';
import HelpHomePage from '@/features/help/pages/HelpHomePage';
import { publicPageMetadata } from '@/lib/seo';

export const metadata = publicPageMetadata({
  title: 'Help Center & Guides',
  description: 'Learn how ServiceHub works: verification, Trust Scores, provider queues, bookings, and payments.',
  path: '/help',
});

export default function Page() {
  return <HelpHomePage />;
}
