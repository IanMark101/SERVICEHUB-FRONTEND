'use client';

import { useCallback, useEffect, useState } from 'react';
import { History, RefreshCw } from 'lucide-react';
import { apiListAdminAuditLogs } from '../../../api/admin.api';
import { useApiCacheRefresh } from '../../../hooks/useApiCacheRefresh';
import { useRefreshableLoad } from '../../../hooks/useRefreshableLoad';
import { getApiErrorMessage } from '../../../lib/api/errors';
import AdminPagination from '../AdminPagination';
import type { AdminAuditRecord, AuditFilters, AuditKind, SecurityRecord } from './types';
import styles from './AuditLogs.module.css';

const PAGE_SIZE = 20;
const emptyFilters: AuditFilters = { search: '', action: '', from: '', to: '' };
const eventNames: Record<string, string> = {
  SIGN_IN_SUCCESS: 'Signed in', SIGN_IN_FAILED: 'Sign-in failed', SIGN_OUT: 'Signed out',
  SERVICE_PUBLISHED: 'Service published', REQUEST_PUBLISHED: 'Request published',
  BOOKING_REQUESTED: 'Booking requested', BOOKING_CREATED: 'Booking created', OFFER_SENT: 'Offer sent',
};

function EventTime({ value }: { value: string }) {
  return <time dateTime={value} title={new Date(value).toISOString()} className={styles.timestamp}>{new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'medium' })}</time>;
}

export function SecurityHistoryRow({ item }: { item: SecurityRecord }) {
  const area = [item.city, item.region, item.country].filter(Boolean).join(', ');
  return <article className={styles.securityRow}>
    <div className={styles.identity}><strong>{item.user?.name || 'Unidentified account'}</strong><span>{item.user?.email || 'No verified account identity for this attempt'}</span></div>
    <div><strong className={styles.event} data-outcome={item.action === 'SIGN_IN_FAILED' ? 'failed' : item.action === 'SIGN_IN_SUCCESS' ? 'success' : 'neutral'}>{eventNames[item.action] || item.action.replace(/_/g, ' ')}</strong><EventTime value={item.createdAt}/>{item.method && <span className={styles.secondary}>{item.method === 'REGISTRATION' ? 'After registration' : item.method === 'GOOGLE' ? 'Google sign-in' : 'Password sign-in'}</span>}</div>
    <div><strong>{item.locationStatus === 'LOCAL_NETWORK' ? 'Local / private network' : item.locationStatus === 'APPROXIMATE' ? area || 'Approximate area unavailable' : 'Location unavailable'}</strong>{item.locationStatus === 'APPROXIMATE' && <span className={styles.secondary}>Approximate IP location</span>}<span className={styles.secondary}>IP: {item.ipAddress || 'Unavailable'}</span></div>
    <div><strong>{item.browser}</strong><span className={styles.secondary}>{item.device}</span></div>
    <details className={styles.details}><summary>Event details</summary><dl><div><dt>Reason</dt><dd>{item.reason}</dd></div>{item.userId && <div><dt>Account ID</dt><dd>{item.userId}</dd></div>}{item.sessionReference && <div><dt>Session reference</dt><dd>{item.sessionReference}</dd></div>}{item.requestId && <div><dt>Request reference</dt><dd>{item.requestId}</dd></div>}{item.userAgent && <div><dt>Browser report</dt><dd>{item.userAgent}</dd></div>}</dl></details>
  </article>;
}

