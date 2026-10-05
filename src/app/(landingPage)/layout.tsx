import type { ReactNode } from 'react';
import LandingPage from '@/components/landing/LandingPage';

export default function LandingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Keep one animated body outside the page's streaming boundary. */}
      <LandingPage />
      {children}
    </>
  );
}
