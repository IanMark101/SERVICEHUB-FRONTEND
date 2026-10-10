import LocationField from '../location/LocationField';
import { LocationSchema, type LocationPoint } from '../../lib/location';
import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ServiceListing } from '../../types';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, Clock, Loader2, TriangleAlert, X } from 'lucide-react';
import ReviewSummaryPanel from '../ui/ReviewSummaryPanel';
import { apiBookDirect } from '../../api/bookings.api';
import { getServicePaymentMethods } from '../../lib/paymentUtils';
import { getApiErrorMessage } from '../../lib/api/errors';
import GCashLogo from '../ui/GCashLogo';
import useDialogFocus from '../../hooks/useDialogFocus';
import styles from '../ui/TransactionForm.module.css';

interface RequestServiceModalProps {
  listing: ServiceListing;
  onClose: () => void;
  initialPaymentMethod?: 'GCash' | 'On-site Cash';
}

export default function RequestServiceModal({ listing, onClose, initialPaymentMethod }: RequestServiceModalProps) {
  const router = useRouter();
  const { user, bookProviderDirectly, isDark, jobEngagements } = useApp();
  const isOwned = !!(user && listing.providerId === user.id);
  const priceUnavailable = listing.priceType === 'STARTS_AT' || listing.priceType === 'CUSTOM' || !Number.isFinite(Number(listing.price)) || Number(listing.price) < 50;
  const isMetered = listing.priceType === 'PER_HOUR' || listing.priceType === 'PER_DAY';
  const unitName = listing.priceType === 'PER_DAY' ? 'days' : 'hours';

  // ── Payment method source of truth ──────────────────────────────────────────
  const { cash, gcash } = getServicePaymentMethods(listing);

  // Resolve a valid default: if the caller passed a method not supported, fall back to supported one
  const resolveDefault = (): 'GCash' | 'On-site Cash' => {
    if (initialPaymentMethod === 'GCash' && gcash) return 'GCash';
    if (initialPaymentMethod === 'On-site Cash' && cash) return 'On-site Cash';
    if (cash) return 'On-site Cash';
    return 'GCash';
  };

  const [description, setDescription] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'GCash' | 'On-site Cash'>(resolveDefault);
  const [preferredSchedule, setPreferredSchedule] = useState<string>('');
  const [jobLocation, setJobLocation] = useState<LocationPoint | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const total = Number(listing.price) * quantity + (listing.transportationFee ?? 0);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const dialogRef = useDialogFocus(true, loading, onClose, 'dialog');

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (priceUnavailable) {
      setFormError('This provider needs to set a final price before the service can be booked.');
      return;
    }
    if (!cash && !gcash) {
      setFormError('This listing has no available payment method.');
      return;
    }
    if ((paymentMethod === 'On-site Cash' && !cash) || (paymentMethod === 'GCash' && !gcash)) {
      setFormError('Choose a payment method accepted by this provider.');
      return;
    }
    if (isMetered && (!Number.isInteger(quantity) || quantity < 1 || quantity > (listing.priceType === 'PER_DAY' ? 7 : 40))) {
      setFormError(`Choose a valid number of ${unitName}.`);
      return;
    }
    if (total > 50_000) {
      setFormError('The booking total cannot exceed ₱50,000. Choose fewer hours or days.');
      return;
    }
    setFormError(null);

    if (description.trim().length < 1) {
      setFormError('Please describe the work needed before sending the request.');
      return;
    }

    if (listing.isPaused) {
      setFormError('This service is currently paused by the provider and cannot be booked at this time.');
      return;
    }

    if (!user) {
      setFormError('You must be logged in to book a service.');
      return;
    }

    const existingActive = jobEngagements.find(je => 
      je.seekerId === user.id &&
      je.serviceId === listing.id &&
      ['pending_provider', 'queued', 'in_progress', 'awaiting_seeker_approval', 'disputed'].includes(je.status)
    );
    if (existingActive) {
      setFormError('You already have an active booking for this service in progress. Please check your Activity tab.');
      return;
    }

    if (!LocationSchema.safeParse(jobLocation).success) { setFormError('Choose where the work will happen and enter its area name.'); return; }
    setLoading(true);
    try {
      if (paymentMethod === 'On-site Cash') {
        // Cash requests are provider-confirmed. The preferred schedule is a
        // proposal and does not reserve provider availability.
        await apiBookDirect({
          jobLocation: jobLocation!,
          serviceId: listing.id,
          quantity,
          message: description,
          schedule: preferredSchedule.trim() || undefined,
        });
      } else {
        // GCash/online path — use the existing hook
        const checkout = await bookProviderDirectly(user.id, listing.id, listing.price, description, paymentMethod, quantity, jobLocation!);
        // The workspace payment dialog takes over without leaving the listing.
        // Initiating checkout alone must never claim a successful booking.
        setLoading(false);
        if (checkout) onClose();
        return;
      }
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: unknown) {
      setLoading(false);
      setFormError(getApiErrorMessage(err, 'Booking failed. Please try again.'));
    }
  };

  return (
    <div className={styles.overlay}>
      <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="request-dialog-title" className={styles.panel} data-theme={isDark ? 'dark' : 'light'} data-workspace="seeker">
        <header className={styles.header}>
          <h3 id="request-dialog-title">Send a request</h3>
          <button type="button" onClick={onClose} disabled={loading} aria-label="Close request form" className={styles.close}><X size={18} aria-hidden="true" /></button>
        </header>

        {success ? (
          <div role="status" className={styles.success}>
            <CheckCircle2 size={40} aria-hidden="true" />
            <h4>{paymentMethod === 'On-site Cash' ? 'Request Sent Successfully!' : 'Booking Created Successfully!'}</h4>
            <p>{paymentMethod === 'On-site Cash'
              ? 'The request was sent to ' + listing.providerName + ' for acceptance. Your preferred schedule is a proposal until the provider accepts it.'
              : "Your verified online booking has entered this service listing's queue."}</p>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} aria-busy={loading} className={styles.form}>
            <div className={styles.body}>
              <fieldset disabled={loading} className={styles.fields}>
                <section className={styles.summary} aria-label="Service summary">
                  <div className={styles.summaryHeading}>
                    <h4>{listing.title}</h4>
                    <div className={styles.amount}>
                      <span>{priceUnavailable ? 'Price unavailable' : '₱' + Number(listing.price).toLocaleString()}</span>
                      <span>{priceUnavailable ? 'Final price required' : listing.priceType === 'PER_HOUR' ? 'Per hour' : listing.priceType === 'PER_DAY' ? 'Per day' : listing.priceType === 'PER_PROJECT' ? 'Per project' : 'Fixed price'}</span>
                    </div>
                  </div>
                  <div className={styles.metadata}>
                    <span>Provider: <strong>{listing.providerName}</strong></span>
                    <span>{listing.category}</span>
                    {listing.estimatedDurationMins && <span><Clock size={14} aria-hidden="true" />Estimated duration: {listing.estimatedDurationMins} minutes</span>}
                  </div>
                  <p className={styles.hint}>
                    <strong>{isMetered ? 'Displayed listing rate' : 'Agreed listing price'}</strong>
                    {' · '}{priceUnavailable ? 'The provider must enter a final price before this listing can be booked.' : isMetered ? 'The server calculates the total from this rate and your selected quantity.' : 'The total includes any one-time transportation fee shown below.'}
                  </p>
                </section>

                {isOwned && <p role="alert" className={styles.error}>This is your own service listing. Marketplace transactions with your own account are not allowed.</p>}
                <div className={styles.review}><ReviewSummaryPanel subjectId={listing.providerId} context="provider" serviceId={listing.id} isDark={isDark} /></div>

                <div>
                  <label htmlFor="request-work-description" className={styles.label}>Describe the work needed</label>
                  <textarea id="request-work-description" rows={4} required disabled={isOwned}
                    placeholder="Describe exactly what needs to be done, location details, preferred schedules..."
                    value={description} onChange={(event) => setDescription(event.target.value)} className={styles.field} />
                </div>

                <LocationField label="Where will the job happen?" value={jobLocation} onChange={setJobLocation} privateAddress disabled={loading || isOwned} />

                {paymentMethod === 'On-site Cash' && (
                  <div>
                    <label htmlFor="request-preferred-schedule" className={styles.label}>Preferred schedule <span className={styles.optional}>(optional)</span></label>
                    <input id="request-preferred-schedule" type="text" maxLength={500} disabled={isOwned}
                      value={preferredSchedule} onChange={(event) => setPreferredSchedule(event.target.value)}
                      placeholder="e.g. Saturday afternoon; please confirm availability" className={styles.field} aria-describedby="request-schedule-hint" />
                    <p id="request-schedule-hint" className={styles.hint}>This is a proposal, not a reserved appointment. The provider must confirm availability.</p>
                  </div>
                )}

                {isMetered && (
                  <div>
                    <label htmlFor="booking-quantity" className={styles.label}>Number of {unitName}</label>
                    <input id="booking-quantity" type="number" min={1} max={listing.priceType === 'PER_DAY' ? 7 : 40} step={1} required value={quantity}
                      onChange={(event) => setQuantity(Number(event.target.value))} className={styles.field} />

                  </div>
                )}

                {!priceUnavailable && <div className={styles.hint}>
                  <p>Service: ₱{(Number(listing.price) * quantity).toLocaleString()}</p>
                  {!!listing.transportationFee && <p>Transportation (once): ₱{listing.transportationFee.toLocaleString()}</p>}
                  <p className={styles.total}>Total: ₱{total.toLocaleString()}</p>
                </div>}
                <section className={styles.payment} aria-labelledby="request-payment-title">
                  <h4 id="request-payment-title" className={styles.label}>Payment Method</h4>
                  <div className={styles.paymentChoices} data-single={!(cash && gcash)}>
                    {([['On-site Cash', cash], ['GCash', gcash]] as const)
                      .filter(([, accepted]) => accepted)
                      .map(([method]) => (
                        <button key={method} type="button" disabled={isOwned}
                          aria-label={method === 'GCash' ? 'GCash · Test Mode' : method}
                          aria-pressed={paymentMethod === method}
                          onClick={() => setPaymentMethod(method)} className={styles.paymentChoice}>
                          {method === 'GCash' ? <><GCashLogo /><span>· Test Mode</span></> : method}
                        </button>
                      ))}
                  </div>
                  {!cash && !gcash && <p className={styles.error}>No supported payment method is available.</p>}
                  {gcash && <p className={styles.hint}>GCash checkout uses PayMongo Test Mode. ServiceHub confirms the payment before adding your booking to the provider’s shared work queue; test payments are not real provider payouts.</p>}
                </section>

                <div className={styles.notice}>
                  <TriangleAlert size={16} aria-hidden="true" />
                  <p>You can cancel for free anytime before the provider starts the job. Once they&apos;ve started, cancellation needs their approval.</p>
                </div>
              </fieldset>
            </div>

            <footer className={styles.footer}>
              {formError && <p role="alert" className={styles.error}>{formError}</p>}
              <div className={styles.actions}>
                <button type="button" onClick={onClose} disabled={loading} className={styles.button}>{isOwned ? 'Return to Marketplace' : 'Cancel'}</button>
                {isOwned ? (
                  <button type="button" onClick={() => router.push('/provider/service-manager?id=' + listing.id)} className={[styles.button, styles.primary].join(' ')}>Edit Listing Details</button>
                ) : (
                  <button type="submit" disabled={loading || priceUnavailable} className={[styles.button, styles.primary].join(' ')}>
                    {loading && <Loader2 size={16} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />}
                    {priceUnavailable ? 'Price Needed Before Booking' : loading ? paymentMethod === 'GCash' ? 'Preparing checkout…' : 'Sending request…' : paymentMethod === 'GCash' ? 'Continue to GCash' : 'Send Request'}
                  </button>
                )}
              </div>
            </footer>
          </form>
        )}
      </div>
    </div>
  );
}
