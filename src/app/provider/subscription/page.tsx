import { redirect } from 'next/navigation';
export default async function LegacySubscriptionPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (typeof params.payment_intent_id === 'string') query.set('payment_intent_id', params.payment_intent_id);
  redirect(`/subscription${query.size ? `?${query}` : ''}`);
}
