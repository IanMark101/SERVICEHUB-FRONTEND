import Link from 'next/link';
import ListingFormSection from '../ui/ListingFormSection';
import styles from '../ui/ListingForm.module.css';
import ListingLocationFields from '../location/ListingLocationFields';
import type { ServiceLocationMode } from '../../lib/serviceArrangement';
import TransportationField, { validTransportationFee } from '../location/TransportationField';
import { LocationSchema, type LocationPoint } from '../../lib/location';
import { orderServiceCategories } from '../../lib/category-catalog';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Briefcase, Info } from 'lucide-react';
import { useTransactionPermission } from '../../hooks/useTransactionPermission';
import { useToast } from '../ui/Toast';
import type { ServiceListing } from '../../types';
import GCashNumberField from '../ui/GCashNumberField';
import FormalSelect from '../ui/FormalSelect';
import ListingTitleInput from '../ui/ListingTitleInput';
import PaymentMethodCheckboxes from '../ui/PaymentMethodCheckboxes';
import ListingPhotoUploader from '../ui/ListingPhotoUploader';
import type { ListingPhoto } from '../../lib/listingPhotos';
import { FormWizardProgress, WizardStep, WizardReviewSection } from '../ui/FormWizard';
import wizard from '../ui/FormWizard.module.css';
import { getApiErrorMessage } from '../../lib/api/errors';

const SERVICE_STEPS = ['Details', 'Location', 'Price', 'Payment', 'Review'] as const;
const PRICING_OPTIONS: readonly string[] = ['FIXED', 'PER_HOUR', 'PER_DAY', 'PER_PROJECT', 'BY_AGREEMENT'];

