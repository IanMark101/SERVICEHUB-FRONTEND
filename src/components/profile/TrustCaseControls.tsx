'use client';

import { useCallback, useEffect, useId, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { apiSubmitTrustCase, apiListTrustCases, apiRespondTrustCase, apiDecideTrustCase, apiRespondReview, type TrustCaseItem, type ReviewViolation } from '../../api/trust.api';
import { getApiErrorMessage } from '../../lib/api/errors';
import { useApiCacheRefresh } from '../../hooks/useApiCacheRefresh';
import { apiGetAdminBookingMessages } from '../../api/admin.api';
import type { CaseMessage } from '../admin/cases/types';
import FormSelect from '../ui/FormSelect';

const inputClass = 'w-full min-w-0 rounded-lg border border-[color:var(--workspace-border)] bg-[color:var(--workspace-surface)] p-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2';
const buttonClass = 'inline-flex min-h-11 items-center justify-center rounded-lg border border-[color:var(--workspace-border)] px-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50';

export function TrustCaseForm({ reviewId, trustEventId }: { reviewId?: string; trustEventId?: string }) {
  const id = useId(); const [open, setOpen] = useState(false); const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [sent, setSent] = useState(false);
  if (sent) return <p role="status" className="text-sm leading-6">Case submitted. Follow its decision in your Trust History.</p>;
  return <div className="space-y-3">
    <button type="button" className={buttonClass} aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>{reviewId ? 'Report review policy violation' : 'Appeal trust penalty'}</button>
    {open && <form id={id} className="space-y-3" onSubmit={async event => {
      event.preventDefault(); if (busy || description.trim().length < 20) return;
      setBusy(true); setError('');
      try { await apiSubmitTrustCase({ reviewId, trustEventId, description: description.trim() }); setSent(true); }
      catch (cause) { setError(getApiErrorMessage(cause, 'The case could not be submitted. Try again.')); }
      finally { setBusy(false); }
    }}>
      <label htmlFor={`${id}-reason`} className="block text-sm font-semibold">{reviewId ? 'Policy violation and supporting details' : 'Why the penalty should be corrected'}</label>
      <p className="text-sm leading-6">{reviewId ? 'Explain threats, manipulation, harassment, irrelevant content, or fabricated participation. Disagreeing with a rating is not grounds for removal.' : 'Explain the finding you dispute and identify relevant booking messages or evidence. Submitting an appeal does not change your score immediately.'} At least 20 characters. Do not include identity documents or passwords.</p>
      <textarea id={`${id}-reason`} required minLength={20} maxLength={2000} rows={4} className={inputClass} value={description} onChange={event => setDescription(event.target.value)} />
      {error && <p role="alert" className="text-sm text-red-600 dark:text-red-300">{error}</p>}
      <button className={buttonClass} disabled={busy || description.trim().length < 20}>{busy ? 'Submitting case…' : 'Submit for admin review'}</button>
    </form>}
  </div>;
}

export function ReviewResponseForm({ reviewId, initialResponse }: { reviewId: string; initialResponse?: string }) {
  const id = useId(); const [open, setOpen] = useState(false); const [response, setResponse] = useState(initialResponse || '');
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [saved, setSaved] = useState(initialResponse || '');
  return <div className="space-y-3">
    <button type="button" className={buttonClass} aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>Respond publicly to review</button>
    {saved && <p className="text-sm leading-6">Member’s response: {saved}</p>}
    {open && <form id={id} className="space-y-3" onSubmit={async event => {
      event.preventDefault(); if (busy || response.trim().length < 10) return;
      setBusy(true); setError('');
      try { await apiRespondReview(reviewId, response.trim()); setSaved(response.trim()); setOpen(false); }
      catch (cause) { setError(getApiErrorMessage(cause, 'The response could not be saved. Try again.')); }
      finally { setBusy(false); }
    }}>
      <label htmlFor={`${id}-text`} className="block text-sm font-semibold">Public response (10–1,000 characters)</label>
      <textarea id={`${id}-text`} required minLength={10} maxLength={1000} rows={3} className={inputClass} value={response} onChange={event => setResponse(event.target.value)} />
      {error && <p role="alert" className="text-sm text-red-600 dark:text-red-300">{error}</p>}
      <button className={buttonClass} disabled={busy || response.trim().length < 10}>{busy ? 'Saving response…' : 'Publish response'}</button>
    </form>}
  </div>;
}

export function TrustCasesPanel({ admin = false }: { admin?: boolean }) {
  const [items, setItems] = useState<TrustCaseItem[]>([]); const [page, setPage] = useState(1); const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const load = useCallback(async () => { setLoading(true); setError('');
    try { const result = await apiListTrustCases(admin, page); setItems(result.data); setPages(Math.max(1, result.pagination.totalPages)); }
    catch (cause) { setError(getApiErrorMessage(cause, 'Cases could not load. Try again.')); }
    finally { setLoading(false); }
  }, [admin, page]);
  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);
  useApiCacheRefresh(['reviews', 'admin'], () => load(), !loading);
  return <section aria-label="Review disputes and trust appeals" className="space-y-4 rounded-xl border border-[color:var(--workspace-border)] p-5 sm:p-6">
    <h2 className="text-lg font-bold">Review disputes and trust appeals</h2>
    <button type="button" className={buttonClass} disabled={loading} onClick={() => void load()}>Refresh cases</button>
    <p className="text-sm leading-6">{admin ? 'Review both explanations and booking evidence. The review author has 48 hours to respond before a dispute can be upheld, unless they respond earlier. Genuine criticism stays visible. Upholding a penalty appeal reverses the original deduction once.' : 'Track your cases and respond to a dispute about a review you wrote. Review authors have 48 hours to explain before a dispute can be upheld. Ratings and pending cases do not change Trust Score.'}</p>
    {error && <div role="alert"><p className="text-sm">{error}</p><button className={buttonClass} onClick={() => void load()}>Retry loading cases</button></div>}
    {loading ? <p role="status">Loading cases…</p> : !items.length && !error ? <p className="text-sm">No cases yet.</p> : items.map(item => <TrustCaseDecision key={item.id} item={item} admin={admin} onSaved={load} />)}
    {pages > 1 && <nav aria-label="Case pages" className="flex flex-wrap items-center gap-3">
      <button className={buttonClass} disabled={page === 1 || loading} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page} of {pages}</span>
      <button className={buttonClass} disabled={page === pages || loading} onClick={() => setPage(page + 1)}>Next</button>
    </nav>}
  </section>;
}

