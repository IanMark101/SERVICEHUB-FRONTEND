import CategorySuggestion from '../marketplace/CategorySuggestion';
import ListingFormSection from '../ui/ListingFormSection';
import MoneyInput from '../ui/MoneyInput';
import styles from '../ui/ListingForm.module.css';
import ServiceArrangementField from '../location/ServiceArrangementField';
import { arrangementLabel, type ServiceLocationMode } from '../../lib/serviceArrangement';
import LocationField from '../location/LocationField';
import { orderServiceCategories } from '../../lib/category-catalog';
import TransportationField, { validTransportationFee } from '../location/TransportationField';
import { LocationSchema, type LocationPoint } from '../../lib/location';
import FormSelect from '../ui/FormSelect';
import React, { useState, FormEvent } from 'react';
import { useApp } from '../../context/AppContext';
import { PlusCircle, Info, CheckCircle2 } from 'lucide-react';
import { useTransactionPermission } from '../../hooks/useTransactionPermission';
import { useToast } from '../ui/Toast';
import ContentCaseAction from '../moderation/ContentCaseAction';
import FormalSelect from '../ui/FormalSelect';
import ListingTitleInput from '../ui/ListingTitleInput';
import PaymentMethodCheckboxes from '../ui/PaymentMethodCheckboxes';
import GCashNumberField from '../ui/GCashNumberField';
import { isRequestUrgency, REQUEST_URGENCY_OPTIONS } from '../../lib/requestUrgency';
import type { RequestRepostTemplate } from '../../api/requests.api';
import ListingPhotoUploader from '../ui/ListingPhotoUploader';
import type { ListingPhoto } from '../../lib/listingPhotos';
import { FormWizardProgress, WizardStep, WizardReviewSection } from '../ui/FormWizard';
import wizard from '../ui/FormWizard.module.css';

const REQUEST_STEPS = ['Details', 'Location', 'Budget', 'Payment', 'Review'] as const;