export default function AuditLogsView({ isDark }: { isDark: boolean }) {
  const [kind, setKind] = useState<AuditKind>('admin');
  const [draft, setDraft] = useState<AuditFilters>(emptyFilters);
  const [filters, setFilters] = useState<AuditFilters>(emptyFilters);
  const [items, setItems] = useState<Array<AdminAuditRecord | SecurityRecord>>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [retentionDays, setRetentionDays] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [filterError, setFilterError] = useState('');
  const { loading, refreshing, beginLoad } = useRefreshableLoad(JSON.stringify({ page, kind, filters }));
  const load = useCallback(async () => {
    const request = beginLoad();
    let succeeded = false;
    try {
      const response = await apiListAdminAuditLogs({ page, limit: PAGE_SIZE, kind, search: filters.search || undefined, action: filters.action || undefined, from: filters.from || undefined, to: filters.to || undefined });
      if (!request.current()) return;
      if (!response.success) throw new Error('Audit records could not be loaded.');
      setItems(response.data || []);
      setTotal(response.pagination?.total || 0);
      setTotalPages(Math.max(1, response.pagination?.totalPages || 1));
      setRetentionDays(response.retentionDays ?? null);
      setError('');
      succeeded = true;
    } catch (cause) {
      if (request.current()) setError(getApiErrorMessage(cause, 'Audit records could not be loaded. Try Refresh.'));
    } finally { request.finish(succeeded); }
  }, [page, kind, filters, beginLoad]);
  useApiCacheRefresh(['admin'], () => load());
  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);
  const changeKind = (next: AuditKind) => { setKind(next); setDraft(emptyFilters); setFilters(emptyFilters); setFilterError(''); setPage(1); };

  return <div className={styles.view} data-dark={isDark}>
    <header className={styles.header}><div><h2><History size={20} aria-hidden="true"/>Audit logs</h2><p>Administrator actions and user sign-in history.</p></div><button type="button" className={styles.button} disabled={loading || refreshing} onClick={() => void load()}><RefreshCw size={16} aria-hidden="true"/>{refreshing ? 'Refreshing…' : 'Refresh'}</button></header>
    <nav className={styles.tabs} aria-label="Audit log views">{([['admin', 'Administrator actions'], ['security', 'Sign-in history']] as const).map(([value, label]) => <button key={value} type="button" aria-pressed={kind === value} onClick={() => changeKind(value)}>{label}</button>)}</nav>
    <form className={styles.filters} onSubmit={event => { event.preventDefault(); if (draft.from && draft.to && draft.from > draft.to) { setFilterError('Start date must be on or before end date.'); return; } setFilterError(''); setFilters({ ...draft, search: draft.search.trim() }); setPage(1); }}>
      <label className={styles.search}><span>{kind === 'security' ? 'User, email, IP or session reference' : 'Action, user or reason'}</span><input type="search" maxLength={100} value={draft.search} onChange={event => setDraft({ ...draft, search: event.target.value })} placeholder={kind === 'security' ? 'Search sign-in history' : 'Search administrator actions'}/></label>
      {kind === 'security' && <label><span>Event</span><select value={draft.action} onChange={event => setDraft({ ...draft, action: event.target.value })}><option value="">All security events</option>{Object.entries(eventNames).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>}
      <label><span>From (UTC)</span><input type="date" value={draft.from} onChange={event => setDraft({ ...draft, from: event.target.value })}/></label>
      <label><span>To (UTC)</span><input type="date" value={draft.to} onChange={event => setDraft({ ...draft, to: event.target.value })} aria-invalid={Boolean(filterError)}/></label>
      <button className={styles.button} type="submit">Apply filters</button>
      <button className={styles.button} type="button" onClick={() => { setDraft(emptyFilters); setFilters(emptyFilters); setFilterError(''); setPage(1); }}>Clear</button>
    </form>
    {filterError && <p role="alert" className={styles.error}>{filterError}</p>}
    {kind === 'security' && <p className={styles.notice}>IP locations are approximate and may reflect a VPN or mobile network. Timestamps display in your device’s time zone; date filters use UTC.{retentionDays !== null && ` Security events are retained for ${retentionDays} days.`} Access to this history is recorded.</p>}
    {error && <p role="alert" className={styles.error}>{error}</p>}
    <section className={styles.records} aria-label={kind === 'security' ? 'User sign-in and security records' : 'Administrator audit records'} aria-busy={loading || refreshing}>
      {loading ? <p role="status" className={styles.state}>Loading audit records…</p> : error ? <p className={styles.state}>Refresh to try loading these records again.</p> : items.length === 0 ? <p className={styles.state}>{kind === 'security' ? 'No sign-in or security events found. New events appear here after this feature is enabled.' : 'No administrator actions found.'}</p> : items.map(item => 'actor' in item ? <article key={item.id} className={styles.adminRow}><div><strong>{item.action.replace(/_/g, ' ')}</strong><EventTime value={item.createdAt}/></div><div><p>{item.reason}</p><span className={styles.secondary}>{item.resourceType}{item.resourceId ? ` · ${item.resourceId}` : ''}{item.targetUser ? ` · Target: ${item.targetUser.name}` : ''}</span></div><div className={styles.identity}><strong>{item.actor.name}</strong><span>{item.actor.email}</span></div></article> : <SecurityHistoryRow key={item.id} item={item}/>)}
    </section>
    {!loading && !error && <AdminPagination page={page} totalPages={totalPages} totalItems={total} pageSize={PAGE_SIZE} onPageChange={setPage} itemLabel={kind === 'security' ? 'security events' : 'audit records'}/>}
  </div>;
}
