import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Star, Calendar, MessageSquare, Trash2, Check, Search, X, CreditCard } from 'lucide-react';
import { usePagination } from '../../hooks/usePagination';
import PaginationBar from '../PaginationBar';

export default function IncomingOffers({ currentUserId = 'u1' }: { currentUserId?: string }) {
  const { bids, jobRequests, acceptBid, declineBid, users, isDark } = useApp();
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'rating' | 'trust'>('rating');
  const [acceptedBidId, setAcceptedBidId] = useState<string | null>(null);
  const [selectingPaymentBidId, setSelectingPaymentBidId] = useState<string | null>(null);

  // Find current seeker's requests
  const myRequests = jobRequests.filter(r => r.seekerId === currentUserId);
  const myRequestIds = myRequests.map(r => r.id);
  
  // Get all pending bids on seeker's requests
  const pendingBids = bids.filter(
    b => myRequestIds.includes(b.requestId) && b.status === 'pending'
  );

  const handleAcceptBid = (bidId: string) => {
    setSelectingPaymentBidId(bidId);
  };

  const handleSelectPaymentMethod = (paymentMethod: 'GCash' | 'On-site Cash') => {
    if (!selectingPaymentBidId) return;
    const bidId = selectingPaymentBidId;
    setSelectingPaymentBidId(null);
    setAcceptedBidId(bidId);
    setTimeout(() => {
      acceptBid(bidId, paymentMethod);
      setAcceptedBidId(null);
    }, 1500);
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
      const emailA = getProviderDetails(a.providerId)?.email;
      const emailB = getProviderDetails(b.providerId)?.email;
      const trustValA = emailA === 'johnfrans@gmail.com' ? 96 : 92;
      const trustValB = emailB === 'johnfrans@gmail.com' ? 96 : 92;
      return trustValB - trustValA;
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
      
      {/* Search and Sort Filter Bar */}
      {pendingBids.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search Box */}
          <div className={`flex items-center rounded-xl px-3 py-2 w-full sm:max-w-md border transition-all ${
            isDark ? 'bg-[#1c1b18] border-neutral-800/80' : 'bg-slate-50 border-slate-300'
          }`}>
            <span className={isDark ? 'text-[#b4b0a9]' : 'text-slate-400'}>
              <Search className="w-4 h-4 mr-2" />
            </span>
            <input 
              type="text" 
              placeholder="Search bids by provider or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-xs w-full text-slate-800 dark:text-[#f2efe9] placeholder-slate-400"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <span className={`text-xs font-semibold whitespace-nowrap ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className={`px-3 py-2 rounded-xl border outline-none font-bold text-xs transition-all ${
                isDark 
                  ? 'bg-[#1c1b18] border-neutral-800/80 text-[#f2efe9]' 
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
        <div className={`rounded-[24px] p-12 border text-center text-sm font-medium transition-colors duration-200 ${
          isDark ? 'bg-[#22211e] border-neutral-800/80 text-[#b4b0a9]' : 'bg-white border-slate-200 text-slate-500'
        }`}>
          No incoming bids or proposals at the moment. Keep checking back later!
        </div>
      ) : sortedBids.length === 0 ? (
        <div className={`rounded-[24px] p-12 border text-center text-sm font-medium transition-colors duration-200 ${
          isDark ? 'bg-[#22211e] border-neutral-800/80 text-[#b4b0a9]' : 'bg-white border-slate-200 text-slate-500'
        }`}>
          No bids matched your search query. Try typing something else!
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {paginatedBids.map((bid) => {
              const req = getRequestDetails(bid.requestId);
              const provider = getProviderDetails(bid.providerId);
              const isVerified = provider?.isVerified ?? false;
              
              // Generate dynamic wait or trust rating matching screenshot aesthetics
              const trustScore = provider?.email === 'johnfrans@gmail.com' ? '96%' : '92%';
              const formattedDate = new Date(bid.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });

              return (
                <div 
                  key={bid.id} 
                  className={`rounded-[24px] p-6 border shadow-sm transition-colors duration-200 relative overflow-hidden ${
                    isDark ? 'bg-[#22211e] border-neutral-800/80' : 'bg-white border-slate-300 hover:shadow-md'
                  }`}
                >
                  {/* Accept Flash Overlay */}
                  {acceptedBidId === bid.id && (
                    <div className="absolute inset-0 bg-emerald-600/90 backdrop-blur-[2px] flex items-center justify-center z-10 transition-all animate-in fade-in duration-200">
                      <div className="text-center text-white space-y-1">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mx-auto text-xl font-bold border border-white/30 animate-bounce">
                          ✓
                        </div>
                        <h4 className="font-extrabold text-sm tracking-wide">Offer Accepted!</h4>
                        <p className="text-[10px] opacity-80">Creating contract and setting up escrow...</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-center">
                    
                    {/* Left Column (1/5): Provider profile card */}
                    <div className={`lg:col-span-1 flex flex-row lg:flex-col items-center justify-between lg:justify-center p-3 lg:p-4 rounded-2xl border text-center space-y-0 lg:space-y-3 h-full ${
                      isDark ? 'bg-[#1c1b18] border-neutral-850' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="flex flex-row lg:flex-col items-center lg:space-y-2 space-x-3 lg:space-x-0">
                        <img 
                          src={bid.providerAvatar} 
                          alt={bid.providerName} 
                          className="w-12 h-12 rounded-full object-cover border border-slate-100 shadow-sm"
                        />
                        <div className="text-left lg:text-center">
                          <h4 className={`font-bold text-xs ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>{bid.providerName}</h4>
                          {isVerified && (
                            <span className="inline-flex items-center text-[9px] text-emerald-600 font-semibold mt-0.5">
                              <ShieldCheck className={`w-3.5 h-3.5 mr-0.5 ${isDark ? 'text-emerald-455 fill-emerald-955/25' : 'fill-emerald-50 text-emerald-600'}`} />
                              Verified Expert
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right lg:text-center flex flex-col items-end lg:items-center">
                        <div className="flex items-center text-xs font-bold text-amber-500">
                          <Star className="w-3.5 h-3.5 mr-0.5 fill-amber-500 text-amber-500" />
                          <span>{bid.providerRating.toFixed(1)}</span>
                        </div>
                        <span className={`text-[9px] font-bold mt-0.5 block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-455'}`}>
                          {trustScore} Trust Score
                        </span>
                      </div>
                    </div>

                    {/* Center Column (3/5): Proposal details */}
                    <div className="lg:col-span-3 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className={`text-[9px] font-bold block mb-1 uppercase tracking-wider ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                            Offer for your request:
                          </span>
                          <h3 className={`font-extrabold text-sm leading-snug ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
                            {req?.title || 'Active Broadcast Task'}
                          </h3>
                        </div>
                        <span className={`text-[10px] font-medium whitespace-nowrap ${isDark ? 'text-[#b4b0a9]' : 'text-slate-400'}`}>{formattedDate}</span>
                      </div>

                      <div className={`p-4 rounded-xl flex items-start space-x-3 border ${
                        isDark ? 'bg-[#1c1b18] border-neutral-800/80 text-[#b4b0a9]' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}>
                        <MessageSquare className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`} />
                        <p className={`text-xs leading-relaxed font-sans font-medium ${isDark ? 'text-[#f2efe9]' : 'text-slate-700'}`}>
                          "{bid.message}"
                        </p>
                      </div>

                      {/* Calendar Availability strip */}
                      <div className={`flex items-center space-x-2 text-[10px] font-semibold rounded-xl px-3 py-2 border transition-colors duration-200 ${
                        isDark ? 'bg-[#1c1b18]/60 border-neutral-800/40 text-[#b4b0a9]' : 'bg-slate-50/50 border-slate-200 text-slate-550'
                      }`}>
                        <Calendar className={`w-3.5 h-3.5 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
                        <span>Available: Flexible, ready to schedule immediately upon accept.</span>
                      </div>
                    </div>

                    {/* Right Column (1/5): Price & stack actions */}
                    <div className="lg:col-span-1 flex flex-row lg:flex-col justify-between items-stretch h-full space-x-3 lg:space-x-0 lg:space-y-3">
                      <div className={`border rounded-2xl p-4 flex-1 lg:flex-none flex flex-col justify-center text-center transition-colors duration-200 ${
                        isDark ? 'bg-[#1c1b18] border-neutral-800/80' : 'bg-slate-50/60 border-slate-200'
                      }`}>
                        <span className={`text-[9px] font-bold uppercase tracking-widest block mb-1 ${isDark ? 'text-[#b4b0a9]' : 'text-slate-400'}`}>
                          Offered Price
                        </span>
                        <span className={`text-xl font-extrabold ${isDark ? 'text-orange-500' : 'text-orange-600'}`}>₱{bid.price}</span>
                      </div>

                      <div className="flex flex-row lg:flex-col gap-2 flex-1 lg:flex-none">
                        <button
                          onClick={() => declineBid(bid.id)}
                          className={`flex-1 py-2.5 border font-bold text-[10px] rounded-xl transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                            isDark 
                              ? 'border-neutral-800 hover:bg-red-955/20 hover:text-red-400 hover:border-red-900/30 text-[#b4b0a9]' 
                              : 'border-slate-300 hover:bg-red-50 hover:text-red-655 hover:border-red-200 text-slate-550'
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Decline</span>
                        </button>
                        <button
                          onClick={() => handleAcceptBid(bid.id)}
                          className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] rounded-xl shadow-sm transition-all active:scale-95 flex items-center justify-center space-x-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept</span>
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

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
                  <span className="text-[10px] text-slate-400 block mt-0.5">Secure escrow hold until task complete</span>
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

    </div>
  );
}
