import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { Search, CheckCircle2, ShieldCheck, Banknote, Smartphone, ArrowRight } from 'lucide-react';
import { usePagination } from '../../hooks/usePagination';
import PaginationBar from '../ui/PaginationBar';
import LimitedModeDashboardCard from '../landing/LimitedModeDashboardCard';
import TransactionBlockedModal from '../ui/TransactionBlockedModal';
import { useTransactionPermission } from '../../hooks/useTransactionPermission';
import EmptyState from '../ui/EmptyState';
import { JobRequestSkeleton } from '../ui/SkeletonCard';

export function formatUrgencyDisplay(urgency?: string): string {
  if (!urgency || !urgency.trim()) return 'Flexible Schedule';
  const u = urgency.trim();
  const lower = u.toLowerCase();
  if (lower === 'high') return 'High Urgency (ASAP / Today)';
  if (lower === 'medium') return 'Medium Urgency (Next 1-2 Days)';
  if (lower === 'low') return 'Low Urgency (Flexible)';
  return u;
}

export default function BrowseJobs({
  currentProviderId = 'u3',
  onNavigateToOffers
}: {
  currentProviderId?: string;
  onNavigateToOffers?: () => void;
}) {
  const router = useRouter();
  const { jobRequests, bids, submitBid, isDark, user } = useApp();
  const { canTransact } = useTransactionPermission();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [activeFilter, setActiveFilter] = useState<'all' | 'urgent' | 'high-budget' | 'few-offers'>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  React.useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 450);
    return () => clearTimeout(t);
  }, []);

  const handleCategoryChange = (cat: string) => {
    if (cat === selectedCategory) return;
    setIsLoading(true);
    setSelectedCategory(cat);
    setTimeout(() => setIsLoading(false), 300);
  };

  const handleFilterChange = (filter: typeof activeFilter) => {
    if (filter === activeFilter) return;
    setIsLoading(true);
    setActiveFilter(filter);
    setTimeout(() => setIsLoading(false), 250);
  };

  // Modal State
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [bidPrice, setBidPrice] = useState<number>(0);
  const [bidMessage, setBidMessage] = useState<string>('');
  const [blockedModalOpen, setBlockedModalOpen] = useState<boolean>(false);

  const categories = [
    'All Categories',
    'Plumbing',
    'Electrical Repair',
    'House Cleaning',
    'Aircon Service',
    'Lawn Care',
    'Tutoring',
    'Appliance Repair'
  ];

  // Filtering Logic
  const filteredRequests = jobRequests.filter((req) => {
    // 0. Only show active OPEN requests (hide paused, closed, canceled, or already booked requests)
    const isClosedOrPaused = req.status === 'CLOSED' || (req.status as string) === 'closed' || (req.status as string) === 'paused' || req.status === 'CANCELED' || req.status === 'IN_PROGRESS' || (req.status as string) === 'in_progress';
    if (isClosedOrPaused) return false;

    // 1. Search Query Filter
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      req.title.toLowerCase().includes(query) ||
      req.description.toLowerCase().includes(query) ||
      req.seekerName.toLowerCase().includes(query) ||
      req.category.toLowerCase().includes(query);

    // 2. Category Dropdown Filter
    const matchesCategory = selectedCategory === 'All Categories' || req.category === selectedCategory;

    // 3. Quick Filter Buttons Logic
    let matchesFilter = true;
    if (activeFilter === 'urgent') {
      const u = (req.urgency || '').toLowerCase();
      matchesFilter = u.includes('high') || u.includes('urgent') || u.includes('immediate') || u.includes('asap') || u.includes('today') || u.includes('24') || u.includes('emergency') || req.urgency === 'high';
    } else if (activeFilter === 'high-budget') {
      // ₱500+ is considered high-budget for local neighborhood services
      matchesFilter = req.budget >= 500;
    } else if (activeFilter === 'few-offers') {
      const bidCount = bids.filter(bid => bid.requestId === req.id && (bid.status === 'pending' || bid.status === 'PENDING')).length;
      matchesFilter = bidCount <= 1;
    }

    return matchesSearch && matchesCategory && matchesFilter;
  });

  // Sorting Logic driven by active Quick Filter
  const sortedRequests = [...filteredRequests].sort((a, b) => {
    if (activeFilter === 'urgent') {
      const getRank = (u: string) => {
        const s = (u || '').toLowerCase();
        if (s.includes('high') || s.includes('emergency')) return 3;
        if (s.includes('medium')) return 2;
        return 1;
      };
      return getRank(b.urgency) - getRank(a.urgency);
    } else if (activeFilter === 'high-budget') {
      return b.budget - a.budget;
    } else if (activeFilter === 'few-offers') {
      const aBidCount = bids.filter(bid => bid.requestId === a.id && (bid.status === 'pending' || bid.status === 'PENDING')).length;
      const bBidCount = bids.filter(bid => bid.requestId === b.id && (bid.status === 'pending' || bid.status === 'PENDING')).length;
      return aBidCount - bBidCount;
    }
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  // Pagination hook
  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedRequests,
    goToPage,
    nextPage,
    prevPage,
    startIndex,
    endIndex
  } = usePagination(sortedRequests, 6);

  const handleOpenBid = (reqId: string, initialPrice: number) => {
    if (!canTransact) {
      setBlockedModalOpen(true);
      return;
    }
    setSelectedRequestId(reqId);
    setBidPrice(initialPrice);
    setBidMessage('');
  };

  const handleSendOfferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestId) return;

    const targetReq = jobRequests.find(r => r.id === selectedRequestId);
    if (targetReq && (targetReq.status === 'CLOSED' || (targetReq.status as string) === 'closed' || (targetReq.status as string) === 'paused')) {
      alert("This service request has been paused by the seeker and is no longer accepting new offers.");
      setSelectedRequestId(null);
      return;
    }

    submitBid(selectedRequestId, currentProviderId, bidPrice, bidMessage);
    setSelectedRequestId(null);
  };

  return (
    <div className={`space-y-6 select-none transition-colors duration-200 ${isDark ? 'text-[#f2efe9]' : 'text-slate-800'}`}>

      <LimitedModeDashboardCard role="provider" />

      {/* Header Banner */}
      <div className={`rounded-[24px] p-8 border shadow-sm relative overflow-hidden text-center flex flex-col items-center justify-center transition-colors duration-200 ${isDark ? 'bg-[#22211e] border-neutral-800/80' : 'bg-white border-slate-300'
        }`}>
        <div className="max-w-2xl relative z-10 space-y-3 w-full">
          <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
            Find client requests for any task.
          </h2>
          <p className={`text-xs sm:text-sm max-w-md mx-auto leading-relaxed ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>
            Browse and bid on open jobs in our trusted community marketplace.
          </p>

          {/* Inputs Row inside Banner */}
          <div className={`flex items-center rounded-2xl p-1.5 shadow-inner mt-6 max-w-xl mx-auto w-full border ${isDark ? 'bg-[#1c1b18] border-neutral-800/85' : 'bg-slate-50 border-slate-200'
            }`}>
            <span className={`pl-3 ${isDark ? 'text-[#b4b0a9]' : 'text-slate-450'}`}>
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="What job or service request are you looking for?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full bg-transparent border-none py-2 px-3 text-xs focus:outline-none ${isDark ? 'text-[#f2efe9] placeholder-neutral-500' : 'text-slate-800 placeholder-slate-400'
                }`}
            />
            <button
              type="button"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95 flex-shrink-0"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Category Controls */}
      <div className="space-y-4">
        {/* Quick Filters Row */}
        <div className={`flex flex-wrap items-center gap-2 border-b pb-4 ${isDark ? 'border-neutral-800/80' : 'border-slate-300'}`}>
          <span className={`text-[10px] font-bold uppercase tracking-wider mr-2 ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>Quick Filters:</span>
          <button
            onClick={() => handleFilterChange('all')}
            className={`px-3 py-1 rounded-xl text-[10px] font-bold border transition-all ${activeFilter === 'all'
                ? isDark
                  ? 'bg-emerald-950/20 text-emerald-450 border-emerald-900/30'
                  : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                : isDark
                  ? 'bg-[#22211e] hover:bg-[#2c2b27] border-neutral-850 text-[#b4b0a9]'
                  : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-500'
              }`}
          >
            All
          </button>
          <button
            onClick={() => handleFilterChange('urgent')}
            className={`px-3 py-1 rounded-xl text-[10px] font-bold border transition-all ${activeFilter === 'urgent'
                ? isDark
                  ? 'bg-emerald-950/20 text-emerald-450 border-emerald-900/30'
                  : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                : isDark
                  ? 'bg-[#22211e] hover:bg-[#2c2b27] border-neutral-850 text-[#b4b0a9]'
                  : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-500'
              }`}
            title="Filter by high urgency job requests"
          >
            Urgent
          </button>
          <button
            onClick={() => handleFilterChange('high-budget')}
            className={`px-3 py-1 rounded-xl text-[10px] font-bold border transition-all ${activeFilter === 'high-budget'
                ? isDark
                  ? 'bg-emerald-950/20 text-emerald-455 border-emerald-900/30'
                  : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                : isDark
                  ? 'bg-[#22211e] hover:bg-[#2c2b27] border-neutral-850 text-[#b4b0a9]'
                  : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-500'
              }`}
            title="Filter by budget ₱500 and above"
          >
            High Budget
          </button>
          <button
            onClick={() => handleFilterChange('few-offers')}
            className={`px-3 py-1 rounded-xl text-[10px] font-bold border transition-all ${activeFilter === 'few-offers'
                ? isDark
                  ? 'bg-emerald-950/20 text-emerald-455 border-emerald-900/30'
                  : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                : isDark
                  ? 'bg-[#22211e] hover:bg-[#2c2b27] border-neutral-850 text-[#b4b0a9]'
                  : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-500'
              }`}
            title="Filter by low competition jobs (1 or fewer offers)"
          >
            Few Offers
          </button>
        </div>

        {/* Categories Bar and Sort Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${selectedCategory === cat
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : isDark
                      ? 'bg-[#22211e] border-neutral-800/80 text-[#b4b0a9] hover:bg-[#2c2b27]'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-3 flex-shrink-0">
            <span className={`text-[10px] font-bold px-3 py-2 rounded-xl border ${isDark
                ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/30'
                : 'bg-emerald-50 text-emerald-600 border-slate-300'
              }`}>
              {sortedRequests.length} Job{sortedRequests.length === 1 ? '' : 's'} Available
            </span>
          </div>
        </div>
      </div>

      {/* Job Requests Card Grid */}
      {isLoading ? (
        <JobRequestSkeleton count={6} />
      ) : sortedRequests.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No Open Job Requests"
          description={
            searchQuery || selectedCategory !== 'All Categories' || activeFilter !== 'all'
              ? `No requests matched your current filters ("${searchQuery || selectedCategory}"). Try adjusting your keywords or category filters.`
              : 'There are currently no open custom job requests posted by seekers in Cordova. Check back shortly!'
          }
          actionLabel={searchQuery || selectedCategory !== 'All Categories' || activeFilter !== 'all' ? 'Clear All Filters' : undefined}
          onAction={() => {
            setSearchQuery('');
            setSelectedCategory('All Categories');
            setActiveFilter('all');
          }}
          accentColor="emerald"
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedRequests.map((req) => {
              const totalBids = bids.filter(b => b.requestId === req.id && (b.status === 'pending' || b.status === 'PENDING')).length;
              const hasSentBid = bids.some(b => b.requestId === req.id && b.providerId === currentProviderId && (b.status === 'pending' || b.status === 'PENDING'));

              // Check if request belongs to currently logged-in user
              const isOwned = !!(user && (req.seekerId === user.id || req.seekerName === `${user.firstName} ${user.lastName}`.trim() || req.seekerName.includes(user.firstName)));

              return (
                <div
                  key={req.id}
                  onClick={() => !hasSentBid && !isOwned && handleOpenBid(req.id, req.budget)}
                  className={`rounded-[24px] p-5 border transition-all duration-200 ease-out flex flex-col justify-between h-full group ${
                    isOwned || hasSentBid
                      ? 'opacity-70 cursor-not-allowed border-dashed bg-slate-50/50 dark:bg-neutral-900/10'
                      : isDark
                        ? 'bg-[#22211e] border-neutral-855 hover:border-emerald-500/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:-translate-y-1 hover:bg-[#2c2b27]/30 cursor-pointer'
                        : 'bg-white border-slate-300 hover:border-emerald-500/50 hover:shadow-xl hover:-translate-y-1 cursor-pointer'
                    }`}
                >
                  <div>
                    {/* Card Header: Client Info */}
                    <div className="flex items-start justify-between">
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (req.seekerId) {
                            router.push(`/provider/user-profile?id=${req.seekerId}`);
                          }
                        }}
                        className="flex items-center space-x-3 group/seeker cursor-pointer select-none rounded-xl p-1 -m-1 transition-all hover:bg-slate-100/70 dark:hover:bg-neutral-800/60"
                        title={`View ${req.seekerName}'s profile`}
                      >
                        <div className="relative flex-shrink-0">
                          <img
                            src={req.seekerAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.seekerName || 'Client')}&background=random`}
                            alt={req.seekerName}
                            className="w-10 h-10 rounded-full object-cover border border-slate-100 dark:border-neutral-700 transition-transform duration-200 group-hover/seeker:scale-105 group-hover/seeker:ring-2 group-hover/seeker:ring-emerald-500/50"
                          />
                        </div>
                        <div>
                          <h4 className={`font-bold text-xs leading-tight transition-colors duration-200 group-hover/seeker:text-emerald-500 ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'
                            }`}>
                            {req.seekerName}
                          </h4>
                          <span className={`inline-flex items-center text-[10px] font-semibold mt-0.5 border px-1.5 py-0.25 rounded-md ${isDark
                              ? 'text-orange-400 bg-orange-950/20 border-orange-900/30'
                              : 'text-orange-655 bg-orange-50 border-orange-200'
                            }`}>
                            <CheckCircle2 className={`w-3 h-3 mr-0.5 ${isDark ? 'fill-orange-950/20 text-orange-400' : 'fill-orange-50 text-orange-600'
                              }`} />
                            Client
                          </span>
                        </div>
                      </div>

                      {/* Proposal count & Trust */}
                      <div className="text-right flex flex-col items-end gap-0.5 select-none">
                        <span className={`text-[10px] font-bold block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-450'}`}>
                          {totalBids} proposal{totalBids === 1 ? '' : 's'}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          🛡️ Verified Member
                        </span>
                      </div>
                    </div>

                    {/* Category Tag, Needed Timeline Badge & Owned Indicator */}
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className={`inline-block px-2.5 py-1 text-[9px] font-bold rounded-lg border uppercase tracking-wider ${isDark
                          ? 'text-emerald-400 bg-emerald-950/20 border-emerald-900/30'
                          : 'text-emerald-600 bg-emerald-50 border-slate-300'
                        }`}>
                        {req.category}
                      </span>

                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-extrabold rounded-lg border ${
                        (req.urgency || '').toLowerCase().includes('high') || (req.urgency || '').toLowerCase().includes('urgent') || (req.urgency || '').toLowerCase().includes('asap') || (req.urgency || '').toLowerCase().includes('today') || req.urgency === 'high'
                          ? isDark ? 'text-red-400 bg-red-955/30 border-red-900/40' : 'text-red-600 bg-red-50 border-red-200'
                          : (req.urgency || '').toLowerCase().includes('medium') || (req.urgency || '').toLowerCase().includes('24') || (req.urgency || '').toLowerCase().includes('tomorrow') || req.urgency === 'medium'
                            ? isDark ? 'text-amber-400 bg-amber-955/30 border-amber-900/40' : 'text-amber-700 bg-amber-50 border-amber-200'
                            : isDark ? 'text-slate-300 bg-neutral-900/30 border-neutral-800' : 'text-slate-700 bg-slate-100 border-slate-200'
                      }`}>
                        <span>⏰ Needed:</span>
                        <span className="font-black">{formatUrgencyDisplay(req.urgency)}</span>
                      </span>

                      {isOwned && (
                        <span className={`inline-block px-2.5 py-1 text-[9px] font-extrabold rounded-lg border uppercase tracking-wider ${isDark
                            ? 'text-orange-400 bg-orange-950/20 border-orange-900/30'
                            : 'text-orange-600 bg-orange-50 border-orange-200'
                          }`}>
                          👤 Owned By You
                        </span>
                      )}
                    </div>

                    {/* Job Details */}
                    <div className="mt-3">
                      <h3 className={`font-extrabold text-sm leading-snug ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
                        {req.title}
                      </h3>
                      <p className={`text-xs mt-2 line-clamp-2 leading-relaxed ${isDark ? 'text-[#b4b0a9]' : 'text-slate-455'}`}>
                        {req.description}
                      </p>
                    </div>
                  </div>

                  <div>
                    {/* Divider Line */}
                    <div className={`border-t my-3.5 ${isDark ? 'border-neutral-850' : 'border-slate-200/80'}`} />

                    {/* Budget & Escrow status */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col space-y-0.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-400'}`}>
                          Client Budget
                        </span>
                        <span className={`text-lg font-black ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
                          ₱{req.budget}
                        </span>
                      </div>

                      <span className="inline-flex items-center gap-1 text-[9.5px] font-bold px-2 py-0.5 rounded-md border w-fit bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        Escrow Protected
                      </span>
                    </div>

                    {/* Payment compatibility badges */}
                    <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10px] font-bold bg-slate-50 dark:bg-neutral-800/60 border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-neutral-300">
                        <Banknote className="w-3 h-3 text-slate-400" />
                        On-site Cash
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10px] font-bold bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                        <Smartphone className="w-3 h-3 text-emerald-500" />
                        GCash Ready
                      </span>
                    </div>

                    {/* Action CTA Button */}
                    <div className="mt-3.5">
                      {isOwned ? (
                        <div className={`w-full text-center text-xs font-bold py-2.5 rounded-xl border ${isDark ? 'text-neutral-500 bg-[#1c1b18] border-neutral-850' : 'text-slate-400 bg-slate-100 border-slate-200'
                          }`}>
                          Your Request (Cannot Bid)
                        </div>
                      ) : hasSentBid ? (
                        <div className={`w-full text-center text-xs font-bold py-2.5 rounded-xl border ${isDark ? 'text-emerald-400 bg-emerald-950/20 border-emerald-900/30' : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                          }`}>
                          ✓ Proposal Submitted
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenBid(req.id, req.budget)}
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-emerald-500/25 active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <span>Send Offer</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
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
            totalItems={sortedRequests.length}
            variant="provider"
          />
        </div>
      )}

      {/* Send Offer Modal Dialog */}
      {selectedRequestId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-955/70 backdrop-blur-sm select-none animate-in fade-in duration-200">
          <div className={`rounded-[24px] max-w-lg w-full overflow-hidden shadow-xl border animate-in zoom-in-95 duration-200 ${isDark ? 'bg-[#22211e] border-neutral-800/80 text-[#f2efe9]' : 'bg-white border-slate-300 text-slate-800'
            }`}>
            <div className={`p-5 border-b flex justify-between items-center ${isDark ? 'border-neutral-855 bg-[#1c1b18]/45' : 'border-slate-100 bg-slate-50/50'
              }`}>
              <h3 className={`font-extrabold text-sm ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
                Submit Proposal Offer
              </h3>
              <button
                onClick={() => setSelectedRequestId(null)}
                className={`p-1.5 rounded-lg border transition-colors ${isDark ? 'border-neutral-800 hover:bg-slate-800 text-neutral-450' : 'border-slate-200 hover:bg-slate-100 text-slate-400'
                  }`}
              >
                ✕
              </button>
            </div>

            {(() => {
              const activeReq = jobRequests.find(r => r.id === selectedRequestId);
              return (
                <form onSubmit={handleSendOfferSubmit} className="p-5 space-y-4">
                  {/* Job Preview Details Box */}
                  {activeReq && (
                    <div className={`p-3.5 rounded-xl border space-y-1.5 ${
                      isDark ? 'bg-[#1c1b18] border-neutral-800/80' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-extrabold text-xs text-orange-600 dark:text-orange-400 truncate">
                          {activeReq.title}
                        </h4>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border flex-shrink-0 ${
                          isDark ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        }`}>
                          Budget: ₱{activeReq.budget}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-500 dark:text-[#b4b0a9] font-medium">
                        <span>Client: <strong className="text-slate-700 dark:text-slate-200">{activeReq.seekerName}</strong></span>
                        <span>•</span>
                        <span>Category: <strong>{activeReq.category}</strong></span>
                        <span>•</span>
                        <span className="text-amber-600 dark:text-amber-400 font-extrabold">⏰ Needed: {formatUrgencyDisplay(activeReq.urgency)}</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-655'}`}>
                      Proposed Rate (₱)
                    </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={bidPrice}
                  onChange={(e) => setBidPrice(Number(e.target.value))}
                  className={`w-full px-4 py-3 rounded-xl border outline-none font-semibold text-sm transition-all ${isDark
                      ? 'bg-[#1c1b18] border-neutral-850 text-[#f2efe9] focus:border-emerald-500'
                      : 'bg-slate-50 border-slate-200 text-slate-750 focus:border-emerald-500'
                    }`}
                />
              </div>

              <div>
                <label className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-655'}`}>
                  Proposal Message / Cover Note
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explain your approach, availability in Cordova, and why the seeker should choose your offer..."
                  value={bidMessage}
                  onChange={(e) => setBidMessage(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border outline-none font-medium text-sm resize-none transition-all ${isDark
                      ? 'bg-[#1c1b18] border-neutral-850 text-[#f2efe9] focus:border-emerald-500'
                      : 'bg-slate-50 border-slate-200 text-slate-700 focus:border-emerald-500'
                    }`}
                />
              </div>

              <div className={`pt-3 border-t flex items-center justify-end space-x-2.5 ${isDark ? 'border-neutral-850' : 'border-slate-100'}`}>
                <button
                  type="button"
                  onClick={() => setSelectedRequestId(null)}
                  className={`px-4 py-2.5 border font-bold text-xs rounded-xl transition-all ${isDark
                      ? 'border-neutral-800 hover:bg-[#2c2b27] text-[#b4b0a9]'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-500'
                    }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95"
                >
                  Send Proposal
                </button>
              </div>
            </form>
            );
          })()}
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
