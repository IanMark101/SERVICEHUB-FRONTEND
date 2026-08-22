import React, { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ServiceListing } from '../../types';
import { useApp } from '../../context/AppContext';
import { X, CreditCard, MapPin, Smartphone, Sparkles } from 'lucide-react';
import { apiGetProviderSummary } from '../../api/ai.api';
import { apiBookDirect } from '../../api/bookings.api';
import { getServicePaymentMethods, shouldShowPaymentSelector } from '../../lib/paymentUtils';

interface RequestServiceModalProps {
  listing: ServiceListing;
  onClose: () => void;
  initialPaymentMethod?: 'GCash' | 'On-site Cash';
}

export default function RequestServiceModal({ listing, onClose, initialPaymentMethod }: RequestServiceModalProps) {
  const router = useRouter();
  const { user, bookProviderDirectly, isDark } = useApp();
  const isOwned = !!(user && listing.providerId === user.id);

  // ── Payment method source of truth ──────────────────────────────────────────
  const { cash, gcash } = getServicePaymentMethods(listing);
  const showSelector = shouldShowPaymentSelector(listing); // true only when BOTH are supported

  // Resolve a valid default: if the caller passed a method not supported, fall back to supported one
  const resolveDefault = (): 'GCash' | 'On-site Cash' => {
    if (initialPaymentMethod === 'GCash' && gcash) return 'GCash';
    if (initialPaymentMethod === 'On-site Cash' && cash) return 'On-site Cash';
    if (cash) return 'On-site Cash';
    return 'GCash';
  };

  const [description, setDescription] = useState<string>('');
  const [price, setPrice] = useState<number>(listing.price);
  const [paymentMethod, setPaymentMethod] = useState<'GCash' | 'On-site Cash'>(resolveDefault);
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [scheduledTime, setScheduledTime] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const gcashClass = paymentMethod === 'GCash'
    ? (isDark ? 'border-orange-500 bg-orange-950/20 text-orange-400 font-bold' : 'border-orange-500 bg-orange-55 text-orange-600 font-bold')
    : (isDark ? 'border-neutral-850 bg-[#1c1b18] hover:bg-[#2c2b27] text-neutral-450' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500 font-semibold');

  const cashClass = paymentMethod === 'On-site Cash'
    ? (isDark ? 'border-orange-500 bg-orange-950/20 text-orange-400 font-bold' : 'border-orange-500 bg-orange-55 text-orange-600 font-bold')
    : (isDark ? 'border-neutral-850 bg-[#1c1b18] hover:bg-[#2c2b27] text-neutral-450' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500 font-semibold');

  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiReason, setAiReason] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    if (listing.providerId) {
      setLoadingAi(true);
      apiGetProviderSummary(listing.providerId)
        .then((res) => {
          if (active && res.success) {
            if (res.data?.summary) {
              setAiSummary(res.data.summary);
            } else if (res.data?.reason) {
              setAiReason(res.data.reason);
            }
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

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    if (!description.trim()) {
      setFormError('Please describe the work needed before sending the request.');
      return;
    }

    if (listing.serviceType === 'SESSION_BASED') {
      if (!scheduledDate) {
        setFormError('Please select a session date.');
        return;
      }
      if (!scheduledTime) {
        setFormError('Please select a session start time.');
        return;
      }
    }

    if (listing.isPaused) {
      setFormError('This service is currently paused by the provider and cannot be booked at this time.');
      return;
    }

    if (!user) {
      setFormError('You must be logged in to book a service.');
      return;
    }

    setLoading(true);
    try {
      if (paymentMethod === 'On-site Cash') {
        // Cash path — call apiBookDirect directly to pass scheduledDate/Time
        await apiBookDirect({
          serviceId: listing.id,
          agreedPrice: price,
          message: description,
          scheduledDate: scheduledDate || undefined,
          scheduledTime: scheduledTime || undefined,
        });
      } else {
        // GCash/online path — use the existing hook
        await bookProviderDirectly(user.id, listing.id, price, description, paymentMethod);
      }
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setLoading(false);
      setFormError(err?.response?.data?.error || err?.message || 'Booking failed. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm select-none animate-in fade-in duration-200">

      {/* Modal Container */}
      <div className={`rounded-[24px] max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden shadow-xl border transition-colors duration-200 ${isDark ? 'bg-[#22211e] border-neutral-800/80 text-[#f2efe9]' : 'bg-white border-slate-200 text-slate-800'
        }`}>

        {/* Header */}
        <div className={`flex-shrink-0 p-5 border-b flex justify-between items-center ${isDark ? 'bg-[#1c1b18]/45 border-neutral-850' : 'bg-slate-50/50 border-slate-100'
          }`}>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider border ${isDark
                  ? 'text-orange-400 bg-orange-950/20 border-orange-900/30'
                  : 'text-orange-655 bg-orange-50 border-orange-100'
                }`}>
                Direct Booking
              </span>
              {listing.serviceType === 'SESSION_BASED' && (
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${
                  isDark
                    ? 'text-emerald-400 bg-emerald-950/20 border-emerald-900/30'
                    : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                }`}>
                  ↺ Session-based
                </span>
              )}
            </div>
            <h3 className={`font-extrabold text-sm mt-1.5 leading-snug ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
              Request {listing.title}
            </h3>
            {listing.priceType && listing.priceType !== 'FIXED' && (
              <p className={`text-[10px] font-semibold mt-0.5 ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>
                ₱{listing.price}{listing.priceType === 'PER_SESSION' ? ' / session' : listing.priceType === 'PER_HOUR' ? ' / hour' : listing.priceType === 'PER_DAY' ? ' / day' : listing.priceType === 'PER_PROJECT' ? ' / project' : ''}
              </p>
            )}
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
          <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">

            {/* Self-transaction policy warning banner */}
            {isOwned && (
              <div className={`p-4 rounded-2xl border transition-all duration-200 ${
                isDark 
                  ? 'bg-red-950/20 border-red-900/30 text-red-400' 
                  : 'bg-red-50 border-red-100 text-red-750'
              }`}>
                <p className="text-xs font-semibold">
                  This is your own service listing. Marketplace transactions with your own account are not allowed.
                </p>
              </div>
            )}

            {/* AI Review Summary Card */}
            {loadingAi ? (
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
                <div className="flex items-center space-x-2 py-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce" />
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce delay-100" />
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce delay-200" />
                  <span className="text-xs text-slate-400 dark:text-neutral-400 font-semibold pl-1">Getting review information...</span>
                </div>
              </div>
            ) : aiSummary ? (
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
                <p className={`text-xs leading-relaxed font-semibold italic ${
                  isDark ? 'text-[#b4b0a9]' : 'text-slate-600'
                }`}>
                  "{aiSummary}"
                </p>
              </div>
            ) : (
              <div className={`p-3.5 rounded-2xl border text-xs space-y-0.5 font-medium ${
                isDark ? 'bg-[#1c1b18] border-neutral-850 text-neutral-400' : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}>
                <div className="flex items-center space-x-1.5 font-bold text-amber-500">
                  <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>AI Summary unavailable</span>
                </div>
                <p className="text-[11px]">
                  {aiReason || 'No client reviews are available yet for this service offer.'}
                </p>
              </div>
            )}

            {/* Description */}
            <div>
              <label className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-655'}`}>
                Describe the work needed
              </label>
              <textarea
                rows={4}
                required
                disabled={isOwned}
                placeholder="Describe exactly what needs to be done, location details, preferred schedules..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border outline-none font-medium text-sm resize-none transition-all ${isDark
                    ? 'bg-[#1c1b18] border-neutral-850 text-[#f2efe9] focus:border-orange-500/80 focus:ring-1 focus:ring-orange-500/30'
                    : 'bg-slate-50 border-slate-200 text-slate-700 focus:border-orange-500'
                  } ${isOwned ? 'opacity-65' : ''}`}
              />
            </div>

            {/* Session Scheduling — only for SESSION_BASED services */}
            {listing.serviceType === 'SESSION_BASED' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-655'}`}>
                    Session Date
                  </label>
                  <input
                    type="date"
                    required
                    disabled={isOwned}
                    value={scheduledDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border outline-none font-medium text-sm transition-all ${isDark
                      ? 'bg-[#1c1b18] border-neutral-850 text-[#f2efe9] focus:border-orange-500/80 focus:ring-1 focus:ring-orange-500/30'
                      : 'bg-slate-50 border-slate-200 text-slate-700 focus:border-orange-500'
                    } ${isOwned ? 'opacity-65' : ''}`}
                  />
                </div>
                <div>
                  <label className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-655'}`}>
                    Session Start Time
                  </label>
                  <input
                    type="time"
                    required
                    disabled={isOwned}
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border outline-none font-medium text-sm transition-all ${isDark
                      ? 'bg-[#1c1b18] border-neutral-850 text-[#f2efe9] focus:border-orange-500/80 focus:ring-1 focus:ring-orange-500/30'
                      : 'bg-slate-50 border-slate-200 text-slate-700 focus:border-orange-500'
                    } ${isOwned ? 'opacity-65' : ''}`}
                  />
                </div>
              </div>
            )}

            {/* Price offer / Budget */}
            <div>
              <label className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-655'}`}>
                Your Budget Offer (₱)
              </label>
              <input
                type="number"
                min={1}
                required
                disabled={isOwned}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className={`w-full px-4 py-3 rounded-xl border outline-none font-semibold text-sm transition-all ${isDark
                    ? 'bg-[#1c1b18] border-neutral-850 text-[#f2efe9] focus:border-orange-500/80 focus:ring-1 focus:ring-orange-500/30'
                    : 'bg-slate-50 border-slate-200 text-slate-750 focus:border-orange-500'
                  } ${isOwned ? 'opacity-65' : ''}`}
              />
              <span className={`block text-[10px] mt-1 ${isDark ? 'text-[#b4b0a9]' : 'text-slate-450'}`}>Base listing rate: ₱{listing.price}</span>
            </div>

            {/* Payment Method Badge Selector — only shown when provider supports BOTH methods */}
            {showSelector ? (
              <div>
                <label className={`text-xs font-semibold mb-2 block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-655'}`}>
                  Preferred Payment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => !isOwned && setPaymentMethod('GCash')}
                    className={`p-3 rounded-xl border flex items-center justify-center space-x-2 transition-all ${
                      paymentMethod === 'GCash'
                        ? (isDark ? 'border-orange-500 bg-orange-950/20 text-orange-400 font-bold' : 'border-orange-500 bg-orange-55 text-orange-600 font-bold')
                        : (isDark ? 'border-neutral-850 bg-[#1c1b18] hover:bg-[#2c2b27] text-neutral-450' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500 font-semibold')
                    } ${isOwned ? 'opacity-65 cursor-not-allowed' : ''}`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span className="text-xs">GCash</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => !isOwned && setPaymentMethod('On-site Cash')}
                    className={`p-3 rounded-xl border flex items-center justify-center space-x-2 transition-all ${
                      paymentMethod === 'On-site Cash'
                        ? (isDark ? 'border-orange-500 bg-orange-950/20 text-orange-400 font-bold' : 'border-orange-500 bg-orange-55 text-orange-600 font-bold')
                        : (isDark ? 'border-neutral-850 bg-[#1c1b18] hover:bg-[#2c2b27] text-neutral-450' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500 font-semibold')
                    } ${isOwned ? 'opacity-65 cursor-not-allowed' : ''}`}
                  >
                    <MapPin className="w-4 h-4" />
                    <span className="text-xs">On-site Cash</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Single method — show read-only badge, no selector */
              <div>
                <label className={`text-xs font-semibold mb-2 block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-655'}`}>
                  Payment Method
                </label>
                <div className={`p-3 rounded-xl border flex items-center space-x-2 ${
                  isDark ? 'bg-[#1c1b18] border-neutral-850 text-[#b4b0a9]' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}>
                  {gcash && !cash
                    ? <><Smartphone className="w-4 h-4 text-orange-500" /><span className="text-xs font-semibold">GCash Online</span></>
                    : <><MapPin className="w-4 h-4" /><span className="text-xs font-semibold">On-site Cash</span></>}
                  <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-md border ${
                    isDark ? 'border-neutral-800 text-neutral-500' : 'border-slate-200 text-slate-400'
                  }`}>Provider's only accepted method</span>
                </div>
              </div>
            )}

            {/* Spec Part 5 Cancellation Policy Disclaimer */}
            <p className={`text-[10px] leading-relaxed p-3 rounded-xl border mt-3 ${
              isDark 
                ? 'bg-neutral-900 border-neutral-800 text-neutral-400' 
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}>
              ⚠️ You can cancel for free anytime before the provider starts the job. Once they've started, cancellation needs their approval.
            </p>

            {/* Error Message */}
            {formError && (
              <div className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center space-x-2 ${
                isDark
                  ? 'bg-red-950/30 border-red-900/40 text-red-400'
                  : 'bg-red-50 border-red-200 text-red-600'
              }`}>
                <span>⚠️</span>
                <span>{formError}</span>
              </div>
            )}

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
                {isOwned ? 'Return to Marketplace' : 'Cancel'}
              </button>
              {isOwned ? (
                <button
                  type="button"
                  onClick={() => router.push(`/provider/service-manager?id=${listing.id}`)}
                  className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center space-x-1.5 cursor-pointer"
                >
                  Edit Listing Details
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center space-x-1.5"
                >
                  {loading ? 'Sending Request...' : 'Send Booking Request'}
                </button>
              )}
            </div>

          </form>
        )}

      </div>

    </div>
  );
}
