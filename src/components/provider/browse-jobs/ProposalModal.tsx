import FormSelect from '../../ui/FormSelect';
import MoneyInput from '../../ui/MoneyInput';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { arrangementOptionLabel, offerArrangements, type BookingLocationMode } from '../../../lib/serviceArrangement';
import { LocationSchema, type LocationPoint } from '../../../lib/location';
import ServiceArrangementField from '../../location/ServiceArrangementField';
import LocationField from '../../location/LocationField';
import type { JobRequest, ServiceListing } from '../../../types';
import { formatUrgencyDisplay } from './browseJobs.utils';
import RequestPaymentMethods from '../../ui/RequestPaymentMethods';
import { ChevronDown, Clock, Loader2, X } from 'lucide-react';
import useDialogFocus from '../../../hooks/useDialogFocus';
import ReviewSummaryPanel from '../../ui/ReviewSummaryPanel';
import styles from '../../ui/TransactionForm.module.css';
import ListingPhotoGallery from '../../ui/ListingPhotoGallery';
import { FormWizardProgress, WizardStep, WizardReviewSection } from '../../ui/FormWizard';
import offerStyles from './ProposalModal.module.css';

const OFFER_STEPS = ['Your offer', 'Location & schedule', 'Review'] as const;
const money = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });
type OfferField = 'price' | 'duration' | 'message' | 'venue' | 'availability';

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
  onSubmit: (event: FormEvent, arrangement: { serviceLocationMode: BookingLocationMode; providerVenue?: LocationPoint }) => void;
}

