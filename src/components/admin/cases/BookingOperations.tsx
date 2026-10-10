'use client';

import CaseSkeleton from './CaseSkeleton';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useApiCacheRefresh } from '@/hooks/useApiCacheRefresh';
import { useRefreshableLoad } from '@/hooks/useRefreshableLoad';
import { apiCancelAdminBooking, apiGetAdminBookingMessages, apiListAdminBookings, apiListAdminPaymentAttempts, apiListPaymentReconciliation, apiResolveBannedParticipantBooking, apiRetryPaymentReconciliation } from '@/api/admin.api';
import AdminPagination from '@/components/admin/AdminPagination';
import ReasonModal from '@/components/ui/ReasonModal';
import { useToast } from '@/components/ui/Toast';
import { getApiErrorMessage } from '@/lib/api/errors';
import { getSocket } from '@/lib/socket';
import { dateLabel, money, stateLabel } from './labels';
import type { CaseMessage } from './types';

interface Booking {
  id: string; status: string; paymentStatus: string; paymentMethod: string; agreedAmount: number | string; started: boolean;
  seeker: { id: string; name: string; moderationStatus: string }; provider: { id: string; name: string; moderationStatus: string };
  service?: { title: string } | null; offer?: { request: { title: string } } | null;
  queue?: { position: number; status: string } | null;
  resolutionOperation?: { requestedOutcome: string; status: string; lastError?: string | null } | null;
}
interface Attempt { id: string; amount: number | string; status: string; paymentMethod: string; providerIntentId?: string; failureReason?: string }
interface Reconciliation { id: string; amount: number | string; failureReason?: string }
type Action = { booking: Booking; kind: 'unstarted' | 'banned'; outcome: 'cancel_booking' | 'release_provider_and_complete' };

