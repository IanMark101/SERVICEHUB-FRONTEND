'use client';

import { useEffect, useState } from 'react';
import { ArrowUpRight, RefreshCw, ReceiptText } from 'lucide-react';
import Link from 'next/link';
import { apiGetPlatformEarnings, type EarningsFilters, type EarningsRecord, type PlatformEarnings } from '../../../api/earnings.api';
import { getApiErrorMessage } from '../../../lib/api/errors';
import FormSelect from '../../ui/FormSelect';
import AdminPagination from '../AdminPagination';
import EarningsTrend from './EarningsTrend';
import styles from './Earnings.module.css';

const money = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });
const date = new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'Asia/Manila' });
const statusLabels = { earned: 'Completed', held: 'Awaiting completion', pending: 'Awaiting payment', failed: 'Failed / expired', refunded: 'Refunded', review: 'Under review' };
const defaultFilters: EarningsFilters = { period: 'month', status: 'all' };

export default function EarningsView({ isDark, userId }: { isDark: boolean; userId?: string }) {
  const [draft, setDraft] = useState(defaultFilters);
  const [filters, setFilters] = useState(defaultFilters);
  const [filterError, setFilterError] = useState('');
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<{ key: string; data: PlatformEarnings | null; loading: boolean; error: string }>({ key: '', data: null, loading: true, error: '' });
  const key = JSON.stringify({ filters, page, userId });
  useEffect(() => {
    if (!userId) return;
    let active = true;
    const controller = new AbortController();
    queueMicrotask(() => { if (active) setResult(current => ({ key, data: current.key === key ? current.data : null, loading: true, error: '' })); });
    void apiGetPlatformEarnings(filters, page, controller.signal)
      .then(data => { if (active) setResult({ key, data, loading: false, error: '' }); })
      .catch(error => { if (active) setResult(current => ({ key, data: current.key === key ? current.data : null, loading: false, error: getApiErrorMessage(error, 'Earnings could not load. Try again.') })); });
    return () => { active = false; controller.abort(); };
  }, [filters, page, key, userId, revision]);
  const current = result.key === key;
  const data = current ? result.data : null;
  const loading = Boolean(userId && (!current || result.loading));
  const error = current ? result.error : '';
  const metric = (value?: number) => value === undefined ? <span className={styles.skeleton} aria-label="Loading amount" /> : money.format(value);
  function applyFilters(event: React.FormEvent) {
    event.preventDefault();
    if (draft.period === 'custom' && (!draft.from || !draft.to || draft.from > draft.to || Date.parse(draft.to) - Date.parse(draft.from) > 366 * 86_400_000)) {
      setFilterError('Choose a start and end date, up to one year apart.'); return;
    }
    setFilterError(''); setPage(1);
    setFilters(draft.period === 'custom' ? { ...draft } : { period: draft.period, status: draft.status });
  }
  return <div className={styles.page} data-theme={isDark ? 'dark' : 'light'} aria-busy={loading}>
    <header className={styles.header}>
      <div><h1>Platform earnings</h1><p>GCash commissions from confirmed, completed bookings.</p></div>
      <button type="button" className={styles.button} disabled={loading || !userId} onClick={() => setRevision(value => value + 1)}><RefreshCw size={16} aria-hidden="true" />{loading && data ? 'Refreshing' : 'Refresh'}</button>
    </header>
    <div className={styles.notice}><strong>10% platform fee</strong><span>Deducted from the agreed total, including travel. No extra customer charge.</span></div>
    {error && <div role="alert" className={styles.error}><span>{error}{data && ' Showing the last loaded records.'}</span><button type="button" className={styles.button} onClick={() => setRevision(value => value + 1)}>Try again</button></div>}
    {!userId ? <p role="status">Sign in as an administrator to view earnings.</p> : <>
      <section aria-label="All-time earnings summary" className={styles.metrics}>
        {[['All-time earnings', data?.summary.earnedTotal], ['Today', data?.summary.today], ['This week', data?.summary.week], ['This month', data?.summary.month]].map(([label, value]) => <div key={String(label)}><h2>{label}</h2><strong>{error && !data ? 'Unavailable' : metric(value as number | undefined)}</strong></div>)}
      </section>
      <form className={styles.filters} onSubmit={applyFilters} aria-label="Filter earnings">
        <label>Period<FormSelect tone="admin" value={draft.period} onChange={event => setDraft({ ...draft, period: event.target.value as EarningsFilters['period'] })}><option value="today">Today</option><option value="week">This week</option><option value="month">This month</option><option value="custom">Custom dates</option></FormSelect></label>
        <label>History status<FormSelect tone="admin" value={draft.status} onChange={event => setDraft({ ...draft, status: event.target.value as EarningsFilters['status'] })}><option value="all">All statuses</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</FormSelect></label>
        {draft.period === 'custom' && <><label>From<input type="date" value={draft.from ?? ''} max={draft.to} onChange={event => setDraft({ ...draft, from: event.target.value })} required /></label><label>To<input type="date" value={draft.to ?? ''} min={draft.from} onChange={event => setDraft({ ...draft, to: event.target.value })} required /></label></>}
        <button className={`${styles.button} ${styles.primary}`} type="submit" disabled={loading}>Apply filters</button>
        {filterError && <p role="alert" className={styles.filterError}>{filterError}</p>}
      </form>
      <section className={styles.analytics} aria-label="Selected period earnings">
        <div className={styles.trend}>
          <div className={styles.sectionHeader}><div><h2>Commission trend</h2><p>{data ? `${date.format(new Date(data.range.from + 'T00:00:00+08:00'))} - ${date.format(new Date(data.range.to + 'T00:00:00+08:00'))}` : 'Selected period'} · Philippine time</p></div><strong>{metric(data?.period.earnedFees)}</strong></div>
          {data ? <EarningsTrend points={data.trend} /> : <div className={styles.chartSkeleton} aria-label={error ? 'Chart unavailable' : 'Loading chart'} />}
        </div>
        <aside className={styles.periodSummary} aria-label="Payment overview">
          <h2>Payment overview</h2>
          <dl><div><dt>Transactions</dt><dd>{data?.period.transactions ?? 'Unavailable'}</dd></div><div><dt>Successful payments</dt><dd>{data?.period.paidTransactions ?? 'Unavailable'}</dd></div><div><dt>Average earned fee</dt><dd>{metric(data?.period.averageFee)}</dd></div><div><dt>Fees awaiting completion <small>All-time</small></dt><dd>{metric(data?.summary.pendingFees)}</dd></div></dl>
          <p>Fees become earnings after completion. Refunds are excluded. Gateway charges are not deducted from these totals.</p>
        </aside>
      </section>
      <section className={styles.history} aria-label="GCash payment history">
        <div className={styles.sectionHeader}><div><h2>Payment history</h2><p>GCash only. Historical payments keep their original fee rate.</p></div><span>{data ? `${data.pagination.total} records` : ''}</span></div>
        {loading && !data ? <div role="status" className={styles.loading}><span className={styles.skeleton} /><span className={styles.skeleton} /><span className={styles.skeleton} /><span className={styles.srOnly}>Loading payment records</span></div>
          : !data ? <p className={styles.empty}>Payment records are unavailable. Try refreshing.</p>
          : !data.items.length ? <div className={styles.empty}><ReceiptText aria-hidden="true" size={28} /><h3>No matching payments</h3><p>New GCash payments will appear here. Try another period or status.</p></div>
          : <div className={styles.tableWrap}><table><caption className={styles.srOnly}>Payment amounts, platform fees and provider earnings</caption><thead><tr><th>Payment / date</th><th>People / service</th><th>Agreed total</th><th>Platform fee</th><th>Provider share</th><th>Status</th></tr></thead><tbody>{data.items.map(record => <PaymentRow key={record.id} record={record} />)}</tbody></table></div>}
        {data && <AdminPagination {...data.pagination} totalItems={data.pagination.total} pageSize={data.pagination.limit} onPageChange={setPage} itemLabel="payments" />}
      </section>
      <p className={styles.footnote}>Test payments are labeled in the history. These figures are accounting records, not a withdrawable balance or confirmed provider payouts.</p>
    </>}
  </div>;
}

