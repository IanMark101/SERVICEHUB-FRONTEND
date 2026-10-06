import FormSelect from '../ui/FormSelect';
import TrustScoreBadge from '../ui/TrustScoreBadge';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  LockKeyhole,
  Check,
  Search,
  X,
  CreditCard,
  Loader2,
  Clock,
  MapPin,
  Inbox
} from 'lucide-react';
import { usePagination } from '../../hooks/usePagination';
import PaginationBar from '../ui/PaginationBar';
import TransactionBlockedModal from '../ui/TransactionBlockedModal';
import { useTransactionPermission } from '../../hooks/useTransactionPermission';
import EmptyState from '../ui/EmptyState';
import UserAvatar from '../ui/UserAvatar';
import { getRequestPaymentMethods } from '../../lib/paymentUtils';
import { isOfferAwaitingDecision, normalizeOfferStatus } from '../../lib/offerStatus';

export default function IncomingOffers({ currentUserId = 'u1' }: { currentUserId?: string }) {
  const router = useRouter();
  const { bids, jobRequests, acceptBid, declineBid, users, isDark, services, offersStatus, refreshAll } = useApp();
  const { canTransact } = useTransactionPermission();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'rating' | 'trust'>('rating');
  const [selectingPaymentBidId, setSelectingPaymentBidId] = useState<string | null>(null);
  const [loadingBidId, setLoadingBidId] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<'accepting' | 'declining' | null>(null);
  const [blockedModalOpen, setBlockedModalOpen] = useState<boolean>(false);
  const [referenceTime, setReferenceTime] = useState(0);

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
  const myRequestIds = myRequests.map(r => r.id);

  // Get all pending bids on seeker's requests
  const pendingBids = bids.filter(
    b => (b.seekerId === currentUserId || myRequestIds.includes(b.requestId)) && isOfferAwaitingDecision(b)
  );

  const handleAcceptBid = (bidId: string) => {
    if (!canTransact) {
      setBlockedModalOpen(true);
      return;
    }
    setSelectingPaymentBidId(bidId);
  };

  const handleSelectPaymentMethod = async (paymentMethod: 'GCash' | 'On-site Cash') => {
    if (!selectingPaymentBidId) return;
    const bidId = selectingPaymentBidId;
    setSelectingPaymentBidId(null);
    setLoadingBidId(bidId);
    setLoadingAction('accepting');
    try {
      await acceptBid(bidId, paymentMethod);
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
    return jobRequests.find(r => r.id === requestId);
  };
  const paymentSelectionRequest = selectingPaymentBidId
    ? getRequestDetails(bids.find((bid) => bid.id === selectingPaymentBidId)?.requestId || '')
    : undefined;
  const paymentSelectionBid = bids.find((bid) => bid.id === selectingPaymentBidId);
  const acceptedMethods = getRequestPaymentMethods(paymentSelectionRequest || (paymentSelectionBid ? {
    paymentMethods: paymentSelectionBid.requestPaymentMethods,
    preferredPaymentMethod: paymentSelectionBid.requestPreferredPaymentMethod,
  } : null));

  // Helper to fetch matching provider user details (like verification flags)
  const getProviderDetails = (providerId: string) => {
    return users.find(u => u.id === providerId);
  };

  // Filter bids by search query
  const filteredBids = pendingBids.filter(bid => {
    const req = getRequestDetails(bid.requestId);
    const matchesSearch =
      bid.providerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (bid.message || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req?.title || '').toLowerCase().includes(searchQuery.toLowerCase());
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
      return b.providerRating - a.providerRating;
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
    endIndex
  } = usePagination(sortedBids, 5);

  return (
    <div className={`space-y-6 select-none transition-colors duration-200 ${isDark ? 'text-white' : 'text-ink'}`}>

      {/* Search & Sort Controls */}
      {pendingBids.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-ink-muted' : 'text-ink-subtle'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by provider name, task, or quote..."
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs transition-colors focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                isDark
                  ? 'bg-[#1c1b18] border-neutral-800 text-white placeholder-ink-muted'
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
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className={`px-3 py-2 rounded-xl border text-xs font-bold transition-colors focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer ${
                isDark
                  ? 'bg-[#1c1b18] border-neutral-800 text-white'
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
        <div role="status" className={`rounded-[24px] border p-12 text-center ${isDark ? 'border-neutral-850 bg-[#22211e] text-ink-muted' : 'border-slate-200 bg-white text-ink-muted'}`}>
          <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin" aria-hidden="true" />
          Loading offers received...
        </div>
      ) : pendingBids.length === 0 && offersStatus === 'error' ? (
        <EmptyState
          icon={Inbox}
          title="Offers Could Not Be Loaded"
          description="Please try again to load your received offers."
          actionLabel="Try Again"
          onAction={refreshAll}
          accentColor="orange"
        />
      ) : pendingBids.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No Incoming Proposals Yet"
          description="When local verified providers submit custom quotes on your open task requests, they will appear here with price breakdowns, estimated duration, and trust ratings."
          actionLabel="Manage Your Requests"
          onAction={() => router.push('/seeker/request-manager')}
          accentColor="orange"
        />
      ) : sortedBids.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No Matching Offers"
          description={`No proposals matched your search query "${searchQuery}". Try searching with different keywords.`}
          actionLabel="Clear Search"
          onAction={() => setSearchQuery('')}
          accentColor="orange"
        />
      ) : (
        <div className="space-y-3">
          {paginatedBids.map((bid) => {
            const req = getRequestDetails(bid.requestId);
            const provider = getProviderDetails(bid.providerId);
            const isVerified = provider?.verificationStatus === 'APPROVED' || provider?.isVerified;
            const trustScore = provider?.trustScore ?? 50;

            return (
              <div
                key={bid.id}
                className={`rounded-[20px] p-4 sm:p-5 border shadow-sm transition-all duration-200 relative overflow-hidden ${
                  isDark
                    ? 'bg-[#22211e] border-neutral-850 hover:border-neutral-800'
                    : 'bg-white border-slate-200 hover:shadow-md'
                }`}
              >
                {/* Accept Flash Overlay */}
                {loadingBidId === bid.id && loadingAction === 'accepting' && (
                  <div className="absolute inset-0 bg-orange-600/90 backdrop-blur-[2px] flex items-center justify-center z-10 transition-all animate-in fade-in duration-200">
                    <div className="text-center text-white space-y-1">
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mx-auto border border-white/30">
                        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                      </div>
                      <h4 className="font-extrabold text-sm tracking-wide">Accepting Offer...</h4>
                      <p className="text-[10px] opacity-80">Creating contract and setting up payment...</p>
                    </div>
                  </div>
                )}

                {/* Row 1: Header with Provider Profile (Left) & Offered Bid (Right) */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {/* Left: Avatar + Provider Name + Badges + Task Title */}
                  <div
                    onClick={() => bid.providerId && router.push(`/profile/${encodeURIComponent(bid.providerId)}`)}
                    className="flex items-center gap-3 min-w-0 cursor-pointer group"
                    title={`View ${bid.providerName}'s profile`}
                  >
                    <UserAvatar src={bid.providerAvatar} name={bid.providerName || 'Provider'} alt={bid.providerName} size={40} role="provider" className="transition-transform group-hover:scale-[1.03]" />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`font-extrabold text-sm truncate group-hover:text-orange-500 transition-colors ${isDark ? 'text-white' : 'text-ink'}`}>
                          {bid.providerName}
                        </span>
                        {isVerified && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                            <ShieldCheck className="w-3 h-3" /> Verified
                          </span>
                        )}
                        <span className="text-slate-300 dark:text-ink-secondary">•</span>
                        <span className={`font-bold text-xs ${isDark ? 'text-amber-400/90' : 'text-amber-600'}`}>
                          {req?.title || bid.requestTitle || 'Custom Task'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] text-ink-muted dark:text-ink-muted font-medium">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-red-400" />
                          {provider?.location || 'Cordova, Cebu'}
                        </span>
                        <span>•</span>
                        <TrustScoreBadge score={trustScore} />
                        {bid.providerRating && bid.providerRating > 0 && (
                          <>
                            <span>•</span>
                            <span className="font-semibold text-amber-500">
                              ⭐ {bid.providerRating.toFixed(1)}
                            </span>
                          </>
                        )}
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(bid.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Offered Price */}
                  <div className="flex items-center gap-2.5 sm:text-right shrink-0">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-ink-subtle dark:text-ink-subtle block">
                        Exact offer
                      </span>
                      <span className="text-lg sm:text-xl font-black text-orange-600 dark:text-orange-400">
                        ₱{Number(bid.price).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Row 2: Proposal Message Body */}
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs font-medium text-ink-muted dark:text-ink-muted">
                  <span>Expected duration: {bid.estimatedDuration ? `${bid.estimatedDuration} minutes` : 'Ask the provider'}</span>
                  {bid.availability?.trim() && <span className="min-w-0 max-w-full whitespace-pre-wrap break-words">Available: {bid.availability}</span>}
                  {req?.preferredPaymentMethod && <span>Selected payment: {req.preferredPaymentMethod}</span>}
                  {bid.serviceId && services.find((service) => service.id === bid.serviceId) && (
                    <span>Related service: {services.find((service) => service.id === bid.serviceId)?.title}</span>
                  )}
                </div>
                <div className={`p-3.5 rounded-2xl border text-xs leading-relaxed mt-3 ${
                  isDark
                    ? 'bg-[#1c1b18] border-neutral-800 text-ink-muted'
                    : 'bg-slate-50 border-slate-200 text-ink-secondary'
                }`}>
                  <p className="whitespace-pre-wrap">{bid.message}</p>
                </div>

                {/* Row 3: Action Buttons */}
                <div className={`flex flex-wrap items-center justify-between gap-3 pt-3 mt-3 border-t ${isDark ? 'border-neutral-850' : 'border-slate-100'}`}>
                  <span
                    className={`text-[11px] font-bold flex items-center gap-1.5 ${
                      isDark ? 'text-ink-muted' : 'text-ink-muted'
                    }`}
                  >
                    <LockKeyhole className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Messaging unlocks after acceptance</span>
                  </span>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={!!loadingBidId || normalizeOfferStatus(bid.status) !== 'pending' || (!!bid.requestStatus && bid.requestStatus !== 'OPEN')}
                      onClick={() => handleDeclineBid(bid.id)}
                      className={`px-3.5 py-1.5 border font-bold text-xs rounded-xl transition-all active:scale-95 flex items-center gap-1 cursor-pointer ${
                        loadingBidId === bid.id && loadingAction === 'declining'
                          ? 'bg-neutral-800 border-neutral-800 text-ink-muted cursor-not-allowed opacity-60'
                          : isDark
                            ? 'border-neutral-800 hover:bg-neutral-800 text-red-400'
                            : 'border-slate-200 hover:bg-red-50 text-red-600'
                      }`}
                    >
                      {loadingBidId === bid.id && loadingAction === 'declining' ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Declining...</span>
                        </>
                      ) : (
                        <>
                          <X className="w-3 h-3" />
                          <span>Decline</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={!!loadingBidId || normalizeOfferStatus(bid.status) !== 'pending' || (!!bid.requestStatus && bid.requestStatus !== 'OPEN')}
                      onClick={() => handleAcceptBid(bid.id)}
                      className={`px-4 sm:px-5 py-1.5 font-extrabold text-xs rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1 cursor-pointer ${
                        loadingBidId === bid.id && loadingAction === 'accepting'
                          ? 'bg-neutral-800 text-ink-muted cursor-not-allowed opacity-60'
                          : 'bg-orange-600 hover:bg-orange-700 text-white'
                      }`}
                    >
                      {loadingBidId === bid.id && loadingAction === 'accepting' ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Accepting...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>{normalizeOfferStatus(bid.status) === 'pending_payment' ? 'Payment in progress' : bid.requestStatus === 'PAYMENT_PENDING' ? 'Another checkout in progress' : bid.requestStatus === 'CLOSED' ? 'Request paused' : 'Accept Offer'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>
            );
          })}

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`viewport-dialog-scroll rounded-[24px] max-w-sm w-full overflow-hidden shadow-xl border animate-in zoom-in-95 duration-200 ${
            isDark ? 'bg-[#22211e] border-neutral-800/80 text-white' : 'bg-white border-slate-200 text-ink'
          }`}>
            <div className={`p-5 border-b flex justify-between items-center ${
              isDark ? 'border-neutral-850 bg-[#1c1b18]/45' : 'border-slate-100 bg-slate-50/50'
            }`}>
              <h3 className={`font-extrabold text-sm flex items-center space-x-2 ${isDark ? 'text-white' : 'text-ink'}`}>
                <CreditCard className="w-4 h-4 text-emerald-500" />
                <span>Select Payment Method</span>
              </h3>
              <button
                onClick={() => setSelectingPaymentBidId(null)}
                className={`p-1.5 rounded-lg border transition-colors ${
                  isDark ? 'border-neutral-800 hover:bg-slate-800 text-ink-subtle' : 'border-slate-200 hover:bg-slate-100 text-ink-subtle'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className={`text-xs leading-relaxed ${isDark ? 'text-ink-muted' : 'text-ink-muted'}`}>
                {paymentSelectionRequest?.preferredPaymentMethod
                  ? `You selected ${paymentSelectionRequest.preferredPaymentMethod} when requesting this service. Confirm the provider’s final price to continue.`
                  : 'Choose from the payment methods selected on your request:'}
              </p>

              {([['On-site Cash', acceptedMethods.cash], ['GCash', acceptedMethods.gcash]] as const)
                .filter(([method, accepted]) => accepted && (!paymentSelectionRequest?.preferredPaymentMethod || method === paymentSelectionRequest.preferredPaymentMethod))
                .map(([method]) => (
                  <button key={method} onClick={() => handleSelectPaymentMethod(method)}
                    className="w-full p-4 border rounded-2xl text-left text-sm hover:border-emerald-500">
                    {paymentSelectionRequest?.preferredPaymentMethod ? `Confirm ${method}` : method}
                  </button>
                ))}
              {acceptedMethods.gcash && (
                <p className={`text-[10px] leading-relaxed ${isDark ? 'text-ink-subtle' : 'text-ink-muted'}`}>
                  Online checkout uses PayMongo Test Mode. Payment statuses are internal workflow records, not regulated escrow or a real provider payout.
                </p>
              )}

              {/* Spec Part 5 Cancellation Policy Disclaimer */}
              <p className={`text-[10px] leading-relaxed p-3 rounded-xl border mt-3 ${
                isDark
                  ? 'bg-neutral-900 border-neutral-800 text-ink-subtle'
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
