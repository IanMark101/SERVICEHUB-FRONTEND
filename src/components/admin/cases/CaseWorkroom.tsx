'use client';

import FormSelect from '../../ui/FormSelect';
import TrustScoreBadge from '../../ui/TrustScoreBadge';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowSquareOut, ChatCircle, FileImage, ShieldCheck, Warning } from '@phosphor-icons/react';
import { apiAccessReportEvidence, apiGetAdminBookingMessages } from '@/api/admin.api';
import { getApiErrorMessage } from '@/lib/api/errors';
import { CASE_TYPES, CONCERNS, DECISIONS, PENALTIES, caseStatusLabel, dateLabel, money, stateLabel } from './labels';
import type { CancellationFault, CaseMessage, CaseParty, ModerationCase, Penalty } from './types';

export default function CaseWorkroom({ item, onBack, onResolve, submitting, error }: {
  item: ModerationCase; onBack: () => void; onResolve: (outcome: string, penalty: Penalty, notes: string, fault?: CancellationFault) => Promise<void>;
  submitting: boolean; error: string;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  const confirmationHeading = useRef<HTMLHeadingElement>(null);
  const [tab, setTab] = useState('overview');
  const [outcome, setOutcome] = useState(item.resolutionOperation && item.allowedOutcomes.length === 1 ? item.allowedOutcomes[0] : '');
  const [penalty, setPenalty] = useState<Penalty>((item.resolutionOperation?.requestedPenalty as Penalty) || 'none');
  const [cancellationFault, setCancellationFault] = useState<CancellationFault | ''>(() => {
    const saved = item.resolutionOperation?.requestedPenalty;
    return saved === 'cancellation_fault_seeker' ? 'seeker' : saved === 'cancellation_fault_provider' ? 'provider' : item.resolutionOperation ? 'none' : '';
  });
  const [notes, setNotes] = useState(item.resolutionOperation?.notes || '');
  const [review, setReview] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [messages, setMessages] = useState<CaseMessage[] | null>(null);
  const [messageError, setMessageError] = useState('');
  const [messageLoading, setMessageLoading] = useState(false);
  const [evidenceError, setEvidenceError] = useState('');
  const [evidenceLoading, setEvidenceLoading] = useState(false);
  const active = ['PENDING', 'UNDER_REVIEW'].includes(item.status);
  const locked = !!item.resolutionOperation && ['PROCESSING', 'FAILED_RETRYABLE'].includes(item.resolutionOperation.status);
  const canPenalize = !!outcome && item.source === 'report' && item.type !== 'CANCELLATION_ESCALATION' && outcome !== 'dismiss';
  const financial = ['cancel_booking', 'refund_seeker', 'release_provider_and_complete', 'approve_cancellation'].includes(outcome);
  const blocked = financial && !!item.otherBlockingCases && !locked;
  const cancellationApproval = item.type === 'CANCELLATION_ESCALATION' && outcome === 'approve_cancellation';
  const valid = !!outcome && item.allowedOutcomes.includes(outcome) && notes.trim().length >= 3 && notes.trim().length <= 2000 && !blocked && (!cancellationApproval || cancellationFault !== '');
  const faultName = cancellationFault === 'provider' ? item.booking.provider.name : cancellationFault === 'seeker' ? item.booking.seeker.name : '';
  const consequence = cancellationApproval && cancellationFault && cancellationFault !== 'none'
    ? `${faultName} is found at fault for ending started work. Only this participant’s trust score will decrease.`
    : canPenalize && penalty !== 'none' ? `${PENALTIES[penalty]} for ${item.reportedUser?.name}.` : 'No account penalty.';
  const confirmDecision = () => cancellationApproval
    ? onResolve(outcome, 'none', notes.trim(), cancellationFault || 'none')
    : onResolve(outcome, canPenalize ? penalty : 'none', notes.trim());
  const escalation = item.type === 'CANCELLATION_ESCALATION' || item.type === 'COMPLETION_ESCALATION';

  useEffect(() => { heading.current?.focus(); }, []);
  useEffect(() => { if (review) confirmationHeading.current?.focus(); }, [review]);
  async function loadMessages() {
    setMessageLoading(true); setMessageError('');
    try { const response = await apiGetAdminBookingMessages(item.booking.id); setMessages(response.data?.messages || []); }
    catch (cause) { setMessageError(getApiErrorMessage(cause, 'Messages could not be loaded. Try again.')); }
    finally { setMessageLoading(false); }
  }
  async function openEvidence() {
    const preview = window.open('about:blank', '_blank');
    if (preview) preview.opener = null;
    setEvidenceLoading(true); setEvidenceError('');
    try {
      const response = await apiAccessReportEvidence(item.id, 'view');
      if (preview) preview.location.href = response.data.url;
      else setEvidenceError('Your browser blocked the evidence window. Allow pop-ups and try again.');
    } catch (cause) { preview?.close(); setEvidenceError(getApiErrorMessage(cause, 'Evidence could not be opened. Try again.')); }
    finally { setEvidenceLoading(false); }
  }
  function chooseTab(value: string) { setTab(value); if (value === 'messages' && messages === null && !messageLoading) void loadMessages(); }
  function person(party: CaseParty, role: string) {
    return <div className="case-person" key={party.id}><div><span className="case-muted">{role}</span><p className="case-person-name">{party.name}</p></div><div className="case-person-meta"><span><ShieldCheck size={16} aria-hidden /> {stateLabel(party.verificationStatus)}</span><TrustScoreBadge score={party.trustScore} />{party.moderationStatus !== 'ACTIVE' && <strong className="case-danger-text">{stateLabel(party.moderationStatus)}</strong>}<a href={`/admin/users?search=${encodeURIComponent(party.name)}`} className="case-text-link">Find account <ArrowSquareOut size={14} aria-hidden /></a></div></div>;
  }

  return <div className="case-workroom">
    <button type="button" className="case-back" onClick={onBack} disabled={submitting}><ArrowLeft size={18} aria-hidden /> Back to cases</button>
    <header className="case-workroom-header">
      <div className="case-header-line"><span className={`case-status ${active ? 'case-status-active' : ''}`}>{caseStatusLabel(item)}</span><span className="case-muted">{CASE_TYPES[item.type]}</span></div>
      <h2 ref={heading} tabIndex={-1}>{CONCERNS[item.concern] || stateLabel(item.concern)}</h2>
      <p className="case-service-title">{item.booking.title}</p>
      <p className="case-muted">Submitted by {item.reporter.name} ({item.submittedByRole}) on {dateLabel(item.createdAt)}</p>
      <p className="case-id">Case {item.id}</p>
      {active && <a className="case-button case-decision-jump" href="#case-decision-heading">Go to decision</a>}
    </header>
    <div className="case-workroom-grid">
      <div className="case-workroom-content">
        <nav className="case-tabs" aria-label="Case sections">{[['overview','Overview'], ['messages',`Messages (${item.booking.messageCount})`], ['evidence','Evidence'], ['history','History']].map(([value,label]) => <button key={value} type="button" aria-current={tab === value ? 'page' : undefined} onClick={() => chooseTab(value)}>{label}</button>)}</nav>
        {tab === 'overview' && <div>
          <section className="case-detail-section"><h3>{escalation ? 'Why Admin help is needed' : 'What was reported'}</h3>{escalation && <p className="case-muted">{item.type === 'COMPLETION_ESCALATION' ? 'The provider is asking for help with completion confirmation. This request is not a report of wrongdoing.' : 'The participants need an Admin decision on a cancellation. This request alone does not establish misconduct.'}</p>}<p className="case-muted">{item.type === 'COMPLETION_ESCALATION' ? 'Provider’s explanation' : `${item.submittedByRole}’s explanation`}</p><p className="case-explanation">{item.explanation}</p>
            {item.cancellation && <dl className="case-facts"><div><dt>Cancellation reason</dt><dd>{item.cancellation.reason}</dd></div><div><dt>Other participant’s response</dt><dd>{item.cancellation.response || 'No written response recorded.'}</dd></div></dl>}
          </section>
          <section className="case-detail-section"><h3>People involved</h3>{person(item.booking.seeker, `Seeker${item.reporter.id === item.booking.seeker.id ? ' / submitted this case' : item.reportedUser?.id === item.booking.seeker.id ? ' / reported participant' : ''}`)}{person(item.booking.provider, `Provider${item.reporter.id === item.booking.provider.id ? ' / submitted this case' : item.reportedUser?.id === item.booking.provider.id ? ' / reported participant' : ''}`)}</section>
          <section className="case-detail-section"><h3>Booking &amp; payment</h3><dl className="case-facts"><div><dt>Service</dt><dd>{item.booking.title}</dd></div><div><dt>Agreed price</dt><dd className="case-amount">{money(item.booking.amount)}</dd></div><div><dt>Booking</dt><dd>{item.booking.statusBeforeDispute && <span className="case-muted">{stateLabel(item.booking.statusBeforeDispute)} → </span>}{stateLabel(item.booking.status)}</dd></div><div><dt>Payment method</dt><dd>{item.booking.paymentMethod}{item.booking.paymentMethod === 'GCash' && <small>PayMongo Test Mode</small>}</dd></div><div><dt>Payment state</dt><dd>{stateLabel(item.booking.paymentStatus)}</dd></div><div><dt>Workload</dt><dd>{item.booking.queue ? `${stateLabel(item.booking.queue.status)} / position ${item.booking.queue.position}` : item.booking.paymentMethod === 'On-site Cash' ? 'Direct cash arrangement, no paid queue' : 'No paid queue position recorded'}</dd></div></dl><p className="case-id">Booking {item.booking.id}</p></section>
          <section className="case-detail-section"><h3>Evidence to review</h3><p className="case-muted">The conversation and attachments belong to this booking.</p><div className="case-inline-actions"><button className="case-button" onClick={() => chooseTab('messages')}><ChatCircle size={18} aria-hidden /> Review messages</button><button className="case-button" onClick={() => chooseTab('evidence')}><FileImage size={18} aria-hidden /> {item.hasPrivateEvidence || item.evidenceUrl ? 'View submitted evidence' : 'Check evidence'}</button></div></section>
        </div>}
        {tab === 'messages' && <section className="case-detail-section"><h3>Booking conversation</h3><p className="case-muted">Only messages from this booking are shown. Access is audit logged.</p>{messageLoading ? <div className="case-loading" role="status">Loading booking messages…</div> : messageError ? <div className="case-error" role="alert">{messageError}<button className="case-button" onClick={() => void loadMessages()}>Retry messages</button></div> : messages?.length ? <ol className="case-messages">{messages.map(message => <li key={message.id}><div className="case-message-meta"><strong>{message.isSystem ? 'ServiceHub' : message.sender?.name || (message.senderId === item.booking.seeker.id ? item.booking.seeker.name : message.senderId === item.booking.provider.id ? item.booking.provider.name : 'Booking participant')}</strong><time dateTime={message.createdAt}>{dateLabel(message.createdAt)}</time></div><p>{message.content}</p>{message.imageUrl && <a className="case-text-link" href={message.imageUrl} target="_blank" rel="noopener noreferrer">View message attachment <ArrowSquareOut size={16} aria-hidden /></a>}</li>)}</ol> : <p className="case-empty-small">No messages have been sent in this booking.</p>}</section>}
        {tab === 'evidence' && <section className="case-detail-section"><h3>Submitted evidence</h3>{item.hasPrivateEvidence ? <><p className="case-muted">Private attachment. Opening it is audit logged and the access link expires after five minutes.</p><button className="case-button mt-4" disabled={evidenceLoading} onClick={() => void openEvidence()}>{evidenceLoading ? 'Opening evidence…' : 'Open private evidence'}<ArrowSquareOut size={18} aria-hidden /></button></> : item.evidenceUrl ? <a className="case-text-link" href={item.evidenceUrl} target="_blank" rel="noopener noreferrer">Open submitted attachment <ArrowSquareOut size={18} aria-hidden /></a> : <p className="case-empty-small">No separate attachment was submitted. Review the explanation and booking conversation before deciding.</p>}{evidenceError && <p className="case-error" role="alert">{evidenceError}</p>}</section>}
        {tab === 'history' && <section className="case-detail-section"><h3>Case history</h3><ol className="case-history"><li><strong>Case submitted</strong><p>{dateLabel(item.createdAt)} by {item.reporter.name}</p></li>{[...(item.history || [])].reverse().map(entry => <li key={entry.id}><strong>{stateLabel(entry.action)}</strong><p>{dateLabel(entry.createdAt)}{entry.actor ? ` by ${entry.actor.name}` : ''}</p>{entry.reason && <p className="case-history-reason">{entry.reason}</p>}</li>)}</ol>{(item.history?.length || 0) >= 30 && <a href="/admin/audit-logs" className="case-text-link">View earlier actions in the audit log</a>}</section>}
      </div>
      <aside className="case-decision" aria-labelledby="case-decision-heading"><h3 id="case-decision-heading" tabIndex={-1}>{active ? 'Admin decision' : 'Recorded decision'}</h3>
        {!active ? <><p className="case-muted">Closed {item.resolvedAt ? dateLabel(item.resolvedAt) : ''}</p><p className="case-explanation">{item.decisionExplanation || item.resolutionOperation?.notes || (item.resolution ? stateLabel(item.resolution) : 'This case is closed. No further decision is required.')}</p><p className="case-muted">Booking and payment states above show the current transaction.</p></> : <>
          <p className="case-muted">Review the concern and evidence before recording a decision.</p>
          {!!item.otherBlockingCases && <p className="case-notice"><Warning size={18} aria-hidden /> {item.otherBlockingCases} other active case(s) affect this booking. Financial decisions may require resolving those first.</p>}
          {locked && <p className="case-notice">A decision has already started. Resume the same outcome and account penalty to avoid duplicate payment actions.</p>}
          {item.resolutionOperation?.lastError && <p className="case-error">Previous attempt: {item.resolutionOperation.lastError}</p>}
          {!item.allowedOutcomes.length ? <p className="case-error">No valid decision is available. The case or booking may have changed; refresh it before continuing.</p> : <form onSubmit={event => { event.preventDefault(); if (valid) { setReview(true); setAcknowledged(false); } }}>
            <fieldset disabled={submitting || review} className="case-decision-fields"><legend className="sr-only">Choose a case outcome</legend>{item.allowedOutcomes.map(value => <label key={value} className={`case-choice ${outcome === value ? 'case-choice-selected' : ''}`}><input type="radio" name="outcome" value={value} checked={outcome === value} disabled={locked && value !== item.allowedOutcomes[0]} onChange={() => { setOutcome(value); if (value === 'dismiss') setPenalty('none'); }} /><span><strong>{DECISIONS[value]?.title || stateLabel(value)}</strong><span>{DECISIONS[value]?.description || 'Resume the previously recorded decision.'}</span></span></label>)}
              {canPenalize && <label className="case-field">Account consequence for {item.reportedUser?.name}<FormSelect value={penalty} disabled={locked} onChange={event => setPenalty(event.target.value as Penalty)}>{Object.entries(PENALTIES).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</FormSelect><small>Apply a penalty only when the evidence establishes that this participant was at fault.</small></label>}
              {cancellationApproval && <label className="case-field">Who was at fault? <span className="case-muted">(required)</span><FormSelect value={cancellationFault} disabled={locked} onChange={event => setCancellationFault(event.target.value as CancellationFault)}><option value="">Choose a finding</option><option value="none">No one found at fault</option><option value="seeker" disabled={item.booking.started === false}>Seeker — {item.booking.seeker.name}</option><option value="provider" disabled={item.booking.started === false}>Provider — {item.booking.provider.name}</option></FormSelect><small>{item.booking.started === false ? 'No cancellation penalty applies before work starts.' : 'Choose a participant only when the evidence establishes fault. A mutual cancellation does not lower either score.'}</small></label>}
              {penalty === 'ban' && <p className="case-notice">This account immediately loses normal access. Its remaining bookings stay recorded and need Admin handling. The user retains the ban-appeal path.</p>}
              {penalty === 'suspend' && <p className="case-notice">Resolve the provider’s unstarted bookings before suspension. Existing history and obligations remain recorded.</p>}
              <label className="case-field">Decision explanation <span className="case-muted">(required)</span><textarea rows={5} minLength={3} maxLength={2000} required value={notes} onChange={event => setNotes(event.target.value)} placeholder="Explain what the evidence supports and why this outcome is appropriate." /><small>{notes.trim().length < 3 ? 'Enter at least 3 characters.' : 'This explanation is audit logged.'} {item.source === 'report' ? 'It is also shared with both participants.' : ''}</small></label>
            </fieldset>
            {error && <p className="case-error" role="alert">{error}</p>}
            {blocked && <p className="case-error">Resolve the other active cases before applying this financial outcome.</p>}
            {review ? <div className="case-confirmation"><h4 ref={confirmationHeading} tabIndex={-1}>Confirm the impact</h4><strong>{DECISIONS[outcome]?.title}</strong><p>{DECISIONS[outcome]?.description}</p><p>{consequence} Both booking participants will be notified. The reason and action are recorded in the audit log.</p>{item.booking.paymentMethod === 'GCash' && financial && <p>Online payment uses PayMongo Test Mode. This does not make a real GCash transfer.</p>}<label className="case-acknowledge"><input type="checkbox" checked={acknowledged} onChange={event => setAcknowledged(event.target.checked)} disabled={submitting} /> I reviewed the booking, payment and account consequences.</label><button type="button" className="case-button case-primary" disabled={!acknowledged || !valid || submitting} onClick={() => void confirmDecision()}>{submitting ? 'Saving decision…' : 'Confirm decision'}</button><button type="button" className="case-button" disabled={submitting} onClick={() => setReview(false)}>Edit decision</button></div> : <button className="case-button case-primary" disabled={!valid || submitting}>Review decision</button>}
          </form>}
        </>}
      </aside>
    </div>
  </div>;
}
