'use client';
import type { FormEvent, RefObject } from 'react';
import Link from 'next/link';
import { RefreshCw, ArrowUpRight } from 'lucide-react';
import FormSelect from '../../ui/FormSelect';
import AdminPagination from '@/components/admin/AdminPagination';
import './admin-users.css';

export type AdminAppeal = {
  id: string; status: 'PENDING' | 'APPROVED' | 'REJECTED'; message: string; createdAt: string;
  decisionReason?: string | null; decidedAt?: string | null; decidedBy?: { name: string } | null;
  banAuditLog?: { reason: string; createdAt: string } | null;
  user: { id: string; name: string; email: string; moderationStatus: string; moderationReason?: string | null };
  moderationHistory: { id: string; action: string; reason: string; createdAt: string }[];
};
const date = (value: string) => new Date(value).toLocaleString('en-PH', { timeZone: 'Asia/Manila', dateStyle: 'medium', timeStyle: 'short' });

export type AppealSelection = { appeal: AdminAppeal; decision: 'APPROVED' | 'REJECTED' };
export interface BanAppealsViewProps {
  appeals: AdminAppeal[]; view: 'pending' | 'history'; status: '' | 'APPROVED' | 'REJECTED'; page: number;
  total: number; totalPages: number; loading: boolean; error: string; selected: AppealSelection | null;
  reason: string; saving: boolean; decisionError: string; dialogRef: RefObject<HTMLDivElement | null>;
  load: () => unknown; close: () => void; decide: (event: FormEvent) => void;
  changeView: (view: 'pending' | 'history') => void; setStatus: (status: '' | 'APPROVED' | 'REJECTED') => void;
  setPage: (page: number) => void; setSelected: (selection: AppealSelection | null) => void;
  setReason: (reason: string) => void; setDecisionError: (error: string) => void;
}
export default function BanAppealsView({ appeals, view, status, page, total, totalPages, loading, error, selected, reason, saving, decisionError, dialogRef, load, close, decide, changeView, setStatus, setPage, setSelected, setReason, setDecisionError }: BanAppealsViewProps) {

  return <div className="au-page">
    <header className="au-topbar"><div><h1 className="au-heading">Ban Appeals</h1><p className="au-muted mt-2">Review the original ban, the user&apos;s explanation, and outstanding obligations before deciding.</p></div><button type="button" className="au-button" disabled={loading || saving} onClick={() => void load()}><RefreshCw size={16} />Refresh</button></header>
    <nav className="au-tabs" aria-label="Ban appeal views"><button type="button" aria-pressed={view === 'pending'} onClick={() => changeView('pending')}>Pending</button><button type="button" aria-pressed={view === 'history'} onClick={() => changeView('history')}>History</button></nav>
    <section className="au-panel" aria-label={view === 'pending' ? 'Pending ban appeals' : 'Ban appeal history'} aria-busy={loading}>
      <div className="au-topbar"><h2 className="text-lg font-semibold">{view === 'pending' ? 'Awaiting review' : 'Reviewed appeals'}{!loading && !error && <span className="au-badge ml-2">{total}</span>}</h2>{view === 'history' && <label className="flex items-center gap-3 text-sm">Decision<FormSelect compact aria-label="Filter appeal decisions" value={status} onChange={event => { setStatus(event.target.value as typeof status); setPage(1); }}><option value="">All decisions</option><option value="APPROVED">Approved</option><option value="REJECTED">Rejected</option></FormSelect></label>}</div>
      {error ? <div className="au-error mt-4" role="alert"><p>{error}</p><button type="button" className="au-button mt-3" onClick={() => void load()}>Try again</button></div>
        : loading ? <p role="status" className="au-muted py-8">Loading appeals…</p>
        : !appeals.length ? <p className="au-muted py-8">{view === 'pending' ? 'No ban appeals are awaiting review.' : 'No reviewed appeals match this filter.'}</p>
        : <>{appeals.map(appeal => <article className="au-record" key={appeal.id}>
          <div className="au-topbar"><div><h3>{appeal.user.name}</h3><p className="au-muted">{appeal.user.email}</p></div><span className="au-badge">{appeal.status === 'PENDING' ? 'Pending review' : appeal.status === 'APPROVED' ? 'Approved' : 'Rejected'}</span></div>
          <p className="au-muted">Submitted {date(appeal.createdAt)} · Account {appeal.user.moderationStatus.toLowerCase()}</p>
          <dl className="mt-5 space-y-4 text-sm"><div><dt className="font-semibold">Original ban reason</dt><dd className="mt-1 whitespace-pre-wrap [overflow-wrap:anywhere]">{appeal.banAuditLog?.reason || appeal.user.moderationReason || 'No reason recorded'}</dd></div><div><dt className="font-semibold">Appeal message</dt><dd className="mt-1 whitespace-pre-wrap leading-6 [overflow-wrap:anywhere]">{appeal.message}</dd></div></dl>
          <div className="mt-4 flex flex-wrap gap-2"><Link className="au-button" href={`/admin/users/${encodeURIComponent(appeal.user.id)}?returnTo=${encodeURIComponent(`/admin/ban-appeals?view=${view}`)}`}>View profile<ArrowUpRight size={15} /></Link><Link className="au-button" href={`/admin/reports?userId=${encodeURIComponent(appeal.user.id)}`}>Review engagements<ArrowUpRight size={15} /></Link></div>
          <details className="mt-4 text-sm"><summary className="cursor-pointer font-semibold">Recent moderation history</summary>{appeal.moderationHistory.length ? <ul className="mt-2 space-y-2">{appeal.moderationHistory.map(item => <li key={item.id} className="au-muted"><span className="font-semibold">{item.action.replaceAll('_', ' ')}</span> · {date(item.createdAt)}<br />{item.reason}</li>)}</ul> : <p className="au-muted">No moderation history recorded.</p>}</details>
          {appeal.status === 'PENDING' ? <><p className="au-muted mt-4">Check current bookings, open cases, and payment obligations before recording a decision.</p>{appeal.user.moderationStatus !== 'BANNED' ? <p className="au-muted">This account is no longer banned. A new appeal decision is unavailable.</p> : <div className="mt-4 flex flex-wrap gap-2"><button type="button" className="au-button au-button-primary" onClick={() => { setSelected({ appeal, decision: 'APPROVED' }); setDecisionError(''); }}>Approve and unban</button><button type="button" className="au-button" onClick={() => { setSelected({ appeal, decision: 'REJECTED' }); setDecisionError(''); }}>Reject appeal</button></div>}</>
            : <div className="mt-4 border-t border-[var(--workspace-border)] pt-4"><p className="font-semibold">Decision explanation</p><p className="whitespace-pre-wrap">{appeal.decisionReason || 'No explanation recorded'}</p>{appeal.decidedAt && <p className="au-muted">{date(appeal.decidedAt)}{appeal.decidedBy ? ` · ${appeal.decidedBy.name}` : ''}</p>}</div>}
        </article>)}<AdminPagination page={page} totalPages={totalPages} totalItems={total} pageSize={10} onPageChange={setPage} itemLabel="appeals" /></>}
    </section>
    {selected && <div className="au-dialog" onMouseDown={event => { if (event.target === event.currentTarget) close(); }}><div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="appeal-decision-title" aria-describedby="appeal-decision-impact" tabIndex={-1} className="au-panel au-dialog-content"><form onSubmit={decide}>
      <h2 id="appeal-decision-title" className="text-xl font-semibold">{selected.decision === 'APPROVED' ? 'Approve appeal and unban' : 'Reject appeal'}</h2><p className="mt-2 font-semibold [overflow-wrap:anywhere]">{selected.appeal.user.name}</p><p id="appeal-decision-impact" className="au-muted mt-3">{selected.decision === 'APPROVED' ? 'Restore this account’s access. Normal verification requirements still apply, and existing bookings and payments remain unchanged.' : 'Keep this account banned. The user will receive your decision explanation.'}</p>
      <label htmlFor="appeal-decision-reason" className="mt-5 block text-sm font-semibold">Decision reason shown to the user</label><textarea id="appeal-decision-reason" required minLength={3} maxLength={500} rows={4} disabled={saving} value={reason} onChange={event => setReason(event.target.value)} />
      {decisionError && <p role="alert" className="au-error mb-4">{decisionError}</p>}<div className="flex flex-wrap justify-end gap-2"><button type="button" className="au-button" disabled={saving} onClick={close}>Cancel</button><button type="submit" className="au-button au-button-primary" disabled={saving || reason.trim().length < 3}>{saving ? 'Saving decision…' : 'Confirm decision'}</button></div>
    </form></div></div>}
  </div>;
}
