import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Briefcase, Info } from 'lucide-react';
import { useTransactionPermission } from '../../hooks/useTransactionPermission';
import { useToast } from '../ui/Toast';
import type { ServiceListing } from '../../types';
import { useRouter } from 'next/navigation';
import FormalSelect from '../ui/FormalSelect';
import ListingTitleInput from '../ui/ListingTitleInput';
import PaymentMethodCheckboxes from '../ui/PaymentMethodCheckboxes';

export default function OfferServices() {
  const { user, createServiceListing, isDark, dbCategories } = useApp();
  const router = useRouter();
  const { canTransact, navigateToVerification } = useTransactionPermission();
  const { error } = useToast();

  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [price, setPrice] = useState<number>(500);
  const [priceType, setPriceType] = useState<NonNullable<ServiceListing['priceType']>>('FIXED');
  const [description, setDescription] = useState<string>('');
  const [durationMins, setDurationMins] = useState<number>(30);
  const [availability, setAvailability] = useState<string>('Available Now');

  // Payment methods
  const [acceptCash, setAcceptCash] = useState<boolean>(true);
  const [acceptGCash, setAcceptGCash] = useState<boolean>(true);

  const [loading, setLoading] = useState<boolean>(false);
  const [moderationError, setModerationError] = useState<{ field?: 'title' | 'description' | 'category'; message: string } | null>(null);
  const hasMobileNumber = Boolean(user?.phone?.trim());

  const categories = dbCategories;
  const selectedCategoryId = categories.some((item) => item.id === category) ? category : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModerationError(null);
    if (!acceptCash && !acceptGCash) {
      error('Payment method required', 'Select at least one supported payment method for this listing.');
      return;
    }

    const selectedCategory = selectedCategoryId;
    if (!selectedCategory) {
      error('Category required', 'Select the category that best matches this service.');
      return;
    }

    setLoading(true);
    const providerId = user?.id || '';
    const res = await createServiceListing(
      providerId,
      title,
      selectedCategory,
      price,
      description,
      { cash: acceptCash, gcash: acceptGCash },
      {
        serviceType: 'ONE_TIME',
        priceType,
        estimatedDurationMins: Math.max(15, Math.min(480, durationMins)),
      }
    );

    setLoading(false);

    if (res?.success) {
      // Reset form
      setTitle('');
      setDescription('');
      setPrice(500);
      setCategory('');
      setPriceType('FIXED');
      setDurationMins(30);
    } else if (res?.field) {
      setModerationError({ field: res.field, message: res.error || 'Fix this detail before publishing.' });
    }
  };

  return (
    <div className={`max-w-5xl mx-auto space-y-6 select-none transition-colors duration-200 ${isDark ? 'text-white' : 'text-ink'}`}>

      {/* Form Container Card */}
      <div className={`rounded-[24px] p-8 border shadow-sm transition-colors duration-200 ${isDark ? 'bg-[#22211e] border-neutral-800/80' : 'bg-white border-slate-300'
        }`}>

        {/* Header */}
        <div className={`flex items-center space-x-3 mb-6 pb-4 border-b ${isDark ? 'border-neutral-850' : 'border-slate-100'}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
            }`}>
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h2 className={`text-base font-extrabold leading-none ${isDark ? 'text-white' : 'text-ink'}`}>
              Create a Service Listing
            </h2>
            <p className={`text-[10px] mt-1 ${isDark ? 'text-ink-muted' : 'text-ink-subtle'}`}>
              Offer your skills to the local community.
            </p>
          </div>
        </div>

        {/* Verification Required Alert Block */}
        {!canTransact && (
          <div className={`p-4 rounded-2xl border text-xs font-semibold flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 animate-in fade-in duration-200 ${
            isDark ? 'bg-amber-950/25 border-amber-900/30 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}>
            <div>
              <span className="font-bold">Verification Required:</span>
              <span className="font-medium ml-1">You may browse ServiceHub freely, but you must complete Cordova Residency Verification before participating in marketplace transactions.</span>
            </div>
            <button
              type="button"
              onClick={navigateToVerification}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] px-4 py-2.5 rounded-xl transition-all shadow-md flex-shrink-0 cursor-pointer"
            >
              Verify Now
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Left Column: Listing Details & Payment Options */}
          <div className="space-y-5">
            {/* Service Title */}
            <div>
              <label className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-ink-muted' : 'text-ink-secondary'}`}>
                Service Listing Title
              </label>
              <ListingTitleInput
                required
                disabled={!canTransact}
                placeholder="e.g. Lawn Mowing and Edge Trimming"
                value={title}
                minLength={10}
                maxLength={100}
                onChange={(e) => { setTitle(e.target.value); if (moderationError?.field === 'title') setModerationError(null); }}
                aria-invalid={moderationError?.field === 'title'}
                aria-describedby={moderationError?.field === 'title' ? 'listing-title-policy-error' : undefined}
                className={`w-full px-4 py-3 rounded-xl border outline-none font-medium text-sm transition-all focus:ring-4 focus:ring-emerald-500/10 ${isDark
                    ? 'bg-[#1c1b18] border-neutral-800/80 text-white focus:border-emerald-500/80'
                    : 'bg-white border-slate-300 text-ink-secondary focus:border-emerald-500'
                  } ${moderationError?.field === 'title' ? 'border-red-500 ring-2 ring-red-500/20' : ''} ${!canTransact ? 'opacity-65 cursor-not-allowed' : ''}`}
              />
              {moderationError?.field === 'title' && <p id="listing-title-policy-error" role="alert" className="mt-2 text-xs font-semibold text-red-600 dark:text-red-400">{moderationError.message} Edit the title and try again.</p>}
            </div>

            {/* Description */}
            <div>
              <label className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-ink-muted' : 'text-ink-secondary'}`}>
                Description
              </label>
              <textarea
                rows={6}
                required
                disabled={!canTransact}
                placeholder="Describe what you will do, tools you will use, and what is included in the service..."
                value={description}
                minLength={30}
                maxLength={1000}
                onChange={(e) => { setDescription(e.target.value); if (moderationError?.field === 'description') setModerationError(null); }}
                aria-invalid={moderationError?.field === 'description'}
                aria-describedby={moderationError?.field === 'description' ? 'listing-description-policy-error' : undefined}
                className={`w-full px-4 py-3 rounded-xl border outline-none font-medium text-sm resize-none leading-relaxed transition-all focus:ring-4 focus:ring-emerald-500/10 ${isDark
                    ? 'bg-[#1c1b18] border-neutral-800/80 text-white focus:border-emerald-500/80'
                    : 'bg-white border-slate-300 text-ink-secondary focus:border-emerald-500'
                  } ${moderationError?.field === 'description' ? 'border-red-500 ring-2 ring-red-500/20' : ''} ${!canTransact ? 'opacity-65 cursor-not-allowed' : ''}`}
              />
              {moderationError?.field === 'description' && <p id="listing-description-policy-error" role="alert" className="mt-2 text-xs font-semibold text-red-600 dark:text-red-400">{moderationError.message} Edit the description and try again.</p>}
            </div>

            {/* Payment Methods Checkboxes */}
            <div>
              <PaymentMethodCheckboxes legend="Payment Methods Accepted" value={{ cash: acceptCash, gcash: acceptGCash }} onChange={(methods) => { setAcceptCash(methods.cash); setAcceptGCash(methods.gcash); }} isDark={isDark} disabled={loading || !canTransact} />
              {acceptGCash && !hasMobileNumber && (
                <div className={`mt-2 flex flex-col gap-2 rounded-xl border p-2.5 text-xs sm:flex-row sm:items-center sm:justify-between ${isDark ? 'border-amber-900/50 bg-amber-950/20 text-amber-200' : 'border-amber-200 bg-amber-50 text-amber-900'}`}>
                  <p className="text-[11px] leading-4">
                    <span className="font-bold">Complete your mobile contact information.</span>{' '}
                    PayMongo Test Mode records an internal earning and does not transfer funds to this phone number.
                  </p>
                  <button type="button" onClick={() => router.push('/provider/account-settings#contact-information')} className="shrink-0 rounded-lg border border-current px-2.5 py-1 text-[11px] font-bold hover:bg-amber-500/10">
                    Add mobile number
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Category, Pricing, Schedule & Actions */}
          <div className="space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
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
                  options={categories.map((cat) => ({ value: cat.id, label: cat.name }))}
                  placeholder="Select a category..."
                  isDark={isDark}
                  theme="provider"
                  ariaInvalid={moderationError?.field === 'category'}
                  ariaDescribedBy={moderationError?.field === 'category' ? 'listing-category-policy-error' : undefined}
                />
                {moderationError?.field === 'category' && <p id="listing-category-policy-error" role="alert" className="mt-2 text-xs font-semibold text-red-600 dark:text-red-400">{moderationError.message} Choose the right category and try again.</p>}
              </div>

              {/* Engagement / Booking model */}
              <div>
                <label className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-ink-muted' : 'text-ink-secondary'}`}>
                  Booking Model
                </label>
                <div className={`rounded-xl border px-3 py-2 text-xs font-bold ${isDark ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                  Reusable one-time listing
                </div>
                <p className={`text-[10px] mt-1 leading-relaxed ${isDark ? 'text-ink-muted' : 'text-ink-subtle'}`}>
                  Each accepted request is an independent booking. A satisfied seeker may request this listing again after the previous booking closes.
                </p>
              </div>

              {/* Base Price & Pricing Unit */}
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-ink-muted' : 'text-ink-secondary'}`}>
                      Price (₱)
                    </label>
                    <input
                      type="number"
                      min={50}
                      max={50000}
                      required
                      placeholder="e.g. 500"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className={`w-full px-4 py-3 rounded-xl border outline-none font-semibold text-sm transition-all focus:ring-4 focus:ring-emerald-500/10 ${isDark
                          ? 'bg-[#1c1b18] border-neutral-800/80 text-white focus:border-emerald-500/80'
                          : 'bg-white border-slate-300 text-ink-secondary focus:border-emerald-500'
                        }`}
                    />
                  </div>

                  <div>
                    <label className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-ink-muted' : 'text-ink-secondary'}`}>
                      Pricing Unit
                    </label>
                    <FormalSelect
                      ariaLabel="Pricing Unit"
                      value={priceType}
                      onChange={(e) => setPriceType(e.target.value as NonNullable<ServiceListing['priceType']>)}
                      options={[
                        { value: 'FIXED', label: 'Fixed Price' },
                        { value: 'PER_HOUR', label: 'Per Hour' },
                        { value: 'PER_DAY', label: 'Per Day' },
                        { value: 'PER_PROJECT', label: 'Per Project' },
                      ]}
                      placeholder="Select pricing unit"
                      isDark={isDark}
                      theme="provider"
                    />
                  </div>
                </div>
                {price > 0 && (
                  <p className={`text-[10px] mt-1.5 font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    Preview: ₱{price}{priceType === 'PER_HOUR' ? ' / hour' : priceType === 'PER_DAY' ? ' / day' : priceType === 'PER_PROJECT' ? ' / project' : ''}
                  </p>
                )}
              </div>

              {/* Duration & Availability Status */}
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-ink-muted' : 'text-ink-secondary'}`}>
                      Est. Duration (Minutes)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={15}
                        max={480}
                        step={5}
                        required
                        value={durationMins}
                        onChange={(e) => setDurationMins(Math.max(1, Number(e.target.value)))}
                        className={`w-full px-4 py-3 pr-14 rounded-xl border outline-none font-semibold text-sm transition-all focus:ring-4 focus:ring-emerald-500/10 ${isDark
                            ? 'bg-[#1c1b18] border-neutral-800/80 text-white focus:border-emerald-500/80'
                            : 'bg-white border-slate-300 text-ink-secondary focus:border-emerald-500'
                          }`}
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-ink-subtle pointer-events-none">
                        mins
                      </span>
                    </div>
                    <p className={`text-[10px] mt-1 font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      {durationMins >= 60
                        ? `≈ ${Math.floor(durationMins / 60)} hr ${durationMins % 60 ? `${durationMins % 60} mins` : ''}`
                        : `${durationMins} minutes`}
                    </p>
                  </div>

                  <div>
                    <label className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-ink-muted' : 'text-ink-secondary'}`}>
                      Availability Status
                    </label>
                    <FormalSelect
                      ariaLabel="Availability Status"
                      value={availability}
                      onChange={(e) => setAvailability(e.target.value)}
                      options={[
                        { value: 'Available Now', label: 'Available Now' },
                        { value: 'Available Next Week', label: 'Available Next Week' },
                        { value: 'Busy / Paused', label: 'Busy / Paused' },
                      ]}
                      placeholder="Select availability"
                      isDark={isDark}
                      theme="provider"
                    />
                  </div>
                </div>
                <p className={`mt-1.5 text-[10px] leading-relaxed ${isDark ? 'text-ink-muted' : 'text-ink-subtle'}`}>
                  Manage how many paid jobs can wait for you in Provider Activity. This setting applies across all your listings and offers.
                </p>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex items-center justify-end">
              {moderationError && !moderationError.field && <p role="alert" className="mb-2 text-xs font-semibold text-red-600 dark:text-red-400">{moderationError.message}</p>}
              <button
                type="submit"
                disabled={loading || !canTransact}
                className={`w-full py-3.5 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 ${
                  !canTransact
                    ? 'bg-neutral-500 cursor-not-allowed opacity-50'
                    : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95'
                }`}
              >
                {loading ? 'Submitting...' : 'Publish Listing'}
              </button>
            </div>
          </div>

        </form>

      </div>

      {/* Info Warning */}
      <div className={`rounded-2xl p-4 border flex items-start space-x-3 transition-colors duration-200 ${isDark ? 'bg-[#1c1b18] border-neutral-800/80 text-ink-muted' : 'bg-slate-50 border-slate-300 text-ink-muted'
        }`}>
        <Info className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
        <div><p className="text-[10px] leading-relaxed">
          Your service appears in Seek Services after you publish it. No admin approval is needed. If a detail needs fixing, we will show you what to change before you try again.
        </p></div>
      </div>

    </div>
  );
}
