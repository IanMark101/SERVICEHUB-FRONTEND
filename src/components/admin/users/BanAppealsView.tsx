'use client';
import type { FormEvent, RefObject } from 'react';
import Link from 'next/link';
import { RefreshCw, ArrowUpRight, X } from 'lucide-react';
import FormSelect from '../../ui/FormSelect';
import AdminPagination from '@/components/admin/AdminPagination';
import ReportWorkflowNav from '../ReportWorkflowNav';
import { ReviewCell, ReviewTable, ReviewQueueLoading } from '../ReviewQueue';
import './admin-users.css';
import './ban-appeals.css';

export type AdminAppeal = {
  id: string; status: 'PENDING' | 'APPROVED' | 'REJECTED'; message: string; createdAt: string;
  decisionReason?: string | null; decidedAt?: string | null; decidedBy?: { name: string } | null;
  banAuditLog?: { reason: string; createdAt: string } | null;
  user: { id: string; name: string; email: string; moderationStatus: string; moderationReason?: string | null };
  moderationHistory: { id: string; action: string; reason: string; createdAt: string }[];
};
const date = (value: string) => new Date(value).toLocaleString('en-PH', { timeZone: 'Asia/Manila', dateStyle: 'medium', timeStyle: 'short' });

export type AppealSelection = { appeal: AdminAppeal; decision: '' | 'APPROVED' | 'REJECTED' };
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

  const canDecide = selected?.appeal.status === 'PENDING' && selected.appeal.user.moderationStatus === 'BANNED';
  const open = (appeal: AdminAppeal) => { setSelected({ appeal, decision: '' }); setReason(''); setDecisionError(''); };
  return <div className="au-page review-workspace ba-workspace">
    <header className="review-header"><h1>Ban Appeals</h1><button type="button" className="au-button" disabled={loading || saving} onClick={() => void load()}><RefreshCw size={16} aria-hidden />Refresh</button></header>
    <ReportWorkflowNav current="ban" />
    <section className="review-queue" aria-label={view === 'pending' ? 'Pending ban appeals' : 'Ban appeal history'} aria-busy={loading}>
      <div className="review-queue-head"><nav className="ba-views" aria-label="Ban appeal views"><button type="button" aria-pressed={view === 'pending'} onClick={() => changeView('pending')}>Pending</button><button type="button" aria-pressed={view === 'history'} onClick={() => changeView('history')}>History</button></nav>{!loading && !error && <span className="review-result-count">{total} {total === 1 ? 'appeal' : 'appeals'}</span>}</div>
      {view === 'history' && <div className="ba-filter"><label>Decision<FormSelect compact aria-label="Filter appeal decisions" value={status} onChange={event => { setStatus(event.target.value as typeof status); setPage(1); }}><option value="">All decisions</option><option value="APPROVED">Approved</option><option value="REJECTED">Rejected</option></FormSelect></label></div>}
      {error ? <div className="au-error" role="alert"><p>{error}</p><button type="button" className="au-button" onClick={() => void load()}>Try again</button></div>
        : loading ? <ReviewQueueLoading label="Loading appeals" />
        : !appeals.length ? <div className="ba-empty">{view === 'pending' ? 'No ban appeals are awaiting review.' : 'No reviewed appeals match this filter.'}</div>
        : <ReviewTable columns={['Account', 'Appeal', 'Status', 'Action']} label={view === 'pending' ? 'Pending ban appeals' : 'Ban appeal history'}>{appeals.map(appeal => <tr key={appeal.id}>
          <ReviewCell label="Account"><h3 className="review-title">{appeal.user.name}</h3><p className="review-meta">{appeal.user.email}</p><p className="review-meta">Account {appeal.user.moderationStatus.toLowerCase()}</p></ReviewCell>
          <ReviewCell label="Appeal"><p className="ba-excerpt">{appeal.message}</p><p className="review-meta"><time dateTime={appeal.createdAt}>{date(appeal.createdAt)}</time></p></ReviewCell>
          <ReviewCell label="Status"><span className={`review-status ${appeal.status === 'PENDING' ? 'review-status-open' : ''}`}>{appeal.status === 'PENDING' ? 'Pending review' : appeal.status === 'APPROVED' ? 'Approved' : 'Rejected'}</span>{appeal.decidedAt && <p className="review-meta">Decided {date(appeal.decidedAt)}</p>}</ReviewCell>
          <ReviewCell label="Action" action><button type="button" className="review-action" onClick={() => open(appeal)}>{appeal.status === 'PENDING' ? 'Review appeal' : 'View outcome'}</button></ReviewCell>
        </tr>)}</ReviewTable>}
      {!loading && !error && <AdminPagination page={page} totalPages={totalPages} totalItems={total} pageSize={10} onPageChange={setPage} itemLabel="appeals" />}
    </section>
    {selected && <div className="au-dialog" onMouseDown={event => { if (event.target === event.currentTarget) close(); }}><div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="appeal-decision-title" tabIndex={-1} className="au-panel au-dialog-content">
      <header className="ba-dialog-header"><h2 id="appeal-decision-title">{selected.appeal.status === 'PENDING' ? 'Review ban appeal' : 'Appeal outcome'}</h2><button type="button" className="au-button" aria-label="Close appeal" disabled={saving} onClick={close}><X size={18} aria-hidden /></button></header>
      <div className="ba-review-grid">
        <section className="ba-evidence" aria-label="Appeal details"><h3>{selected.appeal.user.name}</h3><p className="review-meta">{selected.appeal.user.email} · Account {selected.appeal.user.moderationStatus.toLowerCase()}</p>
          <dl className="ba-facts"><div><dt>Original ban reason</dt><dd>{selected.appeal.banAuditLog?.reason || selected.appeal.user.moderationReason || 'No reason recorded'}</dd></div><div><dt>Appeal message</dt><dd>{selected.appeal.message}</dd><dd className="review-meta">Submitted {date(selected.appeal.createdAt)}</dd></div></dl>
          <div className="ba-profile-actions"><Link className="au-button" href={`/admin/users/${encodeURIComponent(selected.appeal.user.id)}?returnTo=${encodeURIComponent(`/admin/ban-appeals?view=${view}`)}`}>View profile<ArrowUpRight size={15} aria-hidden /></Link><Link className="au-button" href={`/admin/reports?userId=${encodeURIComponent(selected.appeal.user.id)}`}>Review engagements<ArrowUpRight size={15} aria-hidden /></Link></div>
          <details className="ba-history"><summary>Recent moderation history</summary>{selected.appeal.moderationHistory.length ? <ul>{selected.appeal.moderationHistory.map(item => <li key={item.id}><strong>{item.action.replaceAll('_', ' ')}</strong><p className="review-meta">{date(item.createdAt)}</p><p>{item.reason}</p></li>)}</ul> : <p className="review-meta">No moderation history recorded.</p>}</details>
        </section>
        {canDecide ? <form className="ba-decision" onSubmit={decide}><fieldset disabled={saving}><legend>Admin decision</legend>{([{ value: 'APPROVED', label: 'Approve and unban' }, { value: 'REJECTED', label: 'Reject appeal' }] as const).map(option => <label className="ba-decision-choice" key={option.value}><input type="radio" name="appeal-decision" required value={option.value} checked={selected.decision === option.value} onChange={() => setSelected({ ...selected, decision: option.value })} /><span>{option.label}</span></label>)}</fieldset>
          {selected.decision && <p className="ba-impact">{selected.decision === 'APPROVED' ? 'Restore account access. Normal verification requirements still apply. Existing bookings and payments remain unchanged.' : 'Keep this account banned. The user will receive your explanation.'}</p>}
          <label htmlFor="appeal-decision-reason" className="ba-reason-label">Decision reason shown to the user</label><textarea id="appeal-decision-reason" required minLength={3} maxLength={500} rows={4} disabled={saving} value={reason} onChange={event => setReason(event.target.value)} />
          {decisionError && <p role="alert" className="au-error">{decisionError}</p>}<div className="ba-dialog-actions"><button type="button" className="au-button" disabled={saving} onClick={close}>Cancel</button><button type="submit" className="review-action" disabled={saving || !selected.decision || reason.trim().length < 3}>{saving ? 'Saving decision…' : 'Confirm decision'}</button></div>
        </form> : <section className="ba-decision" aria-label="Recorded decision"><h3>{selected.appeal.status === 'PENDING' ? 'Decision unavailable' : selected.appeal.status === 'APPROVED' ? 'Approved' : 'Rejected'}</h3>{selected.appeal.status === 'PENDING' ? <p>This account is no longer banned. A new appeal decision is unavailable.</p> : <><h4>Decision explanation</h4><p className="ba-recorded-reason">{selected.appeal.decisionReason || 'No explanation recorded'}</p>{selected.appeal.decidedAt && <p className="review-meta">{date(selected.appeal.decidedAt)}{selected.appeal.decidedBy ? ` · ${selected.appeal.decidedBy.name}` : ''}</p>}</>}<div className="ba-dialog-actions"><button type="button" className="au-button" onClick={close}>Close</button></div></section>}
      </div>
    </div></div>}
  </div>;
}
