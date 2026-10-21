'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSubscription, type ProviderSubscription } from '../../../api/subscriptions.api';
import styles from './Subscription.module.css';

export default function PlanSummary({ userId }: { userId?: string }) {
  const [state, setState] = useState<{ id?: string; data: ProviderSubscription | null; error: boolean }>({ data: null, error: false });
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (!userId) return;
    const controller = new AbortController();
    void getSubscription(controller.signal).then(data => { if (!controller.signal.aborted) setState({ id: userId, data, error: false }); })
      .catch(() => { if (!controller.signal.aborted) setState({ id: userId, data: null, error: true }); });
    return () => controller.abort();
  }, [userId, revision]);
  if (!userId) return null;
  const data = state.id === userId ? state.data : null;
  return <aside className={styles.planSummary} aria-label="Your provider plan">
    {data ? <><div><span>Current plan</span><strong>{data.plan === 'PRO' ? 'Pro' : 'Free'}</strong></div>
      <div><span>GCash fee</span><strong>{data.commissionRateBps / 100}%</strong></div>
      <div><span>Active listings</span><strong>{data.activeListings}{data.activeListingLimit === null ? ' · Unlimited' : ` / ${data.activeListingLimit}`}</strong></div>
      <Link href="/subscription">{data.plan === 'PRO' ? 'Manage subscription' : 'Upgrade to Pro'}</Link></>
      : state.error && state.id === userId ? <><span>Plan details couldn’t load.</span><button type="button" onClick={() => setRevision(value => value + 1)}>Retry</button></> : <span role="status">Loading your plan…</span>}
  </aside>;
}
