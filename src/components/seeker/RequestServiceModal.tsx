import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ServiceListing } from '../../types';
import { useApp } from '../../context/AppContext';
import { X } from 'lucide-react';
import ReviewSummaryPanel from '../ui/ReviewSummaryPanel';
import { apiBookDirect } from '../../api/bookings.api';
import { getServicePaymentMethods } from '../../lib/paymentUtils';
import { getApiErrorMessage } from '../../lib/api/errors';
import GCashLogo from '../ui/GCashLogo';

interface RequestServiceModalProps {
  listing: ServiceListing;
  onClose: () => void;
  initialPaymentMethod?: 'GCash' | 'On-site Cash';
}

export default function RequestServiceModal({ listing, onClose, initialPaymentMethod }: RequestServiceModalProps) {
  const router = useRouter();
  const { user, bookProviderDirectly, isDark, jobEngagements } = useApp();
  const isOwned = !!(user && listing.providerId === user.id);
  const priceUnavailable = listing.priceType === 'STARTS_AT' || listing.priceType === 'CUSTOM' || !Number.isFinite(Number(listing.price)) || Number(listing.price) < 50;
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
  const [quantity, setQuantity] = useState<number>(1);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (priceUnavailable) {
      setFormError('This provider needs to set a final price before the service can be booked.');
      return;
    }
    if (!cash && !gcash) {
      setFormError('This listing has no available payment method.');
      return;
    }
    if ((paymentMethod === 'On-site Cash' && !cash) || (paymentMethod === 'GCash' && !gcash)) {
      setFormError('Choose a payment method accepted by this provider.');
      return;
    }
    if (isMetered && (!Number.isInteger(quantity) || quantity < 1 || quantity > (listing.priceType === 'PER_DAY' ? 7 : 40))) {
      setFormError(`Choose a valid number of ${unitName}.`);
      return;
    }
    if (Number(listing.price) * quantity > 50_000) {
      setFormError('The booking total cannot exceed ₱50,000. Choose fewer hours or days.');
      return;
    }
    setFormError(null);

    if (description.trim().length < 1) {
      setFormError('Please describe the work needed before sending the request.');
      return;
    }

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

    setLoading(true);
    try {
      if (paymentMethod === 'On-site Cash') {
        // Cash requests are provider-confirmed. The preferred schedule is a
        // proposal and does not reserve provider availability.
        await apiBookDirect({
          serviceId: listing.id,
          quantity,
          message: description,
          schedule: preferredSchedule.trim() || undefined,
        });
      } else {
        // GCash/online path — use the existing hook
        await bookProviderDirectly(user.id, listing.id, listing.price, description, paymentMethod, quantity);
        // Initiating checkout is not a successful booking. The return page
        // shows the authoritative payment result after PayMongo verification.
        setLoading(false);
        return;
      }
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: unknown) {
      setLoading(false);
      setFormError(getApiErrorMessage(err, 'Booking failed. Please try again.'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm select-none animate-in fade-in duration-200">

      {/* Modal Container */}
      <div className={`rounded-[24px] max-w-lg w-full max-h-[90dvh] flex flex-col overflow-hidden shadow-xl border transition-colors duration-200 ${isDark ? 'bg-[#22211e] border-neutral-800/80 text-white' : 'bg-white border-slate-200 text-ink'
        }`}>

        {/* Header */}
        <div className={`flex-shrink-0 p-5 border-b flex justify-between items-center ${isDark ? 'bg-[#1c1b18]/45 border-neutral-850' : 'bg-slate-50/50 border-slate-100'
          }`}>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider border ${isDark
                  ? 'text-orange-400 bg-orange-950/20 border-orange-900/30'
                  : 'text-orange-700 bg-orange-50 border-orange-100'
                }`}>
                Direct Booking
              </span>
            </div>
            <h3 className={`font-extrabold text-sm mt-1.5 leading-snug ${isDark ? 'text-white' : 'text-ink'}`}>
              Request {listing.title}
            </h3>
            {listing.priceType && listing.priceType !== 'FIXED' && (
              <p className={`text-[10px] font-semibold mt-0.5 ${isDark ? 'text-ink-muted' : 'text-ink-muted'}`}>
                {priceUnavailable
                  ? 'Price unavailable'
                  : `₱${listing.price}${listing.priceType === 'PER_HOUR' ? ' / hour' : listing.priceType === 'PER_DAY' ? ' / day' : listing.priceType === 'PER_PROJECT' ? ' / project' : ''}`}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg border transition-colors ${isDark ? 'border-neutral-800 hover:bg-slate-800 text-ink-subtle' : 'border-slate-200 hover:bg-slate-100 text-ink-subtle hover:text-ink-secondary'
              }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success State */}
        {success ? (
          <div className="p-8 text-center space-y-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto text-xl font-bold border ${isDark ? 'bg-orange-950/20 text-orange-400 border-orange-900/30' : 'bg-orange-50 text-orange-600 border-orange-100'
              }`}>
              ✓
            </div>
            <h4 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-ink'}`}>
              {paymentMethod === 'On-site Cash' ? 'Request Sent Successfully!' : 'Booking Created Successfully!'}
            </h4>
            <p className={`text-xs ${isDark ? 'text-ink-muted' : 'text-ink-subtle'}`}>
              {paymentMethod === 'On-site Cash'
                ? `The request was sent to ${listing.providerName} for acceptance. Your preferred schedule is a proposal until the provider accepts it.`
                : 'Your verified online booking has entered this service listing\'s queue.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">

            {/* Self-transaction policy warning banner */}
            {isOwned && (
              <div className={`p-4 rounded-2xl border transition-all duration-200 ${
                isDark 
                  ? 'bg-red-950/20 border-red-900/30 text-red-400' 
                  : 'bg-red-50 border-red-100 text-red-800'
              }`}>
                <p className="text-xs font-semibold">
                  This is your own service listing. Marketplace transactions with your own account are not allowed.
                </p>
              </div>
            )}

            <ReviewSummaryPanel subjectId={listing.providerId} context="provider" serviceId={listing.id} isDark={isDark} />

            {/* Description */}
            <div>
              <label className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-ink-muted' : 'text-ink-secondary'}`}>
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
                    ? 'bg-[#1c1b18] border-neutral-850 text-white focus:border-orange-500/80 focus:ring-1 focus:ring-orange-500/30'
                    : 'bg-slate-50 border-slate-200 text-ink-secondary focus:border-orange-500'
                  } ${isOwned ? 'opacity-65' : ''}`}
              />
            </div>

            {paymentMethod === 'On-site Cash' && (
              <div>
                <label className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-ink-muted' : 'text-ink-secondary'}`}>
                  Preferred schedule (optional)
                </label>
                <input
                  type="text"
                  maxLength={500}
                  disabled={isOwned}
                  value={preferredSchedule}
                  onChange={(event) => setPreferredSchedule(event.target.value)}
                  placeholder="e.g. Saturday afternoon; please confirm availability"
                  className={`w-full px-4 py-3 rounded-xl border outline-none font-medium text-sm ${isDark ? 'bg-[#1c1b18] border-neutral-850 text-white' : 'bg-slate-50 border-slate-200 text-ink-secondary'}`}
                />
                <p className={`mt-1 text-[10px] ${isDark ? 'text-ink-muted' : 'text-ink-muted'}`}>
                  This is a proposal, not a reserved appointment. The provider must confirm availability.
                </p>
              </div>
            )}

            {/* Listing rate and server-calculated total for metered services. */}
            <div>
              <label className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-ink-muted' : 'text-ink-secondary'}`}>
                {isMetered ? 'Displayed listing rate' : 'Agreed listing price'}
              </label>
              <div className={`w-full px-4 py-3 rounded-xl border font-semibold text-sm ${isDark ? 'bg-[#1c1b18] border-neutral-850 text-white' : 'bg-slate-50 border-slate-200 text-ink'}`}>
                {priceUnavailable
                  ? 'Price unavailable'
                  : `₱${Number(listing.price).toLocaleString()}${listing.priceType === 'PER_HOUR' ? ' / hour' : listing.priceType === 'PER_DAY' ? ' / day' : listing.priceType === 'PER_PROJECT' ? ' / project' : ''}`}
              </div>
              <span className={`block text-[10px] mt-1 ${isDark ? 'text-ink-muted' : 'text-ink-subtle'}`}>
                {priceUnavailable ? 'The provider must enter a final price before this listing can be booked.' : isMetered ? 'The server calculates the total from this rate and your selected quantity.' : 'The server records this exact amount.'}
              </span>
            </div>

            {isMetered && <div>
              <label htmlFor="booking-quantity" className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-ink-muted' : 'text-ink-secondary'}`}>Number of {unitName}</label>
              <input id="booking-quantity" type="number" min={1} max={listing.priceType === 'PER_DAY' ? 7 : 40} step={1} required value={quantity}
                onChange={(event) => setQuantity(Number(event.target.value))}
                className={`w-full px-4 py-3 rounded-xl border text-sm ${isDark ? 'bg-[#1c1b18] border-neutral-850 text-white' : 'bg-slate-50 border-slate-200 text-ink-secondary'}`} />
              <p className="mt-1 text-xs font-semibold">Total: ₱{(Number(listing.price) * quantity).toLocaleString()}</p>
            </div>}

            <div>
              <label className="text-xs font-semibold mb-2 block">Payment Method</label>
              <div className={`grid gap-3 ${cash && gcash ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {([['On-site Cash', cash], ['GCash', gcash]] as const)
                  .filter(([, accepted]) => accepted)
                  .map(([method]) => (
                    <button key={method} type="button" disabled={isOwned}
                      aria-label={method === 'GCash' ? 'GCash · Test Mode' : method}
                      aria-pressed={paymentMethod === method}
                      onClick={() => setPaymentMethod(method)}
                      className={`min-h-12 flex flex-wrap items-center justify-center gap-2 p-3 rounded-xl border text-xs disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 ${paymentMethod === method ? (isDark ? 'border-orange-400 text-orange-300 font-bold' : 'border-orange-600 text-orange-700 font-bold') : (isDark ? 'border-neutral-700 text-ink-secondary' : 'border-slate-300 text-ink-secondary')}`}>
                      {method === 'GCash' ? <><GCashLogo /><span>· Test Mode</span></> : method}
                    </button>
                  ))}
              </div>
              {!cash && !gcash && <p className="text-xs text-red-500">No supported payment method is available.</p>}
              {gcash && (
                <p className={`mt-2 text-[10px] leading-relaxed ${isDark ? 'text-ink-subtle' : 'text-ink-muted'}`}>
                  GCash checkout uses PayMongo Test Mode. ServiceHub confirms the payment before adding your booking to the provider’s shared work queue; test payments are not real provider payouts.
                </p>
              )}
            </div>

            {/* Spec Part 5 Cancellation Policy Disclaimer */}
            <p className={`text-[10px] leading-relaxed p-3 rounded-xl border mt-3 ${
              isDark 
                ? 'bg-neutral-900 border-neutral-800 text-ink-subtle'
                : 'bg-slate-50 border-slate-200 text-ink-muted'
            }`}>
              ⚠️ You can cancel for free anytime before the provider starts the job. Once they&apos;ve started, cancellation needs their approval.
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
                    ? 'border-neutral-800 hover:bg-[#2c2b27] text-ink-muted'
                    : 'border-slate-200 hover:bg-slate-50 text-ink-muted'
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
                  disabled={loading || priceUnavailable}
                  className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center space-x-1.5"
                >
                  {priceUnavailable ? 'Price Needed Before Booking' : loading ? 'Sending Request...' : 'Send Booking Request'}
                </button>
              )}
            </div>

          </form>
        )}

      </div>

    </div>
  );
}
