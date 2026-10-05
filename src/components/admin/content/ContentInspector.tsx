'use client';
import { useRef, useState, type FormEvent } from 'react';
import { ArrowLeft } from 'lucide-react';
import { apiChangeMarketplaceItem, type ContentItem } from '@/api/contentWorkspace.api';
import { getApiErrorMessage } from '@/lib/api/errors';
import { ContentFacts, contentDate, contentTypeLabel } from './ContentFacts';

export default function ContentInspector({ item, onBack, onReload, onSaved }: { item: ContentItem; onBack: () => void; onReload: () => void; onSaved: () => void }) {
  const [action, setAction] = useState<'REMOVE' | 'RESTORE' | ''>('');
  const [reason, setReason] = useState('');
  const [review, setReview] = useState(false);
  const [ack, setAck] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const pending = useRef(false);
  const valid = reason.trim().length >= 10 && !!action && (action === 'REMOVE' ? item.canRemove : item.canRestore);
  async function submit(event: FormEvent) {
    event.preventDefault(); if (!valid || !review || !ack || !action || pending.current) return;
    pending.current = true; setSaving(true); setError('');
    try { await apiChangeMarketplaceItem(item, action, reason.trim()); onSaved(); }
    catch (cause) { setError(getApiErrorMessage(cause, 'The action could not be applied.')); }
    finally { pending.current = false; setSaving(false); }
  }
  return <div><button type="button" className="cw-back" onClick={onBack} disabled={saving}><ArrowLeft size={18} /> Back to all content</button><header className="cw-detail-header"><div className="cw-meta"><span>{contentTypeLabel(item.contentType)}</span><span className="cw-status">{item.visibility}</span></div><h2>{item.title}</h2><p>Published by {item.owner.name} · Created {contentDate(item.createdAt)}</p></header><div className="cw-detail-grid"><div><section className="cw-detail-section"><h3>{item.contentType === 'SERVICE_LISTING' ? 'Service details' : 'Request details'}</h3><p className="cw-prose">{item.description}</p><ContentFacts item={item} />{item.adminNotes && <p className="cw-prose">Last admin explanation: {item.adminNotes}</p>}</section><section className="cw-detail-section"><h3>Content owner</h3><p className="cw-prose">{item.owner.name} · {item.owner.email}</p><p className="cw-muted">Account: {item.owner.moderationStatus.toLowerCase()} · Trust {item.owner.trustScore}/100</p></section></div><aside className="cw-decision"><h3>Content action</h3><p className="cw-intro cw-muted">Use this view for a content check. Investigate reported violations in Needs review before applying an account penalty.</p>{item.actionBlock && <p className="cw-notice">{item.actionBlock}</p>}{!item.canRemove && !item.canRestore ? <p className="cw-prose cw-muted">No removal or restoration action is available for this content’s current state.</p> : <form onSubmit={submit}><fieldset disabled={saving || review} hidden={review}><legend>Choose an action</legend>{item.canRemove && <label className="cw-choice"><input type="radio" name="content-action" checked={action === 'REMOVE'} onChange={() => setAction('REMOVE')} /><span><strong>Remove from marketplace</strong><span>Hide this content. Existing bookings remain recorded.</span></span></label>}{item.canRestore && <label className="cw-choice"><input type="radio" name="content-action" checked={action === 'RESTORE'} onChange={() => setAction('RESTORE')} /><span><strong>Restore after review</strong><span>Make this content available again if it meets the current rules.</span></span></label>}<label className="cw-field">Reason<textarea required minLength={10} maxLength={1000} rows={4} value={reason} onChange={event => setReason(event.target.value)} /><small>The owner receives this explanation. Enter at least 10 characters.</small></label></fieldset>{error && <div className="cw-error" role="alert"><p>{error}</p><button type="button" className="cw-button" onClick={onReload}>Reload content</button></div>}{review ? <div className="cw-confirmation"><strong>{action === 'REMOVE' ? 'Remove this content?' : 'Restore this content?'}</strong><p>{reason.trim()}</p><p>The owner will be notified. Closed offers will not reopen. Bookings and payments stay unchanged.</p><label className="cw-acknowledge"><input type="checkbox" checked={ack} disabled={saving} onChange={event => setAck(event.target.checked)} /> I reviewed the impact.</label><button className={`cw-button ${action === 'REMOVE' ? 'cw-danger-button' : 'cw-primary'}`} disabled={!valid || !ack || saving}>{saving ? 'Applying…' : action === 'REMOVE' ? 'Remove content' : 'Restore content'}</button><button type="button" disabled={saving} className="cw-button" onClick={() => { setReview(false); setAck(false); }}>Edit decision</button></div> : <button type="button" className="cw-button cw-primary" disabled={!valid} onClick={() => setReview(true)}>Review action</button>}</form>}</aside></div></div>;
}
