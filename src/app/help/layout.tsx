import React from 'react';
import { Metadata } from 'next';
import HelpLayout from '@/features/help/components/HelpLayout';

export const metadata: Metadata = {
  title: 'Help Center | ServiceHub Cordova',
  description: 'Official help center, user guides, and documentation for ServiceHub Cordova residents and service providers.',
};

export default function HelpRootLayout({ children }: { children: React.ReactNode }) {
  return <HelpLayout>{children}</HelpLayout>;
}
