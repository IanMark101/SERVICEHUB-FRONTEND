import React from 'react';
import { Metadata } from 'next';
import HelpHomePage from '@/features/help/pages/HelpHomePage';

export const metadata: Metadata = {
  title: 'Help Center & Documentation | ServiceHub Cordova',
  description: 'Learn how ServiceHub Cordova works: verification, Trust Scores, service queues, bookings, and payments.',
};

export default function Page() {
  return <HelpHomePage />;
}
