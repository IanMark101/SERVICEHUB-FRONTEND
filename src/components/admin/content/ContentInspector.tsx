'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { apiChangeMarketplaceItem, type ContentItem } from '@/api/contentWorkspace.api';
import { getApiErrorMessage } from '@/lib/api/errors';
import { ContentFacts, accountStateLabel, contentStateLabel, contentDate, contentTypeLabel } from './ContentFacts';
import { InspectionFacts, InspectionPanel, InspectionTabs, InspectionText, inspectionStyles as styles } from '../InspectionLayout';

export default function ContentInspector({ item, onBack, onReload, onSaved }: { item: ContentItem; onBack: () => void; onReload: () => void; onSaved: () => void }) {
  const [action, setAction] = useState<'REMOVE' | 'RESTORE' | ''>('');
  const [reason, setReason] = useState('');
  const [review, setReview] = useState(false);
  const [ack, setAck] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('content');
  const pending = useRef(false);
  const confirmationHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { if (review) confirmationHeading.current?.focus(); }, [review]);
  const valid = reason.trim().length >= 10 && !!action && (action === 'REMOVE' ? item.canRemove : item.canRestore);
  async function submit(event: FormEvent) {
    event.preventDefault(); if (!valid || !review || !ack || !action || pending.current) return;
    pending.current = true; setSaving(true); setError('');
    try { await apiChangeMarketplaceItem(item, action, reason.trim()); onSaved(); }
    catch (cause) { setError(getApiErrorMessage(cause, 'The action could not be applied.')); }
    finally { pending.current = false; setSaving(false); }
  }
  return <div className={styles.root}>
    <button type="button" className="cw-back" onClick={onBack} disabled={saving}><ArrowLeft size={18} /> Back to all content</button>
    <header className={styles.header}>
      <div className={styles.titleRow}><h2>{item.title}</h2><span>{item.visibility}</span></div>
      <InspectionFacts facts={[
        { label: 'Content type', value: contentTypeLabel(item.contentType) }, { label: 'Content owner', value: item.owner.name },
        { label: 'Created', value: contentDate(item.createdAt) }, { label: 'Last updated', value: contentDate(item.updatedAt) },
      ]} />
      <a className={`cw-button ${styles.jump}`} href="#inspect-action-heading">Go to content action</a>
    </header>
    <div className={styles.layout}>
      <div className={styles.main}>
        <InspectionTabs value={tab} onChange={setTab} label="Content inspection sections" tabs={[{ id: 'content', label: 'Content details' }, { id: 'owner', label: 'Owner account' }, { id: 'status', label: 'Publication status' }]} />
        {tab === 'content' && <InspectionPanel title={item.contentType === 'SERVICE_LISTING' ? 'Service listing' : 'Seeker request'}><InspectionText text={item.description} label="content" /><ContentFacts item={item} /></InspectionPanel>}
        {tab === 'owner' && <InspectionPanel title="Content owner"><div className={styles.person}><strong>{item.owner.name}</strong><p>{item.owner.email}</p><InspectionFacts facts={[
          { label: 'Account status', value: accountStateLabel(item.owner.moderationStatus) }, { label: 'Trust score', value: `${item.owner.trustScore}/100` },
          { label: 'Residency verification', value: item.owner.verificationStatus === 'APPROVED' ? 'Verified resident' : 'Not verified' },
        ]} /><a className="cw-button" href={`/admin/users?search=${encodeURIComponent(item.owner.email)}`}>View owner account <ArrowUpRight size={14} /></a></div></InspectionPanel>}
        {tab === 'status' && <InspectionPanel title="Publication status"><InspectionFacts facts={[
          { label: 'Marketplace visibility', value: item.visibility }, { label: 'Content state', value: contentStateLabel(item.status, item.moderationReasonCode === 'ADMIN_REMOVED') },
          { label: 'Removal available', value: item.canRemove ? 'Yes' : 'No' }, { label: 'Restoration available', value: item.canRestore ? 'Yes' : 'No' },
        ]} />{item.adminNotes && <div className={styles.resultReason}><h4>Latest admin explanation</h4><InspectionText text={item.adminNotes} /></div>}<p className={styles.identifiers}>Content ID: {item.id}</p></InspectionPanel>}
      </div>
      <aside className={`cw-decision ${styles.decision}`} aria-labelledby="inspect-action-heading"><h3 id="inspect-action-heading" tabIndex={-1}>Content action</h3>
        {item.actionBlock && <><p className="cw-notice">{item.actionBlock}</p><a className="cw-button" href={`/admin/reports?userId=${encodeURIComponent(item.owner.id)}`}>Review owner’s bookings <ArrowUpRight size={14} /></a></>}
        {!item.canRemove && !item.canRestore ? <p className="cw-prose cw-muted">No removal or restoration action is available for this content’s current state.</p> : <form onSubmit={submit}>
          <fieldset disabled={saving || review} hidden={review}><legend>Choose an action</legend>
            {item.canRemove && <label className="cw-choice"><input type="radio" name="content-action" checked={action === 'REMOVE'} onChange={() => setAction('REMOVE')} /><span><strong>Remove from marketplace</strong><span>Hide this content. Existing bookings remain recorded.</span></span></label>}
            {item.canRestore && <label className="cw-choice"><input type="radio" name="content-action" checked={action === 'RESTORE'} onChange={() => setAction('RESTORE')} /><span><strong>Restore after review</strong><span>Make this content available again if it meets the current rules.</span></span></label>}
            <label className="cw-field">Reason<textarea required minLength={10} maxLength={1000} rows={4} value={reason} onChange={event => setReason(event.target.value)} /><small>The owner receives this explanation. Enter at least 10 characters.</small></label>
          </fieldset>
          {error && <div className="cw-error" role="alert"><p>{error}</p><button type="button" className="cw-button" onClick={onReload}>Reload content</button></div>}
          {review ? <div className="cw-confirmation"><h4 ref={confirmationHeading} tabIndex={-1}>{action === 'REMOVE' ? 'Remove this content?' : 'Restore this content?'}</h4><p>{reason.trim()}</p><p>The owner will be notified. Closed offers will not reopen. Bookings and payments stay unchanged.</p><label className="cw-acknowledge"><input type="checkbox" checked={ack} disabled={saving} onChange={event => setAck(event.target.checked)} /> I reviewed the impact.</label><button className={`cw-button ${action === 'REMOVE' ? 'cw-danger-button' : 'cw-primary'}`} disabled={!valid || !ack || saving}>{saving ? 'Applying…' : action === 'REMOVE' ? 'Remove content' : 'Restore content'}</button><button type="button" disabled={saving} className="cw-button" onClick={() => { setReview(false); setAck(false); }}>Edit decision</button></div> : <button type="button" className="cw-button cw-primary" disabled={!valid} onClick={() => setReview(true)}>Review action</button>}
        </form>}
      </aside>
    </div>
  </div>;
}
