import React from 'react';
import HelpLayout from '@/features/help/components/HelpLayout';

export default function HelpRootLayout({ children }: { children: React.ReactNode }) {
  return <HelpLayout>{children}</HelpLayout>;
}
