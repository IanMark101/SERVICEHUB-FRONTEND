'use client';

import FormSelect from '../../ui/FormSelect';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useApiCacheRefresh } from '@/hooks/useApiCacheRefresh';
import { useRefreshableLoad } from '@/hooks/useRefreshableLoad';
import { invalidateApiCache } from '@/lib/api/responseCache';
import { useRouter, useSearchParams } from 'next/navigation';
import { RefreshCw, Search, ShieldCheck } from 'lucide-react';
import { apiGetContentCases, apiGetContentCase, apiGetMarketplaceContent, apiGetMarketplaceItem, type ContentCase, type ContentCaseDetail, type ContentItem, type ContentType } from '@/api/contentWorkspace.api';
import { getApiErrorMessage } from '@/lib/api/errors';
import { getSocket } from '@/lib/socket';
import { useToast } from '@/components/ui/Toast';
import AdminPagination from '../AdminPagination';
import ReportWorkflowNav from '../ReportWorkflowNav';
import { ReviewQueueLoading } from '../ReviewQueue';
import ContentCaseTable from './ContentCaseTable';
import ContentCaseWorkroom from './ContentCaseWorkroom';
import ContentInspector from './ContentInspector';
import './content-workspace.css';

type View = 'review' | 'content' | 'history';
const views: { id: View; label: string }[] = [{ id: 'review', label: 'Needs attention' }, { id: 'content', label: 'All content' }, { id: 'history', label: 'Case history' }];
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
  const { loading, beginLoad } = useRefreshableLoad(JSON.stringify([page, type, view, querySearch, caseType]));
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
    const request = beginLoad();
    let succeeded = false;
    setError('');
    try {
      const query = { page, limit: pageSize, contentType: type, ...(view === 'content' ? { search: querySearch } : { caseType, status: view === 'history' ? 'RESOLVED' as const : 'OPEN' as const }) };
      if (view === 'content') {
        const response = await apiGetMarketplaceContent(query);
        if (sequence !== listSequence.current || !request.current()) return;
        setContent(response.data); setPagination(response.pagination);
      } else {
        const response = await apiGetContentCases(query);
        if (sequence !== listSequence.current || !request.current()) return;
        setCases(response.data); setPagination(response.pagination);
      }
      succeeded = true;
    } catch (cause) { if (sequence === listSequence.current && request.current()) setError(getApiErrorMessage(cause, 'This view could not be loaded. Try Refresh.')); }
    finally { if (sequence === listSequence.current) request.finish(succeeded); }
  }, [page, type, view, querySearch, caseType, beginLoad, setContent, setPagination, setCases]);
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

  return <div className="cw-workspace review-workspace">
    {opened ? <><ReportWorkflowNav current="content" detail />{detailError ? <div className="cw-empty" role="alert"><h2>Unable to open this item</h2><p>{detailError}</p><div className="cw-inline"><button type="button" className="cw-button" onClick={back}>Back to list</button><button type="button" className="cw-button" onClick={() => void loadDetail()}>Retry</button></div></div> : detail && detailMatches ? caseId && 'allowedDecisions' in detail ? <ContentCaseWorkroom key={`${caseId}:${detailRevision}`} item={detail} onBack={back} onReload={() => { invalidateApiCache(['admin', 'content']); void loadDetail(); }} onSaved={() => saved(true)} /> : !caseId && !('allowedDecisions' in detail) ? <ContentInspector key={`${contentId}:${detailRevision}`} item={detail} onBack={back} onReload={() => { invalidateApiCache(['admin', 'content']); void loadDetail(); }} onSaved={() => saved(false)} /> : null : <div className="cw-loading" role="status">Opening item…</div>}</> : <>
      <header className="review-header"><h1>Content Reports &amp; Appeals</h1><button type="button" className="cw-button" onClick={() => { invalidateApiCache(['admin', 'content']); void load(); }} disabled={loading}><RefreshCw size={16} aria-hidden /> Refresh</button></header>
      <ReportWorkflowNav current="content" />
      <section className="cw-queue review-queue" aria-labelledby="content-list-title">
      <div className="review-queue-head"><nav className="cw-views" aria-label="Content workspace views">{views.map(item => <button type="button" key={item.id} aria-current={view === item.id ? 'page' : undefined} onClick={() => navigate({ view: item.id === 'review' ? null : item.id, page: null, kind: null, search: null })}>{item.label}</button>)}</nav>{!loading && !error && <span className="review-result-count">{pagination.total} {view === 'content' ? 'items' : pagination.total === 1 ? 'case' : 'cases'}</span>}</div>
      <div className="cw-list-heading"><h2 id="content-list-title">{view === 'content' ? 'Marketplace content records' : view === 'history' ? 'Resolved reports and appeals' : 'Reports and appeals awaiting a decision'}</h2>
        <p>{view === 'content' ? 'Public and retained listings. Marketplace visibility is separate from booking completion.' : view === 'history' ? 'Open a case to see the content decision, account action, and admin explanation.' : 'Review a report or owner appeal, inspect the content, and record your decision.'}</p></div>
      <div className="cw-toolbar"><label className="cw-filter">Content type<FormSelect value={type || ''} onChange={event => navigate({ type: event.target.value || null, page: null })}><option value="">All content types</option><option value="SERVICE_LISTING">Provider service listings</option><option value="SERVICE_REQUEST">Seeker public requests</option></FormSelect></label>
        {view !== 'content' ? <label className="cw-filter">Case type<FormSelect value={caseType || ''} onChange={event => navigate({ kind: event.target.value || null, page: null })}><option value="">Reports and appeals</option><option value="REPORT">Content reports</option><option value="APPEAL">Owner appeals</option></FormSelect></label> : <form className="cw-search" role="search" onSubmit={event => { event.preventDefault(); navigate({ search: search.trim() || null, page: null }); }}><label htmlFor="content-search">Find content</label><div><Search size={17} aria-hidden /><input id="content-search" maxLength={100} value={search} onChange={event => setSearch(event.target.value)} placeholder="Search title or description" /><button type="submit" className="cw-button">Search</button></div></form>}
        {filtered && <button type="button" className="cw-text-link" onClick={() => { setSearch(''); navigate({ type: null, kind: null, search: null, page: null }); }}>Clear filters</button>}
      </div>
      {error ? <div className="cw-error" role="alert"><p>{error}</p><button type="button" className="cw-button" onClick={() => { invalidateApiCache(['admin', 'content']); void load(); }}>Retry</button></div> : loading ? <ReviewQueueLoading label="Loading content" /> : !rows.length ? <div className="cw-empty"><ShieldCheck size={28} aria-hidden /><h3>{filtered ? 'No matches for these filters' : view === 'content' ? 'No marketplace content yet' : view === 'history' ? 'No completed cases yet' : 'No cases need review'}</h3>{filtered && <button type="button" className="cw-text-link" onClick={() => navigate({ type: null, kind: null, search: null, page: null })}>Clear filters</button>}</div> : <ContentCaseTable cases={cases} content={content} view={view} onCase={id => navigate({ caseId: id }, true)} onContent={item => navigate({ contentId: item.id, type: item.contentType }, true)} />}
      {!loading && !error && <AdminPagination page={page} totalPages={pagination.totalPages} totalItems={pagination.total} pageSize={pageSize} onPageChange={value => navigate({ page: String(value) })} itemLabel={view === 'content' ? 'items' : 'cases'} />}
      </section>
    </>}
  </div>;
}