export default function PostRequest({ appealRequestId = '', initialTemplate }: { appealRequestId?: string; initialTemplate?: RequestRepostTemplate }) {
  const { user, postJobRequest, isDark, dbCategories } = useApp();
  const { canTransact, navigateToVerification, isSuspended } = useTransactionPermission();
  const { error } = useToast();
  const [title, setTitle] = useState<string>(initialTemplate?.title ?? '');
  const [photos, setPhotos] = useState<ListingPhoto[]>(initialTemplate?.photos ?? []);
  const [photosBusy, setPhotosBusy] = useState(false);
  const [category, setCategory] = useState<string>(initialTemplate?.categoryId ?? '');
  const [serviceLocationMode, setServiceLocationMode] = useState<ServiceLocationMode>(initialTemplate?.serviceLocationMode ?? 'PROVIDER_VISITS');
  const [jobLocation, setJobLocation] = useState<LocationPoint | null>(initialTemplate?.jobLocation ?? null);
  const [locationError, setLocationError] = useState('');
  const [transportationFee, setTransportationFee] = useState(initialTemplate?.transportationFee == null ? '' : String(initialTemplate.transportationFee));
  const [urgency, setUrgency] = useState<string>('');
  const [budget, setBudget] = useState<number>(initialTemplate?.budget ?? 0);
  const [description, setDescription] = useState<string>(initialTemplate?.description ?? '');
  const [paymentMethods, setPaymentMethods] = useState(initialTemplate ? initialTemplate.paymentMethods ?? { cash: false, gcash: false } : { cash: true, gcash: true });
  const hasPaymentMethod = paymentMethods.cash || paymentMethods.gcash;

  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [moderationError, setModerationError] = useState<{ field?: 'title' | 'description' | 'category'; message: string } | null>(null);
  const [step, setStep] = useState(0);
  const [validationAttempted, setValidationAttempted] = useState(false);
  const safeAppealRequestId = /^[a-z0-9]{20,32}$/i.test(appealRequestId) ? appealRequestId : '';

  // Keep a previously selected ID from remaining selectable after Admin retires it.
  const selectedCategoryId = dbCategories.some((item) => item.id === category) ? category : '';

  const stepProblems = (index: number) => {
    const problems: { field: string; heading: string; message: string }[] = [];
    if (index === 0) {
      if (title.trim().length < 3 || title.trim().length > 100 || description.trim().length < 10 || description.trim().length > 2000) {
        problems.push({ field: 'details', heading: 'Check your request details', message: 'Give your request a title of 3–100 characters and describe the work in 10–2,000 characters.' });
      }
      if (!selectedCategoryId) problems.push({ field: 'category', heading: 'Choose a category', message: 'Select the type of service you need.' });
    }
    if (index === 1 && !LocationSchema.safeParse(jobLocation).success) {
      problems.push({ field: 'location', heading: serviceLocationMode === 'SEEKER_VISITS' ? 'Choose an area to find providers' : 'Choose where the work will happen', message: serviceLocationMode === 'SEEKER_VISITS' ? 'Choose the city or barangay where you want to find a provider. The provider will give their address in their offer.' : 'Mark where the provider should come on the map, then enter the city or barangay name.' });
    }
    if (index === 2) {
      if (!Number.isFinite(budget) || budget < 50 || budget > 50_000 || !Number.isInteger(budget)) problems.push({ field: 'budget', heading: 'Invalid budget', message: 'Enter an estimated budget between ₱50 and ₱50,000 in whole pesos.' });
      if (!isRequestUrgency(urgency)) problems.push({ field: 'urgency', heading: 'Choose when you need help', message: 'Select how soon you need this service.' });
      if (serviceLocationMode !== 'SEEKER_VISITS' && !validTransportationFee(transportationFee)) problems.push({ field: 'travel', heading: 'Check your extra travel budget', message: 'Leave it blank, or enter ₱0–₱5,000 using no more than two digits after the decimal point.' });
    }
    if (index === 3 && !hasPaymentMethod) problems.push({ field: 'payment', heading: 'Choose how you can pay', message: 'Choose at least one way you can pay.' });
    return problems;
  };
  const problems = validationAttempted ? stepProblems(step) : [];
  const changeStep = (next: number) => { setValidationAttempted(false); setStep(next); };
  const validateStep = (index: number) => {
    const issues = stepProblems(index);
    if (!issues.length) return true;
    setStep(index); setValidationAttempted(true);
    const locationIssue = issues.find(issue => issue.field === 'location');
    if (locationIssue) setLocationError(locationIssue.message);
    error(issues[0].heading, issues[0].message);
    return false;
  };
  const nextStep = () => {
    if (loading || photosBusy || !canTransact) return;
    if (validateStep(step)) changeStep(step + 1);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading || photosBusy || !canTransact) return;
    if (step < 4) { nextStep(); return; }
    for (let index = 0; index < 4; index++) {
      if (!validateStep(index)) return;
    }
    // Keep the existing urgency predicate at the typed submission boundary.
    if (!isRequestUrgency(urgency)) { validateStep(2); return; }
    setModerationError(null);

    setLoading(true);
    setSuccess(false);
    try {
      const posted = await postJobRequest(user?.id || '', title.trim(), selectedCategoryId, urgency, budget, description.trim(), paymentMethods, { ...(photos.length && { photoIds: photos.map(photo => photo.id) }), jobLocation: serviceLocationMode === 'SEEKER_VISITS' ? { ...jobLocation!, address: undefined } : jobLocation!, serviceLocationMode, transportationFee: serviceLocationMode === 'SEEKER_VISITS' || transportationFee === '' ? null : Number(transportationFee) });
      if (posted !== true) {
        if (posted && typeof posted === 'object') {
          setModerationError({ field: posted.field, message: posted.error });
          if (posted.field) changeStep(0);
        }
        return;
      }
      setSuccess(true);
      setTitle('');
      setPhotos([]);
      setDescription('');
      setBudget(0);
      setJobLocation(null);
      setServiceLocationMode('PROVIDER_VISITS');
      setTransportationFee('');
      setCategory('');
      setUrgency('');
      setPaymentMethods({ cash: true, gcash: true });
      changeStep(0);

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page} data-form-tone="seeker">
      <div className={styles.panel}>
        <header className={styles.header}>
          <span className={styles.headerIcon}><PlusCircle size={22} aria-hidden="true" /></span>
          <div><h2>{initialTemplate ? 'Post this request again' : 'Post a Request'}</h2><p>{initialTemplate ? 'Check the copied details and choose when you need help again.' : 'Tell providers what you need and how much you plan to spend. Compare their offers before choosing.'}</p></div>
        </header>
        {initialTemplate && !success && <div className={styles.status}>
          <div><p>This creates a new request. Your previous booking stays in Activity.</p>
          {!initialTemplate.categoryId && <p>{initialTemplate.categoryName} is no longer available. Choose another category.</p>}
          {!initialTemplate.paymentMethods && <p>Choose how you can pay before posting.</p>}</div>
        </div>}
        {!canTransact && <div className={styles.verification}>
          {isSuspended ? <p><strong>Posting is unavailable while suspended.</strong> You can still browse services. You can post again when your suspension ends.</p> : <>
            <p><strong>Verify your account to post.</strong> Complete Identity & Residency Verification and wait for approval. You can still browse services.</p>
            <button type="button" onClick={navigateToVerification}>Verify Now</button>
          </>}
        </div>}
        {success && <div className={styles.status} role="status"><CheckCircle2 size={20} aria-hidden="true" /><span>Your request is live. Providers can now send offers.</span></div>}
        <form noValidate onSubmit={handleSubmit} className={styles.form} aria-label="Post a request">
          <FormWizardProgress steps={REQUEST_STEPS} currentStep={step} />
          {problems.length > 0 && step !== 1 && <ul id="request-step-errors" role="alert" className={wizard.errors}>{problems.map(issue => <li key={issue.field}>{issue.message}</li>)}</ul>}
          <fieldset disabled={loading || photosBusy || !canTransact} className={styles.fields}>
            <WizardStep index={0} currentStep={step} label="Request details">
            <ListingFormSection number={1} title="What do you need help with?" description="Describe the work so providers can give you a price.">
              <div className={styles.detailsColumns}>
                <div>
                  <label htmlFor="request-title" className={styles.label}>Request title</label>
                  <ListingTitleInput id="request-title" required minLength={3} maxLength={100} placeholder="e.g. Laptop will not turn on" value={title}
                    onChange={e => { setTitle(e.target.value); if (moderationError?.field === 'title') setModerationError(null); }}
                    aria-invalid={moderationError?.field === 'title' || (validationAttempted && (title.trim().length < 3 || title.trim().length > 100))} aria-describedby={moderationError?.field === 'title' ? 'request-title-help request-title-policy-error' : 'request-title-help'} className={styles.field} />
                  <p id="request-title-help" className={styles.fieldHelp}>A short title, 3–100 characters.</p>
                  {moderationError?.field === 'title' && <p id="request-title-policy-error" role="alert" className={styles.error}>{moderationError.message} Edit the title and try again.</p>}
                </div>
                <div>
                  <label htmlFor="request-category" className={styles.label}>Service category</label>
                  <FormalSelect id="request-category" ariaLabel="Service category" value={selectedCategoryId} required searchable searchLabel="Search service categories"
                    onChange={e => { setCategory(e.target.value); if (moderationError?.field === 'category') setModerationError(null); }}
                    options={orderServiceCategories(dbCategories).map(cat => ({ value:cat.id, label:cat.name, searchText:[cat.description, ...(cat.aliases ?? [])].join(' ') }))} placeholder="Select a category..." isDark={isDark} theme="seeker"
                    ariaInvalid={moderationError?.field === 'category' || (validationAttempted && !selectedCategoryId)} ariaDescribedBy={moderationError?.field === 'category' ? 'request-category-policy-error' : 'request-category-help'} />
                  <p id="request-category-help" className={styles.fieldHelp}>{dbCategories.find(item => item.id === selectedCategoryId)?.description || 'Choose the type of help you need. If none fits, choose Other Services.'}</p>
                  <CategorySuggestion title={title} description={description} categories={dbCategories} selectedId={selectedCategoryId} onChoose={id=>{setCategory(id);if(moderationError?.field==='category')setModerationError(null);}} tone="seeker" />
                  {moderationError?.field === 'category' && <p id="request-category-policy-error" role="alert" className={styles.error}>{moderationError.message}</p>}
                </div>
              </div>
              <div>
                <label htmlFor="request-description" className={styles.label}>Describe what you need</label>
                <textarea id="request-description" rows={4} required minLength={10} maxLength={2000} placeholder="e.g. My laptop will not turn on, even when plugged in. I need someone to check and repair it." value={description}
                  onChange={e => { setDescription(e.target.value); if (moderationError?.field === 'description') setModerationError(null); }}
                  aria-invalid={moderationError?.field === 'description' || (validationAttempted && (description.trim().length < 10 || description.trim().length > 2000))} aria-describedby={moderationError?.field === 'description' ? 'request-description-help request-description-policy-error' : 'request-description-help'} className={styles.field} />
                <p id="request-description-help" className={styles.fieldHelp}>Explain the problem and what you want done. Use 10–2,000 characters.</p>
                {moderationError?.field === 'description' && <p id="request-description-policy-error" role="alert" className={styles.error}>{moderationError.message} Edit the description and try again.</p>}
              </div>
            <ListingPhotoUploader value={photos} onChange={setPhotos} onBusyChange={setPhotosBusy} disabled={loading || !canTransact} />
            </ListingFormSection>
            </WizardStep>
            <WizardStep index={1} currentStep={step} label="Request location">
            <ListingFormSection number={2} title="Where should the work happen?" description="Choose whether the provider comes to you or you go to them.">
              <ServiceArrangementField value={serviceLocationMode} onChange={mode => {
                if ((mode === 'SEEKER_VISITS') !== (serviceLocationMode === 'SEEKER_VISITS')) setJobLocation(null);
                setServiceLocationMode(mode); setLocationError('');
              }} disabled={!canTransact || loading} layout="responsive" />
              <LocationField required error={locationError} selectionMode={serviceLocationMode === 'SEEKER_VISITS' ? 'area' : 'pin'} label={serviceLocationMode === 'SEEKER_VISITS' ? 'Area where you want to find a provider' : serviceLocationMode === 'BOTH' ? 'Your location if the provider comes to you' : 'Where the provider should come'} value={jobLocation} onChange={point => { setJobLocation(point); setLocationError(''); }} privateAddress={serviceLocationMode !== 'SEEKER_VISITS'} disabled={!canTransact || loading}
                hint={serviceLocationMode === 'SEEKER_VISITS' ? 'Choose a city or barangay to find providers in that area. No home address is needed. The provider will give their address in their offer.' : serviceLocationMode === 'BOTH' ? 'Mark where the provider should come if you choose that option. Your exact location is shared after booking. If you go to the provider, their offer gives the address.' : undefined} />
            </ListingFormSection>
            </WizardStep>
            <WizardStep index={2} currentStep={step} label="Request timing and budget">
            <ListingFormSection number={3} title="When do you need help, and what is your budget?" description="Providers use these details when making an offer.">
              <div className={styles.columns}>
                <div>
                  <label htmlFor="request-urgency" className={styles.label}>When do you need help?</label>
                  <FormSelect id="request-urgency" required value={urgency} onChange={e => setUrgency(e.target.value)} aria-invalid={problems.some(issue => issue.field === 'urgency')} aria-describedby="request-urgency-help" className={styles.field}>
                    <option value="" disabled>Choose when you need help</option>
                    {REQUEST_URGENCY_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </FormSelect>
                  <p id="request-urgency-help" className={styles.fieldHelp}>If you need a specific date or time, add it to your description.</p>
                </div>
                <div>
                  <label htmlFor="request-budget" className={styles.label}>Your service budget (₱)</label>
                  <MoneyInput id="request-budget" min={50} max={50000} required placeholder="e.g. 500" value={budget} onChange={e => setBudget(Number(e.target.value))} aria-invalid={problems.some(issue => issue.field === 'budget')} aria-describedby="request-budget-help" className={styles.field} />
                  <p id="request-budget-help" className={styles.fieldHelp}>How much you expect to spend on the work: ₱50–₱50,000. Review the provider’s price before accepting.</p>
                </div>
              </div>
              {serviceLocationMode !== 'SEEKER_VISITS' && <TransportationField value={transportationFee} onChange={setTransportationFee} isDark={isDark} budget disabled={!canTransact || loading} />}
            </ListingFormSection>
            </WizardStep>
            <WizardStep index={3} currentStep={step} label="Request payment methods">
            <ListingFormSection number={4} title="How can you pay?" description="Let providers know which payment methods you can use.">
              <PaymentMethodCheckboxes value={paymentMethods} onChange={setPaymentMethods} isDark={isDark} legend="Choose at least one payment method" disabled={loading || !canTransact}
                description="You can choose both. Posting a request does not charge you. GCash is currently in test mode; no real money is transferred."
                error={!hasPaymentMethod ? 'Choose at least one way you can pay.' : undefined} />
              <GCashNumberField userId={user?.id} enabled={paymentMethods.gcash} isDark={isDark} workspace="seeker" disabled={loading || !canTransact} />
            </ListingFormSection>
            </WizardStep>
            <WizardStep index={4} currentStep={step} label="Review your request">
              <ListingFormSection number={5} title="Review your request" description="Check everything before sharing it with providers.">
                <div>
                  <WizardReviewSection title="Request details" onEdit={() => changeStep(0)}><dl><dt>Request title</dt><dd>{title}</dd><dt>Service category</dt><dd>{dbCategories.find(item => item.id === selectedCategoryId)?.name}</dd><dt>Describe what you need</dt><dd>{description}</dd><dt>Photos</dt><dd>{photos.length ? `${photos.length} photo${photos.length === 1 ? '' : 's'} added` : 'No photos added'}</dd></dl></WizardReviewSection>
                  <WizardReviewSection title="Location" onEdit={() => changeStep(1)}><dl><dt>Service arrangement</dt><dd>{arrangementLabel[serviceLocationMode]}</dd><dt>{serviceLocationMode === 'SEEKER_VISITS' ? 'Area to find providers' : 'Job location'}</dt><dd>{jobLocation?.label}</dd>{serviceLocationMode !== 'SEEKER_VISITS' && jobLocation?.address && <><dt>Private directions</dt><dd>{jobLocation.address}</dd></>}</dl></WizardReviewSection>
                  <WizardReviewSection title="Timing and budget" onEdit={() => changeStep(2)}><dl><dt>When you need help</dt><dd>{urgency}</dd><dt>Your service budget</dt><dd>₱{budget.toLocaleString()}</dd>{serviceLocationMode !== 'SEEKER_VISITS' && <><dt>Extra travel budget</dt><dd>{transportationFee === '' ? 'None specified' : `₱${Number(transportationFee).toLocaleString()}`}</dd></>}</dl></WizardReviewSection>
                  <WizardReviewSection title="Payment methods" onEdit={() => changeStep(3)}><p>{[paymentMethods.cash && 'Cash in person', paymentMethods.gcash && 'GCash (test mode)'].filter(Boolean).join(' · ')}</p><p>Posting does not charge you. Compare providers’ offers before choosing.</p></WizardReviewSection>
                </div>
              </ListingFormSection>
            </WizardStep>
            {moderationError && !moderationError.field && <p role="alert" className={styles.error}>{moderationError.message}</p>}
            <footer className={styles.footer}>
              <div className={wizard.actions}>
                <button type="button" disabled={step === 0 || loading || photosBusy || !canTransact} className={wizard.back} onClick={() => changeStep(step - 1)}>Back</button>
                {step < 4 ? <button type="submit" disabled={loading || photosBusy || !canTransact} className={styles.submit}>{step === 3 ? 'Review request' : 'Next'}</button> : <button type="submit" disabled={loading || photosBusy || !canTransact || !hasPaymentMethod} className={styles.submit} aria-busy={loading}>{loading ? 'Posting...' : 'Post request'}</button>}
              </div>
            </footer>
          </fieldset>
        </form>
      </div>
      <div className={styles.notice}><Info size={16} aria-hidden="true" /><div><p>After your request passes our content checks, verified providers can send offers. Compare their prices and profiles before choosing.</p>
        {safeAppealRequestId && <div className="mt-2"><strong>Was your request removed?</strong><p>You can ask an Admin to review the removal. This will not republish the request automatically.</p><ContentCaseAction caseType="APPEAL" contentType="SERVICE_REQUEST" resourceId={safeAppealRequestId} isDark={isDark} label="Appeal this removal" /></div>}
      </div></div>
    </div>
  );
}
