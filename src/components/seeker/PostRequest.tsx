import LocationField from '../location/LocationField';
import { orderServiceCategories } from '../../lib/category-catalog';
import TransportationField, { validTransportationFee } from '../location/TransportationField';
import { LocationSchema, type LocationPoint } from '../../lib/location';
import FormSelect from '../ui/FormSelect';
import React, { useState, FormEvent } from 'react';
import { useApp } from '../../context/AppContext';
import { PlusCircle, Info } from 'lucide-react';
import { useTransactionPermission } from '../../hooks/useTransactionPermission';
import { useToast } from '../ui/Toast';
import ContentCaseAction from '../moderation/ContentCaseAction';
import FormalSelect from '../ui/FormalSelect';
import ListingTitleInput from '../ui/ListingTitleInput';
import PaymentMethodCheckboxes from '../ui/PaymentMethodCheckboxes';
import { isRequestUrgency, REQUEST_URGENCY_OPTIONS } from '../../lib/requestUrgency';
import type { RequestRepostTemplate } from '../../api/requests.api';

export default function PostRequest({ appealRequestId = '', initialTemplate }: { appealRequestId?: string; initialTemplate?: RequestRepostTemplate }) {
  const { user, postJobRequest, isDark, dbCategories } = useApp();
  const { canTransact, navigateToVerification } = useTransactionPermission();
  const { error } = useToast();
  const [title, setTitle] = useState<string>(initialTemplate?.title ?? '');
  const [category, setCategory] = useState<string>(initialTemplate?.categoryId ?? '');
  const [jobLocation, setJobLocation] = useState<LocationPoint | null>(initialTemplate?.jobLocation ?? null);
  const [transportationFee, setTransportationFee] = useState(initialTemplate?.transportationFee == null ? '' : String(initialTemplate.transportationFee));
  const [urgency, setUrgency] = useState<string>('');
  const [budget, setBudget] = useState<number>(initialTemplate?.budget ?? 500);
  const [description, setDescription] = useState<string>(initialTemplate?.description ?? '');
  const [paymentMethods, setPaymentMethods] = useState(initialTemplate ? initialTemplate.paymentMethods ?? { cash: false, gcash: false } : { cash: true, gcash: true });
  const hasPaymentMethod = paymentMethods.cash || paymentMethods.gcash;

  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [moderationError, setModerationError] = useState<{ field?: 'title' | 'description' | 'category'; message: string } | null>(null);
  const safeAppealRequestId = /^[a-z0-9]{20,32}$/i.test(appealRequestId) ? appealRequestId : '';

  // Keep a previously selected ID from remaining selectable after Admin retires it.
  const selectedCategoryId = dbCategories.some((item) => item.id === category) ? category : '';

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading || !canTransact) return;
    setModerationError(null);
    if (title.trim().length < 3 || title.trim().length > 100 || description.trim().length < 10 || description.trim().length > 2000) {
      error('Request details required', 'Use a 3–100 character title and a 10–2000 character description.');
      return;
    }
    if (!Number.isFinite(budget) || budget < 50 || budget > 50_000) {
      error('Invalid budget', 'Enter an estimated budget between ₱50 and ₱50,000.');
      return;
    }
    if (!isRequestUrgency(urgency)) {
      error('Urgency required', 'Select how soon you need this service.');
      return;
    }
    if (!selectedCategoryId) {
      error('Category required', 'Select an active service category.');
      return;
    }
    if (!LocationSchema.safeParse(jobLocation).success) { error('Job location required', 'Choose where the work will happen and enter its area name.'); return; }
    if (!validTransportationFee(transportationFee)) { error('Invalid travel budget', 'Enter an amount from ₱0 to ₱5,000, with at most two decimal places.'); return; }
    if (!hasPaymentMethod) return;

    setLoading(true);
    setSuccess(false);
    try {
      const posted = await postJobRequest(user?.id || '', title.trim(), selectedCategoryId, urgency, budget, description.trim(), paymentMethods, { jobLocation: jobLocation!, transportationFee: transportationFee === '' ? null : Number(transportationFee) });
      if (posted !== true) {
        if (posted && typeof posted === 'object') setModerationError({ field: posted.field, message: posted.error });
        return;
      }
      setSuccess(true);
      setTitle('');
      setDescription('');
      setBudget(500);
      setJobLocation(null);
      setTransportationFee('');
      setCategory('');
      setUrgency('');
      setPaymentMethods({ cash: true, gcash: true });

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`max-w-5xl mx-auto space-y-6 select-none transition-colors duration-200 ${isDark ? 'text-white' : 'text-ink'}`}>

      {/* Form Container Card */}
      <div className={`rounded-[24px] p-8 border shadow-sm transition-colors duration-200 ${isDark ? 'bg-charcoal-surface border-neutral-800/80' : 'bg-white border-slate-300'
        }`}>

        {/* Header */}
        <div className={`flex items-center space-x-3 mb-6 pb-4 border-b ${isDark ? 'border-neutral-850' : 'border-slate-100'}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-50 text-brand-text'
            }`}>
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className={`text-base font-extrabold leading-none ${isDark ? 'text-white' : 'text-ink'}`}>
              {initialTemplate ? 'Repost a Request' : 'Post a Request'}
            </h2>
            <p className={`text-[10px] mt-1 ${isDark ? 'text-ink-muted' : 'text-ink-subtle'}`}>
              {initialTemplate ? 'Review your copied details and choose when you need the service again.' : 'Broadcast your task requirements to all local verified providers.'}
            </p>
          </div>
        </div>

        {initialTemplate && !success && <div className={`mb-6 rounded-xl border p-4 text-sm leading-6 ${isDark ? 'border-orange-800 bg-orange-950/40 text-orange-200' : 'border-orange-200 bg-orange-50 text-orange-900'}`}>
          <p>Posting creates a new request with fresh offers. Your completed booking stays in Activity.</p>
          {!initialTemplate.categoryId && <p className="mt-2">{initialTemplate.categoryName} is no longer available. Choose an active category.</p>}
          {!initialTemplate.paymentMethods && <p className="mt-2">Choose your accepted payment methods before posting.</p>}
        </div>}

        {/* Verification Required Alert Block */}
        {!canTransact && (
          <div className={`p-4 rounded-2xl border text-xs font-semibold flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 animate-in fade-in duration-200 ${
            isDark ? 'bg-amber-950/25 border-amber-900/30 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}>
            <div>
              <span className="font-bold">Verification Required:</span>
              <span className="font-medium ml-1">You may browse ServiceHub freely, but you must complete Identity & Residency Verification before participating in marketplace transactions.</span>
            </div>
            <button
              type="button"
              onClick={navigateToVerification}
              className="bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-[10px] px-4 py-2.5 rounded-xl transition-all shadow-md flex-shrink-0 cursor-pointer"
            >
              Verify Now
            </button>
          </div>
        )}

        {/* Success Alert Banner */}
        {success && (
          <div className={`border rounded-2xl p-4 text-xs font-semibold flex items-center space-x-2.5 mb-6 animate-in fade-in duration-205 ${isDark ? 'bg-orange-950/20 border-orange-900/30 text-orange-400' : 'bg-orange-50 border-orange-200 text-orange-800'
            }`}>
            <span className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px]">✓</span>
            <span>Your request is live. Providers can now send offers.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Left Column (3/5 width): Main Content fields */}
          <div className="lg:col-span-3 space-y-5">
            {/* Title */}
            <div>
              <label className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-ink-muted' : 'text-ink-secondary'}`}>
                Request Title
              </label>
              <ListingTitleInput
                required
                minLength={3}
                maxLength={100}
                disabled={!canTransact}
                placeholder="e.g. Need help fixing kitchen faucet leak"
                value={title}
                onChange={(e) => { setTitle(e.target.value); if (moderationError?.field === 'title') setModerationError(null); }}
                aria-invalid={moderationError?.field === 'title'}
                aria-describedby={moderationError?.field === 'title' ? 'request-title-policy-error' : undefined}
                className={`w-full px-4 py-3 rounded-xl border outline-none font-medium text-sm transition-all focus:ring-4 focus:ring-orange-500/10 ${isDark
                    ? 'bg-charcoal-inset border-neutral-800/80 text-white focus:border-orange-500/80'
                    : 'bg-white border-slate-300 text-ink-secondary focus:border-orange-500'
                  } ${moderationError?.field === 'title' ? 'border-red-500 ring-2 ring-red-500/20' : ''} ${!canTransact ? 'opacity-65 cursor-not-allowed' : ''}`}
              />
              {moderationError?.field === 'title' && <p id="request-title-policy-error" role="alert" className="mt-2 text-xs font-semibold text-red-600 dark:text-red-400">{moderationError.message} Edit the title and try again.</p>}
            </div>

            {/* Detailed Description */}
            <div>
              <label className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-ink-muted' : 'text-ink-secondary'}`}>
                Detailed Description
              </label>
              <textarea
                rows={7}
                required
                minLength={10}
                maxLength={2000}
                disabled={!canTransact}
                placeholder="Describe the scope of work, timeline, and tools required so providers can submit accurate proposals."
                value={description}
                onChange={(e) => { setDescription(e.target.value); if (moderationError?.field === 'description') setModerationError(null); }}
                aria-invalid={moderationError?.field === 'description'}
                aria-describedby={moderationError?.field === 'description' ? 'request-description-policy-error' : undefined}
                className={`w-full px-4 py-3 rounded-xl border outline-none font-medium text-sm resize-none leading-relaxed transition-all focus:ring-4 focus:ring-orange-500/10 ${isDark
                    ? 'bg-charcoal-inset border-neutral-800/80 text-white focus:border-orange-500'
                    : 'bg-white border-slate-300 text-ink-secondary focus:border-orange-500'
                  } ${moderationError?.field === 'description' ? 'border-red-500 ring-2 ring-red-500/20' : ''} ${!canTransact ? 'opacity-65 cursor-not-allowed' : ''}`}
              />
              {moderationError?.field === 'description' && <p id="request-description-policy-error" role="alert" className="mt-2 text-xs font-semibold text-red-600 dark:text-red-400">{moderationError.message} Edit the description and try again.</p>}
            </div>
            <PaymentMethodCheckboxes
              value={paymentMethods} onChange={setPaymentMethods} isDark={isDark}
              legend="Payment methods I can use" disabled={loading || !canTransact}
              description="Choose one or both. Only checked methods will appear on your request. Posting does not charge you."
              error={!hasPaymentMethod ? 'Select at least one payment method you can use.' : undefined}
            />
          </div>

          {/* Right Column (2/5 width): Configuration & Summary notes */}
          <div className="lg:col-span-2 space-y-5 flex flex-col justify-between">
            <div className="space-y-5">
              {/* Category */}
              <div>
                <label className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-ink-muted' : 'text-ink-secondary'}`}>
                  Service Category
                </label>
                <FormalSelect
                  ariaLabel="Service Category"
                  value={selectedCategoryId}
                  required
                  disabled={!canTransact}
                  onChange={(e) => { setCategory(e.target.value); if (moderationError?.field === 'category') setModerationError(null); }}
                  options={orderServiceCategories(dbCategories).map((cat) => ({ value: cat.id, label: cat.name }))}
                  placeholder="Select a category..."
                  isDark={isDark}
                  theme="seeker"
                  ariaInvalid={moderationError?.field === 'category'}
                  ariaDescribedBy={moderationError?.field === 'category' ? 'request-category-policy-error' : undefined}
                />
                <p className="mt-2 text-xs text-ink-muted">No suitable category? Choose Other Services and describe the task in your title and description.</p>
                {moderationError?.field === 'category' && <p id="request-category-policy-error" role="alert" className="mt-2 text-xs font-semibold text-red-600 dark:text-red-400">{moderationError.message}</p>}
              </div>

              {/* Urgency / Preferred Timeframe */}
              <div>
                <label htmlFor="request-urgency" className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-ink-muted' : 'text-ink-secondary'}`}>
                  Urgency
                </label>
                <FormSelect
                  id="request-urgency"
                  required
                  disabled={!canTransact || loading}
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value)}
                  aria-describedby="request-urgency-help"
                  className={`w-full px-4 py-3 rounded-xl border outline-none font-medium text-sm transition-all focus:ring-4 focus:ring-orange-500/10 ${isDark
                      ? 'bg-charcoal-inset border-neutral-800/80 text-white focus:border-orange-500/80'
                      : 'bg-white border-slate-300 text-ink-secondary focus:border-orange-500'
                    } ${!canTransact ? 'opacity-65 cursor-not-allowed' : ''}`}
                >
                  <option value="" disabled>Select urgency...</option>
                  {REQUEST_URGENCY_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                </FormSelect>
                <p id="request-urgency-help" className={`text-[10px] mt-1.5 ${isDark ? 'text-ink-muted' : 'text-ink-subtle'}`}>
                  Choose how soon you need help. Add any specific date or time to your description.
                </p>
              </div>

              <LocationField label="Where will the job happen?" value={jobLocation} onChange={setJobLocation} privateAddress disabled={!canTransact || loading} />
              <TransportationField value={transportationFee} onChange={setTransportationFee} isDark={isDark} budget disabled={!canTransact || loading} />

              {/* Budget */}
              <div>
                <label className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-ink-muted' : 'text-ink-secondary'}`}>
                  Estimated Budget (₱)
                </label>
                <input
                  type="number"
                  min={50}
                  max={50000}
                  required
                  disabled={!canTransact}
                  placeholder="e.g. 500"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className={`w-full px-4 py-3 rounded-xl border outline-none font-semibold text-sm transition-all focus:ring-4 focus:ring-orange-500/10 ${isDark
                      ? 'bg-charcoal-inset border-neutral-800/80 text-white focus:border-orange-500/80'
                      : 'bg-white border-slate-300 text-ink-secondary focus:border-orange-500'
                    } ${!canTransact ? 'opacity-65 cursor-not-allowed' : ''}`}
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-3 flex items-center justify-end">
              {moderationError && !moderationError.field && <p role="alert" className="mb-2 text-xs font-semibold text-red-600 dark:text-red-400">{moderationError.message}</p>}
              <button
                type="submit"
                disabled={loading || !canTransact || !hasPaymentMethod}
                className={`w-full py-3.5 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 ${
                  !canTransact
                    ? 'bg-neutral-500 dark:bg-charcoal cursor-not-allowed opacity-50'
                    : 'bg-orange-600 hover:bg-orange-700 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed'
                }`}
              >
                {loading ? 'Posting...' : 'Post Request Publicly'}
              </button>
            </div>
          </div>

        </form>

      </div>

      {/* Form Note Box */}
      <div className={`rounded-2xl p-4 border flex items-start space-x-3 transition-colors duration-200 ${isDark ? 'bg-charcoal-inset border-neutral-800/80 text-ink-muted' : 'bg-slate-50 border-slate-300 text-ink-muted'
        }`}>
        <Info className="w-4 h-4 text-brand-text mt-0.5 flex-shrink-0" />
        <div><p className="text-[10px] leading-relaxed">
          A request that passes ServiceHub content checks is shared with verified providers. You can compare their offers and profiles, then choose the provider who best matches your needs.
        </p>{safeAppealRequestId && <div className="mt-2"><strong className="text-xs">Was your request removed?</strong><p className="text-xs">You can ask an Admin to review the removal. This will not republish the request automatically.</p><ContentCaseAction caseType="APPEAL" contentType="SERVICE_REQUEST" resourceId={safeAppealRequestId} isDark={isDark} label="Appeal this removal" /></div>}</div>
      </div>

    </div>
  );
}
