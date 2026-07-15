import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Briefcase, Info } from 'lucide-react';
import { useTransactionPermission } from '../../hooks/useTransactionPermission';

export default function OfferServices() {
  const { user, createServiceListing, isDark } = useApp();
  const { canTransact, navigateToVerification } = useTransactionPermission();

  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<string>('Lawn Care');
  const [price, setPrice] = useState<number>(500);
  const [description, setDescription] = useState<string>('');
  const [maxQueue, setMaxQueue] = useState<number>(5);
  const [estTime, setEstTime] = useState<string>('1 hour');
  const [availability, setAvailability] = useState<string>('Available Now');

  // Payment methods
  const [acceptCash, setAcceptCash] = useState<boolean>(true);
  const [acceptGCash, setAcceptGCash] = useState<boolean>(true);

  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const categories = [
    { label: 'Plumbing Repair', value: 'Plumbing' },
    { label: 'House Cleaning', value: 'House Cleaning' },
    { label: 'Electrical Repair', value: 'Electrical Repair' },
    { label: 'Gardening & Lawn Care', value: 'Lawn Care' },
    { label: 'Academic Tutoring', value: 'Tutoring' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!acceptCash && !acceptGCash) {
      alert('Please select at least one accepted payment method.');
      setLoading(false);
      return;
    }

    setTimeout(() => {
      const providerId = user?.id || '';
      // Mock skill proof url
      const mockProofUrl = 'cert_uploaded.jpg';

      createServiceListing(providerId, title, category, price, description, mockProofUrl, { cash: acceptCash, gcash: acceptGCash });

      setLoading(false);
      setSuccess(true);

      // Reset form
      setTitle('');
      setDescription('');
      setPrice(500);
      setCategory('Lawn Care');
      setMaxQueue(5);
      setEstTime('1 hour');

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    }, 800);
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
              className="bg-emerald-650 hover:bg-emerald-700 text-white font-extrabold text-[10px] px-4 py-2.5 rounded-xl transition-all shadow-md flex-shrink-0 cursor-pointer animate-none"
            >
              Verify Now
            </button>
          </div>
        )}

        {/* Success Alert Banner */}
        {success && (
          <div className={`border rounded-2xl p-4 text-xs font-semibold flex items-center space-x-2.5 mb-6 animate-in fade-in duration-205 ${isDark ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}>
            <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">✓</span>
            <span>Your service offering has been published and is now active on the marketplace!</span>
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
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border outline-none font-medium text-sm transition-all focus:ring-4 focus:ring-emerald-500/10 ${isDark
                      ? 'bg-[#1c1b18] border-neutral-850 text-[#f2efe9] focus:border-emerald-500/80'
                      : 'bg-white border-slate-300 text-slate-750 focus:border-emerald-500'
                    }`}
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value} className={isDark ? 'bg-[#1c1b18] text-[#f2efe9]' : ''}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Base Price */}
              <div>
                <label className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-655'}`}>
                  Base Price (₱)
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  placeholder="e.g. 500"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className={`w-full px-4 py-3 rounded-xl border outline-none font-semibold text-sm transition-all focus:ring-4 focus:ring-emerald-500/10 ${isDark
                      ? 'bg-[#1c1b18] border-neutral-850 text-[#f2efe9] focus:border-emerald-500/80'
                      : 'bg-white border-slate-300 text-slate-755 focus:border-emerald-500'
                    }`}
                />
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
                  <label className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-650'}`}>
                    Est. Time
                  </label>
                  <input
                    type="text"
                    required
                    value={estTime}
                    onChange={(e) => setEstTime(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border outline-none font-medium text-sm transition-all focus:ring-4 focus:ring-emerald-500/10 ${isDark
                        ? 'bg-[#1c1b18] border-neutral-850 text-[#f2efe9] focus:border-emerald-500/80'
                        : 'bg-white border-slate-300 text-slate-700 focus:border-emerald-500'
                      }`}
                  />
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
                </div>
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
                {loading ? 'Publishing...' : 'Publish Service Listing'}
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
          Submitting a new service listing publishes your skills to the public Seeker Marketplace. Please check that your pricing is fair, and describe the tasks clearly to avoid disputes.
        </p>
      </div>

    </div>
  );
}
