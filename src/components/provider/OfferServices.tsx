import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Briefcase, Info } from 'lucide-react';
import { useTransactionPermission } from '../../hooks/useTransactionPermission';
import { useToast } from '../ui/Toast';
import type { ServiceListing } from '../../types';
import { useRouter } from 'next/navigation';

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
  const [maxQueue, setMaxQueue] = useState<number>(5);
  const [durationMins, setDurationMins] = useState<number>(30);
  const [availability, setAvailability] = useState<string>('Available Now');

  // Payment methods
  const [acceptCash, setAcceptCash] = useState<boolean>(true);
  const [acceptGCash, setAcceptGCash] = useState<boolean>(true);
  const [acceptMaya, setAcceptMaya] = useState<boolean>(false);
  const [acceptCard] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const hasMobileNumber = Boolean(user?.phone?.trim());

  const categories = dbCategories;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptCash && !acceptGCash && !acceptMaya && !acceptCard) {
      error('Payment method required', 'Select at least one supported payment method for this listing.');
      return;
    }

    const selectedCategory = category || (dbCategories.length > 0 ? dbCategories[0].id : '');
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
      { cash: acceptCash, gcash: acceptGCash, maya: acceptMaya, card: acceptCard },
      {
        serviceType: 'ONE_TIME',
        priceType,
        estimatedDurationMins: Math.max(15, Math.min(480, durationMins)),
        queueLimit: Math.max(1, Math.min(10, maxQueue)),
      }
    );

    setLoading(false);

    if (res?.success) {
      // Reset form
      setTitle('');
      setDescription('');
      setPrice(500);
      setCategory(dbCategories.length > 0 ? dbCategories[0].id : '');
      setPriceType('FIXED');
      setMaxQueue(5);
      setDurationMins(30);
    }
  };

  return (
    <div className={`max-w-5xl mx-auto space-y-6 select-none transition-colors duration-200 ${isDark ? 'text-[#f2efe9]' : 'text-slate-800'}`}>

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
            <h2 className={`text-base font-extrabold leading-none ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
              Create a Service Listing
            </h2>
            <p className={`text-[10px] mt-1 ${isDark ? 'text-[#b4b0a9]' : 'text-slate-455'}`}>
              Offer your skills to the local community.
            </p>
          </div>
        </div>

        {/* Verification Required Alert Block */}
        {!canTransact && (
          <div className={`p-4 rounded-2xl border text-xs font-semibold flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 animate-in fade-in duration-200 ${
            isDark ? 'bg-amber-955/25 border-amber-900/30 text-amber-400' : 'bg-amber-50 border-amber-250 text-amber-800'
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

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Left Column (3/5 width): Main Content fields */}
          <div className="lg:col-span-3 space-y-5">
            {/* Service Title */}
            <div>
              <label className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-650'}`}>
                Service Listing Title
              </label>
              <input
                type="text"
                required
                disabled={!canTransact}
                placeholder="e.g. Lawn Mowing and Edge Trimming"
                value={title}
                minLength={10}
                maxLength={100}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border outline-none font-medium text-sm transition-all focus:ring-4 focus:ring-emerald-500/10 ${isDark
                    ? 'bg-[#1c1b18] border-neutral-855 text-[#f2efe9] focus:border-emerald-500/80'
                    : 'bg-white border-slate-300 text-slate-700 focus:border-emerald-500'
                  } ${!canTransact ? 'opacity-65 cursor-not-allowed' : ''}`}
              />
            </div>

            {/* Description */}
            <div>
              <label className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-655'}`}>
                Description
              </label>
              <textarea
                rows={7}
                required
                disabled={!canTransact}
                placeholder="Describe what you will do, tools you will use, and what is included in the service..."
                value={description}
                minLength={30}
                maxLength={1000}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border outline-none font-medium text-sm resize-none leading-relaxed transition-all focus:ring-4 focus:ring-emerald-500/10 ${isDark
                    ? 'bg-[#1c1b18] border-neutral-855 text-[#f2efe9] focus:border-emerald-500/80'
                    : 'bg-white border-slate-300 text-slate-700 focus:border-emerald-500'
                  } ${!canTransact ? 'opacity-65 cursor-not-allowed' : ''}`}
              />
            </div>
          </div>

          {/* Right Column (2/5 width): Configuration details */}
          <div className="lg:col-span-2 space-y-5 flex flex-col justify-between">
            <div className="space-y-5">
              {/* Category */}
              <div>
                <label className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-655'}`}>
                  Service Category
                </label>

                {/* Live category dropdown — driven by admin-approved DB categories */}
                <select
                  value={category}
                  required
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={!canTransact}
                  className={`w-full px-4 py-3 rounded-xl border outline-none font-medium text-sm transition-all focus:ring-4 focus:ring-emerald-500/10 ${isDark
                      ? 'bg-[#1c1b18] border-neutral-850 text-[#f2efe9] focus:border-emerald-500/80'
                      : 'bg-white border-slate-300 text-slate-750 focus:border-emerald-500'
                    } ${!canTransact ? 'opacity-65 cursor-not-allowed' : ''}`}
                >
                  <option value="" disabled>Select a category...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id} className={isDark ? 'bg-[#1c1b18] text-[#f2efe9]' : ''}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>


              {/* Engagement model */}
              <div>
                <label className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-655'}`}>
                  Booking Model
                </label>
                <div className={`rounded-xl border px-3 py-2.5 text-xs font-bold ${isDark ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>Reusable one-time listing</div>
                <p className={`text-[10px] mt-1.5 leading-relaxed ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>
                  Each accepted request is an independent booking. A satisfied seeker may request this listing again after the previous booking closes.
                </p>
              </div>

              {/* Base Price */}
              <div>
                <label className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-655'}`}>
                  Price (₱)
                </label>
                <input
                  type="number"
                  min={50}
                  max={50000}
                  required={priceType !== 'CUSTOM'}
                  disabled={priceType === 'CUSTOM'}
                  placeholder="e.g. 500"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className={`w-full px-4 py-3 rounded-xl border outline-none font-semibold text-sm transition-all focus:ring-4 focus:ring-emerald-500/10 ${isDark
                      ? 'bg-[#1c1b18] border-neutral-850 text-[#f2efe9] focus:border-emerald-500/80'
                      : 'bg-white border-slate-300 text-slate-755 focus:border-emerald-500'
                    }`}
                />
              </div>

              {/* Pricing Unit */}
              <div>
                <label className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-655'}`}>
                  Pricing Unit
                </label>
                <select
                  value={priceType}
                  onChange={(e) => setPriceType(e.target.value as NonNullable<ServiceListing['priceType']>)}
                  className={`w-full px-4 py-3 rounded-xl border outline-none font-medium text-sm transition-all focus:ring-4 focus:ring-emerald-500/10 ${isDark
                      ? 'bg-[#1c1b18] border-neutral-850 text-[#f2efe9] focus:border-emerald-500/80'
                      : 'bg-white border-slate-300 text-slate-750 focus:border-emerald-500'
                    }`}
                >
                  <option value="FIXED" className={isDark ? 'bg-[#1c1b18]' : ''}>Fixed Price</option>
                  <option value="PER_HOUR" className={isDark ? 'bg-[#1c1b18]' : ''}>Per Hour</option>
                  <option value="PER_DAY" className={isDark ? 'bg-[#1c1b18]' : ''}>Per Day</option>
                  <option value="PER_PROJECT" className={isDark ? 'bg-[#1c1b18]' : ''}>Per Project</option>
                  <option value="STARTS_AT" className={isDark ? 'bg-[#1c1b18]' : ''}>Starts At</option>
                  <option value="CUSTOM" className={isDark ? 'bg-[#1c1b18]' : ''}>Custom</option>
                </select>
                {price > 0 && (
                  <p className={`text-[10px] mt-1.5 font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    Preview: ₱{price}{priceType === 'PER_HOUR' ? ' / hour' : priceType === 'PER_DAY' ? ' / day' : priceType === 'PER_PROJECT' ? ' / project' : priceType === 'STARTS_AT' ? ' starting at' : ''}
                  </p>
                )}
              </div>

              {/* Max Queue & Est Time side-by-side */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-650'}`}>
                    Max Queue
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={maxQueue}
                    onChange={(e) => setMaxQueue(Number(e.target.value))}
                    className={`w-full px-4 py-3 rounded-xl border outline-none font-medium text-sm transition-all focus:ring-4 focus:ring-emerald-500/10 ${isDark
                        ? 'bg-[#1c1b18] border-neutral-850 text-[#f2efe9] focus:border-emerald-500/80'
                        : 'bg-white border-slate-300 text-slate-700 focus:border-emerald-500'
                      }`}
                  />
                </div>

                <div>
                  <label className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-700'}`}>
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
                          ? 'bg-[#1c1b18] border-neutral-850 text-[#f2efe9] focus:border-emerald-500/80'
                          : 'bg-white border-slate-300 text-slate-700 focus:border-emerald-500'
                        }`}
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                      mins
                    </span>
                  </div>
                  <p className={`text-[10px] mt-1.5 font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    {durationMins >= 60
                      ? `≈ ${Math.floor(durationMins / 60)} hr ${durationMins % 60 ? `${durationMins % 60} mins` : ''}`
                      : `${durationMins} minutes`}
                  </p>
                </div>
              </div>

              {/* Availability Status */}
              <div>
                <label className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-655'}`}>
                  Availability Status
                </label>
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border outline-none font-medium text-sm transition-all focus:ring-4 focus:ring-emerald-500/10 ${isDark
                      ? 'bg-[#1c1b18] border-neutral-850 text-[#f2efe9] focus:border-emerald-500/80'
                      : 'bg-white border-slate-300 text-slate-755 focus:border-emerald-500'
                    }`}
                >
                  <option value="Available Now" className={isDark ? 'bg-[#1c1b18] text-[#f2efe9]' : ''}>Available Now</option>
                  <option value="Available Next Week" className={isDark ? 'bg-[#1c1b18] text-[#f2efe9]' : ''}>Available Next Week</option>
                  <option value="Busy / Paused" className={isDark ? 'bg-[#1c1b18] text-[#f2efe9]' : ''}>Busy / Paused</option>
                </select>
              </div>

              {/* Payment Methods Checkboxes */}
              <div>
                <label className={`text-xs font-semibold mb-2 block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-650'}`}>
                  Payment Methods Accepted
                </label>
                <div className={`border rounded-xl p-4 flex items-center space-x-6 transition-all ${isDark ? 'bg-[#1c1b18] border-neutral-850' : 'bg-white border-slate-300'
                   }`}>
                  <label className="flex items-center space-x-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptCash}
                      onChange={(e) => setAcceptCash(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                    />
                    <span className={isDark ? 'text-[#f2efe9]' : 'text-slate-800'}>On-site Cash</span>
                  </label>

                  <label className="flex items-center space-x-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptGCash}
                      onChange={(e) => setAcceptGCash(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                    />
                    <span className={isDark ? 'text-[#f2efe9]' : 'text-slate-800'}>GCash</span>
                  </label>

                  <label className="flex items-center space-x-2 text-xs font-semibold cursor-pointer">
                    <input type="checkbox" checked={acceptMaya} onChange={(e) => setAcceptMaya(e.target.checked)} className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300" />
                    <span className={isDark ? 'text-[#f2efe9]' : 'text-slate-800'}>Maya</span>
                  </label>

                  <label className="flex items-center space-x-2 text-xs font-semibold cursor-pointer">
                    <input type="checkbox" disabled checked={false} className="w-4 h-4 rounded border-slate-300" />
                    <span className="text-slate-400">Card (unavailable)</span>
                  </label>
                </div>
                {acceptGCash && !hasMobileNumber && (
                  <div className={`mt-2 flex flex-col gap-3 rounded-xl border p-3 text-xs sm:flex-row sm:items-center sm:justify-between ${isDark ? 'border-amber-900/50 bg-amber-950/20 text-amber-200' : 'border-amber-200 bg-amber-50 text-amber-900'}`}>
                    <p className="leading-5">
                      <span className="font-bold">Complete your mobile contact information.</span>{' '}
                      PayMongo Test Mode records an internal earning and does not transfer funds to this phone number.
                    </p>
                    <button type="button" onClick={() => router.push('/provider/user-profile?tab=settings')} className="shrink-0 rounded-lg border border-current px-3 py-2 font-bold hover:bg-amber-500/10">
                      Add mobile number
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-3 flex items-center justify-end">
              <button
                type="submit"
                disabled={loading || !canTransact}
                className={`w-full py-3.5 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 animate-none ${
                  !canTransact
                    ? 'bg-neutral-500 cursor-not-allowed opacity-50'
                    : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95'
                }`}
              >
                {loading ? 'Submitting...' : 'Submit Listing for Review'}
              </button>
            </div>
          </div>

        </form>

      </div>

      {/* Info Warning */}
      <div className={`rounded-2xl p-4 border flex items-start space-x-3 transition-colors duration-200 ${isDark ? 'bg-[#1c1b18] border-neutral-800/80 text-[#b4b0a9]' : 'bg-slate-50 border-slate-300 text-slate-500'
        }`}>
        <Info className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
        <p className="text-[10px] leading-relaxed">
          All service listings are submitted to municipal administrators for review before appearing on the public Seeker Marketplace. Please ensure your title, pricing, and description clearly reflect your services.
        </p>
      </div>

    </div>
  );
}
