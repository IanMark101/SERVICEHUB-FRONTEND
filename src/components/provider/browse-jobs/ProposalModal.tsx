import FormSelect from '../../ui/FormSelect';
import type { FormEvent } from 'react';
import type { JobRequest, ServiceListing } from '../../../types';
import { formatUrgencyDisplay } from './browseJobs.utils';
import RequestPaymentMethods from '../../ui/RequestPaymentMethods';
import { Clock, Loader2, X } from 'lucide-react';
import useDialogFocus from '../../../hooks/useDialogFocus';
import ReviewSummaryPanel from '../../ui/ReviewSummaryPanel';
import styles from '../../ui/TransactionForm.module.css';

interface ProposalModalProps {
  request: JobRequest | undefined;
  listings: ServiceListing[];
  serviceId: string;
  onServiceChange: (id: string) => void;
  isSubmitting: boolean;
  isDark: boolean;
  price: number;
  duration: number;
  message: string;
  availability: string;
  onAvailabilityChange: (availability: string) => void;
  onPriceChange: (price: number) => void;
  onDurationChange: (minutes: number) => void;
  onMessageChange: (message: string) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent) => void;
}

export default function ProposalModal({ request, listings, serviceId, onServiceChange, isSubmitting, isDark, price, duration, message, availability, onAvailabilityChange, onPriceChange, onDurationChange, onMessageChange, onClose, onSubmit }: ProposalModalProps) {
  const dialogRef = useDialogFocus(!!request, isSubmitting, onClose, 'dialog');
  if (!request) return null;
  return (
    <div className={styles.overlay}>
      <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="offer-dialog-title" className={styles.panel} data-theme={isDark ? 'dark' : 'light'} data-workspace="provider">
        <header className={styles.header}>
          <h3 id="offer-dialog-title">Send an offer</h3>
          <button type="button" aria-label="Close offer form" onClick={onClose} disabled={isSubmitting} className={styles.close}><X size={18} aria-hidden="true" /></button>
        </header>
        <form onSubmit={onSubmit} aria-busy={isSubmitting} className={styles.form}>
          <div className={styles.body}>
            <fieldset disabled={isSubmitting} className={styles.fields}>
              <section className={styles.summary} aria-label="Request summary">
                <div className={styles.summaryHeading}>
                  <h4>{request.title}</h4>
                  <div className={styles.amount}>
                    <span>{request.targetServiceId && !request.budget ? 'Quote required' : `₱${Number(request.budget).toLocaleString()}`}</span>
                    <span>{request.targetServiceId ? 'Listed rate' : 'Seeker budget'}</span>
                  </div>
                </div>
                <div className={styles.metadata}>
                  <span>Service seeker: <strong>{request.seekerName}</strong></span>
                  <span>{request.category}</span>
                  <span><Clock size={14} aria-hidden="true" />Needed: {formatUrgencyDisplay(request.urgency)}</span>
                </div>
              </section>

              {request.locationLabel && <p className={styles.hint}>Job area: {request.locationLabel}. Exact directions become available when a booking is created.</p>}
              {!!request.transportationFee && <p className={styles.hint}>Additional travel budget: ₱{request.transportationFee.toLocaleString()}</p>}
              <div className={styles.review}><ReviewSummaryPanel subjectId={request.seekerId} context="seeker" isDark={isDark} /></div>

              <div>
                <label htmlFor="offer-service-listing" className={styles.label}>Service listing <span className={styles.optional}>{request.targetServiceId ? '(requested by the seeker)' : '(optional)'}</span></label>
                <FormSelect id="offer-service-listing" value={serviceId} disabled={!!request.targetServiceId} onChange={(event) => onServiceChange(event.target.value)} className={styles.field}>
                  {!request.targetServiceId && <option value="">No listing. Offer for this request only</option>}
                  {listings.map((listing) => <option key={listing.id} value={listing.id}>{listing.title}</option>)}
                </FormSelect>
                <p className={styles.hint}>{request.targetServiceId ? `Quote the final total for this listing. The seeker selected ${request.preferredPaymentMethod || 'a payment method'} and must approve your price before booking or paying.` : 'A listing can fill in your usual price and duration. You can change either for this job.'}</p>
              </div>

              <div className={styles.columns}>
                <div><label htmlFor="offer-price" className={styles.label}>Your price (₱)</label><input id="offer-price" type="number" min={50} max={50000} step="0.01" required value={price} onChange={(event) => onPriceChange(Number(event.target.value))} className={styles.field} /></div>
                <div><label htmlFor="offer-duration" className={styles.label}>Expected duration (minutes)</label><input id="offer-duration" type="number" min={15} max={480} required value={duration} onChange={(event) => onDurationChange(Number(event.target.value))} className={styles.field} /></div>
              </div>
              <p className={styles.hint}>Quote one final total including transportation. The listing fee or seeker travel allowance will not be added again.</p>
              <div><label htmlFor="offer-availability" className={styles.label}>Availability <span className={styles.optional}>(optional)</span></label><input id="offer-availability" maxLength={500} placeholder="For example, Saturday morning" value={availability} onChange={(event) => onAvailabilityChange(event.target.value)} className={styles.field} /></div>
              <div><label htmlFor="offer-message" className={styles.label}>How you will handle this job</label><textarea id="offer-message" rows={3} maxLength={2000} required placeholder="Describe your approach and availability" value={message} onChange={(event) => onMessageChange(event.target.value)} className={styles.field} /></div>

              <section className={styles.payment} aria-label="Request payment methods">
                <RequestPaymentMethods request={request} isDark={isDark} />
                <p className={styles.hint}>These payment methods come from the seeker’s request.</p>
              </section>
            </fieldset>
          </div>
          <footer className={styles.footer}>
            <div className={styles.actions}>
              <button type="button" onClick={onClose} disabled={isSubmitting} className={styles.button}>Cancel</button>
              <button type="submit" disabled={isSubmitting} className={`${styles.button} ${styles.primary}`}>
                {isSubmitting && <Loader2 size={16} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />}
                {isSubmitting ? 'Sending offer…' : 'Send Offer'}
              </button>
            </div>
          </footer>
        </form>
      </div>
    </div>
  );
}
