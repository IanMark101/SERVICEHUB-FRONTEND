import React, { useState, FormEvent, useEffect } from 'react';
import { ServiceListing } from '../../types';
import { useApp } from '../../context/AppContext';
import { X, CreditCard, DollarSign, Sparkles } from 'lucide-react';
import { apiGetProviderSummary } from '../../api/ai.api';

interface RequestServiceModalProps {
  listing: ServiceListing;
  onClose: () => void;
  initialPaymentMethod?: 'GCash' | 'On-site Cash';
}

export default function RequestServiceModal({ listing, onClose, initialPaymentMethod }: RequestServiceModalProps) {
  const { user, bookProviderDirectly, isDark } = useApp();

  const [description, setDescription] = useState<string>('');
  const [price, setPrice] = useState<number>(listing.price);
  const [paymentMethod, setPaymentMethod] = useState<'GCash' | 'On-site Cash'>(initialPaymentMethod || 'GCash');
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    if (listing.providerId) {
      setLoadingAi(true);
      apiGetProviderSummary(listing.providerId)
        .then((res) => {
          if (active && res.success && res.data.summary) {
            setAiSummary(res.data.summary);
          }
        })
        .catch((err) => {
          console.warn("Failed to fetch provider reviews summary:", err);
        })
        .finally(() => {
          if (active) setLoadingAi(false);
        });
    }
    return () => {
      active = false;
    };
  }, [listing.providerId]);

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('Please enter a description for the booking.');
      return;
    }

    setLoading(true);

    // Mock API call delay
    setTimeout(() => {
      const seekerId = user?.id || '';

      bookProviderDirectly(seekerId, listing.id, price, description, paymentMethod);

      setLoading(false);
      setSuccess(true);

      setTimeout(() => {
        onClose();
      }, 1000);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm select-none animate-in fade-in duration-200">

      {/* Modal Container */}
      <div className={`rounded-[24px] max-w-lg w-full max-h-[95vh] overflow-y-auto shadow-xl border transition-colors duration-200 ${isDark ? 'bg-[#22211e] border-neutral-800/80 text-[#f2efe9]' : 'bg-white border-slate-200 text-slate-800'
        }`}>

        {/* Header */}
        <div className={`p-5 border-b flex justify-between items-center ${isDark ? 'bg-[#1c1b18]/45 border-neutral-850' : 'bg-slate-50/50 border-slate-100'
          }`}>
          <div>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider border ${isDark
                ? 'text-orange-400 bg-orange-950/20 border-orange-900/30'
                : 'text-orange-655 bg-orange-50 border-orange-100'
              }`}>
              Direct Booking
            </span>
            <h3 className={`font-extrabold text-sm mt-1.5 leading-snug ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
              Request {listing.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg border transition-colors ${isDark ? 'border-neutral-800 hover:bg-slate-800 text-neutral-450' : 'border-slate-200 hover:bg-slate-100 text-slate-400 hover:text-slate-700'
              }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success State */}
        {success ? (
          <div className="p-8 text-center space-y-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto text-xl font-bold border ${isDark ? 'bg-emerald-950/20 text-emerald-405 border-emerald-900/30' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
              }`}>
              ✓
            </div>
            <h4 className={`font-bold text-sm ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>Booking Sent Successfully!</h4>
            <p className={`text-xs ${isDark ? 'text-[#b4b0a9]' : 'text-slate-450'}`}>
              The booking request has been sent to {listing.providerName} for review.
            </p>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="p-5 space-y-4">

            {/* AI Review Summary Card */}
            {(loadingAi || aiSummary) && (
              <div className={`p-4 rounded-2xl border transition-all duration-200 ${
                isDark 
                  ? 'bg-orange-950/10 border-orange-900/30 text-[#f2efe9]' 
                  : 'bg-orange-50/50 border-orange-100/80 text-slate-800'
              }`}>
                <div className="flex items-center space-x-2 mb-1.5">
                  <span className={isDark ? 'text-orange-400' : 'text-orange-600'}>
                    <Sparkles className="w-4 h-4 animate-pulse" />
                  </span>
                  <h4 className={`text-[11px] uppercase tracking-wider font-extrabold ${
                    isDark ? 'text-orange-400' : 'text-orange-755'
                  }`}>
                    AI-Generated Feedback Digest
                  </h4>
                </div>
                {loadingAi ? (
                  <div className="flex items-center space-x-2 py-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce" />
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce delay-100" />
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce delay-200" />
                    <span className="text-[10px] text-slate-400 dark:text-neutral-500 font-semibold pl-1">Analyzing past community reviews...</span>
                  </div>
                ) : (
                  <p className={`text-xs leading-relaxed font-semibold italic ${
                    isDark ? 'text-[#b4b0a9]' : 'text-slate-600'
                  }`}>
                    "{aiSummary}"
                  </p>
                )}
              </div>
            )}

            {/* Description */}
            <div>
              <label className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-650'}`}>
                Describe the work needed
              </label>
              <textarea
                rows={4}
                required
                placeholder="Describe exactly what needs to be done, location details, preferred schedules..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border outline-none font-medium text-sm resize-none transition-all ${isDark
                    ? 'bg-[#1c1b18] border-neutral-850 text-[#f2efe9] focus:border-orange-500/80 focus:ring-1 focus:ring-orange-500/30'
                    : 'bg-slate-50 border-slate-200 text-slate-700 focus:border-orange-500'
                  }`}
              />
            </div>

            {/* Price offer / Budget */}
            <div>
              <label className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-655'}`}>
                Your Budget Offer (₱)
              </label>
              <input
                type="number"
                min={1}
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className={`w-full px-4 py-3 rounded-xl border outline-none font-semibold text-sm transition-all ${isDark
                    ? 'bg-[#1c1b18] border-neutral-850 text-[#f2efe9] focus:border-orange-500/80 focus:ring-1 focus:ring-orange-500/30'
                    : 'bg-slate-50 border-slate-200 text-slate-750 focus:border-orange-500'
                  }`}
              />
              <span className={`block text-[10px] mt-1 ${isDark ? 'text-[#b4b0a9]' : 'text-slate-450'}`}>Base listing rate: ₱{listing.price}</span>
            </div>

            {/* Payment Method Badge Selector */}
            <div>
              <label className={`text-xs font-semibold mb-2 block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-655'}`}>
                Preferred Payment Method
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('GCash')}
                  className={`p-3 rounded-xl border flex items-center justify-center space-x-2 transition-all ${paymentMethod === 'GCash'
                      ? isDark
                        ? 'border-orange-500 bg-orange-950/20 text-orange-400 font-bold'
                        : 'border-orange-500 bg-orange-55 text-orange-600 font-bold'
                      : isDark
                        ? 'border-neutral-850 bg-[#1c1b18] hover:bg-[#2c2b27] text-neutral-450'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500 font-semibold'
                    }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span className="text-xs">GCash</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('On-site Cash')}
                  className={`p-3 rounded-xl border flex items-center justify-center space-x-2 transition-all ${paymentMethod === 'On-site Cash'
                      ? isDark
                        ? 'border-orange-500 bg-orange-950/20 text-orange-400 font-bold'
                        : 'border-orange-500 bg-orange-55 text-orange-600 font-bold'
                      : isDark
                        ? 'border-neutral-850 bg-[#1c1b18] hover:bg-[#2c2b27] text-neutral-450'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500 font-semibold'
                    }`}
                >
                  <DollarSign className="w-4 h-4" />
                  <span className="text-xs">On-site Cash</span>
                </button>
              </div>
            </div>

            {/* Spec Part 5 Cancellation Policy Disclaimer */}
            <p className={`text-[10px] leading-relaxed p-3 rounded-xl border mt-3 ${
              isDark 
                ? 'bg-neutral-900 border-neutral-800 text-neutral-400' 
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}>
              ⚠️ You can cancel for free anytime before the provider starts the job. Once they've started, cancellation needs their approval.
            </p>

            {/* Actions */}
            <div className={`pt-3 border-t mt-3 flex items-center justify-end space-x-2.5 ${isDark ? 'border-neutral-850' : 'border-slate-100'}`}>
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2.5 border font-bold text-xs rounded-xl transition-all ${isDark
                    ? 'border-neutral-800 hover:bg-[#2c2b27] text-[#b4b0a9]'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-500'
                  }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center space-x-1.5"
              >
                {loading ? 'Sending Request...' : 'Send Booking Request'}
              </button>
            </div>

          </form>
        )}

      </div>

    </div>
  );
}
