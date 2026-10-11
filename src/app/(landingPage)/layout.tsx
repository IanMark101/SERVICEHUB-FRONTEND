import type { ReactNode } from 'react';
import LandingPage from '@/components/landing/LandingPage';
import JsonLd from '@/components/seo/JsonLd';
import { websiteSchema } from '@/lib/seo';

export default function LandingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd data={websiteSchema()} />
      {/* Keep one animated body outside the page's streaming boundary. */}
      <LandingPage />
      {children}
    </>
  );
}
