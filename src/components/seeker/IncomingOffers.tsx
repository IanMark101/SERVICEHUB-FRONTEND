import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  Star, 
  Calendar, 
  MessageSquare, 
  Trash2, 
  Check, 
  Search, 
  X, 
  CreditCard, 
  Loader2, 
  Sparkles,
  Clock,
  MapPin,
  Inbox
} from 'lucide-react';
import { usePagination } from '../../hooks/usePagination';
import PaginationBar from '../ui/PaginationBar';
import TransactionBlockedModal from '../ui/TransactionBlockedModal';
import { useTransactionPermission } from '../../hooks/useTransactionPermission';
import EmptyState from '../ui/EmptyState';

export default function IncomingOffers({ currentUserId = 'u1' }: { currentUserId?: string }) {
  const router = useRouter();
  const { bids, jobRequests, acceptBid, declineBid, users, isDark } = useApp();
  const { canTransact } = useTransactionPermission();
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'rating' | 'trust'>('rating');
  const [selectingPaymentBidId, setSelectingPaymentBidId] = useState<string | null>(null);
  const [loadingBidId, setLoadingBidId] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<'accepting' | 'declining' | null>(null);
  const [blockedModalOpen, setBlockedModalOpen] = useState<boolean>(false);

  // Compute relative time from a full ISO timestamp
  const formatTimeAgo = (isoStr: string): string => {
    if (!isoStr) return 'Just now';
    const diffMs = Date.now() - new Date(isoStr).getTime();
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
    b => myRequestIds.includes(b.requestId) && b.status === 'pending'
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
    } catch (err) {
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
    } catch (err) {
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
    <div className={`space-y-6 select-none transition-colors duration-200 ${isDark ? 'text-[#f2efe9]' : 'text-slate-800'}`}>
      
      {/* Search & Sort Controls */}
      {pendingBids.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by provider name, task, or quote..."
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs transition-colors focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                isDark 
                  ? 'bg-[#1c1b18] border-neutral-800 text-[#f2efe9] placeholder-neutral-500' 
                  : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 dark:text-neutral-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className={`px-3 py-2 rounded-xl border text-xs font-bold transition-colors focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer ${
                isDark 
                  ? 'bg-[#1c1b18] border-neutral-800 text-[#f2efe9]' 
                  : 'bg-white border-slate-300 text-slate-700'
              }`}
            >
              <option value="rating">Provider Rating</option>
              <option value="trust">Trust Score</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      )}

      {pendingBids.length === 0 ? (
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
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mx-auto text-xl font-bold border border-white/30 animate-bounce">
                        ✓
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
                    onClick={() => bid.providerId && router.push(`/seeker/user-profile?id=${bid.providerId}`)}
                    className="flex items-center gap-3 min-w-0 cursor-pointer group"
                    title={`View ${bid.providerName}'s profile`}
                  >
                    <img 
                      src={bid.providerAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(bid.providerName || 'Provider')}&background=random`} 
                      alt={bid.providerName} 
                      className="w-10 h-10 rounded-full object-cover border border-neutral-700/60 shadow-sm shrink-0 transition-transform group-hover:scale-105"
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`font-extrabold text-sm truncate group-hover:text-orange-500 transition-colors ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
                          {bid.providerName}
                        </span>
                        {isVerified && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                            <ShieldCheck className="w-3 h-3" /> Verified
                          </span>
                        )}
                        <span className="text-slate-300 dark:text-neutral-700">•</span>
                        <span className={`font-bold text-xs ${isDark ? 'text-amber-400/90' : 'text-amber-600'}`}>
                          {req?.title || 'Custom Task'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-neutral-400 font-medium">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-red-400" />
                          {provider?.location || 'Cordova, Cebu'}
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-0.5 font-semibold text-amber-500">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          Trust: {trustScore}
                        </span>
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
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-neutral-500 block">
                        Offered Bid
                      </span>
                      <span className="text-lg sm:text-xl font-black text-orange-600 dark:text-orange-400">
                        ₱{Number(bid.price).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Row 2: Proposal Message Body */}
                <div className={`p-3.5 rounded-2xl border text-xs leading-relaxed mt-3 ${
                  isDark 
                    ? 'bg-[#1c1b18] border-neutral-800 text-[#b4b0a9]' 
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  <p className="whitespace-pre-wrap">{bid.message}</p>
                </div>

                {/* Row 3: Action Buttons */}
                <div className={`flex items-center justify-between pt-3 mt-3 border-t ${isDark ? 'border-neutral-850' : 'border-slate-100'}`}>
                  <button
                    type="button"
                    onClick={() => { /* Placeholder for handleStartChat */ }}
                    className={`text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isDark ? 'text-[#b4b0a9] hover:text-orange-400' : 'text-slate-500 hover:text-orange-600'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Message Provider</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={!!loadingBidId}
                      onClick={() => handleDeclineBid(bid.id)}
                      className={`px-3.5 py-1.5 border font-bold text-xs rounded-xl transition-all active:scale-95 flex items-center gap-1 cursor-pointer ${
                        loadingBidId === bid.id && loadingAction === 'declining'
                          ? 'bg-neutral-800 border-neutral-800 text-neutral-500 cursor-not-allowed opacity-60'
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
                      disabled={!!loadingBidId}
                      onClick={() => handleAcceptBid(bid.id)}
                      className={`px-4 sm:px-5 py-1.5 font-extrabold text-xs rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1 cursor-pointer ${
                        loadingBidId === bid.id && loadingAction === 'accepting'
                          ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed opacity-60'
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
                          <span>Accept Offer</span>
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
          <div className={`rounded-[24px] max-w-sm w-full overflow-hidden shadow-xl border animate-in zoom-in-95 duration-200 ${
            isDark ? 'bg-[#22211e] border-neutral-800/80 text-[#f2efe9]' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className={`p-5 border-b flex justify-between items-center ${
              isDark ? 'border-neutral-850 bg-[#1c1b18]/45' : 'border-slate-100 bg-slate-50/50'
            }`}>
              <h3 className={`font-extrabold text-sm flex items-center space-x-2 ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
                <CreditCard className="w-4 h-4 text-emerald-500" />
                <span>Select Payment Method</span>
              </h3>
              <button 
                onClick={() => setSelectingPaymentBidId(null)}
                className={`p-1.5 rounded-lg border transition-colors ${
                  isDark ? 'border-neutral-800 hover:bg-slate-800 text-neutral-450' : 'border-slate-200 hover:bg-slate-100 text-slate-400'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className={`text-xs leading-relaxed ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>
                Choose how you want to coordinate payment for this booking:
              </p>

              <button
                onClick={() => handleSelectPaymentMethod('GCash')}
                className="w-full flex items-center justify-between p-4 border rounded-2xl hover:border-emerald-500 text-left transition-all active:scale-98 bg-[#0084FF]/5 border-blue-500/20 hover:bg-blue-500/10 cursor-pointer"
              >
                <div>
                  <span className="font-extrabold text-xs block text-slate-955 dark:text-[#f2efe9]">GCash Online</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Online payment tracked until task completion</span>
                </div>
                <span className="text-blue-550 font-extrabold text-xs">GCash</span>
              </button>

              <button
                onClick={() => handleSelectPaymentMethod('On-site Cash')}
                className="w-full flex items-center justify-between p-4 border rounded-2xl hover:border-orange-500 text-left transition-all active:scale-98 bg-orange-500/5 border-orange-500/20 hover:bg-orange-500/10 cursor-pointer"
              >
                <div>
                  <span className="font-extrabold text-xs block text-slate-955 dark:text-[#f2efe9]">On-site Cash</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Pay provider directly in cash at location</span>
                </div>
                <span className="text-orange-500 font-extrabold text-xs">Cash</span>
              </button>

              {/* Spec Part 5 Cancellation Policy Disclaimer */}
              <p className={`text-[10px] leading-relaxed p-3 rounded-xl border mt-3 ${
                isDark 
                  ? 'bg-neutral-900 border-neutral-800 text-neutral-450' 
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}>
                ⚠️ You can cancel for free anytime before the provider starts the job. Once they've started, cancellation needs their approval.
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