function TrustCaseDecision({ item, admin, onSaved }: { item: TrustCaseItem; admin: boolean; onSaved: () => Promise<void> }) {
  const { user } = useApp(); const id = useId(); const [text, setText] = useState('');
  const [uphold, setUphold] = useState(false); const [violation, setViolation] = useState<ReviewViolation>('MANIPULATION');
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const canRespond = !admin && item.respondentId === user?.id && item.status === 'PENDING';
  const bookingId = item.trustEvent?.bookingId || item.review?.completedService.bookingId;
  return <article className="space-y-3 border-t border-[color:var(--workspace-border)] pt-4 [overflow-wrap:anywhere]">
    <h3 className="text-sm font-bold">{item.review ? 'Review policy dispute' : 'Trust penalty appeal'} — {item.status === 'UPHELD' ? 'Appeal upheld' : item.status === 'REJECTED' ? 'Appeal rejected' : 'Pending review'}</h3>
    {admin && <p className="text-sm">Submitted by {item.user.name}{item.respondent ? `; other participant: ${item.respondent.name}` : ''}</p>}
    {item.review && <p className="text-sm">Review: {item.review.rating}/5 — {item.review.text || 'No written feedback'}</p>}
    {item.trustEvent && <p className="text-sm">Original finding: {item.trustEvent.reason} ({item.trustEvent.delta} points)</p>}
    <p className="whitespace-pre-wrap text-sm leading-6">{item.description}</p>
    {item.response && <p className="whitespace-pre-wrap text-sm leading-6">Other participant’s explanation: {item.response}</p>}
    {item.decisionReason && <p className="whitespace-pre-wrap text-sm leading-6">Admin decision: {item.decisionReason}</p>}
    {admin && bookingId && <><a className={`${buttonClass} break-all`} href={`/admin/reports?booking=${encodeURIComponent(bookingId)}`}>Inspect booking cases</a><TrustCaseMessages bookingId={bookingId} /></>}
    {(canRespond || (admin && item.status === 'PENDING')) && <form className="space-y-3" onSubmit={async event => {
      event.preventDefault(); if (busy || text.trim().length < 20) return;
      setBusy(true); setError('');
      try { if (admin) await apiDecideTrustCase(item.id, { uphold, reason: text.trim(), violation: uphold && item.review ? violation : undefined });
        else await apiRespondTrustCase(item.id, text.trim()); await onSaved(); }
      catch (cause) { setError(getApiErrorMessage(cause, 'The explanation or decision could not be saved.')); }
      finally { setBusy(false); }
    }}>
      {admin && <><label htmlFor={`${id}-decision`} className="block text-sm font-semibold">Decision</label>
        <FormSelect id={`${id}-decision`} tone="admin" className={inputClass} value={String(uphold)} onChange={event => setUphold(event.target.value === 'true')}>
          <option value="false">{item.review ? 'Reject — keep review' : 'Reject — keep penalty'}</option><option value="true">{item.review ? 'Uphold — hide review' : 'Uphold — reverse penalty'}</option>
        </FormSelect>
        {uphold && item.review && <><label htmlFor={`${id}-violation`} className="block text-sm font-semibold">Review policy violated</label><FormSelect id={`${id}-violation`} tone="admin" className={inputClass} value={violation} onChange={event => setViolation(event.target.value as ReviewViolation)}>
          <option value="MANIPULATION">Manipulation or threats</option><option value="HARASSMENT">Harassment or abuse</option><option value="FABRICATED">Fabricated participation</option><option value="IRRELEVANT">Unrelated content</option><option value="OTHER_POLICY">Other policy violation</option>
        </FormSelect></>}
      </>}
      <label htmlFor={`${id}-reason`} className="block text-sm font-semibold">{admin ? 'Finding and supporting evidence' : 'Your explanation'} (at least 20 characters)</label>
      <textarea id={`${id}-reason`} className={inputClass} required minLength={20} maxLength={2000} rows={3} value={text} onChange={event => setText(event.target.value)} />
      {error && <p role="alert" className="text-sm text-red-600 dark:text-red-300">{error}</p>}
      <button className={buttonClass} disabled={busy || text.trim().length < 20}>{busy ? 'Saving…' : admin ? 'Record decision' : 'Send explanation'}</button>
    </form>}
  </article>;
}

