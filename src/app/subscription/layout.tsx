import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Provider Subscription', robots: { index: false, follow: false } };
export default function SubscriptionLayout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
