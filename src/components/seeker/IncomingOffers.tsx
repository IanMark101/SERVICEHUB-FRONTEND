import FormSelect from '../ui/FormSelect';
import { arrangementLabel } from '../../lib/serviceArrangement';
import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  X,
  CreditCard,
  Loader2,
  Inbox,
} from 'lucide-react';
import { usePagination } from '../../hooks/usePagination';
import PaginationBar from '../ui/PaginationBar';
import TransactionBlockedModal from '../ui/TransactionBlockedModal';
import { useTransactionPermission } from '../../hooks/useTransactionPermission';
import InboxState from '../ui/InboxState';
import IncomingOfferRow from './IncomingOfferRow';
import { getRequestPaymentMethods } from '../../lib/paymentUtils';
import { isOfferAwaitingDecision, normalizeOfferStatus } from '../../lib/offerStatus';
import useDialogFocus from '../../hooks/useDialogFocus';
import BookingAddressField from '../location/BookingAddressField';
import { BookingLocationSchema, type BookingLocation } from '../../lib/location';

export default function IncomingOffers({ currentUserId = 'u1' }: { currentUserId?: string }) {
  const { bids, jobRequests, acceptBid, declineBid, users, isDark, services, offersStatus, refreshAll } = useApp();
  const { canTransact } = useTransactionPermission();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'rating' | 'trust'>('rating');
  const [selectingPaymentBidId, setSelectingPaymentBidId] = useState<string | null>(null);
  const [bookingLocation, setBookingLocation] = useState<BookingLocation | null>(null);
  const [locationError, setLocationError] = useState('');
  const [loadingBidId, setLoadingBidId] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<'accepting' | 'declining' | null>(null);
  const [blockedModalOpen, setBlockedModalOpen] = useState<boolean>(false);
  const [referenceTime, setReferenceTime] = useState(0);
  const paymentDialogRef = useDialogFocus(Boolean(selectingPaymentBidId), false, () => setSelectingPaymentBidId(null));

  useEffect(() => {
    const timer = window.setTimeout(() => setReferenceTime(Date.now()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  // Compute relative time from a full ISO timestamp
  const formatTimeAgo = (isoStr: string): string => {
    if (!isoStr) return 'Just now';
    if (!referenceTime) return 'Recently';
    const diffMs = referenceTime - new Date(isoStr).getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    if (diffSecs < 60) return diffSecs <= 1 ? 'Just now' : `${diffSecs}s ago`;
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs} hr${diffHrs > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffHrs / 24)} day${Math.floor(diffHrs / 24) > 1 ? 's' : ''} ago`;
  };

  // Find current seeker's requests
  const myRequests = jobRequests.filter(r => r.seekerId === currentUserId);
  const myRequestIds = new Set(myRequests.map(r => r.id));
  const requestsById = new Map(jobRequests.map(request => [request.id, request]));
  const providersById = new Map(users.map(provider => [provider.id, provider]));
  const servicesById = new Map(services.map(service => [service.id, service]));

  // Get all pending bids on seeker's requests
  const pendingBids = bids.filter(
    b => (b.seekerId === currentUserId || myRequestIds.has(b.requestId)) && isOfferAwaitingDecision(b)
  );

  const handleAcceptBid = (bidId: string) => {
    if (!canTransact) {
      setBlockedModalOpen(true);
      return;
    }
    setSelectingPaymentBidId(bidId);
    setLocationError('');
    setBookingLocation(null);
  };

  const handleSelectPaymentMethod = async (paymentMethod: 'GCash' | 'On-site Cash') => {
    if (!selectingPaymentBidId) return;
    const bidId = selectingPaymentBidId;
    if (needsJobAddress && !BookingLocationSchema.safeParse(bookingLocation).success) {
      setLocationError('Enter the job address or directions in at least 5 characters, or choose a job pin.');
      return;
    }
    setSelectingPaymentBidId(null);
    setLoadingBidId(bidId);
    setLoadingAction('accepting');
    try {
      if (needsJobAddress && bookingLocation) await acceptBid(bidId, paymentMethod, bookingLocation);
      else await acceptBid(bidId, paymentMethod);
    } catch {
      // error is already toasted, clean up loading state
    } finally {
      setLoadingBidId(null);
      setLoadingAction(null);
    }
  };

  const handleDeclineBid = async (bidId: string) => {
    setLoadingBidId(bidId);
    setLoadingAction('declining');
    try {
      await declineBid(bidId);
    } catch {
      // error is already toasted
    } finally {
      setLoadingBidId(null);
      setLoadingAction(null);
    }
  };

  // Helper to get matching request details
  const getRequestDetails = (requestId: string) => {
    return requestsById.get(requestId);
  };
  const paymentSelectionRequest = selectingPaymentBidId
    ? getRequestDetails(bids.find((bid) => bid.id === selectingPaymentBidId)?.requestId || '')
    : undefined;
  const paymentSelectionBid = bids.find((bid) => bid.id === selectingPaymentBidId);
  const acceptedMethods = getRequestPaymentMethods(paymentSelectionRequest || (paymentSelectionBid ? {
    paymentMethods: paymentSelectionBid.requestPaymentMethods,
    preferredPaymentMethod: paymentSelectionBid.requestPreferredPaymentMethod,
  } : null));
  const cashOnlyConfirmation = acceptedMethods.cash && !acceptedMethods.gcash;
  const isListingPriceApproval = Boolean(paymentSelectionRequest?.targetServiceId || paymentSelectionBid?.requestTargetServiceId);
  const needsJobAddress = !isListingPriceApproval && paymentSelectionBid?.serviceLocationMode === 'PROVIDER_VISITS';

  // Helper to fetch matching provider user details (like verification flags)
  const getProviderDetails = (providerId: string) => {
    return providersById.get(providerId);
  };

  // Filter bids by search query
  const filteredBids = pendingBids.filter(bid => {
    const req = getRequestDetails(bid.requestId);
    const matchesSearch =
      (bid.providerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (bid.message || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req?.title || bid.requestTitle || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Sort bids
  const sortedBids = [...filteredBids].sort((a, b) => {
    if (sortBy === 'price_asc') {
      return Number(a.price) - Number(b.price);
    }
    if (sortBy === 'price_desc') {
      return Number(b.price) - Number(a.price);
    }
    if (sortBy === 'rating') {
      return (b.providerRating || 0) - (a.providerRating || 0);
    }
    if (sortBy === 'trust') {
      const trustA = getProviderDetails(a.providerId)?.trustScore ?? 50;
      const trustB = getProviderDetails(b.providerId)?.trustScore ?? 50;
      return trustB - trustA;
    }
    return 0;
  });

  // Pagination
  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedBids,
    goToPage,
    nextPage,
    prevPage,
    startIndex,
    endIndex, reset
  } = usePagination(sortedBids, 10);

  return (
    <div className={`space-y-3 transition-colors duration-200 ${isDark ? 'text-white' : 'text-ink'}`}>

      {/* Search & Sort Controls */}
      {pendingBids.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-ink-muted' : 'text-ink-subtle'}`} />
            <input
              aria-label="Search incoming offers"
              type="search"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); reset(); }}
              placeholder="Search by provider name, task, or quote..."
              className={`w-full min-h-11 pl-10 pr-4 py-2.5 rounded-xl border text-xs transition-colors focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                isDark
                  ? 'bg-charcoal-inset border-neutral-800 text-white placeholder-ink-muted'
                  : 'bg-white border-slate-300 text-ink placeholder-ink-subtle'
              }`}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-ink-subtle dark:text-ink-subtle">Sort by:</span>
            <FormSelect
              compact
              aria-label="Sort incoming offers"
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value as typeof sortBy); reset(); }}
              className={`px-3 py-2 rounded-xl border text-xs font-bold transition-colors focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer ${
                isDark
                  ? 'bg-charcoal-inset border-neutral-800 text-white'
                  : 'bg-white border-slate-300 text-ink-secondary'
              }`}
            >
              <option value="rating">Provider Rating</option>
              <option value="trust">Trust Score</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </FormSelect>
          </div>
        </div>
      )}

      {pendingBids.length === 0 && offersStatus === 'loading' ? (
        <InboxState loading icon={Loader2} title="Loading offers received..." description="Fetching your provider offers." />
      ) : pendingBids.length === 0 && offersStatus === 'error' ? (
        <InboxState
          kind="error"
          title="Offers Could Not Be Loaded"
          description="Please try again to load your received offers."
          actionLabel="Try Again"
          onAction={refreshAll}
        />
      ) : pendingBids.length === 0 ? (
        <InboxState
          icon={Inbox}
          title="No Offers"
          description="When providers send offers for your service requests, they will appear here."
        />
      ) : sortedBids.length === 0 ? (
        <InboxState
          icon={Search}
          title="No Matching Offers"
          description={`No proposals matched your search query "${searchQuery}". Try searching with different keywords.`}
          actionLabel="Clear Search"
          onAction={() => { setSearchQuery(''); reset(); }}
        />
      ) : (
        <div className="space-y-3">
          {paginatedBids.map(bid => <IncomingOfferRow key={bid.id} bid={bid} request={getRequestDetails(bid.requestId)} provider={getProviderDetails(bid.providerId)} relatedService={servicesById.get(bid.serviceId || '')?.title} timeLabel={formatTimeAgo(bid.createdAt)}
            disabled={Boolean(loadingBidId) || normalizeOfferStatus(bid.status) !== 'pending' || Boolean(bid.requestStatus && bid.requestStatus !== 'OPEN')}
            loadingAction={loadingBidId === bid.id ? loadingAction : null} onAccept={() => handleAcceptBid(bid.id)} onDecline={() => void handleDeclineBid(bid.id)} />)}

          <PaginationBar
            currentPage={currentPage}
            totalPages={totalPages}
            goToPage={goToPage}
            nextPage={nextPage}
            prevPage={prevPage}
            startIndex={startIndex}
            endIndex={endIndex}
            totalItems={sortedBids.length}
            variant="seeker"
          />
        </div>
      )}

      {/* Payment Selection Modal */}
      {selectingPaymentBidId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div ref={paymentDialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="offer-payment-title" className={`viewport-dialog-scroll rounded-2xl max-w-md w-full overflow-hidden shadow-xl border animate-in zoom-in-95 duration-200 ${
            isDark ? 'bg-charcoal-surface border-neutral-800/80 text-white' : 'bg-white border-slate-200 text-ink'
          }`}>
            <div className={`p-5 border-b flex justify-between items-center ${
              isDark ? 'border-neutral-850 bg-charcoal-inset/45' : 'border-slate-100 bg-slate-50/50'
            }`}>
              <h3 id="offer-payment-title" className={`font-extrabold text-base flex items-center space-x-2 ${isDark ? 'text-white' : 'text-ink'}`}>
                <CreditCard className="w-4 h-4 text-brand-text" />
                <span>{isListingPriceApproval ? 'Confirm price & booking' : cashOnlyConfirmation ? 'Confirm offer' : 'Select Payment Method'}</span>
              </h3>
              <button
                type="button"
                aria-label="Close offer confirmation"
                onClick={() => setSelectingPaymentBidId(null)}
                className={`p-1.5 rounded-lg border transition-colors ${
                  isDark ? 'border-neutral-800 hover:bg-charcoal text-ink-subtle' : 'border-slate-200 hover:bg-slate-100 text-ink-subtle'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {needsJobAddress && <BookingAddressField value={bookingLocation} onChange={point => { setBookingLocation(point); setLocationError(''); }} error={locationError || undefined} />}
              {cashOnlyConfirmation ? (
                <>
                  <p className="text-sm leading-relaxed text-ink-secondary">Review the offer before creating your booking.</p>
                  <p className="text-sm font-medium mb-3">{arrangementLabel[paymentSelectionBid?.serviceLocationMode ?? 'PROVIDER_VISITS']}{paymentSelectionBid?.serviceLocationMode === 'SEEKER_VISITS' && paymentSelectionBid.venueLabel ? ` · ${paymentSelectionBid.venueLabel}` : ''}</p>
                  <p className="text-base font-semibold break-words">{paymentSelectionRequest?.title || paymentSelectionBid?.requestTitle || 'Custom Task'}</p>
                  <dl className="space-y-3 text-sm">
                    <div className="flex justify-between gap-4"><dt className="shrink-0 text-ink-muted">Provider</dt><dd className="min-w-0 text-right font-semibold break-words [overflow-wrap:anywhere]">{paymentSelectionBid?.providerName}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-ink-muted">Agreed price</dt><dd className="text-lg font-bold tabular-nums">₱{Number(paymentSelectionBid?.price).toLocaleString()}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-ink-muted">Payment</dt><dd className="font-semibold">Cash</dd></div>
                  </dl>
                  {paymentSelectionBid?.message && <p className="text-sm leading-relaxed break-words">{paymentSelectionBid.message}</p>}
                  <button type="button" onClick={() => handleSelectPaymentMethod('On-site Cash')} className="min-h-11 w-full rounded-xl bg-orange-600 px-4 py-3 text-sm font-bold text-white hover:bg-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600">Confirm booking</button>
                </>
              ) : <>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-4"><dt>Provider</dt><dd className="min-w-0 text-right font-semibold break-words">{paymentSelectionBid?.providerName}</dd></div>
                <div className="flex justify-between gap-4"><dt>Final total</dt><dd className="font-bold tabular-nums">₱{Number(paymentSelectionBid?.price).toLocaleString()}</dd></div>
              </dl>
              {paymentSelectionBid?.message && <p className="text-sm leading-relaxed break-words">{paymentSelectionBid.message}</p>}
              <p className="text-sm leading-relaxed text-ink-muted">
                {paymentSelectionRequest?.preferredPaymentMethod
                  ? `You selected ${paymentSelectionRequest.preferredPaymentMethod} when requesting this service. Confirm the provider’s final price to continue.`
                  : isListingPriceApproval ? 'Confirm the provider’s final total by choosing a payment method. Travel is included and will not be added again.' : 'Choose from the payment methods selected on your request:'}
              </p>

              {([['On-site Cash', acceptedMethods.cash], ['GCash', acceptedMethods.gcash]] as const)
                .filter(([method, accepted]) => accepted && (!paymentSelectionRequest?.preferredPaymentMethod || method === paymentSelectionRequest.preferredPaymentMethod))
                .map(([method]) => (
                  <button key={method} onClick={() => handleSelectPaymentMethod(method)}
                    className="w-full p-4 border rounded-2xl text-left text-sm hover:border-orange-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600">
                    {method === 'On-site Cash' ? paymentSelectionRequest?.preferredPaymentMethod ? 'Confirm Cash' : 'Cash' : paymentSelectionRequest?.preferredPaymentMethod ? 'Confirm GCash' : 'GCash · Test Mode'}
                  </button>
                ))}
              </>}
              {acceptedMethods.gcash && (
                <p className={`text-[10px] leading-relaxed ${isDark ? 'text-ink-subtle' : 'text-ink-muted'}`}>
                  Online checkout uses PayMongo Test Mode. Payment statuses are internal workflow records, not regulated escrow or a real provider payout.
                </p>
              )}

              {/* Spec Part 5 Cancellation Policy Disclaimer */}
              <p className={`text-[10px] leading-relaxed p-3 rounded-xl border mt-3 ${
                isDark
                  ? 'bg-charcoal border-neutral-800 text-ink-subtle'
                  : 'bg-slate-50 border-slate-200 text-ink-muted'
              }`}>
                ⚠️ You can cancel for free anytime before the provider starts the job. Once they&apos;ve started, cancellation needs their approval.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Blocked Modal */}
      <TransactionBlockedModal
        isOpen={blockedModalOpen}
        onClose={() => setBlockedModalOpen(false)}
      />

    </div>
  );
}
