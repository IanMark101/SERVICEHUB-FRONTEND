import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Community Hub | ServiceHub Cordova',
  description: 'See official updates, newly published services, and recognized local providers across ServiceHub Cordova.',
};

export default function CommunityLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
