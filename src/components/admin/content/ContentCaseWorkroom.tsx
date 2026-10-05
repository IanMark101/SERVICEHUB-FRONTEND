'use client';

import FormSelect from '../../ui/FormSelect';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowUpRight, ShieldAlert } from 'lucide-react';
import { apiDecideContentCase, type ContentCaseDetail, type ContentDecision, type ContentPenalty } from '@/api/contentWorkspace.api';
import { getApiErrorMessage } from '@/lib/api/errors';
import { ContentFacts, contentDate, contentTypeLabel } from './ContentFacts';

export const CONTENT_DECISIONS = {
  KEEP: { title: 'Dismiss report', description: 'No violation was established in this report. Keep the current content visibility and account state.' },
  REMOVE: { title: 'Remove content', description: 'Hide this listing or request from the marketplace. Existing bookings and payments remain recorded.' },
  RESTORE: { title: 'Restore content', description: 'Make the removed content available again if the owner, category, and content remain eligible. Closed offers stay closed.' },
  KEEP_REMOVED: { title: 'Keep content removed', description: 'The content stays hidden. Explain why the removal should stand.' },
  GUIDANCE: { title: 'Send guidance', description: 'Explain the next step. This does not publish, remove, or restore content and does not change account access.' },
};
export const CONTENT_PENALTIES = { none: 'No account penalty', warn: 'Send a warning', suspend: 'Temporarily suspend account', ban: 'Ban account' };

