'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowUpRight, ChevronLeft, ChevronRight, RefreshCw, ReceiptText, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useProviderPaymentRecords } from '../../hooks/useProviderPaymentRecords';
import type { PaymentRecordFilter, ProviderPaymentRecord } from '../../api/transactions.api';
import styles from './TransactionHistory.module.css';

const currency = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 });
const recordDate = new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium', timeZone: 'Asia/Manila' });
const outcomes = { completed: 'Completed', refunded: 'Refunded', cancelled: 'Cancelled / declined' };

export default function TransactionHistory({ currentUserId }: { currentUserId?: string }) {
  const { isDark } = useApp();
  const [date, setDate] = useState('');
  const [status, setStatus] = useState<PaymentRecordFilter>('all');
  const booking = useSearchParams().get('booking');
  const { data, loading, refreshing, error, refresh, goToPage } = useProviderPaymentRecords(currentUserId, date, status, booking);
  const summary = data?.summary;
  const pagination = data?.pagination;
  const filtered = Boolean(date || status !== 'all');

  const clearFilters = () => { setDate(''); setStatus('all'); };

  return (
    <div className={styles.page} data-theme={isDark ? 'dark' : 'light'}>
      <section className={styles.earnings} aria-labelledby="earnings-heading">
        <div className={styles.earningsLead}>
          <h1 id="earnings-heading">Recorded earnings</h1>
          <p>All-time total from your confirmed completed bookings.</p>
          <strong className={styles.total}>{summary ? currency.format(summary.earnedTotal) : '—'}</strong>
          <span className={styles.completionCount}>{summary ? summary.completedCount + ' completed ' + (summary.completedCount === 1 ? 'booking' : 'bookings') : error ? 'Records unavailable' : 'Waiting for payment records'}</span>
        </div>
        <dl className={styles.breakdown}>
          <div><dt>On-site cash</dt><dd>{summary ? currency.format(summary.cashTotal) : '—'}</dd><span>Confirmed as paid in person</span></div>
          <div><dt>GCash (Test Mode)</dt><dd>{summary ? currency.format(summary.onlineTotal) : '—'}</dd><span>Confirmed test-payment records</span></div>
        </dl>
        <p className={styles.recordNote}>For tracking only. These records are not an available balance or a payout.</p>
      </section>

      <section className={styles.history} aria-labelledby="history-heading" aria-busy={loading || refreshing}>
        <header className={styles.historyHeader}>
          <div><h2 id="history-heading">Previous bookings</h2><p>Completed, refunded and cancelled service bookings.</p></div>
          <button type="button" className={styles.refresh} onClick={refresh} disabled={loading || refreshing || !currentUserId}>
            <RefreshCw size={15} aria-hidden="true" />{refreshing ? 'Updating...' : 'Refresh'}
          </button>
        </header>
        <div className={styles.filters}>
          <label>Recorded date <input type="date" value={date} onChange={event => setDate(event.target.value)} /></label>
          <label>Booking status <select value={status} onChange={event => setStatus(event.target.value as PaymentRecordFilter)}>
            <option value="all">All records</option><option value="completed">Completed</option><option value="refunded">Refunded</option><option value="cancelled">Cancelled / declined</option>
          </select></label>
          {filtered && <button type="button" className={styles.clear} onClick={clearFilters}><X size={15} aria-hidden="true" />Clear filters</button>}
          <span className={styles.filterHint}>Dates use Philippine time. Filters do not change the all-time total.</span>
        </div>

        {error && <div role="alert" className={styles.error}><span>{data ? 'Your last loaded records are still shown. ' : ''}{error}</span><button type="button" onClick={refresh} disabled={refreshing}>Try again</button></div>}
        {booking && data && !data.linkedRecordFound && <p className={styles.linkNotice}>The linked booking is not in these results. Clear filters or check Activity for ongoing work.</p>}

        {loading ? <div role="status" className={styles.empty}><ReceiptText size={28} aria-hidden="true" /><h3>Loading payment records</h3><p>Getting your booking history and recorded earnings.</p></div>
          : !currentUserId ? <div className={styles.empty}><h3>Sign in to view your records</h3></div>
          : data && data.items.length === 0 ? <div className={styles.empty}><ReceiptText size={28} aria-hidden="true" /><h3>{filtered ? 'No records match these filters' : 'No previous bookings yet'}</h3><p>{filtered ? 'Choose another date or status, or clear your filters.' : 'Confirmed completions and cancelled bookings will appear here. Ongoing work stays in Activity.'}</p>{filtered && <button type="button" className={styles.clear} onClick={clearFilters}>Show all records</button>}</div>
          : data && <div className={styles.tableWrap}><table className={styles.table}>
            <caption className={styles.srOnly}>Your previous provider service bookings and recorded earnings</caption>
            <thead><tr><th scope="col">Service / seeker</th><th scope="col">Recorded date</th><th scope="col">Method / status</th><th scope="col" className={styles.amountHeader}>Earned amount</th><th scope="col"><span className={styles.srOnly}>Booking details</span></th></tr></thead>
            <tbody>{data.items.map(record => <RecordRow key={record.id} record={record} linked={record.bookingId === booking || record.id === booking} />)}</tbody>
          </table></div>}

        {pagination && pagination.total > 0 && <footer className={styles.pagination}>
          <p>Showing <strong>{(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)}</strong> of <strong>{pagination.total}</strong> records</p>
          <nav aria-label="Payment records pages"><button type="button" onClick={() => goToPage(pagination.page - 1)} disabled={pagination.page === 1 || refreshing} aria-label="Previous page"><ChevronLeft size={17} aria-hidden="true" /></button><span>Page {pagination.page} of {pagination.totalPages}</span><button type="button" onClick={() => goToPage(pagination.page + 1)} disabled={pagination.page === pagination.totalPages || refreshing} aria-label="Next page"><ChevronRight size={17} aria-hidden="true" /></button></nav>
        </footer>}
      </section>
    </div>
  );
}

function RecordRow({ record, linked }: { record: ProviderPaymentRecord; linked: boolean }) {
  const isEarned = record.earnedAmount > 0;
  const cash = record.paymentMethod === 'On-site Cash';
  return <tr className={linked ? styles.linked : undefined}>
    <td data-label="Service / seeker" className={styles.serviceCell}><strong>{record.serviceTitle}</strong><span>{record.seekerName}</span>{linked && <span className={styles.linkedLabel}>Linked booking</span>}</td>
    <td data-label="Recorded date"><time dateTime={record.recordedAt}>{recordDate.format(new Date(record.recordedAt))}</time></td>
    <td data-label="Method / status"><div className={styles.method}>{cash ? 'On-site cash' : 'GCash (Test Mode)'}</div><span className={styles.status} data-outcome={record.outcome}>{outcomes[record.outcome]}</span></td>
    <td data-label="Earned amount" className={styles.amount} data-earned={isEarned}><strong>{currency.format(record.earnedAmount)}</strong>{!isEarned && <span>{record.outcome === 'refunded' ? currency.format(record.amount) + ' returned to seeker' : record.outcome === 'cancelled' ? 'No earnings recorded' : 'Payment not confirmed'}</span>}</td>
    <td className={styles.detailsCell}>{record.bookingId ? <Link href={'/provider/provider-activity?tab=' + (record.outcome === 'completed' ? 'completed' : 'canceled') + '&booking=' + encodeURIComponent(record.bookingId)} className={styles.details} aria-label={'View booking: ' + record.serviceTitle}>View booking <ArrowUpRight size={15} aria-hidden="true" /></Link> : <span className={styles.archived}>Archived record</span>}</td>
  </tr>;
}
