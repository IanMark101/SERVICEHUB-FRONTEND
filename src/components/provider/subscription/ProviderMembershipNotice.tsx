'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSubscription, startFreeProviderPlan, type ProviderSubscription } from '../../../api/subscriptions.api';
import styles from './Subscription.module.css';

/** Entering the Provider workspace starts one Free period, never a paid checkout. */
export default function ProviderMembershipNotice({ userId, isDark }: { userId?: string; isDark: boolean }) {
  const [state, setState] = useState<{ owner?: string; data: ProviderSubscription | null; failed: boolean }>({ data: null, failed: false });
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (!userId) return;
    const owner = new AbortController();
    void getSubscription(owner.signal).then(async data => {
      const membership = data.trialStarted ? data : await startFreeProviderPlan(owner.signal);
      if (!owner.signal.aborted) setState({ owner: userId, data: membership, failed: false });
    }).catch(() => { if (!owner.signal.aborted) setState({ owner: userId, data: null, failed: true }); });
    return () => owner.abort();
  }, [userId, revision]);
  if (state.owner !== userId) return null;
  if (state.failed) return <div className={styles.page} data-theme={isDark ? 'dark' : 'light'}><div className={styles.workspaceNotice} role="status"><span>Membership details could not load.</span><button className={styles.textButton} onClick={() => setRevision(v => v + 1)}>Retry</button></div></div>;
  const data = state.data;
  if (!data || (data.marketplaceAccess && data.daysRemaining > 7)) return null;
  return <div className={styles.page} data-theme={isDark ? 'dark' : 'light'}><aside className={styles.workspaceNotice} aria-label="Provider membership reminder"><div>
    <strong>{data.marketplaceAccess ? `Your ${data.plan === 'FREE' ? 'Free plan' : 'membership'} ends ${data.daysRemaining === 1 ? 'tomorrow' : `in ${data.daysRemaining} days`}` : 'Your provider membership has ended'}</strong>
    <p>{data.marketplaceAccess ? 'Choose your next plan. No automatic charges.' : 'Existing bookings remain available. Renew to accept new customers.'}</p>
  </div><Link className={`${styles.button} ${styles.primary}`} href="/subscription">{data.marketplaceAccess ? 'View plans' : 'Renew membership'}</Link></aside></div>;
}