function TrustCaseMessages({ bookingId }: { bookingId: string }) {
  const id = useId(); const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<CaseMessage[] | null>(null);
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  async function load() {
    setBusy(true); setError('');
    try { const result = await apiGetAdminBookingMessages(bookingId); setMessages(result.data?.messages || []); }
    catch (cause) { setError(getApiErrorMessage(cause, 'Booking messages could not load. Try again.')); }
    finally { setBusy(false); }
  }
  return <div className="space-y-3">
    <button type="button" className={buttonClass} aria-expanded={open} aria-controls={id} onClick={() => { setOpen(!open); if (!open && messages === null && !busy) void load(); }}>{open ? 'Hide booking messages' : 'View booking messages'}</button>
    {open && <div id={id} className="max-h-80 space-y-3 overflow-y-auto rounded-lg border border-[color:var(--workspace-border)] p-3">
      {busy && <p role="status" className="text-sm">Loading booking messages…</p>}
      {error && <div role="alert"><p className="text-sm">{error}</p><button type="button" className={buttonClass} onClick={() => void load()}>Retry messages</button></div>}
      {!busy && !error && messages?.length === 0 && <p className="text-sm">No messages have been sent in this booking.</p>}
      {messages?.map(message => <div key={message.id} className="space-y-1 border-b border-[color:var(--workspace-border)] pb-3 text-sm">
        <p className="font-semibold">{message.isSystem ? 'System' : message.sender?.name || 'Participant'} · {new Date(message.createdAt).toLocaleString()}</p>
        <p className="whitespace-pre-wrap leading-6 [overflow-wrap:anywhere]">{message.content}</p>
      </div>)}
    </div>}
  </div>;
}