export default function ProposalModal({ request, listings, serviceId, onServiceChange, isSubmitting, isDark, price, duration, message, availability, onAvailabilityChange, onPriceChange, onDurationChange, onMessageChange, onClose, onSubmit }: ProposalModalProps) {
  const dialogRef = useDialogFocus(!!request, isSubmitting, onClose, 'dialog');
  const listing = listings.find(item => item.id === serviceId);
  const agreementRequest = Boolean(request?.targetServiceId && !request.preferredPaymentMethod);
  const arrangements = offerArrangements(request?.serviceLocationMode, listing?.serviceLocationMode);
  const [selectedMode, setSelectedMode] = useState<BookingLocationMode>(arrangements[0] ?? 'PROVIDER_VISITS');
  const mode = arrangements.includes(selectedMode) ? selectedMode : arrangements[0];
  const [venue, setVenue] = useState<LocationPoint | null>(null);
  const [step, setStep] = useState(0);
  const [validatedStep, setValidatedStep] = useState<number | null>(null);
  const [validationAttempt, setValidationAttempt] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (!validationAttempt) return;
    const invalid = formRef.current?.querySelector<HTMLElement>(`[data-wizard-step="${step}"] [aria-invalid="true"]`);
    invalid?.focus({ preventScroll: true });
    invalid?.scrollIntoView?.({ block: 'center', behavior: 'instant' });
  }, [validationAttempt, step]);
  const stepErrors = (index: number) => {
    const errors: Partial<Record<OfferField, string>> = {};
    if (index === 0) {
      if (!Number.isFinite(price) || price < 50 || price > 50_000 || Math.abs(price * 100 - Math.round(price * 100)) > 0.000001) errors.price = 'Enter ₱50–₱50,000, with up to two decimal places.';
      if (!Number.isInteger(duration) || duration < 15 || duration > 480) errors.duration = 'Enter 15–480 minutes in whole numbers.';
      if (message.trim().length < (agreementRequest ? 10 : 1) || message.length > 2000) errors.message = agreementRequest ? 'Describe what is included in 10–2,000 characters.' : 'Add offer details, up to 2,000 characters.';
    }
    if (index === 1) {
      if (mode === 'SEEKER_VISITS' && !listing && !LocationSchema.safeParse(venue).success) errors.venue = 'Choose your service venue and enter its general area.';
      if (availability.length > 500) errors.availability = 'Keep availability within 500 characters.';
    }
    return errors;
  };
  const errors = validatedStep === step ? stepErrors(step) : {};
  const changeStep = (next: number) => { setValidatedStep(null); setStep(next); };
  const validateStep = (index: number) => {
    if (!Object.keys(stepErrors(index)).length) return true;
    setStep(index); setValidatedStep(index); setValidationAttempt(value => value + 1); return false;
  };
  const fieldError = (field: OfferField) => errors[field] ? <p id={`offer-${field}-error`} role="alert" className={styles.error}>{errors[field]}</p> : null;
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting || !mode) return;
    if (step < 2) {
      if (validateStep(step)) changeStep(step + 1);
      return;
    }
    if (!validateStep(0) || !validateStep(1)) return;
    onSubmit(event, { serviceLocationMode: mode, ...(mode === 'SEEKER_VISITS' && !listing && { providerVenue: venue! }) });
  };
  if (!request) return null;
  return (
    <div className={styles.overlay}>
      <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="offer-dialog-title" className={styles.panel} data-theme={isDark ? 'dark' : 'light'} data-workspace="provider">
        <header className={styles.header}>
          <h3 id="offer-dialog-title">{agreementRequest ? 'Send Quote' : 'Send Offer'}</h3>
          <button type="button" aria-label="Close offer form" onClick={onClose} disabled={isSubmitting} className={styles.close}><X size={18} aria-hidden="true" /></button>
        </header>
        <form ref={formRef} noValidate onSubmit={submit} aria-label={agreementRequest ? 'Send a quote' : 'Send an offer'} aria-busy={isSubmitting} className={styles.form}>
          <div className={styles.wizardProgress}><FormWizardProgress steps={OFFER_STEPS} currentStep={step} workspace="provider" /></div>
          <div className={styles.body} data-wizard-scroll>
            <fieldset disabled={isSubmitting} className={styles.fields}>
              <section className={styles.summary} aria-label="Request summary">
                <div className={styles.summaryHeading}>
                  <h4>{request.title}</h4>
                  <div className={styles.amount}>
                    <span>{request.targetServiceId && !request.budget ? 'Quote required' : `₱${Number(request.budget).toLocaleString()}`}</span>
                    {(!request.targetServiceId || request.budget > 0) && <span>{request.targetServiceId ? 'Listed rate' : 'Customer budget'}</span>}
                  </div>
                </div>
                <div className={styles.metadata}>
                  <span>Customer: <strong>{request.seekerName}</strong></span>
                  <span>{request.category}</span>
                  <span><Clock size={14} aria-hidden="true" />Needed: {formatUrgencyDisplay(request.urgency)}</span>
                </div>
              </section>

              <WizardStep index={0} currentStep={step} label="Your offer">
              {(request.description || request.photos?.length) && <details className={offerStyles.disclosure}><summary>Request details<ChevronDown size={16} aria-hidden="true" /></summary><p className={styles.hint}>{request.description}</p><ListingPhotoGallery photos={request.photos} title={request.title} /></details>}

              <div>
                <label htmlFor="offer-service-listing" className={styles.label}>Service listing <span className={styles.optional}>{request.targetServiceId ? '(requested by the customer)' : '(optional)'}</span></label>
                <FormSelect id="offer-service-listing" value={serviceId} disabled={!!request.targetServiceId} onChange={(event) => onServiceChange(event.target.value)} className={styles.field}>
                  {!request.targetServiceId && <option value="">No listing. Offer for this request only</option>}
                  {listings.map((listing) => <option key={listing.id} value={listing.id}>{listing.title}</option>)}
                </FormSelect>
              </div>

              {!mode && <p role="alert" className={styles.error}>This listing does not support the customer’s arrangement. Choose a compatible listing or send a custom offer.</p>}
              <div className={styles.columns}>
                <div><label htmlFor="offer-price" className={styles.label}>{agreementRequest ? 'Final total (₱)' : 'Your price (₱)'}</label><MoneyInput id="offer-price" min={50} max={50000} step="0.01" required value={price} onChange={(event) => onPriceChange(Number(event.target.value))} aria-invalid={Boolean(errors.price)} aria-describedby={errors.price ? 'offer-price-error' : undefined} className={styles.field} />{fieldError('price')}</div>
                <div><label htmlFor="offer-duration" className={styles.label}>Duration (minutes)</label><input id="offer-duration" type="number" min={15} max={480} required value={duration} onChange={(event) => onDurationChange(Number(event.target.value))} aria-invalid={Boolean(errors.duration)} aria-describedby={errors.duration ? 'offer-duration-error' : undefined} className={styles.field} />{fieldError('duration')}</div>
              </div>
              <p className={styles.hint}>{mode === 'REMOTE' ? 'Total for the online work.' : 'Include all travel costs in your total.'}</p>
              <div><label htmlFor="offer-message" className={styles.label}>{agreementRequest ? 'What’s included' : 'Offer details'}</label><textarea id="offer-message" rows={3} minLength={agreementRequest ? 10 : undefined} maxLength={2000} required placeholder="Describe your approach and availability" value={message} onChange={(event) => onMessageChange(event.target.value)} aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? 'offer-message-error' : undefined} className={styles.field} />{fieldError('message')}</div>
              <details className={offerStyles.disclosure}><summary>Customer reviews<ChevronDown size={16} aria-hidden="true" /></summary><ReviewSummaryPanel subjectId={request.seekerId} context="seeker" isDark={isDark} /></details>
              </WizardStep>

              <WizardStep index={1} currentStep={step} label="Location and schedule">
              {mode && <ServiceArrangementField workspace="provider" value={mode} options={arrangements} onChange={value => setSelectedMode(value as BookingLocationMode)} disabled={isSubmitting} />}
              {mode === 'REMOTE' ? <p className={styles.hint}>No travel required.</p> : request.locationLabel && <p className={styles.hint}>{request.serviceLocationMode === 'SEEKER_VISITS' ? 'Customer’s search area' : 'Job area'}: {request.locationLabel}</p>}
              {request.serviceLocationMode !== 'REMOTE' && request.serviceLocationMode !== 'SEEKER_VISITS' && !!request.transportationFee && <p className={styles.hint}>Additional travel budget: ₱{request.transportationFee.toLocaleString()}</p>}
              {mode === 'SEEKER_VISITS' && (listing ? <p className={styles.hint}>Saved business address · shared privately after booking.</p> : <LocationField workspace="provider" label="Business address" value={venue} onChange={setVenue} disabled={isSubmitting} privateAddress error={errors.venue} hint="Exact location is shared privately after booking." />)}
              <div><label htmlFor="offer-availability" className={styles.label}>Availability <span className={styles.optional}>(optional)</span></label><input id="offer-availability" maxLength={500} placeholder="For example, Saturday morning" value={availability} onChange={(event) => onAvailabilityChange(event.target.value)} aria-invalid={Boolean(errors.availability)} aria-describedby={errors.availability ? 'offer-availability-error' : undefined} className={styles.field} />{fieldError('availability')}</div>
              </WizardStep>

              <WizardStep index={2} currentStep={step} label="Review your offer">
              <WizardReviewSection title="Your offer" onEdit={() => changeStep(0)}><dl>
                <dt>Total</dt><dd><strong>{money.format(price)}</strong></dd>
                <dt>Duration</dt><dd>{duration} minutes</dd>
                <dt>Service listing</dt><dd>{listing?.title || 'Custom offer'}</dd>
                <dt>What’s included</dt><dd>{message}</dd>
              </dl>{mode !== 'REMOTE' && <p>Travel costs included.</p>}</WizardReviewSection>
              <WizardReviewSection title="Location and schedule" onEdit={() => changeStep(1)}><dl>
                <dt>Work location</dt><dd>{mode ? arrangementOptionLabel(mode, 'provider') : 'Unavailable'}</dd>
                {mode === 'SEEKER_VISITS' ? <><dt>Business address</dt><dd>{listing ? listing.locationLabel || 'Saved business address' : venue?.label}{!listing && venue?.address && <p>{venue.address}</p>}</dd></> : mode !== 'REMOTE' && request.locationLabel ? <><dt>Job area</dt><dd>{request.locationLabel}</dd></> : null}
                <dt>Availability</dt><dd>{availability.trim() || 'To be arranged'}</dd>
              </dl></WizardReviewSection>
              <section className={styles.payment} aria-label="Request payment methods">
                <RequestPaymentMethods request={request} isDark={isDark} />
              </section>
              </WizardStep>
            </fieldset>
          </div>
          <footer className={styles.footer}>
            <div className={styles.actions}>
              <button type="button" onClick={() => step === 0 ? onClose() : changeStep(step - 1)} disabled={isSubmitting} className={styles.button}>{step === 0 ? 'Cancel' : 'Back'}</button>
              <button type="submit" disabled={isSubmitting || !mode} className={`${styles.button} ${styles.primary}`}>
                {isSubmitting && <Loader2 size={16} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />}
                {isSubmitting ? 'Sending offer…' : step === 0 ? 'Next' : step === 1 ? agreementRequest ? 'Review quote' : 'Review offer' : agreementRequest ? 'Send Quote' : 'Send Offer'}
              </button>
            </div>
          </footer>
        </form>
      </div>
    </div>
  );
}
