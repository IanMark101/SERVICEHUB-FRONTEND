import LocationField from '../location/LocationField';
import ServiceArrangementField from '../location/ServiceArrangementField';
import { arrangementLabel, availableArrangements, directTransportationFee, type BookingLocationMode } from '../../lib/serviceArrangement';
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
import { FormWizardProgress, WizardStep, WizardReviewSection } from '../ui/FormWizard';
import { isPriceByAgreement } from '../../lib/listingPricing';
import { apiCreateListingInquiry } from '../../api/requests.api';
import ListingPhotoUploader from '../ui/ListingPhotoUploader';
import type { ListingPhoto } from '../../lib/listingPhotos';

const BOOKING_STEPS = ['Details', 'Location', 'Payment', 'Review'] as const;

interface RequestServiceModalProps {
  listing: ServiceListing;
  onClose: () => void;
  initialPaymentMethod?: 'GCash' | 'On-site Cash';
}

export default function RequestServiceModal({ listing, onClose, initialPaymentMethod }: RequestServiceModalProps) {
  const router = useRouter();
  const { user, bookProviderDirectly, isDark, jobEngagements, refreshAll } = useApp();
  const isOwned = !!(user && listing.providerId === user.id);
  const agreement = isPriceByAgreement(listing);
  const finalStep = agreement ? 2 : 3;
  const steps = agreement ? ['Details', 'Location', 'Review'] : BOOKING_STEPS;
  const [photos, setPhotos] = useState<ListingPhoto[]>([]);
  const [photosBusy, setPhotosBusy] = useState(false);
  const priceUnavailable = !agreement && (listing.priceType === 'STARTS_AT' || listing.priceType === 'CUSTOM' || !Number.isFinite(Number(listing.price)) || Number(listing.price) < 50);
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
  const arrangements = availableArrangements(listing.serviceLocationMode);
  const [serviceLocationMode, setServiceLocationMode] = useState<BookingLocationMode>(arrangements[0]);
  const transportationFee = directTransportationFee(serviceLocationMode, listing.transportationFee);
  const [quantity, setQuantity] = useState<number>(1);
  const total = Number(listing.price) * quantity + transportationFee;
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const inFlight = React.useRef(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [step, setStep] = useState(0);
  const dialogRef = useDialogFocus(true, loading, onClose, 'dialog');

  const stepProblem = (index: number): string | null => {
    if (index === 0 && description.trim().length < 1) return 'Please describe the work needed before sending the request.';
    if (index === 1) {
      if (!arrangements.includes(serviceLocationMode)) return 'This arrangement changed. Reopen the listing and choose an available arrangement.';
      if (serviceLocationMode === 'PROVIDER_VISITS' && !LocationSchema.safeParse(jobLocation).success) return 'Choose where the work will happen and enter its area name.';
    }
    if (index === 0 && agreement && description.trim().length < 10) return 'Describe the problem or work needed using at least 10 characters.';
    if (index === 0 && agreement && description.trim().length > 2000) return 'Keep the description within 2,000 characters.';
    if (index === 2 && !agreement) {
      if (priceUnavailable) return 'This provider needs to set a final price before the service can be booked.';
      if (!cash && !gcash) return 'This listing has no available payment method.';
      if ((paymentMethod === 'On-site Cash' && !cash) || (paymentMethod === 'GCash' && !gcash)) return 'Choose a payment method accepted by this provider.';
      if (isMetered && (!Number.isInteger(quantity) || quantity < 1 || quantity > (listing.priceType === 'PER_DAY' ? 7 : 40))) return `Choose a valid number of ${unitName}.`;
      if (total > 50_000) return 'The booking total cannot exceed ₱50,000. Choose fewer hours or days.';
    }
    return null;
  };
  const changeStep = (next: number) => { setFormError(null); setStep(next); };
  const nextStep = () => {
    if (loading || photosBusy || isOwned || priceUnavailable) return;
    const problem = stepProblem(step);
    if (problem) { setFormError(problem); return; }
    changeStep(step + 1);
  };

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading || photosBusy || isOwned || inFlight.current) return;
    if (step < finalStep) { nextStep(); return; }
    for (let index = 0; index < finalStep; index++) {
      const problem = stepProblem(index);
      if (problem) { setStep(index); setFormError(problem); return; }
    }
    setFormError(null);

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

    inFlight.current = true;
    setLoading(true);
    try {
      if (agreement) {
        await apiCreateListingInquiry({ serviceId: listing.id, message: description.trim(), serviceLocationMode,
          ...(serviceLocationMode === 'PROVIDER_VISITS' && { jobLocation: jobLocation! }),
          ...(photos.length && { photoIds: photos.map(photo => photo.id) }),
        });
        refreshAll?.();
        setLoading(false); setSuccess(true); return;
      } else if (paymentMethod === 'On-site Cash') {
        // Cash requests are provider-confirmed. The preferred schedule is a
        // proposal and does not reserve provider availability.
        await apiBookDirect({
          ...(serviceLocationMode === 'PROVIDER_VISITS' && { jobLocation: jobLocation! }),
          serviceLocationMode,
          serviceId: listing.id,
          quantity,
          message: description,
          schedule: preferredSchedule.trim() || undefined,
        });
      } else {
        // GCash/online path — use the existing hook
        const checkout = await bookProviderDirectly(user.id, listing.id, listing.price, description, paymentMethod, quantity, serviceLocationMode === 'PROVIDER_VISITS' ? jobLocation! : undefined, serviceLocationMode);
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
      setFormError(getApiErrorMessage(err, agreement ? 'Your service request could not be sent. Please try again.' : 'Booking failed. Please try again.'));
    } finally { inFlight.current = false; }
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
            <h4>{agreement ? 'Service request sent' : paymentMethod === 'On-site Cash' ? 'Request Sent Successfully!' : 'Booking Created Successfully!'}</h4>
            <p>{agreement ? 'The provider will review your request and accept with a final price, or decline. Review their price in Offers Received. No booking or payment has been created.' : paymentMethod === 'On-site Cash'
              ? 'The request was sent to ' + listing.providerName + ' for acceptance. Your preferred schedule is a proposal until the provider accepts it.'
              : "Your verified online booking has entered this service listing's queue."}</p>
            {agreement && <button type="button" className={`${styles.button} ${styles.primary}`} onClick={() => { onClose(); router.push('/seeker/request-manager'); }}>View your request</button>}
          </div>
        ) : (
          <form noValidate onSubmit={handleFormSubmit} aria-label="Request service" aria-busy={loading} className={styles.form}>
            <div className={styles.wizardProgress}><FormWizardProgress steps={steps} currentStep={step} /></div>
            <div className={styles.body} data-wizard-scroll>
              <fieldset disabled={loading} className={styles.fields}>
                <section className={styles.summary} aria-label="Service summary">
                  <div className={styles.summaryHeading}>
                    <h4>{listing.title}</h4>
                    <div className={styles.amount}>
                      <span>{agreement ? 'Price by agreement' : priceUnavailable ? 'Price unavailable' : '₱' + Number(listing.price).toLocaleString()}</span>
                      <span>{agreement ? 'Approve the price before booking' : priceUnavailable ? 'Final price required' : listing.priceType === 'PER_HOUR' ? 'Per hour' : listing.priceType === 'PER_DAY' ? 'Per day' : listing.priceType === 'PER_PROJECT' ? 'Per project' : 'Fixed price'}</span>
                    </div>
                  </div>
                  <div className={styles.metadata}>
                    <span>Provider: <strong>{listing.providerName}</strong></span>
                    <span>{listing.category}</span>
                    {listing.estimatedDurationMins && <span><Clock size={14} aria-hidden="true" />Estimated duration: {listing.estimatedDurationMins} minutes</span>}
                  </div>
                  <p className={styles.hint}>
                    <strong>{agreement ? 'Request this service' : isMetered ? 'Displayed listing rate' : 'Agreed listing price'}</strong>
                    {' · '}{agreement ? 'Describe the work. The provider proposes a final price, including travel, for your approval.' : priceUnavailable ? 'The provider must enter a final price before this listing can be booked.' : isMetered ? 'The server calculates the total from this rate and your selected quantity.' : 'The total includes any one-time transportation fee shown below.'}
                  </p>
                </section>

                {isOwned && <p role="alert" className={styles.error}>This is your own service listing. Marketplace transactions with your own account are not allowed.</p>}
                <WizardStep index={0} currentStep={step} label="Work details">
                <div className={styles.review}><ReviewSummaryPanel subjectId={listing.providerId} context="provider" serviceId={listing.id} isDark={isDark} /></div>

                <div>
                  <label htmlFor="request-work-description" className={styles.label}>Describe the work needed</label>
                  <textarea id="request-work-description" rows={4} required minLength={agreement ? 10 : undefined} maxLength={agreement ? 2000 : undefined} disabled={isOwned} aria-invalid={Boolean(formError && !description.trim())} aria-describedby={formError && !description.trim() ? 'booking-form-error' : undefined}
                    placeholder="Describe exactly what needs to be done, location details, preferred schedules..."
                    value={description} onChange={(event) => { setDescription(event.target.value); setFormError(null); }} className={styles.field} />
                </div>
                {agreement && <ListingPhotoUploader purpose="inquiry" value={photos} onChange={setPhotos} onBusyChange={setPhotosBusy} disabled={loading || isOwned} />}
                </WizardStep>

                <WizardStep index={1} currentStep={step} label="Work location">
                <ServiceArrangementField value={serviceLocationMode} options={arrangements} onChange={mode => { setServiceLocationMode(mode as BookingLocationMode); setFormError(null); }} disabled={loading || isOwned} />
                {serviceLocationMode === 'PROVIDER_VISITS' ? <LocationField label="Where will the job happen?" value={jobLocation} onChange={point => { setJobLocation(point); setFormError(null); }} required error={formError && step === 1 ? formError : undefined} privateAddress disabled={loading || isOwned} hint="Choose the place where the provider will work. The pin and directions are shared only with booking participants." /> : <div className={styles.hint}>
                  <strong>Provider’s service venue</strong>
                  <p>{listing.locationLabel || 'The provider’s saved service venue'}</p>
                  <p>You’ll travel to the provider. Exact directions are shared in your booking; no seeker job pin or provider transportation fee is needed.</p>
                </div>}
                </WizardStep>

                {!agreement && <WizardStep index={2} currentStep={step} label="Schedule and payment">
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
                    <input id="booking-quantity" type="number" min={1} max={listing.priceType === 'PER_DAY' ? 7 : 40} step={1} required value={quantity} aria-invalid={Boolean(formError && stepProblem(2))} aria-describedby={formError ? 'booking-form-error' : undefined}
                      onChange={(event) => { setQuantity(Number(event.target.value)); setFormError(null); }} className={styles.field} />

                  </div>
                )}

                {!priceUnavailable && <div className={styles.hint}>
                  <p>Service: ₱{(Number(listing.price) * quantity).toLocaleString()}</p>
                  {!!transportationFee && <p>Provider transportation (once): ₱{transportationFee.toLocaleString()}</p>}
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
                          onClick={() => { setPaymentMethod(method); setFormError(null); }} className={styles.paymentChoice}>
                          {method === 'GCash' ? <><GCashLogo /><span>· Test Mode</span></> : method}
                        </button>
                      ))}
                  </div>
                  {!cash && !gcash && <p className={styles.error}>No supported payment method is available.</p>}
                  {gcash && <p className={styles.hint}>GCash checkout uses PayMongo Test Mode. ServiceHub confirms the payment before adding your booking to the provider’s shared work queue; test payments are not real provider payouts.</p>}
                </section>
                </WizardStep>}

                <WizardStep index={finalStep} currentStep={step} label="Review your booking request">
                  <h4 className={styles.label}>Review your request</h4>
                  <WizardReviewSection title="Work details" onEdit={() => changeStep(0)}><p>{description}</p>{agreement && <p>{photos.length ? `${photos.length} photo${photos.length === 1 ? '' : 's'} attached` : 'No photos attached'}</p>}</WizardReviewSection>
                  <WizardReviewSection title="Location" onEdit={() => changeStep(1)}><dl><dt>Service arrangement</dt><dd>{arrangementLabel[serviceLocationMode]}</dd><dt>{serviceLocationMode === 'PROVIDER_VISITS' ? 'Job location' : 'Provider’s service venue'}</dt><dd>{serviceLocationMode === 'PROVIDER_VISITS' ? jobLocation?.label : listing.locationLabel || 'The provider’s saved service venue'}</dd>{serviceLocationMode === 'PROVIDER_VISITS' && jobLocation?.address && <><dt>Private directions</dt><dd>{jobLocation.address}</dd></>}</dl></WizardReviewSection>
                  {agreement ? <p className={styles.hint}>The provider reviews your request and proposes a final price, including travel. Approve their price in Offers Received before booking or payment. Sending this request does not charge you.</p> : <WizardReviewSection title="Schedule and payment" onEdit={() => changeStep(2)}><dl>{paymentMethod === 'On-site Cash' && <><dt>Preferred schedule</dt><dd>{preferredSchedule.trim() || 'Not specified'}</dd></>}{isMetered && <><dt>Number of {unitName}</dt><dd>{quantity}</dd></>}<dt>Service</dt><dd>₱{(Number(listing.price) * quantity).toLocaleString()}</dd>{!!transportationFee && <><dt>Provider transportation (once)</dt><dd>₱{transportationFee.toLocaleString()}</dd></>}<dt>Total</dt><dd>₱{total.toLocaleString()}</dd><dt>Payment Method</dt><dd>{paymentMethod === 'GCash' ? 'GCash · Test Mode' : paymentMethod}</dd></dl>
                  <p>{paymentMethod === 'On-site Cash' ? 'Your preferred schedule is a proposal. The provider must accept your request and confirm availability.' : 'Continue to PayMongo Test Mode checkout. Your booking is added only after payment is confirmed.'}</p></WizardReviewSection>}
                {!agreement && <div className={styles.notice}>
                  <TriangleAlert size={16} aria-hidden="true" />
                  <p>You can cancel for free anytime before the provider starts the job. Once they&apos;ve started, cancellation needs their approval.</p>
                </div>}
                </WizardStep>
              </fieldset>
            </div>

            <footer className={styles.footer}>
              {formError && <p id="booking-form-error" role="alert" className={styles.error}>{formError}</p>}
              <div className={styles.actions}>
                <button type="button" onClick={() => step === 0 || isOwned ? onClose() : changeStep(step - 1)} disabled={loading || photosBusy} className={styles.button}>{isOwned ? 'Return to Marketplace' : step === 0 ? 'Cancel' : 'Back'}</button>
                {isOwned ? (
                  <button type="button" onClick={() => router.push('/provider/service-manager?id=' + listing.id)} className={[styles.button, styles.primary].join(' ')}>Edit Listing Details</button>
                ) : step < finalStep ? (
                  <button type="submit" disabled={loading || photosBusy || priceUnavailable} className={[styles.button, styles.primary].join(' ')}>{priceUnavailable ? 'Price Needed Before Booking' : step === finalStep - 1 ? 'Review request' : 'Next'}</button>
                ) : (
                  <button type="submit" disabled={loading || photosBusy || priceUnavailable} className={[styles.button, styles.primary].join(' ')}>
                    {loading && <Loader2 size={16} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />}
                    {priceUnavailable ? 'Price Needed Before Booking' : agreement ? loading ? 'Sending request…' : 'Send service request' : loading ? paymentMethod === 'GCash' ? 'Preparing checkout…' : 'Sending request…' : paymentMethod === 'GCash' ? 'Continue to GCash' : 'Send Request'}
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