export default function ContentCaseWorkroom({ item, onBack, onReload, onSaved }: { item: ContentCaseDetail; onBack: () => void; onReload: () => void; onSaved: () => void }) {
  const [decision, setDecision] = useState<ContentDecision | ''>('');
  const [penalty, setPenalty] = useState<ContentPenalty>('none');
  const [days, setDays] = useState(7);
  const [notes, setNotes] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const heading = useRef<HTMLHeadingElement>(null);
  const confirmationHeading = useRef<HTMLHeadingElement>(null);
  const pending = useRef(false);
  useEffect(() => { heading.current?.focus(); }, []);
  useEffect(() => { if (reviewing) confirmationHeading.current?.focus(); }, [reviewing]);
  const owner = item.content?.owner;
  const snapshot = item.contentSnapshot;
  const canPenalize = item.caseType === 'REPORT' && ['REMOVE', 'KEEP_REMOVED'].includes(decision) && !!owner && owner.role === 'user' && owner.isActive && !owner.deactivatedAt;
  const valid = !!decision && item.allowedDecisions.includes(decision) && notes.trim().length >= 10 && notes.trim().length <= 1000 && (penalty !== 'suspend' || days >= 1 && days <= 30 && !item.obligations.unstartedProviderBookings);
  const hasObligations = item.obligations.bookings || item.obligations.heldPayments || item.obligations.pendingPayments;
  const snapshotChanged = !!snapshot && !!item.content && snapshot.updatedAt !== item.content.updatedAt;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!valid || !decision || !reviewing || !acknowledged || pending.current) return;
    pending.current = true; setSaving(true); setError('');
    try {
      await apiDecideContentCase(item.id, { decision, penalty: canPenalize ? penalty : 'none', resolution: notes.trim(), suspensionDays: days, ...(item.content && { expectedUpdatedAt: item.content.updatedAt, expectedOwnerStatus: item.content.owner.moderationStatus }) });
      onSaved();
    } catch (cause) { setError(getApiErrorMessage(cause, 'The decision could not be applied. The case is still open.')); }
    finally { pending.current = false; setSaving(false); }
  }

  return <div className="cw-workroom">
    <button type="button" className="cw-back" onClick={onBack} disabled={saving}><ArrowLeft size={18} /> Back to cases</button>
    <header className="cw-detail-header"><div className="cw-meta"><span>{item.caseType === 'REPORT' ? 'Content report' : 'Content appeal'}</span><span>{contentTypeLabel(item.contentType)}</span><span className="cw-status">{item.status === 'OPEN' ? 'Needs review' : 'Resolved'}</span></div><h2 ref={heading} tabIndex={-1}>{snapshot?.title || item.content?.title || 'Publication check appeal'}</h2><p>Submitted by {item.submitter.name} · {contentDate(item.createdAt)}</p><small>Case {item.id}</small></header>
    <div className="cw-detail-grid">
      <div className="cw-detail-main">
        <section className="cw-detail-section"><h3>{item.caseType === 'REPORT' ? 'What was reported' : 'Why the owner appealed'}</h3><p className="cw-prose">{item.reason}</p></section>
        <section className="cw-detail-section"><h3>{snapshot ? 'Content saved when submitted' : 'Current content'}</h3>
          {!snapshot && <p className="cw-muted">An original copy was not saved for this older case.</p>}
          {snapshot || item.content ? <><p className="cw-prose">{(snapshot || item.content)?.description}</p><ContentFacts item={(snapshot || item.content)!} /></> : <p className="cw-prose cw-muted">No saved listing or request is available. Review the explanation and send guidance; publishing or penalizing an account is unavailable here.</p>}
          {snapshotChanged && <details className="cw-changes"><summary>Content has changed since submission — view current details</summary><p className="cw-prose"><strong>{item.content?.title}</strong></p><p className="cw-prose">{item.content?.description}</p>{item.content && <ContentFacts item={item.content} />}</details>}
          {item.content && <p className="cw-current">Current visibility: <strong>{item.content.visibility}</strong>{item.content.adminNotes && <span> · Last admin explanation: {item.content.adminNotes}</span>}</p>}
          {item.content?.actionBlock && <p className="cw-notice">{item.content.actionBlock}</p>}
        </section>
        <section className="cw-detail-section"><h3>People involved</h3><div className="cw-person"><div><span className="cw-muted">{item.caseType === 'REPORT' ? 'Person who reported' : 'Person who appealed'}</span><strong>{item.submitter.name}</strong><span>{item.submitter.email}</span></div></div>
          {owner ? <div className="cw-person"><div><span className="cw-muted">Content owner — any account consequence applies to this person</span><strong>{owner.name}</strong><span>{owner.email}</span></div><div className="cw-person-state"><span>Account: {owner.moderationStatus.toLowerCase()}</span><span>Trust {owner.trustScore}/100 · {owner.verificationStatus === 'APPROVED' ? 'Verified resident' : 'Residency not verified'}</span><a href={`/admin/users?search=${encodeURIComponent(owner.email)}`}>View account <ArrowUpRight size={14} /></a></div></div> : <p className="cw-muted">The original owner is unavailable; no account penalty can be applied.</p>}
        </section>
        <section className="cw-detail-section"><h3>Bookings and payments</h3><p className="cw-prose">{hasObligations ? `${item.obligations.bookings} unfinished bookings · ${item.obligations.heldPayments} held payments · ${item.obligations.pendingPayments} pending payments or refunds.` : 'No unfinished bookings or held/pending payments were found for this owner.'}</p><p className="cw-muted">Content decisions do not cancel bookings or move money.</p>{owner && !!hasObligations && <a className="cw-text-link" href={`/admin/reports?userId=${encodeURIComponent(owner.id)}`}>Handle bookings in Disputes & Reports <ArrowUpRight size={14} /></a>}</section>
        <section className="cw-detail-section"><h3>Recent admin actions for this owner</h3>{item.history.length ? <ol className="cw-history">{item.history.map(event => <li key={event.id}><strong>{event.action.toLowerCase().replaceAll('_', ' ')}</strong><time>{contentDate(event.createdAt)}</time><p>{event.reason}</p></li>)}</ol> : <p className="cw-prose cw-muted">No previous content or account actions were found.</p>}</section>
      </div>
      <aside className="cw-decision">
        <h3>{item.status === 'RESOLVED' ? 'Recorded outcome' : 'Decide this case'}</h3>
        {item.status === 'RESOLVED' ? <><p className="cw-prose"><strong>{item.decision ? CONTENT_DECISIONS[item.decision].title : 'Legacy explanation only'}</strong></p><p className="cw-prose">{item.resolution}</p>{item.penalty && <p className="cw-prose">{CONTENT_PENALTIES[item.penalty]}</p>}{item.decisionResult && <dl className="cw-facts"><div><dt>Content after decision</dt><dd>{item.decisionResult.contentStatus?.toLowerCase().replaceAll('_',' ') || 'Unavailable'}</dd></div><div><dt>Owner after decision</dt><dd>{item.decisionResult.ownerStatus?.toLowerCase() || 'Unavailable'}</dd></div></dl>}{!item.decision && <p className="cw-notice">This older case recorded an explanation. No content or account action is inferred from that text.</p>}{item.decidedAt && <p className="cw-muted">Decided {contentDate(item.decidedAt)}</p>}</> : <form onSubmit={submit}>
          <p className="cw-muted cw-intro">Review the content, choose an outcome, and explain why. The case closes only when the selected actions succeed.</p>
          <fieldset disabled={saving || reviewing} hidden={reviewing}><legend>Content outcome</legend>{item.allowedDecisions.map(value => <label className="cw-choice" key={value}><input type="radio" name="content-decision" value={value} checked={decision === value} onChange={() => { setDecision(value); setPenalty('none'); setAcknowledged(false); }} /><span><strong>{CONTENT_DECISIONS[value].title}</strong><span>{CONTENT_DECISIONS[value].description}</span></span></label>)}
            {canPenalize && <label className="cw-field">Account consequence for {owner?.name}<FormSelect value={penalty} onChange={event => setPenalty(event.target.value as ContentPenalty)}>{Object.entries(CONTENT_PENALTIES).map(([value, label]) => <option key={value} value={value} disabled={value === 'ban' && owner?.moderationStatus === 'BANNED' || value === 'suspend' && (owner?.moderationStatus !== 'ACTIVE' || !!item.obligations.unstartedProviderBookings)}>{label}</option>)}</FormSelect><small>A report alone is not proof. Apply a penalty only when your review establishes a violation.</small></label>}
            {canPenalize && item.obligations.unstartedProviderBookings > 0 && <p className="cw-notice">Temporary suspension is unavailable until this provider’s {item.obligations.unstartedProviderBookings} unstarted bookings are handled.</p>}
            {penalty === 'suspend' && <label className="cw-field">Suspension length<FormSelect value={days} onChange={event => setDays(Number(event.target.value))}>{[1,3,7,14,30].map(day => <option key={day} value={day}>{day} {day === 1 ? 'day' : 'days'}</option>)}</FormSelect></label>}
            {penalty === 'ban' && <p className="cw-notice cw-danger"><ShieldAlert size={18} /> The owner will lose normal account access. They can appeal the ban. Their bookings and payments remain for admin handling.</p>}
            <label className="cw-field">Decision explanation<textarea rows={5} required minLength={10} maxLength={1000} value={notes} onChange={event => setNotes(event.target.value)} placeholder="Explain what you found and why this action is appropriate." /><small>{notes.trim().length < 10 ? 'Enter at least 10 characters.' : 'The explanation will be shared and recorded in the audit log.'}</small></label>
          </fieldset>
          {error && <div className="cw-error" role="alert"><p>{error}</p><button type="button" className="cw-button" onClick={onReload} disabled={saving}>Reload case</button></div>}
          {reviewing && decision ? <div className="cw-confirmation"><h4 ref={confirmationHeading} tabIndex={-1}>Confirm the impact</h4><strong>{CONTENT_DECISIONS[decision].title}</strong><p>{CONTENT_DECISIONS[decision].description}</p><p>{canPenalize ? `${CONTENT_PENALTIES[penalty]}${penalty !== 'none' ? ` for ${owner?.name}` : ''}${penalty === 'suspend' ? ` for ${days} days` : ''}.` : 'No account penalty.'}</p><p>Your explanation: {notes.trim()}</p><p>The submitter will receive the outcome. Content owners will be notified of removals, restorations, or account consequences.</p><label className="cw-acknowledge"><input type="checkbox" checked={acknowledged} disabled={saving} onChange={event => setAcknowledged(event.target.checked)} /> I reviewed the content, account, and booking consequences.</label><button type="submit" className={`cw-button ${penalty === 'ban' || decision === 'REMOVE' ? 'cw-danger-button' : 'cw-primary'}`} disabled={!valid || !acknowledged || saving}>{saving ? 'Applying decision…' : 'Confirm decision'}</button><button type="button" className="cw-button" disabled={saving} onClick={() => { setReviewing(false); setAcknowledged(false); }}>Edit decision</button></div> : <button type="button" className="cw-button cw-primary" disabled={!valid} onClick={() => setReviewing(true)}>Review decision</button>}
        </form>}
      </aside>
    </div>
  </div>;
}
