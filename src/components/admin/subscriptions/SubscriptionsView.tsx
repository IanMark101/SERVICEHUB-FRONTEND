'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { RefreshCw } from 'lucide-react';
import { getAdminSubscriptions, type AdminSubscriptions } from '../../../api/subscriptions.api';
import { getApiErrorMessage } from '../../../lib/api/errors';
import AdminPagination from '../AdminPagination';
import { subscriptionPaymentLabels } from '../../../lib/subscriptions';
import styles from '../../provider/subscription/Subscription.module.css';

const money = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });
const date = (value: string | null) => value ? new Date(value).toLocaleDateString('en-PH', { dateStyle: 'medium', timeZone: 'Asia/Manila' }) : '—';

export default function SubscriptionsView({ userId, isDark }: { userId?: string; isDark: boolean }) {
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<{ key: string; data: AdminSubscriptions | null; error: string }>({ key: '', data: null, error: '' });
  const key = `${userId}:${page}:${revision}`;
  useEffect(() => {
    if (!userId) return;
    const controller = new AbortController();
    void getAdminSubscriptions(page, controller.signal).then(data => { if (!controller.signal.aborted) setState({ key, data, error: '' }); })
      .catch(error => { if (!controller.signal.aborted) setState({ key, data: null, error: getApiErrorMessage(error, 'Subscriptions could not load. Please try again.') }); });
    return () => controller.abort();
  }, [page, userId, key]);
  const data = state.key === key ? state.data : null;
  const error = state.key === key ? state.error : '';
  return <div className={styles.page} data-theme={isDark ? 'dark' : 'light'}>
    <header className={styles.header}><div><h1>Provider subscriptions</h1><p className={styles.muted}>Pro memberships and subscription payments.</p></div>
      <button className={styles.button} type="button" onClick={() => setRevision(value => value + 1)} disabled={!data && !error}><RefreshCw size={16} aria-hidden="true" />Refresh</button></header>
    {error && <div className={styles.error} role="alert">{error}<button type="button" className={styles.button} onClick={() => setRevision(value => value + 1)}>Try again</button></div>}
    {!data && !error ? <p role="status">Loading subscriptions…</p> : data && <>
      {data.summary.isTestMode && <p className={styles.notice}><strong>Test Mode.</strong> Subscription totals include simulated payments. No real money is transferred.</p>}
      <section className={styles.summaryMetrics} aria-label="Subscription overview">
        <div><span>Active Pro providers</span><strong>{data.summary.activeProProviders}</strong></div>
        <div><span>{data.summary.isTestMode ? 'Test subscription total' : 'Subscription revenue'}</span><strong>{money.format(data.summary.isTestMode ? data.summary.testSubscriptionTotal : data.summary.subscriptionRevenue)}</strong></div>
        <div><span>Expired Pro subscriptions</span><strong>{data.summary.expiredProSubscriptions}</strong></div>
      </section>
      <section className={styles.history}><h2>Subscription payments</h2>
        {data.payments.length === 0 ? <p className={styles.muted}>No subscription payments yet.</p> : <div className={styles.tableWrap}><table className={styles.table}>
          <caption className="sr-only">Provider subscription payments, separate from booking commissions</caption>
          <thead><tr><th>Provider</th><th>Plan</th><th>Amount</th><th>Status</th><th>Started</th><th>Expires</th></tr></thead>
          <tbody>{data.payments.map(payment => <tr key={payment.id}><td><Link href={`/admin/users?userId=${encodeURIComponent(payment.provider.id)}`}>{payment.provider.name}</Link><small>{payment.paymentReference || payment.id}</small></td><td>Pro<small>{payment.isTestMode ? 'Test Mode' : 'GCash'}</small></td><td>{money.format(payment.amount)}</td><td>{subscriptionPaymentLabels[payment.paymentStatus]}</td><td>{date(payment.subscriptionStartedAt)}</td><td>{date(payment.subscriptionExpiresAt)}</td></tr>)}</tbody>
        </table></div>}
      </section>
      <AdminPagination page={data.pagination.page} totalPages={data.pagination.totalPages} totalItems={data.pagination.total} pageSize={data.pagination.limit} onPageChange={setPage} itemLabel="payments" />
    </>}
  </div>;
}
