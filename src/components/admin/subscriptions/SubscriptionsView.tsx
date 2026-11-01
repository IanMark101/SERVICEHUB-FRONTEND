'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { RefreshCw } from 'lucide-react';
import { getAdminSubscriptions, type AdminSubscriptions } from '../../../api/subscriptions.api';
import { getApiErrorMessage } from '../../../lib/api/errors';
import AdminPagination from '../AdminPagination';
import { subscriptionPaymentLabels } from '../../../lib/subscriptions';
import styles from '../../provider/subscription/Subscription.module.css';
import { planName } from '../../../lib/providerPlans';

const money = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });
const date = (value: string | null) => value ? new Date(value).toLocaleDateString('en-PH', { dateStyle: 'medium', timeZone: 'Asia/Manila' }) : 'Not activated';

export default function SubscriptionsView({ userId, isDark }: { userId?: string; isDark: boolean }) {
  const [page, setPage] = useState(1);
  const [view, setView] = useState<'memberships' | 'payments'>('memberships');
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
  const pagination = data ? view === 'memberships' ? data.membershipsPagination : data.pagination : null;
  return <div className={styles.page} data-theme={isDark ? 'dark' : 'light'}>
    <header className={styles.header}><div><h1>Provider subscriptions</h1><p className={styles.muted}>Free, Basic and Pro provider memberships.</p></div>
      <button className={styles.button} type="button" onClick={() => setRevision(value => value + 1)} disabled={!data && !error}><RefreshCw size={16} aria-hidden="true" />Refresh</button></header>
    {error && <div className={styles.error} role="alert">{error}<button type="button" className={styles.button} onClick={() => setRevision(value => value + 1)}>Try again</button></div>}
    {!data && !error ? <p role="status">Loading subscriptions…</p> : data && <>
      {data.summary.isTestMode && <p className={styles.notice}><strong>Test Mode.</strong> Simulated payments are listed separately. No real money is transferred.</p>}
      <section className={styles.summaryMetrics} aria-label="Membership overview">
        <div><span>Active Free</span><strong>{data.summary.activeFreeProviders}</strong></div>
        <div><span>Active Basic</span><strong>{data.summary.activeBasicProviders}</strong></div>
        <div><span>Active Pro</span><strong>{data.summary.activeProProviders}</strong></div>
        <div><span>Membership revenue</span><strong>{money.format(data.summary.subscriptionRevenue)}</strong></div>
      </section>
      <p className={styles.muted}>Test payments: {money.format(data.summary.testSubscriptionTotal)}. Test amounts are excluded from membership revenue.</p>
      <div className={styles.actions} role="group" aria-label="Subscription records">
        {(['memberships', 'payments'] as const).map(tab => <button type="button" key={tab} aria-pressed={view === tab} className={`${styles.button} ${view === tab ? styles.primary : ''}`} onClick={() => { setView(tab); setPage(1); }}>{tab === 'memberships' ? 'Memberships' : 'Payments'}</button>)}
      </div>
      <section className={styles.history}><h2>{view === 'memberships' ? 'Provider memberships' : 'Membership payments'}</h2>
        {view === 'memberships' ? data.memberships.length === 0 ? <p className={styles.muted}>No provider memberships yet.</p> : <div className={styles.tableWrap}><table className={styles.table}><caption className="sr-only">Provider plans, status, expiry and GCash fees</caption><thead><tr><th>Provider</th><th>Plan</th><th>Status</th><th>Started</th><th>Expires</th><th>GCash fee</th></tr></thead><tbody>{data.memberships.map(member => <tr key={member.id}><td><Link href={`/admin/users?userId=${encodeURIComponent(member.id)}`}>{member.name}</Link></td><td>{planName(member.plan)}<small>{member.plan === 'FREE' ? '30 days' : `${money.format(member.monthlyPrice)}/month`}</small></td><td>{!member.marketplaceAccess ? 'Expired' : member.status === 'CANCELLED' ? 'Cancelled, active until expiry' : 'Active'}</td><td>{date(member.startsAt)}</td><td>{date(member.expiresAt)}</td><td>{member.commissionRateBps / 100}%</td></tr>)}</tbody></table></div>
          : data.payments.length === 0 ? <p className={styles.muted}>No membership payments yet.</p> : <div className={styles.tableWrap}><table className={styles.table}>
          <caption className="sr-only">Provider membership payments, separate from booking commissions</caption>
          <thead><tr><th>Provider</th><th>Plan</th><th>Amount</th><th>Status</th><th>Started</th><th>Expires</th></tr></thead>
          <tbody>{data.payments.map(payment => <tr key={payment.id}><td><Link href={`/admin/users?userId=${encodeURIComponent(payment.provider.id)}`}>{payment.provider.name}</Link><small>{payment.paymentReference || payment.id}</small></td><td>{planName(payment.plan)}<small>{payment.isTestMode ? 'Test Mode' : 'GCash'}</small></td><td>{money.format(payment.amount)}</td><td>{subscriptionPaymentLabels[payment.paymentStatus]}</td><td>{date(payment.subscriptionStartedAt)}</td><td>{date(payment.subscriptionExpiresAt)}</td></tr>)}</tbody>
        </table></div>}
      </section>
      {pagination && <AdminPagination page={pagination.page} totalPages={pagination.totalPages} totalItems={pagination.total} pageSize={pagination.limit} onPageChange={setPage} itemLabel={view} />}
    </>}
  </div>;
}
