'use client';

import FormSelect from '../../ui/FormSelect';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowUpRight, ShieldAlert } from 'lucide-react';
import { apiDecideContentCase, type ContentCaseDetail, type ContentDecision, type ContentPenalty } from '@/api/contentWorkspace.api';
import { getApiErrorMessage } from '@/lib/api/errors';
import { ContentFacts, accountStateLabel, contentStateLabel, contentDate, contentTypeLabel } from './ContentFacts';
import { InspectionFacts, InspectionPanel, InspectionTabs, InspectionText, inspectionStyles as styles } from '../InspectionLayout';

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
  const [tab, setTab] = useState('summary');
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
  const snapshotChanged = !!snapshot && !!item.content && (['title', 'description', 'category', 'price', 'priceType', 'budgetMin', 'budgetMax', 'urgency'] as const)
    .some(field => snapshot[field] !== item.content![field]);
  const resolved = item.status === 'RESOLVED';
  const contentActionLabels = { KEEP: 'Visibility unchanged', REMOVE: 'Removed from marketplace', RESTORE: 'Content restored', KEEP_REMOVED: 'Remains removed', GUIDANCE: 'Guidance sent' };
  const recordedOutcome = <InspectionPanel title="Recorded outcome" className={styles.result}>
    <InspectionFacts facts={[
      { label: 'Content action', value: item.decision ? contentActionLabels[item.decision] : 'No structured action recorded' },
      { label: 'Account action', value: item.penalty ? `${CONTENT_PENALTIES[item.penalty]}${item.penalty === 'suspend' && item.decisionResult?.suspensionDays ? ` (${item.decisionResult.suspensionDays} days)` : ''}` : 'Not recorded' },
      ...(item.decisionResult ? [
        { label: 'Content state after decision', value: contentStateLabel(item.decisionResult.contentStatus, item.decision === 'REMOVE' || item.decision === 'KEEP_REMOVED') },
        { label: 'Owner account after decision', value: accountStateLabel(item.decisionResult.ownerStatus) },
      ] : []),
    ]} />
    <div className={styles.resultReason}><h4>Admin explanation</h4><InspectionText text={item.resolution || 'No explanation was recorded.'} /></div>
    {!item.decision && <p className="cw-notice">This older case recorded an explanation. No content or account action is inferred from that text.</p>}
    {item.decidedAt && <p className={styles.resultTime}>Decided {contentDate(item.decidedAt)}</p>}
  </InspectionPanel>;

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

  return <div className={`cw-workroom ${styles.root}`}>
    <button type="button" className="cw-back" onClick={onBack} disabled={saving}><ArrowLeft size={18} /> Back to cases</button>
    <header className={styles.header}>
      <div className={styles.titleRow}><h2 ref={heading} tabIndex={-1}>{snapshot?.title || item.content?.title || 'Publication check appeal'}</h2><span>{resolved ? 'Case resolved' : 'Needs review'}</span></div>
      <InspectionFacts facts={[
        { label: 'Case type', value: item.caseType === 'REPORT' ? 'Content report' : 'Owner appeal' },
        { label: 'Content type', value: contentTypeLabel(item.contentType) },
        { label: item.caseType === 'REPORT' ? 'Reported by' : 'Appealed by', value: item.submitter.name },
        { label: 'Submitted', value: contentDate(item.createdAt) },
      ]} />
      {!resolved && <a className={`cw-button ${styles.jump}`} href="#content-decision-heading">Go to admin decision</a>}
    </header>
    <div className={resolved ? styles.single : styles.layout}>
      <div className={styles.main}>
        <InspectionTabs value={tab} onChange={setTab} tabs={[
          { id: 'summary', label: 'Case summary' }, ...(resolved ? [{ id: 'outcome', label: 'Recorded outcome' }] : []),
          { id: 'content', label: item.caseType === 'REPORT' ? 'Reported content' : 'Appealed content' },
          { id: 'people', label: 'People & bookings' }, { id: 'history', label: 'Admin history' },
        ]} />
        {tab === 'summary' && <div className={resolved ? styles.summaryGrid : styles.stack}>
          <InspectionPanel title={item.caseType === 'REPORT' ? 'What was reported' : 'Why the owner appealed'}><InspectionText text={item.reason} />
            <InspectionFacts facts={[
              { label: 'Content owner', value: owner?.name || snapshot?.ownerName || 'Unavailable' },
              { label: 'Current marketplace visibility', value: item.content?.visibility || 'Content unavailable' },
            ]} />
            <div className="cw-inline" style={{ marginTop: 16 }}><button type="button" className="cw-button" onClick={() => setTab('content')}>Review {item.caseType === 'REPORT' ? 'reported' : 'appealed'} content</button></div>
            {item.content?.actionBlock && <p className="cw-notice">{item.content.actionBlock}</p>}
          </InspectionPanel>
          {resolved && recordedOutcome}
        </div>}
        {tab === 'outcome' && resolved && recordedOutcome}
        {tab === 'content' && <InspectionPanel title={snapshot ? 'Original content at submission' : 'Current content'}>
          {!snapshot && <p className="cw-muted">An original copy was not saved for this older case.</p>}
          {snapshot || item.content ? <><InspectionText text={(snapshot || item.content)!.description} label="content" /><ContentFacts item={(snapshot || item.content)!} /></> : <p className="cw-prose cw-muted">No saved listing or request is available. Review the explanation and send guidance; publishing or penalizing an account is unavailable here.</p>}
          {snapshotChanged && <details className={styles.disclosure}><summary>View current version (changed since submission)</summary><h4>{item.content?.title}</h4><InspectionText text={item.content!.description} label="current content" /><ContentFacts item={item.content!} /></details>}
          {item.content && <InspectionFacts facts={[{ label: 'Current marketplace visibility', value: item.content.visibility }]} />}
          {item.content?.adminNotes && <div className={styles.resultReason}><h4>Latest content moderation reason</h4><InspectionText text={item.content.adminNotes} /></div>}
        </InspectionPanel>}
        {tab === 'people' && <div className={styles.stack}>
          <InspectionPanel title="People involved"><div className={styles.people}>
            <div className={styles.person}><h4>{item.caseType === 'REPORT' ? 'Reported by' : 'Appealed by'}</h4><strong>{item.submitter.name}</strong><p>{item.submitter.email}</p></div>
            {owner ? <div className={styles.person}><h4>Content owner</h4><strong>{owner.name}</strong><p>{owner.email}</p><InspectionFacts facts={[
              { label: 'Account status', value: accountStateLabel(owner.moderationStatus) }, { label: 'Trust score', value: `${owner.trustScore}/100` },
              { label: 'Residency verification', value: owner.verificationStatus === 'APPROVED' ? 'Verified resident' : 'Not verified' },
            ]} /><a className="cw-button" href={`/admin/users?search=${encodeURIComponent(owner.email)}`}>View owner account <ArrowUpRight size={14} /></a></div> : <p className="cw-muted">The original owner is unavailable; no account penalty can be applied.</p>}
          </div></InspectionPanel>
          <InspectionPanel title="Owner’s bookings and payments"><dl className={`${styles.facts} ${styles.obligations}`}>
            <div><dt>Unfinished bookings</dt><dd>{item.obligations.bookings}</dd></div><div><dt>Held payments</dt><dd>{item.obligations.heldPayments}</dd></div><div><dt>Pending payments / refunds</dt><dd>{item.obligations.pendingPayments}</dd></div>
          </dl><p className={styles.muted}>Content decisions do not cancel bookings or move money.</p>{owner && !!hasObligations && <a className="cw-button" href={`/admin/reports?userId=${encodeURIComponent(owner.id)}`}>Review owner’s bookings <ArrowUpRight size={14} /></a>}</InspectionPanel>
        </div>}
        {tab === 'history' && <InspectionPanel title="Recent admin actions for this owner">{item.history.length ? <ol className={styles.history}>{item.history.map(event => <li key={event.id}><div className={styles.historyLine}><strong>{event.action.toLowerCase().replaceAll('_', ' ').replace(/^./, letter => letter.toUpperCase())}</strong><time>{contentDate(event.createdAt)}</time></div><InspectionText text={event.reason} /></li>)}</ol> : <p className={styles.muted}>No previous content or account actions were found.</p>}<p className={styles.identifiers}>Case ID: {item.id}</p></InspectionPanel>}
      </div>
      {!resolved && <aside className={`cw-decision ${styles.decision}`} aria-labelledby="content-decision-heading">
        <h3 id="content-decision-heading" tabIndex={-1}>Admin decision</h3>
        <form onSubmit={submit}>
          <fieldset disabled={saving || reviewing} hidden={reviewing}><legend>Content outcome</legend>{item.allowedDecisions.map(value => <label className="cw-choice" key={value}><input type="radio" name="content-decision" value={value} checked={decision === value} onChange={() => { setDecision(value); setPenalty('none'); setAcknowledged(false); }} /><span><strong>{CONTENT_DECISIONS[value].title}</strong><span>{CONTENT_DECISIONS[value].description}</span></span></label>)}
            {canPenalize && <label className="cw-field">Account consequence for {owner?.name}<FormSelect value={penalty} onChange={event => setPenalty(event.target.value as ContentPenalty)}>{Object.entries(CONTENT_PENALTIES).map(([value, label]) => <option key={value} value={value} disabled={value === 'ban' && owner?.moderationStatus === 'BANNED' || value === 'suspend' && (owner?.moderationStatus !== 'ACTIVE' || !!item.obligations.unstartedProviderBookings)}>{label}</option>)}</FormSelect><small>A report alone is not proof. Apply a penalty only when your review establishes a violation.</small></label>}
            {canPenalize && item.obligations.unstartedProviderBookings > 0 && <p className="cw-notice">Temporary suspension is unavailable until this provider’s {item.obligations.unstartedProviderBookings} unstarted bookings are handled.</p>}
            {penalty === 'suspend' && <label className="cw-field">Suspension length<FormSelect value={days} onChange={event => setDays(Number(event.target.value))}>{[1,3,7,14,30].map(day => <option key={day} value={day}>{day} {day === 1 ? 'day' : 'days'}</option>)}</FormSelect></label>}
            {penalty === 'ban' && <p className="cw-notice cw-danger"><ShieldAlert size={18} /> The owner will lose normal account access. They can appeal the ban. Their bookings and payments remain for admin handling.</p>}
            <label className="cw-field">Decision explanation<textarea rows={5} required minLength={10} maxLength={1000} value={notes} onChange={event => setNotes(event.target.value)} placeholder="Explain what you found and why this action is appropriate." /><small>{notes.trim().length < 10 ? 'Enter at least 10 characters.' : 'The explanation will be shared and recorded in the audit log.'}</small></label>
          </fieldset>
          {error && <div className="cw-error" role="alert"><p>{error}</p><button type="button" className="cw-button" onClick={onReload} disabled={saving}>Reload case</button></div>}
          {reviewing && decision ? <div className="cw-confirmation"><h4 ref={confirmationHeading} tabIndex={-1}>Confirm the impact</h4><strong>{CONTENT_DECISIONS[decision].title}</strong><p>{CONTENT_DECISIONS[decision].description}</p><p>{canPenalize ? `${CONTENT_PENALTIES[penalty]}${penalty !== 'none' ? ` for ${owner?.name}` : ''}${penalty === 'suspend' ? ` for ${days} days` : ''}.` : 'No account penalty.'}</p><p>Your explanation: {notes.trim()}</p><p>The submitter will receive the outcome. Content owners will be notified of removals, restorations, or account consequences.</p><label className="cw-acknowledge"><input type="checkbox" checked={acknowledged} disabled={saving} onChange={event => setAcknowledged(event.target.checked)} /> I reviewed the content, account, and booking consequences.</label><button type="submit" className={`cw-button ${penalty === 'ban' || decision === 'REMOVE' ? 'cw-danger-button' : 'cw-primary'}`} disabled={!valid || !acknowledged || saving}>{saving ? 'Applying decision…' : 'Confirm decision'}</button><button type="button" className="cw-button" disabled={saving} onClick={() => { setReviewing(false); setAcknowledged(false); }}>Edit decision</button></div> : <button type="button" className="cw-button cw-primary" disabled={!valid} onClick={() => setReviewing(true)}>Review decision</button>}
        </form>
      </aside>}
    </div>
  </div>;
}
