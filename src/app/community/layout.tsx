import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Community Hub | ServiceHub',
  description: 'See official updates, newly published services, and recognized local providers across ServiceHub.',
};

export default function CommunityLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