export default function OfferServices() {
  const { user, createServiceListing, isDark, dbCategories } = useApp();
  const { canTransact, navigateToVerification } = useTransactionPermission();
  const { error } = useToast();

  const [title, setTitle] = useState<string>('');
  const [photos, setPhotos] = useState<ListingPhoto[]>([]);
  const [photosBusy, setPhotosBusy] = useState(false);
  const [category, setCategory] = useState<string>('');
  const [price, setPrice] = useState<number>(500);
  const [priceType, setPriceType] = useState<NonNullable<ServiceListing['priceType']>>('FIXED');
  const priceByAgreement = priceType === 'BY_AGREEMENT';
  const [description, setDescription] = useState<string>('');
  const [durationMins, setDurationMins] = useState<number>(30);

  const [serviceLocation, setServiceLocation] = useState<LocationPoint | null>(null);
  const [publicMapPin, setPublicMapPin] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [serviceLocationMode, setServiceLocationMode] = useState<ServiceLocationMode>('PROVIDER_VISITS');
  const [venueAddress, setVenueAddress] = useState('');
  const [coverageRadiusKm, setCoverageRadiusKm] = useState<number | null | undefined>(undefined);
  const [coverageError, setCoverageError] = useState('');
  const [transportationFee, setTransportationFee] = useState('');

  // Payment methods
  const [acceptCash, setAcceptCash] = useState<boolean>(true);
  const [acceptGCash, setAcceptGCash] = useState<boolean>(true);

  const [loading, setLoading] = useState<boolean>(false);
  const [moderationError, setModerationError] = useState<{ field?: 'title' | 'description' | 'category'; message: string } | null>(null);
  const [step, setStep] = useState(0);
  const [validationAttempted, setValidationAttempted] = useState(false);

  const categories = orderServiceCategories(dbCategories);
  const selectedCategoryId = categories.some((item) => item.id === category) ? category : '';

  const stepProblems = (index: number) => {
    const problems: { field: string; heading: string; message: string }[] = [];
    if (index === 0) {
      if (title.trim().length < 10 || title.trim().length > 100) problems.push({ field: 'title', heading: 'Check your service name', message: 'Name the service in 10–100 characters.' });
      if (description.trim().length < 30 || description.trim().length > 1000) problems.push({ field: 'description', heading: 'Describe your service', message: 'Explain what is included in 30–1,000 characters.' });
      if (!selectedCategoryId) problems.push({ field: 'category', heading: 'Choose a category', message: 'Select the type of service you offer.' });
    }
    if (index === 1) {
      if (!LocationSchema.safeParse(serviceLocation).success) {
        problems.push({ field: 'location', heading: serviceLocationMode === 'PROVIDER_VISITS' ? 'Choose your service area' : 'Choose where seekers can visit you', message: serviceLocationMode === 'PROVIDER_VISITS' ? 'Choose a city or barangay where you offer this service. No shop or home address is needed.' : 'Mark the place where seekers can visit you on the map, then enter the city or barangay name.' });
      } else if (serviceLocationMode !== 'SEEKER_VISITS' && coverageRadiusKm === undefined) {
        problems.push({ field: 'coverage', heading: 'Choose your travel distance', message: 'Choose how far you will travel, or select “No distance limit”.' });
      }
      if (serviceLocationMode !== 'PROVIDER_VISITS' && venueAddress.length > 500) problems.push({ field: 'address', heading: 'Check your directions', message: 'Keep the address or directions within 500 characters.' });
    }
    if (index === 2) {
      if (!priceByAgreement && (!Number.isFinite(price) || !Number.isInteger(price) || price < 50 || price > 50000)) problems.push({ field: 'price', heading: 'Check your service price', message: 'Enter a service price between ₱50 and ₱50,000 in whole pesos.' });
      if (!PRICING_OPTIONS.includes(priceType)) problems.push({ field: 'priceType', heading: 'Choose how you charge', message: 'Choose a set price or rate, or Price by agreement.' });
      if (!Number.isFinite(durationMins) || durationMins < 15 || durationMins > 480 || durationMins % 5 !== 0) problems.push({ field: 'duration', heading: 'Check the time needed', message: 'Enter 15–480 minutes in steps of 5, such as 30 or 45.' });
      if (!priceByAgreement && serviceLocationMode !== 'SEEKER_VISITS' && !validTransportationFee(transportationFee)) problems.push({ field: 'travel', heading: 'Check your travel fee', message: 'Leave it blank, or enter ₱0–₱5,000 using no more than two digits after the decimal point.' });
    }
    if (index === 3 && !acceptCash && !acceptGCash) problems.push({ field: 'payment', heading: 'Choose a payment method', message: 'Choose at least one way seekers can pay you.' });
    return problems;
  };
  const problems = validationAttempted ? stepProblems(step) : [];
  const changeStep = (next: number) => { setValidationAttempted(false); setStep(next); };
  const validateStep = (index: number) => {
    const issues = stepProblems(index);
    if (!issues.length) return true;
    setStep(index); setValidationAttempted(true);
    const location = issues.find(issue => issue.field === 'location');
    const coverage = issues.find(issue => issue.field === 'coverage');
    setLocationError(location?.message || ''); setCoverageError(coverage?.message || '');
    error(issues[0].heading, issues[0].message);
    return false;
  };
  const nextStep = () => {
    if (loading || photosBusy || !canTransact) return;
    if (validateStep(step)) changeStep(step + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || photosBusy || !canTransact) return;
    if (step < 4) { nextStep(); return; }
    for (let index = 0; index < 4; index++) {
      if (!validateStep(index)) return;
    }
    setModerationError(null);
    const selectedCategory = selectedCategoryId;
    setLoading(true);
    const providerId = user?.id || '';
    try {
      const res = await createServiceListing(
        providerId,
        title,
        selectedCategory,
        price,
        description,
        { cash: acceptCash, gcash: acceptGCash },
        {
          photoIds: photos.map(photo => photo.id),
          serviceLocation: serviceLocation!,
          publicMapPin,
          serviceLocationMode,
          venueAddress: serviceLocationMode === 'PROVIDER_VISITS' ? null : venueAddress.trim() || null,
          coverageRadiusKm: serviceLocationMode === 'SEEKER_VISITS' ? null : coverageRadiusKm,
          transportationFee: priceByAgreement || serviceLocationMode === 'SEEKER_VISITS' || transportationFee === '' ? null : Number(transportationFee),
          serviceType: 'ONE_TIME',
          priceType,
          estimatedDurationMins: Math.max(15, Math.min(480, durationMins)),
        }
      );

      if (res?.success) {
        // Reset form
        setServiceLocation(null);
        setPublicMapPin(false);
        setServiceLocationMode('PROVIDER_VISITS');
        setVenueAddress('');
        setCoverageRadiusKm(undefined);
        setTransportationFee('');
        setTitle('');
        setPhotos([]);
        setDescription('');
        setPrice(500);
        setCategory('');
        setPriceType('FIXED');
        setDurationMins(30);
        changeStep(0);
      } else if (res?.field) {
        setModerationError({ field: res.field, message: res.error || 'Fix this detail before publishing.' });
        changeStep(0);
      }
    } catch (cause) {
      error('Could not publish your service', getApiErrorMessage(cause, 'Please try again. Your details are still saved in this form.'));
    } finally { setLoading(false); }
  };

  return (
    <div className={styles.page} data-form-tone="provider">
      <div className={styles.panel}>
        <header className={styles.header}>
          <span className={styles.headerIcon}><Briefcase size={22} aria-hidden="true" /></span>
          <div><h2>Create a Service Listing</h2><p>Describe what you offer, where you work, and what it costs.</p></div>
        </header>
        {!canTransact && <div className={styles.verification}>
          <p><strong>Verify your account to publish.</strong> Complete Identity & Residency Verification and wait for approval. You can still browse requests.</p>
          <button type="button" onClick={navigateToVerification}>Verify Now</button>
        </div>}
        <form noValidate onSubmit={handleSubmit} className={styles.form} aria-label="Create a service listing">
          <FormWizardProgress steps={SERVICE_STEPS} currentStep={step} workspace="provider" />
          {problems.some(issue => issue.field !== 'location' && issue.field !== 'coverage') && <ul id="service-step-errors" role="alert" className={wizard.errors}>{problems.filter(issue => issue.field !== 'location' && issue.field !== 'coverage').map(issue => <li key={issue.field}>{issue.message}</li>)}</ul>}
          <fieldset disabled={loading || photosBusy || !canTransact} className={styles.fields}>
            <WizardStep index={0} currentStep={step} label="Service details">
            <ListingFormSection number={1} title="What service do you offer?" description="Tell seekers what you can do and what your price includes.">
              <div className={styles.detailsColumns}>
                <div>
                  <label htmlFor="listing-title" className={styles.label}>Service name</label>
                  <ListingTitleInput id="listing-title" required minLength={10} maxLength={100} placeholder="e.g. Laptop repair and diagnostics" value={title}
                    onChange={e => { setTitle(e.target.value); if (moderationError?.field === 'title') setModerationError(null); }}
                    aria-invalid={moderationError?.field === 'title' || problems.some(issue => issue.field === 'title')} aria-describedby={moderationError?.field === 'title' ? 'listing-title-help listing-title-policy-error' : 'listing-title-help'} className={styles.field} />
                  <p id="listing-title-help" className={styles.fieldHelp}>Name the service in 10–100 characters.</p>
                  {moderationError?.field === 'title' && <p id="listing-title-policy-error" role="alert" className={styles.error}>{moderationError.message} Edit the title and try again.</p>}
                </div>
                <div>
                  <label htmlFor="listing-category" className={styles.label}>Service category</label>
                  <FormalSelect id="listing-category" ariaLabel="Service category" value={selectedCategoryId} required
                    onChange={e => { setCategory(e.target.value); if (moderationError?.field === 'category') setModerationError(null); }}
                    options={categories.map(cat => ({ value:cat.id, label:cat.name }))} placeholder="Select a category..." isDark={isDark} theme="provider"
                    ariaInvalid={moderationError?.field === 'category' || problems.some(issue => issue.field === 'category')} ariaDescribedBy={moderationError?.field === 'category' ? 'listing-category-policy-error' : 'listing-category-help'} />
                  <p id="listing-category-help" className={styles.fieldHelp}>{categories.find(item => item.id === selectedCategoryId)?.description || 'Choose the type of service you offer. If none fits, choose Other Services.'}</p>
                  {moderationError?.field === 'category' && <p id="listing-category-policy-error" role="alert" className={styles.error}>{moderationError.message} Choose the right category and try again.</p>}
                </div>
              </div>
              <div>
                <label htmlFor="listing-description" className={styles.label}>What is included?</label>
                <textarea id="listing-description" rows={4} required minLength={30} maxLength={1000} placeholder="e.g. I check and repair laptops. The price includes checking the problem and basic repairs. Replacement parts cost extra." value={description}
                  onChange={e => { setDescription(e.target.value); if (moderationError?.field === 'description') setModerationError(null); }}
                  aria-invalid={moderationError?.field === 'description' || problems.some(issue => issue.field === 'description')} aria-describedby={moderationError?.field === 'description' ? 'listing-description-help listing-description-policy-error' : 'listing-description-help'} className={styles.field} />
                <p id="listing-description-help" className={styles.fieldHelp}>Explain what you do and any extra costs, such as parts. Use 30–1,000 characters.</p>
                {moderationError?.field === 'description' && <p id="listing-description-policy-error" role="alert" className={styles.error}>{moderationError.message} Edit the description and try again.</p>}
              </div>
            <ListingPhotoUploader workspace="provider" value={photos} onChange={setPhotos} onBusyChange={setPhotosBusy} disabled={loading || !canTransact} />
            </ListingFormSection>
            </WizardStep>
            <WizardStep index={1} currentStep={step} label="Service location and coverage">
            <ListingFormSection number={2} title="Where will you do the work?" description="Choose whether you go to seekers or they come to you.">
              <ListingLocationFields locationError={locationError} coverageError={coverageError} value={{ serviceLocation, publicMapPin, serviceLocationMode, venueAddress, coverageRadiusKm, transportationFee }} isDark={isDark} disabled={!canTransact || loading} arrangementLayout="responsive" showTransportation={false} onChange={patch => {
                setLocationError('');
                if (patch.publicMapPin !== undefined) setPublicMapPin(patch.publicMapPin);
                if (patch.serviceLocation !== undefined) setServiceLocation(patch.serviceLocation);
                if (patch.serviceLocationMode) setServiceLocationMode(patch.serviceLocationMode);
                if (patch.venueAddress !== undefined) setVenueAddress(patch.venueAddress ?? '');
                if (patch.coverageRadiusKm !== undefined) { setCoverageRadiusKm(patch.coverageRadiusKm); setCoverageError(''); }
                if (patch.serviceLocationMode) setCoverageError('');
                if (patch.transportationFee !== undefined) setTransportationFee(patch.transportationFee);
              }} />
            </ListingFormSection>
            </WizardStep>
            <WizardStep index={2} currentStep={step} label="Service price and duration">
            <ListingFormSection number={3} title="How much do you charge?" description="Set your service price and how long the work usually takes.">
              <div className={priceByAgreement ? styles.columns : styles.threeColumns}>
                {!priceByAgreement && <div>
                  <label htmlFor="listing-price" className={styles.label}>Service price (₱)</label>
                  <input id="listing-price" type="number" min={50} max={50000} required placeholder="e.g. 500" value={price} onChange={e => setPrice(Number(e.target.value))} aria-invalid={problems.some(issue => issue.field === 'price')} aria-describedby="listing-price-help" className={styles.field} />
                  <p id="listing-price-help" className={styles.fieldHelp}>Enter ₱50–₱50,000. Choose how you charge next.</p>
                </div>}
                <div>
                  <label htmlFor="listing-price-unit" className={styles.label}>How do you charge?</label>
                  <FormalSelect id="listing-price-unit" ariaLabel="How do you charge?" value={priceType} onChange={e => setPriceType(e.target.value as NonNullable<ServiceListing['priceType']>)}
                    options={[{ value:'FIXED', label:'Fixed Price' },{ value:'PER_HOUR', label:'Per Hour' },{ value:'PER_DAY', label:'Per Day' },{ value:'PER_PROJECT', label:'Per Project' },{ value:'BY_AGREEMENT', label:'Price by agreement' }]} placeholder="Choose how you charge" isDark={isDark} theme="provider" />
                </div>
                <div>
                  <label htmlFor="listing-duration" className={styles.label}>Time needed (minutes)</label>
                  <input id="listing-duration" type="number" min={15} max={480} step={5} required value={durationMins} onChange={e => setDurationMins(Math.max(1,Number(e.target.value)))} aria-invalid={problems.some(issue => issue.field === 'duration')} aria-describedby="listing-duration-help" className={styles.field} />
                  <p id="listing-duration-help" className={styles.fieldHelp}>{priceByAgreement ? 'A general estimate: 15–480 minutes. Give the actual expected duration when you propose a price.' : 'Usual time for one job: 15–480 minutes (up to 8 hours).'}</p>
                </div>
              </div>
              {priceByAgreement ? <p className={styles.help}><strong>Price by agreement.</strong> Seekers describe the work in a service request. You accept with a final price, including any travel, or decline. They approve your price before booking or payment.</p> : price > 0 && <p className={styles.help}><strong>Price preview:</strong> ₱{price}{priceType === 'PER_HOUR' ? ' / hour' : priceType === 'PER_DAY' ? ' / day' : priceType === 'PER_PROJECT' ? ' / project' : ' fixed price'}</p>}
              {!priceByAgreement && serviceLocationMode !== 'SEEKER_VISITS' && <TransportationField value={transportationFee} onChange={setTransportationFee} isDark={isDark} disabled={!canTransact || loading} />}
            </ListingFormSection>
            </WizardStep>
            <WizardStep index={3} currentStep={step} label="Accepted payment methods">
            <ListingFormSection number={4} title="How can seekers pay you?" description="Choose the payment methods you accept.">
              <PaymentMethodCheckboxes legend="Choose at least one payment method" value={{ cash:acceptCash, gcash:acceptGCash }} onChange={methods => { setAcceptCash(methods.cash); setAcceptGCash(methods.gcash); }} isDark={isDark} disabled={loading || !canTransact}
                description="You can choose both. GCash is currently in test mode; no real money is transferred."
                error={!acceptCash && !acceptGCash ? 'Choose at least one way seekers can pay you.' : undefined} />
              <GCashNumberField userId={user?.id} enabled={acceptGCash} isDark={isDark} workspace="provider" disabled={loading || !canTransact} />
            </ListingFormSection>
            </WizardStep>
            <WizardStep index={4} currentStep={step} label="Review your service listing">
              <ListingFormSection number={5} title="Review your service listing" description="Check the details seekers will see before publishing.">
                <div>
                  <WizardReviewSection title="Service details" onEdit={() => changeStep(0)}><dl><dt>Service name</dt><dd>{title}</dd><dt>Service category</dt><dd>{categories.find(item => item.id === selectedCategoryId)?.name}</dd><dt>What is included?</dt><dd>{description}</dd><dt>Photos</dt><dd>{photos.length ? `${photos.length} photo${photos.length === 1 ? '' : 's'} added` : 'No photos added'}</dd></dl></WizardReviewSection>
                  <WizardReviewSection title="Location and coverage" onEdit={() => changeStep(1)}><dl><dt>Who will travel?</dt><dd>{serviceLocationMode === 'PROVIDER_VISITS' ? 'You go to the seeker' : serviceLocationMode === 'SEEKER_VISITS' ? 'The seeker comes to you' : 'Either option'}</dd><dt>{serviceLocationMode === 'PROVIDER_VISITS' ? 'Service area' : 'Where seekers can visit you'}</dt><dd>{serviceLocation?.label}</dd>{serviceLocationMode !== 'PROVIDER_VISITS' && venueAddress && <><dt>Private directions</dt><dd>{venueAddress}</dd></>}{serviceLocationMode !== 'SEEKER_VISITS' && <><dt>How far you travel</dt><dd>{coverageRadiusKm === null ? 'No distance limit' : `Up to ${coverageRadiusKm} km`}</dd></>}</dl></WizardReviewSection>
                  <WizardReviewSection title="Price and duration" onEdit={() => changeStep(2)}><dl><dt>Service price</dt><dd>{priceByAgreement ? 'Price by agreement' : '₱' + price.toLocaleString() + (priceType === 'PER_HOUR' ? ' / hour' : priceType === 'PER_DAY' ? ' / day' : priceType === 'PER_PROJECT' ? ' / project' : ' fixed price')}</dd><dt>Time needed</dt><dd>{durationMins} minutes</dd>{!priceByAgreement && serviceLocationMode !== 'SEEKER_VISITS' && <><dt>Your travel fee</dt><dd>{transportationFee === '' ? 'None specified' : `₱${Number(transportationFee).toLocaleString()}`}</dd></>}</dl></WizardReviewSection>
                  <WizardReviewSection title="Payment methods" onEdit={() => changeStep(3)}><p>{[acceptCash && 'Cash in person', acceptGCash && 'GCash (test mode)'].filter(Boolean).join(' · ')}</p>{acceptGCash && <p>GCash is currently in test mode; no real money is transferred.</p>}</WizardReviewSection>
                  <p className={styles.help}>You can accept separate bookings from this listing. A seeker can book again after their previous booking ends.</p>
                </div>
              </ListingFormSection>
            </WizardStep>
            {moderationError && !moderationError.field && <p role="alert" className={styles.error}>{moderationError.message}</p>}
            <footer className={styles.footer}>
              <div className={wizard.actions}>
                <button type="button" disabled={step === 0 || loading || photosBusy || !canTransact} className={wizard.back} onClick={() => changeStep(step - 1)}>Back</button>
                {step < 4 ? <button type="submit" disabled={loading || photosBusy || !canTransact} className={styles.submit}>{step === 3 ? 'Review service' : 'Next'}</button> : <button type="submit" disabled={loading || photosBusy || !canTransact || (!acceptCash && !acceptGCash)} className={styles.submit} aria-busy={loading}>{loading ? 'Publishing...' : 'Publish service'}</button>}
              </div>
            </footer>
          </fieldset>
        </form>
      </div>
      <div className={styles.notice}><Info size={16} aria-hidden="true" /><div><p>Once published, seekers can find and book your service. If something needs fixing, we will tell you what to change.</p>
        <p className="mt-2">Pause or resume your listing in <Link href="/provider/service-manager" className={styles.link}>Service Manager</Link>. Track your bookings in <Link href="/provider/provider-activity" className={styles.link}>Provider Activity</Link>.</p>
      </div></div>
    </div>
  );
}
