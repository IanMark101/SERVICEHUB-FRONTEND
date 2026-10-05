'use client';

import FormSelect from '../../ui/FormSelect';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useApiCacheRefresh } from '@/hooks/useApiCacheRefresh';
import { invalidateApiCache } from '@/lib/api/responseCache';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, RefreshCw, Search, ShieldCheck } from 'lucide-react';
import { apiGetContentCases, apiGetContentCase, apiGetMarketplaceContent, apiGetMarketplaceItem, type ContentCase, type ContentCaseDetail, type ContentItem, type ContentType } from '@/api/contentWorkspace.api';
import { getApiErrorMessage } from '@/lib/api/errors';
import { getSocket } from '@/lib/socket';
import { useToast } from '@/components/ui/Toast';
import AdminPagination from '../AdminPagination';
import ReportWorkflowNav from '../ReportWorkflowNav';
import ContentCaseWorkroom, { CONTENT_DECISIONS, CONTENT_PENALTIES } from './ContentCaseWorkroom';
import ContentInspector from './ContentInspector';
import { contentDate, contentTypeLabel } from './ContentFacts';
import './content-workspace.css';

type View = 'review' | 'content' | 'history';
const views: { id: View; label: string }[] = [{ id: 'review', label: 'Needs review' }, { id: 'content', label: 'All content' }, { id: 'history', label: 'History' }];
const pageSize = 10;

