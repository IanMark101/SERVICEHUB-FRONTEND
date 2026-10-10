import React from 'react';
import { Metadata } from 'next';
import HelpHomePage from '@/features/help/pages/HelpHomePage';

export const metadata: Metadata = {
  title: 'Help Center & Documentation | ServiceHub',
  description: 'Learn how ServiceHub works: verification, Trust Scores, provider queues, bookings, and payments.',
};

export default function Page() {
  return <HelpHomePage />;
}
