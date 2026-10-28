'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiGetProviderAnalytics, type ProviderAnalytics as Analytics } from '../../api/transactions.api';
import styles from './subscription/Subscription.module.css';

const money = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });
export default function ProviderAnalytics({ userId, isDark }: { userId?: string; isDark: boolean }) {
  const [state, setState] = useState<{ owner?: string; data: Analytics | null; error: boolean }>({ data: null, error: false });
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (!userId) return;
    const owner = new AbortController();
    void apiGetProviderAnalytics(owner.signal).then(data => { if (!owner.signal.aborted) setState({ owner: userId, data, error: false }); })
      .catch(() => { if (!owner.signal.aborted) setState({ owner: userId, data: null, error: true }); });
    return () => owner.abort();
  }, [userId, revision]);
  if (!userId) return null;
  const data = state.owner === userId ? state.data : null;
  return <section className={styles.page} data-theme={isDark ? 'dark' : 'light'} aria-label="Provider analytics">
    {state.owner === userId && state.error ? <div className={styles.notice}><span>Analytics could not load.</span> <button className={styles.textButton} onClick={() => setRevision(v => v + 1)}>Retry</button></div>
      : !data ? <p className={styles.muted} role="status">Loading analytics...</p>
      : data.level === 'BASIC' ? <div className={styles.notice}><strong>Your booking history stays available.</strong><p>Basic and Pro add 30-day earnings insights and a daily breakdown.</p><Link className={styles.textButton} href="/subscription">View plans</Link></div>
      : data.summary && <div className={styles.notice}><h2>Last 30 days</h2><dl className={styles.membershipFacts}>
        <div><dt>Recorded earnings</dt><dd>{money.format(data.summary.earned)}</dd></div>
        <div><dt>Completed bookings</dt><dd>{data.summary.completed}</dd></div>
        <div><dt>Average per booking</dt><dd>{money.format(data.summary.averagePerBooking)}</dd></div>
        <div><dt>GCash platform fees</dt><dd>{money.format(data.summary.fees)}</dd></div>
      </dl><p className={styles.muted}>Confirmed completed work only. Recorded amounts may include Test Mode payments and do not represent an available payout.</p>
      {data.daily?.length ? <details><summary className={styles.textButton}>Daily breakdown</summary><div className={styles.tableWrap}><table className={styles.table}><caption className="sr-only">Daily recorded earnings in Philippine time</caption><thead><tr><th>Date</th><th>Completed</th><th>Earned</th></tr></thead><tbody>{data.daily.map(day => <tr key={day.day}><td>{day.day}</td><td>{day.completed}</td><td>{money.format(day.earned)}</td></tr>)}</tbody></table></div></details> : <p className={styles.muted}>No confirmed earnings in this period.</p>}
      </div>}
  </section>;
}
