'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useApiCacheRefresh } from '@/hooks/useApiCacheRefresh';
import { invalidateApiCache } from '@/lib/api/responseCache';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowClockwise, Scales } from '@phosphor-icons/react';
import { apiGetModerationCase, apiListModerationCases, apiResolveCompletionEscalation, apiResolveEscalatedCancellation, apiResolveReport } from '@/api/admin.api';
import AdminPagination from '@/components/admin/AdminPagination';
import ReportWorkflowNav from '@/components/admin/ReportWorkflowNav';
import { ReviewQueueLoading } from '@/components/admin/ReviewQueue';
import BookingCaseTable from '@/components/admin/cases/BookingCaseTable';
import CaseWorkroom from '@/components/admin/cases/CaseWorkroom';
import CaseSkeleton from '@/components/admin/cases/CaseSkeleton';
import CaseFilterBar from '@/components/admin/cases/CaseFilterBar';
import BookingOperations from '@/components/admin/cases/BookingOperations';
import { CONCERNS } from '@/components/admin/cases/labels';
import type { CaseFilters, CaseSummary, ModerationCase, Penalty } from '@/components/admin/cases/types';
import { getApiErrorMessage } from '@/lib/api/errors';
import { getSocket } from '@/lib/socket';
import { useToast } from '@/components/ui/Toast';
import './reports.css';