export default function ContentWorkspace() {
  const router = useRouter();
  const params = useSearchParams();
  const view: View = params.get('view') === 'content' ? 'content' : params.get('view') === 'history' ? 'history' : 'review';
  const type = ['SERVICE_LISTING', 'SERVICE_REQUEST'].includes(params.get('type') || '') ? params.get('type') as ContentType : undefined;
  const caseType = ['REPORT', 'APPEAL'].includes(params.get('kind') || '') ? params.get('kind') as 'REPORT' | 'APPEAL' : undefined;
  const caseId = params.get('caseId');
  const contentId = params.get('contentId');
  const rawPage = Number(params.get('page') || 1);
  const page = Number.isInteger(rawPage) && rawPage > 0 && rawPage <= 10000 ? rawPage : 1;
  const querySearch = params.get('search') || '';
  const [search, setSearch] = useState(querySearch);
  const [cases, setCases] = useState<ContentCase[]>([]);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detail, setDetail] = useState<ContentCaseDetail | ContentItem | null>(null);
  const [detailError, setDetailError] = useState('');
  const [detailRevision, setDetailRevision] = useState(0);
  const listSequence = useRef(0);
  const detailSequence = useRef(0);
  const invalidateList = useCallback(() => { listSequence.current++; }, []);
  const invalidateDetail = useCallback(() => { detailSequence.current++; }, []);
  const { success } = useToast();
  const opened = Boolean(caseId || contentId);
  const detailMatches = detail && (caseId ? detail.id === caseId && 'allowedDecisions' in detail : detail.id === contentId && !('allowedDecisions' in detail) && detail.contentType === type);

  function navigate(changes: Record<string, string | null>, push = false) {
    const next = new URLSearchParams(params.toString());
    Object.entries(changes).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key));
    const url = `/admin/content-cases${next.size ? `?${next}` : ''}`;
    if (push) router.push(url, { scroll: false }); else router.replace(url, { scroll: false });
  }
  const load = useCallback(async () => {
    const sequence = ++listSequence.current;
    setLoading(true); setError('');
    try {
      const query = { page, limit: pageSize, contentType: type, ...(view === 'content' ? { search: querySearch } : { caseType, status: view === 'history' ? 'RESOLVED' as const : 'OPEN' as const }) };
      if (view === 'content') {
        const response = await apiGetMarketplaceContent(query);
        if (sequence !== listSequence.current) return;
        setContent(response.data); setPagination(response.pagination);
      } else {
        const response = await apiGetContentCases(query);
        if (sequence !== listSequence.current) return;
        setCases(response.data); setPagination(response.pagination);
      }
    } catch (cause) { if (sequence === listSequence.current) setError(getApiErrorMessage(cause, 'This view could not be loaded. Try Refresh.')); }
    finally { if (sequence === listSequence.current) setLoading(false); }
  }, [page, type, view, querySearch, caseType]);
  const loadDetail = useCallback(async () => {
    const sequence = ++detailSequence.current;
    setDetail(null); setDetailError('');
    try {
      const response = caseId ? await apiGetContentCase(caseId) : contentId && type ? await apiGetMarketplaceItem(type, contentId) : null;
      if (!response) throw new Error('This content link is incomplete. Return to All content and open the item again.');
      if (sequence === detailSequence.current) { setDetail(response.data); setDetailRevision(value => value + 1); }
    } catch (cause) { if (sequence === detailSequence.current) setDetailError(getApiErrorMessage(cause, 'This item could not be opened. Retry or return to the list.')); }
  }, [caseId, contentId, type]);
  useApiCacheRefresh(['admin', 'content'], () => load(), !opened);

  useEffect(() => { const timer = setTimeout(() => { if (!opened) void load(); }, 0); return () => { clearTimeout(timer); invalidateList(); }; }, [load, opened, invalidateList]);
  useEffect(() => { const timer = setTimeout(() => { if (opened) void loadDetail(); }, 0); return () => { clearTimeout(timer); invalidateDetail(); }; }, [loadDetail, opened, invalidateDetail]);
  useEffect(() => { const timer = setTimeout(() => setSearch(querySearch), 0); return () => clearTimeout(timer); }, [querySearch]);
  useEffect(() => {
    const socket = getSocket();
    const refresh = () => { if (!opened) void load(); };
    const events = ['CONTENT_CASES_CHANGED', 'SERVICE_LISTINGS_CHANGED', 'SERVICE_REQUESTS_CHANGED'];
    events.forEach(event => socket?.on(event, refresh));
    return () => { events.forEach(event => socket?.off(event, refresh)); };
  }, [load, opened]);

  function saved(isCase: boolean) {
    success(isCase ? 'Decision applied' : 'Content updated', isCase ? 'The selected actions succeeded. The outcome is in History and the audit log.' : 'The owner was notified and the action was recorded.');
    navigate({ caseId: null, contentId: null, view: isCase ? 'history' : 'content', page: null });
  }
  const back = () => navigate({ caseId: null, contentId: null });
  const filtered = !!type || (view !== 'content' && !!caseType) || !!querySearch;
  const rows = view === 'content' ? content : cases;

  return <div className="cw-workspace">
    <ReportWorkflowNav current="content" />
    {opened ? detailError ? <div className="cw-empty" role="alert"><h2>Unable to open this item</h2><p>{detailError}</p><div className="cw-inline"><button type="button" className="cw-button" onClick={back}>Back to list</button><button type="button" className="cw-button" onClick={() => void loadDetail()}>Retry</button></div></div> : detail && detailMatches ? caseId && 'allowedDecisions' in detail ? <ContentCaseWorkroom key={`${caseId}:${detailRevision}`} item={detail} onBack={back} onReload={() => { invalidateApiCache(['admin', 'content']); void loadDetail(); }} onSaved={() => saved(true)} /> : !caseId && !('allowedDecisions' in detail) ? <ContentInspector key={`${contentId}:${detailRevision}`} item={detail} onBack={back} onReload={() => { invalidateApiCache(['admin', 'content']); void loadDetail(); }} onSaved={() => saved(false)} /> : null : <div className="cw-loading" role="status">Opening item…</div> : <>
      <header className="cw-page-header"><div><h1>Content Reports &amp; Appeals</h1><p>Review reported listings, public requests, and owner appeals.</p><p>No booking required. Content decisions do not cancel bookings or settle payments.</p></div><button type="button" className="cw-button" onClick={() => { invalidateApiCache(['admin', 'content']); void load(); }} disabled={loading}><RefreshCw size={16} /> Refresh</button></header>
      <nav className="cw-views" aria-label="Content workspace views">{views.map(item => <button type="button" key={item.id} aria-current={view === item.id ? 'page' : undefined} onClick={() => navigate({ view: item.id === 'review' ? null : item.id, page: null, kind: null, search: null })}>{item.label}</button>)}</nav>
      <div className="cw-toolbar"><label className="cw-filter">Content type<FormSelect value={type || ''} onChange={event => navigate({ type: event.target.value || null, page: null })}><option value="">All content types</option><option value="SERVICE_LISTING">Provider service listings</option><option value="SERVICE_REQUEST">Seeker public requests</option></FormSelect></label>
        {view !== 'content' ? <label className="cw-filter">Case type<FormSelect value={caseType || ''} onChange={event => navigate({ kind: event.target.value || null, page: null })}><option value="">Reports and appeals</option><option value="REPORT">Reports</option><option value="APPEAL">Appeals</option></FormSelect></label> : <form className="cw-search" role="search" onSubmit={event => { event.preventDefault(); navigate({ search: search.trim() || null, page: null }); }}><label htmlFor="content-search">Find content</label><div><Search size={17} aria-hidden /><input id="content-search" maxLength={100} value={search} onChange={event => setSearch(event.target.value)} placeholder="Search title or description" /><button type="submit" className="cw-button">Search</button></div></form>}
        {filtered && <button type="button" className="cw-text-link" onClick={() => { setSearch(''); navigate({ type: null, kind: null, search: null, page: null }); }}>Clear filters</button>}
      </div>
      <div className="cw-list-heading"><h2>{view === 'content' ? 'Marketplace content' : view === 'history' ? 'Completed cases' : 'Reports and appeals to review'}</h2><p>{view === 'content' ? 'All listings and public requests are shown here, including content without a report. Private booking inquiries stay in Disputes & Reports.' : view === 'history' ? 'Open a case to read the decision, explanation, and actions that actually succeeded.' : 'A report starts a review. It does not automatically remove content or ban its owner.'}</p></div>
      {error ? <div className="cw-error" role="alert"><p>{error}</p><button type="button" className="cw-button" onClick={() => { invalidateApiCache(['admin', 'content']); void load(); }}>Retry</button></div> : loading ? <div className="cw-loading" role="status">{view === 'content' ? 'Loading content…' : 'Loading cases…'}</div> : !rows.length ? <div className="cw-empty"><ShieldCheck size={28} aria-hidden /><h3>{filtered ? 'No matches for these filters' : view === 'content' ? 'No marketplace content yet' : view === 'history' ? 'No completed cases yet' : 'No cases need review'}</h3><p>{filtered ? 'Clear the filters to see the full list.' : view === 'review' ? 'New content reports and appeals will appear here. Use All content for routine checks.' : view === 'history' ? 'Cases appear here after their selected actions succeed.' : 'Provider listings and seeker public requests will appear here.'}</p></div> : <div className="cw-list">{view === 'content' ? content.map(item => <article className="cw-row" key={`${item.contentType}:${item.id}`}><div className="cw-row-main"><h3>{item.title}</h3><p>{contentTypeLabel(item.contentType)} · {item.category} · {item.owner.name}</p><span className="cw-status">{item.visibility}</span></div><div className="cw-row-end"><time>{contentDate(item.updatedAt)}</time><button type="button" className="cw-button" onClick={() => navigate({ contentId: item.id, type: item.contentType }, true)}>Inspect content <ArrowRight size={15} /></button></div></article>) : cases.map(item => <article className="cw-row" key={item.id}><div className="cw-row-main"><div className="cw-meta"><span>{item.caseType === 'REPORT' ? 'Report' : 'Appeal'}</span><span>{contentTypeLabel(item.contentType)}</span><span>{item.category}</span></div><h3>{item.title}</h3><p>{item.ownerName ? `Owner: ${item.ownerName} · ` : ''}{item.caseType === 'REPORT' ? 'Reported' : 'Appealed'} by {item.submitter.name}</p><p className="cw-excerpt">{item.reason}</p>{view === 'history' && <p className="cw-outcome">{item.decision ? CONTENT_DECISIONS[item.decision].title : 'Legacy explanation only'}{item.penalty && item.penalty !== 'none' ? ` · ${CONTENT_PENALTIES[item.penalty]}` : ''}</p>}</div><div className="cw-row-end"><time>{contentDate(item.decidedAt || item.createdAt)}</time><button type="button" className="cw-button" onClick={() => navigate({ caseId: item.id }, true)}>{view === 'history' ? 'View outcome' : 'Review case'} <ArrowRight size={15} /></button></div></article>)}</div>}
      {!loading && !error && <AdminPagination page={page} totalPages={pagination.totalPages} totalItems={pagination.total} pageSize={pageSize} onPageChange={value => navigate({ page: String(value) })} itemLabel={view === 'content' ? 'items' : 'cases'} />}
    </>}
  </div>;
}