export default function BookingOperations({ userId }: { userId?: string }) {
  const { success, error: toastError } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [reconciliation, setReconciliation] = useState<Reconciliation[]>([]);
  const [page, setPage] = useState(1);
  const [attemptPage, setAttemptPage] = useState(1);
  const [reconciliationPage, setReconciliationPage] = useState(1);
  const [needsResolution, setNeedsResolution] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [attemptPagination, setAttemptPagination] = useState({ total: 0, totalPages: 1 });
  const [reconciliationPagination, setReconciliationPagination] = useState({ total: 0, totalPages: 1 });
  const [errors, setErrors] = useState<Record<string,string>>({});
  const { loading, beginLoad } = useRefreshableLoad(JSON.stringify([page, attemptPage, reconciliationPage, userId, needsResolution]));
  const [action, setAction] = useState<Action | null>(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [retrying, setRetrying] = useState<string | null>(null);
  const [messageBooking, setMessageBooking] = useState<string | null>(null);
  const [messages, setMessages] = useState<CaseMessage[]>([]);
  const [messageLoading, setMessageLoading] = useState(false);
  const [messageError, setMessageError] = useState('');
  const loadSequence = useRef(0);
  const invalidate = useCallback(() => { loadSequence.current++; }, []);
  const load = useCallback(async () => {
    const sequence = ++loadSequence.current;
    const request = beginLoad();
    const results = await Promise.allSettled([apiListAdminBookings({ page, limit: 10, userId, needsResolution }), apiListAdminPaymentAttempts({ page: attemptPage, limit: 10 }), apiListPaymentReconciliation({ page: reconciliationPage, limit: 10 })]);
    if (sequence !== loadSequence.current || !request.current()) return;
    const nextErrors: Record<string,string> = {};
    results.forEach((result,index) => {
      const key = ['bookings','attempts','reconciliation'][index];
      if (result.status === 'rejected') { nextErrors[key] = getApiErrorMessage(result.reason, `${key} could not be loaded. Try again.`); return; }
      if (index === 0) { setBookings(result.value.data || []); setPagination(result.value.pagination); if (page > Math.max(1,result.value.pagination.totalPages)) setPage(Math.max(1,result.value.pagination.totalPages)); }
      if (index === 1) { setAttempts(result.value.data || []); setAttemptPagination(result.value.pagination); }
      if (index === 2) { setReconciliation(result.value.data || []); setReconciliationPagination(result.value.pagination); if (reconciliationPage > Math.max(1,result.value.pagination.totalPages)) setReconciliationPage(Math.max(1,result.value.pagination.totalPages)); }
    });
    setErrors(nextErrors); request.finish(results.every(result => result.status === 'fulfilled'));
  }, [page,attemptPage,reconciliationPage,userId,needsResolution,beginLoad]);
  useApiCacheRefresh(['admin', 'bookings'], () => load(), !submitting);
  useEffect(() => { const timer = setTimeout(() => void load(), 0); return () => { clearTimeout(timer); invalidate(); }; }, [load, invalidate]);
  useEffect(() => { const socket = getSocket(); const refresh = () => { if (!submitting) void load(); }; socket?.on('ADMIN_MODERATION_CHANGED',refresh); return () => { socket?.off('ADMIN_MODERATION_CHANGED',refresh); }; }, [load,submitting]);
  async function submitAction() {
    if (!action || reason.trim().length < 3 || submitting) return;
    setSubmitting(true);
    try { if (action.kind === 'banned') await apiResolveBannedParticipantBooking(action.booking.id,action.outcome,reason.trim()); else await apiCancelAdminBooking(action.booking.id,reason.trim()); success('Booking decision recorded','Payment and queue effects were reconciled and audit logged.'); setAction(null); setReason(''); await load(); }
    catch (cause) { toastError('Booking decision failed',getApiErrorMessage(cause,'The decision could not be saved. Your reason is preserved.')); }
    finally { setSubmitting(false); }
  }
  async function retry(item: Reconciliation) {
    setRetrying(item.id);
    try { await apiRetryPaymentReconciliation(item.id); success('Reconciliation retried','The existing payment operation was resumed.'); await load(); }
    catch(cause) { toastError('Retry failed',getApiErrorMessage(cause,'Payment reconciliation could not be retried.')); }
    finally { setRetrying(null); }
  }
  async function inspectMessages(bookingId: string) {
    setMessageBooking(bookingId); setMessageLoading(true); setMessageError(''); setMessages([]);
    try { const response = await apiGetAdminBookingMessages(bookingId); setMessages(response.data?.messages || []); }
    catch(cause) { setMessageError(getApiErrorMessage(cause,'Booking messages could not be loaded.')); }
    finally { setMessageLoading(false); }
  }
  function begin(booking: Booking, kind: Action['kind'], outcome: Action['outcome']) { setAction({ booking,kind,outcome }); setReason(''); }
  function errorState(key: string) { return errors[key] ? <div className="case-error" role="alert">{errors[key]}<button className="case-button" onClick={() => void load()}>Retry</button></div> : null; }
  return <div>
    <p className="case-muted">Operational tools support reconciliation and bookings affected by account restrictions. Reports and escalations are resolved in their own case workrooms.</p>
    {userId && <p className="case-notice">Selected-user scope applies to bookings and cases. Payment reconciliation and payment attempts below are system-wide.</p>}
    <section className="case-operations-section"><div className="case-queue-heading"><h3>{userId ? 'Selected user’s bookings' : 'Booking operations'}</h3><label className="case-acknowledge"><input type="checkbox" checked={needsResolution} onChange={event => { setNeedsResolution(event.target.checked); setPage(1); }} /> Only active or unsettled bookings</label></div>{errorState('bookings') || (loading ? <CaseSkeleton variant="operations" /> : !bookings.length ? <p className="case-empty-small">No bookings match this view.</p> : <div className="case-operation-list">{bookings.map(booking => {
      const banned = booking.seeker.moderationStatus === 'BANNED' || booking.provider.moderationStatus === 'BANNED';
      const operation = booking.resolutionOperation;
      const retryable = operation && ['FAILED_RETRYABLE','PROCESSING'].includes(operation.status);
      return <div className="case-operation-row" key={booking.id}><div><h4>{booking.service?.title || booking.offer?.request.title || 'Service engagement'} / {money(booking.agreedAmount || 0)}</h4><p className="case-muted">{booking.seeker.name}{booking.seeker.moderationStatus === 'BANNED' ? ' (banned)' : ''} → {booking.provider.name}{booking.provider.moderationStatus === 'BANNED' ? ' (banned)' : ''}</p><p>{stateLabel(booking.status)} / {stateLabel(booking.paymentStatus)}</p><p className="case-muted">{booking.paymentMethod}{booking.queue ? ` / ${stateLabel(booking.queue.status)}, position ${booking.queue.position}` : ' / no paid queue'}</p>{retryable && <p className="case-danger-text">Decision needs review or retry: {operation.lastError || 'The prior decision is still processing.'}</p>}</div><div className="case-inline-actions"><button className="case-button" onClick={() => void inspectMessages(booking.id)}>Review messages</button>{!operation && !booking.started && ['PENDING_APPROVAL','WAITING','ACCEPTED'].includes(booking.status) && <button className="case-button" onClick={() => begin(booking,'unstarted','cancel_booking')}>Cancel booking</button>}{retryable && operation.requestedOutcome === 'cancel_booking' && <button className="case-button" onClick={() => begin(booking,banned ? 'banned' : 'unstarted','cancel_booking')}>Resume cancellation</button>}{banned && !operation && ['ONGOING','AWAITING_CONFIRMATION'].includes(booking.status) && <button className="case-button" onClick={() => begin(booking,'banned','cancel_booking')}>Cancel / refund</button>}{banned && ((booking.status === 'AWAITING_CONFIRMATION' && booking.paymentMethod !== 'On-site Cash' && !operation) || (retryable && operation.requestedOutcome === 'release_provider_and_complete')) && <button className="case-button" onClick={() => begin(booking,'banned','release_provider_and_complete')}>Complete booking</button>}</div></div>;
    })}</div>)}{!errors.bookings && !loading && <AdminPagination page={page} totalPages={pagination.totalPages} totalItems={pagination.total} pageSize={10} onPageChange={setPage} itemLabel="bookings" />}</section>
    {messageBooking && <section className="case-detail-section"><div className="case-inline-actions"><h3>Selected booking conversation</h3><button className="case-button" onClick={() => setMessageBooking(null)}>Close messages</button></div>{messageLoading ? <p className="case-loading">Loading messages…</p> : messageError ? <div className="case-error" role="alert">{messageError}<button className="case-button" onClick={() => void inspectMessages(messageBooking)}>Retry messages</button></div> : !messages.length ? <p className="case-empty-small">No messages in this booking.</p> : <ol className="case-messages">{messages.map(message => <li key={message.id}><div className="case-message-meta"><strong>{message.isSystem ? 'ServiceHub' : message.sender?.name || 'Booking participant'}</strong><time>{dateLabel(message.createdAt)}</time></div><p>{message.content}</p></li>)}</ol>}</section>}
    <section className="case-operations-section"><h3>Payment reconciliation</h3><p className="case-muted">Retry an existing failed payment operation; this does not start a new charge.</p>{errorState('reconciliation') || (loading ? <p className="case-loading">Loading reconciliation…</p> : !reconciliation.length ? <p className="case-empty-small">No payment reconciliation needs attention.</p> : <div className="case-operation-list">{reconciliation.map(item => <div className="case-operation-row" key={item.id}><div><h4>{money(item.amount)}</h4><p className="case-muted">{item.failureReason ? stateLabel(item.failureReason) : 'Payment reconciliation required'}</p><p className="case-id">Attempt {item.id}</p></div><button className="case-button" disabled={!!retrying} onClick={() => void retry(item)}>{retrying === item.id ? 'Retrying…' : 'Retry reconciliation'}</button></div>)}</div>)}{!loading && !errors.reconciliation && <AdminPagination page={reconciliationPage} totalPages={reconciliationPagination.totalPages} totalItems={reconciliationPagination.total} pageSize={10} onPageChange={setReconciliationPage} itemLabel="reconciliation attempts" />}</section>
    <details className="case-operations-section"><summary className="case-back">PayMongo Test Mode payment attempts</summary><p className="case-muted">Payment attempt states and safe reference IDs. These are test transactions.</p>{userId && <p className="case-notice">Payment attempts below are system-wide; the selected-user scope applies to booking operations.</p>}{errorState('attempts') || (loading ? <p className="case-loading">Loading payment attempts…</p> : !attempts.length ? <p className="case-empty-small">No payment attempts recorded.</p> : <div className="case-operation-list">{attempts.map(item => <div className="case-operation-row" key={item.id}><div><h4>{money(item.amount)} / {stateLabel(item.status)}</h4><p className="case-muted">{item.paymentMethod}{item.failureReason ? ` / ${stateLabel(item.failureReason)}` : ''}</p><p className="case-id">Attempt {item.id}{item.providerIntentId ? ` / intent ${item.providerIntentId}` : ''}</p></div></div>)}</div>)}{!loading && !errors.attempts && <AdminPagination page={attemptPage} totalPages={attemptPagination.totalPages} totalItems={attemptPagination.total} pageSize={10} onPageChange={setAttemptPage} itemLabel="payment attempts" />}</details>
    <ReasonModal isOpen={!!action} title={action?.outcome === 'release_provider_and_complete' ? 'Complete booking with a banned participant' : 'Cancel and reconcile booking'} description={action?.outcome === 'release_provider_and_complete' ? 'Confirm that the work was completed. The held online test payment will enter the provider ledger. The decision is audit logged and both participants are notified.' : 'This cancels the booking and removes it from the queue. Held online test payments are refunded; cash has no platform refund. Explain the evidence supporting cancellation.'} value={reason} onChange={setReason} onClose={() => { if (!submitting) setAction(null); }} onSubmit={submitAction} confirmText={action?.outcome === 'release_provider_and_complete' ? 'Complete booking' : 'Cancel booking'} variant="danger" isSubmitting={submitting} />
  </div>;
}