const PAGE_SIZE = 12;
const DEFAULT_FILTERS: CaseFilters = { view: 'active', sort: 'attention' };
export default function AdminReportsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId') || undefined;
  const bookingId = searchParams.get('booking') || undefined;
  const caseKey = searchParams.get('case') || (searchParams.get('report') ? `report:${searchParams.get('report')}` : null);
  const { success } = useToast();
  const [filters, setFilters] = useState<CaseFilters>({ ...DEFAULT_FILTERS, ...(bookingId ? { view: 'all' as const } : {}) });
  const [search, setSearch] = useState('');
  const [operations, setOperations] = useState(false);
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<ModerationCase[]>([]);
  const [summary, setSummary] = useState<CaseSummary | null>(null);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [detail, setDetail] = useState<ModerationCase | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [decisionError, setDecisionError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const listSequence = useRef(0);
  const detailSequence = useRef(0);
  const invalidateList = useCallback(() => { listSequence.current++; }, []);
  const invalidateDetail = useCallback(() => { detailSequence.current++; }, []);

  function changeFilters(next: Partial<CaseFilters>) { setFilters(current => ({ ...current, ...next })); setPage(1); }
  function concernSelected(key: string) {
    if (key === 'CANCELLATION_REVIEW') return filters.type === 'CANCELLATION_ESCALATION' && !filters.concern;
    if (key === 'COMPLETION_REVIEW') return filters.type === 'COMPLETION_ESCALATION' && !filters.concern;
    return filters.concern === key;
  }
  function chooseConcern(key: string) {
    const escalation = key === 'CANCELLATION_REVIEW' ? 'CANCELLATION_ESCALATION' : key === 'COMPLETION_REVIEW' ? 'COMPLETION_ESCALATION' : undefined;
    changeFilters(escalation
      ? { type: concernSelected(key) ? undefined : escalation, concern: undefined }
      : { concern: concernSelected(key) ? undefined : key, type: undefined });
  }
  function clearFilters() { setSearch(''); setFilters({ ...DEFAULT_FILTERS, view: filters.view, sort: filters.view === 'history' ? 'newest' : 'attention' }); setPage(1); }
  function changeView(view: CaseFilters['view']) {
    setOperations(false);
    changeFilters({ view, status: undefined, sort: view === 'history' ? 'newest' : 'attention' });
  }
  function navigateCase(key: string | null) {
    const query = new URLSearchParams(searchParams.toString());
    query.delete('report');
    if (key) query.set('case', key); else query.delete('case');
    const url = `/admin/reports${query.size ? `?${query}` : ''}`;
    if (key) router.push(url, { scroll: false }); else router.replace(url, { scroll: false });
  }
  const loadCases = useCallback(async () => {
    const sequence = ++listSequence.current;
    setLoading(true); setLoadError('');
    try {
      const response = await apiListModerationCases({ ...filters, page, limit: PAGE_SIZE, userId, bookingId });
      if (sequence !== listSequence.current) return;
      setItems(response.data || []); setSummary(response.summary);
      setPagination({ total: response.pagination.total, totalPages: Math.max(1, response.pagination.totalPages) });
      if (page > Math.max(1, response.pagination.totalPages)) setPage(Math.max(1, response.pagination.totalPages));
    } catch (cause) { if (sequence === listSequence.current) setLoadError(getApiErrorMessage(cause, 'Cases could not be loaded. Try again.')); }
    finally { if (sequence === listSequence.current) setLoading(false); }
  }, [filters, page, userId, bookingId]);
  const loadDetail = useCallback(async (startReview = false) => {
    if (!caseKey) return;
    const [source, id] = caseKey.split(':');
    if (!['report', 'completion'].includes(source) || !id) { setDetailError('This case link is invalid. Return to the queue.'); return; }
    const sequence = ++detailSequence.current;
    setDetailLoading(true); setDetailError('');
    try { const response = await apiGetModerationCase(source, id, startReview); if (sequence === detailSequence.current) setDetail(response.data); }
    catch (cause) { if (sequence === detailSequence.current) setDetailError(getApiErrorMessage(cause, 'The case could not be opened. Try again.')); }
    finally { if (sequence === detailSequence.current) setDetailLoading(false); }
  }, [caseKey]);
  useApiCacheRefresh(['admin'], () => loadCases(), !caseKey && !submitting);
  useEffect(() => { const timer = setTimeout(() => { setFilters(current => ({ ...current, search: search.trim() || undefined })); setPage(1); }, 300); return () => clearTimeout(timer); }, [search]);
  useEffect(() => { const timer = setTimeout(() => void loadCases(), 0); return () => { clearTimeout(timer); invalidateList(); }; }, [loadCases, invalidateList]);
  useEffect(() => { const timer = setTimeout(() => { setDetail(null); setDecisionError(''); if (caseKey) void loadDetail(true); }, 0); return () => { clearTimeout(timer); invalidateDetail(); }; }, [caseKey, loadDetail, invalidateDetail]);
  useEffect(() => {
    const socket = getSocket();
    const refresh = () => { if (!submitting) { void loadCases(); if (caseKey) void loadDetail(); } };
    socket?.on('ADMIN_MODERATION_CHANGED', refresh);
    return () => { socket?.off('ADMIN_MODERATION_CHANGED', refresh); };
  }, [loadCases, loadDetail, caseKey, submitting]);
  async function resolve(outcome: string, penalty: Penalty, notes: string, fault: 'none' | 'seeker' | 'provider' = 'none') {
    if (!detail || submitting) return;
    setSubmitting(true); setDecisionError('');
    let decisionSaved = false;
    invalidateDetail();
    try {
      if (detail.source === 'completion') await apiResolveCompletionEscalation(detail.id, outcome as 'keep_awaiting' | 'refund_seeker' | 'release_provider_and_complete', notes);
      else if (detail.type === 'CANCELLATION_ESCALATION') {
        if (!detail.cancellation) throw new Error('This case has no linked cancellation request.');
        await apiResolveEscalatedCancellation(detail.cancellation.id, outcome === 'approve_cancellation', notes, fault);
      } else await apiResolveReport(detail.id, outcome as 'dismiss' | 'resolve_safety' | 'cancel_booking' | 'release_provider_and_complete', penalty, notes);
      decisionSaved = true;
      invalidateApiCache(['admin']);
      const updated = await apiGetModerationCase(detail.source, detail.id);
      setDetail(updated.data);
      if (['PENDING', 'UNDER_REVIEW'].includes(updated.data.status)) throw new Error('The booking action was processed, but the case is still open. Refresh the case and review its processing status before retrying.');
      success('Case closed', 'The recorded outcome is now available in Case history.');
      void loadCases();
    } catch (cause) { setDecisionError(decisionSaved ? `Decision submitted, but closure could not be confirmed. ${getApiErrorMessage(cause, 'Refresh the case before retrying.')}` : getApiErrorMessage(cause, 'The decision could not be saved. Your explanation is preserved.')); }
    finally { setSubmitting(false); }
  }

  if (caseKey) return <div className="case-workspace review-workspace"><ReportWorkflowNav current="booking" detail />{detailError ? <div className="case-empty" role="alert"><h2>Unable to open case</h2><p>{detailError}</p><div className="case-inline-actions"><button className="case-button" onClick={() => navigateCase(null)}>Back to cases</button><button className="case-button" onClick={() => void loadDetail()}>Retry</button></div></div> : detail && `${detail.source}:${detail.id}` === caseKey ? <CaseWorkroom key={caseKey} item={detail} onBack={() => navigateCase(null)} onResolve={resolve} submitting={submitting} error={decisionError} /> : <CaseSkeleton variant="detail" busy={detailLoading} />}</div>;
  const filtered = !!(filters.concern || filters.type || filters.status || filters.payment || filters.search);
  return <div className="case-workspace review-workspace">
    <header className="review-header"><h1>Disputes &amp; Reports</h1><button className="case-button" disabled={loading} onClick={() => { invalidateApiCache(['admin']); void loadCases(); }} aria-label="Refresh cases"><ArrowClockwise size={18} aria-hidden /> Refresh</button></header>
    <ReportWorkflowNav current="booking" />
    {(userId || bookingId) && <div className="case-notice">{userId ? 'Showing booking cases for the selected user.' : 'Showing cases for the selected booking.'}<Link href="/admin/reports" className="case-text-link">Show all cases</Link></div>}
    <section className="review-queue" aria-labelledby="case-queue-title">
      <div className="review-queue-head"><nav className="case-view-nav" aria-label="Moderation workspace"><button aria-current={!operations && filters.view === 'active' ? 'page' : undefined} onClick={() => changeView('active')}>Needs attention {summary && <span>{summary.active}</span>}</button><button aria-current={!operations && filters.view === 'history' ? 'page' : undefined} onClick={() => changeView('history')}>Case history {summary && <span>{summary.history}</span>}</button><button aria-current={operations ? 'page' : undefined} onClick={() => setOperations(true)}>Booking &amp; payment operations</button></nav>{!operations && !loading && !loadError && <span className="review-result-count">{pagination.total} {pagination.total === 1 ? 'case' : 'cases'}</span>}</div>
      <h2 id="case-queue-title" className="sr-only">{operations ? 'Booking and payment operations' : filters.view === 'history' ? 'Closed cases' : 'Cases needing a decision'}</h2>
      {operations ? <div className="review-operations"><BookingOperations userId={userId} /></div> : <>
        {summary && filters.view !== 'history' && Object.entries(summary.concerns).some(([,count]) => count > 0) && <div className="case-concern-counts" aria-label="Open concerns">{Object.entries(CONCERNS).filter(([key]) => summary.concerns[key] > 0).map(([key,label]) => <button key={key} className={concernSelected(key) ? 'is-selected' : ''} aria-pressed={concernSelected(key)} onClick={() => chooseConcern(key)}>{label}<strong>{summary.concerns[key]}</strong></button>)}</div>}
        <CaseFilterBar filters={filters} search={search} onSearch={setSearch} onChange={changeFilters} onClear={clearFilters} />
        {loadError ? <div className="case-empty" role="alert"><h3>Cases could not be loaded</h3><p>{loadError}</p><button className="case-button" onClick={() => { invalidateApiCache(['admin']); void loadCases(); }}>Retry loading</button></div> : loading ? <ReviewQueueLoading /> : !items.length ? <div className="case-empty"><Scales size={32} aria-hidden /><h3>{filtered ? 'No cases match these filters' : filters.view === 'history' ? 'No closed cases yet' : 'No cases need attention'}</h3>{filtered && <button className="case-button" onClick={clearFilters}>Clear filters</button>}</div> : <BookingCaseTable items={items} history={filters.view === 'history'} onOpen={navigateCase} />}
        {!loading && !loadError && <AdminPagination page={page} totalPages={pagination.totalPages} totalItems={pagination.total} pageSize={PAGE_SIZE} onPageChange={setPage} itemLabel="cases" />}
      </>}
    </section>
  </div>;
}