function PaymentRow({ record }: { record: EarningsRecord }) {
  return <tr>
    <td data-label="Payment"><details className={styles.details}><summary><strong>{record.id.slice(-10).toUpperCase()}</strong><span>{date.format(new Date(record.recordedAt))}</span></summary><dl><dt>Transaction ID</dt><dd>{record.id}</dd><dt>Gateway reference</dt><dd>{record.reference || 'Not assigned'}</dd><dt>Payment confirmed</dt><dd>{record.paidAt ? date.format(new Date(record.paidAt)) : 'Not confirmed'}</dd>{record.bookingId && <><dt>Booking</dt><dd><Link href={'/admin/reports?booking=' + encodeURIComponent(record.bookingId)}>Booking cases <ArrowUpRight size={12} aria-hidden="true" /></Link></dd></>}</dl></details>{record.isTestMode && <span className={styles.testBadge}>Test payment</span>}</td>
    <td data-label="People / service"><strong className={styles.service}>{record.serviceTitle}</strong><span>{record.customerName}<small>Customer</small></span><span>{record.providerName}<small>Provider</small></span></td>
    <td data-label="Agreed total" className={styles.amount}>{money.format(record.amount)}</td>
    <td data-label="Platform fee" className={styles.amount}><strong>{money.format(record.platformFeeAmount)}</strong><span>{record.commissionRateBps / 100}%{record.status === 'refunded' ? ' · Reversed' : record.status !== 'earned' ? ' · Not earned' : ''}</span></td>
    <td data-label="Provider share" className={styles.amount}>{money.format(record.status === 'refunded' ? 0 : record.providerNetAmount)}</td>
    <td data-label="Status"><span className={styles.status} data-status={record.status}>{statusLabels[record.status]}</span></td>
  </tr>;
}
