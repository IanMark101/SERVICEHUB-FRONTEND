import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Send, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';
import { usePagination } from '../../hooks/usePagination';
import PaginationBar from '../PaginationBar';

export default function BrowseJobs({ currentProviderId = 'u3' }: { currentProviderId?: string }) {
  const { jobRequests, bids, submitBid, isDark } = useApp();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');

  // Sort state
  const [sortBy, setSortBy] = useState<'highest_budget' | 'most_urgent' | 'fewest_bids'>('most_urgent');

  // Quick Filters state
  const [activeFilter, setActiveFilter] = useState<'all' | 'urgent' | 'high-budget' | 'few-offers'>('all');

  // Bid modal state
  const [biddingJobId, setBiddingJobId] = useState<string | null>(null);
  const [bidPrice, setBidPrice] = useState<number>(0);
  const [bidMessage, setBidMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const categories = [
    'All Categories',
    'Plumbing Repair',
    'House Cleaning',
    'Electrician',
    'Gardening',
    'Tutoring'
  ];

  // Map category tabs to actual database category names
  const categoryMap: Record<string, string> = {
    'Plumbing Repair': 'Plumbing',
    'House Cleaning': 'House Cleaning',
    'Electrician': 'Electrical Repair',
    'Gardening': 'Lawn Care',
    'Tutoring': 'Tutoring'
  };

  const handleOpenBid = (reqId: string, defaultBudget: number) => {
    setBiddingJobId(reqId);
    setBidPrice(defaultBudget);
    setBidMessage('');
    setSuccess(false);
  };

  const handleSendBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!biddingJobId) return;
    if (bidPrice <= 0 || !bidMessage.trim()) {
      alert('Please enter a valid price and proposal message.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      submitBid(biddingJobId, currentProviderId, bidPrice, bidMessage);
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        setBiddingJobId(null);
        setSuccess(false);
      }, 1000);
    }, 800);
  };

  // Filter requests that are open and match selections
  const filteredRequests = jobRequests.filter(req => {
    if (req.status !== 'open') return false;

    // 1. Search Query filter
    const matchesSearch =
      req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.seekerName.toLowerCase().includes(searchQuery.toLowerCase());

    // 2. Category Tab filter
    const targetCategory = categoryMap[selectedCategory];
    const matchesCategory = selectedCategory === 'All Categories' || req.category === targetCategory;

    // 3. Quick Filter conditions
    let matchesQuickFilter = true;
    const requestBidsCount = bids.filter(b => b.requestId === req.id).length;
    if (activeFilter === 'urgent') {
      matchesQuickFilter = req.urgency === 'high';
    } else if (activeFilter === 'high-budget') {
      matchesQuickFilter = req.budget >= 1000;
    } else if (activeFilter === 'few-offers') {
      matchesQuickFilter = requestBidsCount <= 1;
    }

    return matchesSearch && matchesCategory && matchesQuickFilter;
  });

  // Sort requests based on selected option
  const sortedRequests = [...filteredRequests].sort((a, b) => {
    if (sortBy === 'highest_budget') {
      return b.budget - a.budget;
    }
    if (sortBy === 'most_urgent') {
      const urgencyScore = (u: 'low' | 'medium' | 'high') => {
        if (u === 'high') return 3;
        if (u === 'medium') return 2;
        return 1;
      };
      return urgencyScore(b.urgency) - urgencyScore(a.urgency);
    }
    if (sortBy === 'fewest_bids') {
      const countA = bids.filter(bid => bid.requestId === a.id).length;
      const countB = bids.filter(bid => bid.requestId === b.id).length;
      return countA - countB;
    }
    return 0;
  });

  // Pagination
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

  return (
    <div className={`space-y-6 select-none transition-colors duration-200 ${isDark ? 'text-[#f2efe9]' : 'text-slate-800'}`}>

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
        </div>
      </div>

      {/* Filter and Category Controls */}
      <div className="space-y-4">
        {/* Quick Filters Row */}
        <div className={`flex flex-wrap items-center gap-2 border-b pb-4 ${isDark ? 'border-neutral-800/80' : 'border-slate-300'}`}>
          <span className={`text-[10px] font-bold uppercase tracking-wider mr-2 ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>Quick Filters:</span>
          <button
            onClick={() => setActiveFilter('all')}
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
            onClick={() => setActiveFilter('urgent')}
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
            onClick={() => setActiveFilter('high-budget')}
            className={`px-3 py-1 rounded-xl text-[10px] font-bold border transition-all ${activeFilter === 'high-budget'
                ? isDark
                  ? 'bg-emerald-950/20 text-emerald-455 border-emerald-900/30'
                  : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                : isDark
                  ? 'bg-[#22211e] hover:bg-[#2c2b27] border-neutral-850 text-[#b4b0a9]'
                  : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-500'
              }`}
            title="Filter by budget ₱1,000 and above"
          >
            High Budget
          </button>
          <button
            onClick={() => setActiveFilter('few-offers')}
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

        {/* Horizontal Category pills row */}
        <div className="flex flex-wrap gap-2.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-xs font-bold rounded-full border transition-all ${selectedCategory === cat
                  ? isDark
                    ? 'bg-[#f2efe9] border-[#f2efe9] text-slate-950'
                    : 'bg-[#1a2238] border-[#1a2238] text-white shadow-sm'
                  : isDark
                    ? 'bg-[#22211e] hover:bg-[#2c2b27] border-neutral-850 text-[#b4b0a9]'
                    : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-600'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search & Sort Action Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between pt-2">
          {/* Search Box */}
          <div className={`flex items-center rounded-xl px-3 py-2 w-full md:max-w-md border transition-all ${isDark ? 'bg-[#1c1b18] border-neutral-800/80' : 'bg-slate-50 border-slate-300'
            }`}>
            <span className={isDark ? 'text-[#b4b0a9]' : 'text-slate-400'}>
              <Search className="w-4 h-4 mr-2" />
            </span>
            <input
              type="text"
              placeholder="Search open jobs by client name, title, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-xs w-full text-slate-800 dark:text-[#f2efe9] placeholder-slate-400"
            />
          </div>

          {/* Sort Dropdown & Badge */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            <div className="flex items-center space-x-2">
              <span className={`text-xs font-semibold whitespace-nowrap ${isDark ? 'text-[#b4b0a9]' : 'text-slate-550'}`}>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className={`px-3 py-2 rounded-xl border outline-none font-bold text-xs transition-all ${isDark
                    ? 'bg-[#1c1b18] border-neutral-800/80 text-[#f2efe9]'
                    : 'bg-white border-slate-300 text-slate-700'
                  }`}
              >
                <option value="most_urgent">Most Urgent</option>
                <option value="highest_budget">Highest Budget</option>
                <option value="fewest_bids">Fewest Bids</option>
              </select>
            </div>
            <span className={`text-[10px] font-bold px-3 py-2 rounded-xl border ${isDark
                ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/30'
                : 'bg-emerald-50 text-emerald-600 border-slate-300'
              }`}>
              {sortedRequests.length} Job{sortedRequests.length === 1 ? '' : 's'} Available
            </span>
          </div>
        </div>
      </div>      {/* Job Requests Card Grid */}
      {sortedRequests.length === 0 ? (
        <div className={`rounded-[24px] p-12 border text-center text-sm font-medium transition-colors duration-200 ${isDark ? 'bg-[#22211e] border-neutral-800/80 text-[#b4b0a9]' : 'bg-white border-slate-300 text-slate-500'
          }`}>
          No open job requests found matching the active criteria.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedRequests.map((req) => {
              const totalBids = bids.filter(b => b.requestId === req.id).length;
              const hasSentBid = bids.some(b => b.requestId === req.id && b.providerId === currentProviderId);

              return (
                <div
                  key={req.id}
                  onClick={() => !hasSentBid && handleOpenBid(req.id, req.budget)}
                  className={`rounded-[24px] p-5 border transition-all duration-200 flex flex-col justify-between h-full group ${hasSentBid
                      ? 'opacity-55 cursor-not-allowed border-dashed bg-slate-50/50 dark:bg-neutral-900/10'
                      : isDark
                        ? 'bg-[#22211e] border-neutral-855 hover:border-emerald-500/40 hover:shadow-lg hover:bg-[#2c2b27]/20 cursor-pointer'
                        : 'bg-white border-slate-300 hover:border-emerald-500/40 hover:shadow-md cursor-pointer'
                    }`}
                >
                  <div>
                    {/* Card Header: Client Info */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={req.seekerAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'}
                          alt={req.seekerName}
                          className="w-10 h-10 rounded-full object-cover border border-slate-100"
                        />
                        <div>
                          <h4 className={`font-bold text-xs leading-tight transition-colors ${isDark ? 'text-[#f2efe9] group-hover:text-emerald-450' : 'text-slate-900 group-hover:text-emerald-600'
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

                      {/* Urgency tag */}
                      <div className="text-right flex flex-col items-end">
                        <span className={`inline-block px-2.5 py-0.5 text-[9px] font-extrabold rounded-md uppercase tracking-wider border ${req.urgency === 'high'
                            ? isDark ? 'text-red-400 bg-red-955/20 border-red-900/30' : 'text-red-600 bg-red-50 border-red-200'
                            : req.urgency === 'medium'
                              ? isDark ? 'text-amber-400 bg-amber-955/20 border-amber-900/30' : 'text-amber-600 bg-amber-50 border-amber-200'
                              : isDark ? 'text-[#b4b0a9] bg-neutral-900/20 border-neutral-850' : 'text-slate-500 bg-slate-50 border-slate-300'
                          }`}>
                          {req.urgency}
                        </span>
                        <span className={`text-[10px] font-bold mt-1 block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-450'}`}>
                          {totalBids} proposal{totalBids === 1 ? '' : 's'}
                        </span>
                      </div>
                    </div>

                    {/* Category Tag */}
                    <div className="mt-4">
                      <span className={`inline-block px-2.5 py-1 text-[9px] font-bold rounded-lg border uppercase tracking-wider ${isDark
                          ? 'text-emerald-400 bg-emerald-950/20 border-emerald-900/30'
                          : 'text-emerald-600 bg-emerald-50 border-slate-300'
                        }`}>
                        {req.category}
                      </span>
                    </div>

                    {/* Job Details */}
                    <div className="mt-3">
                      <h3 className={`font-extrabold text-sm leading-snug group-hover:underline ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
                        {req.title}
                      </h3>
                      <p className={`text-xs mt-2 line-clamp-2 leading-relaxed ${isDark ? 'text-[#b4b0a9]' : 'text-slate-455'}`}>
                        {req.description}
                      </p>
                    </div>
                  </div>

                  {/* Divider Line */}
                  <div className={`border-t my-4 ${isDark ? 'border-neutral-850' : 'border-slate-350'}`} />

                  {/* Footer: Budget & Action */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-400'}`}>Budget</span>
                      <span className={`text-base font-extrabold ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>₱{req.budget}</span>
                    </div>

                    {hasSentBid ? (
                      <span className={`text-[10px] font-bold px-3 py-1.5 rounded-xl border ${isDark ? 'text-neutral-550 bg-[#1c1b18] border-neutral-850' : 'text-slate-400 bg-slate-100/50 border-slate-300'
                        }`}>
                        Submitted Proposal
                      </span>
                    ) : (
                      <span className={`text-[10px] font-bold px-3 py-1.5 rounded-xl transition-all ${isDark
                          ? 'text-emerald-450 bg-emerald-955/20 group-hover:bg-[#f2efe9] group-hover:text-slate-950 border border-emerald-900/30'
                          : 'text-emerald-600 bg-emerald-55 group-hover:bg-emerald-600 group-hover:text-white border border-slate-300'
                        }`}>
                        Send Offer
                      </span>
                    )}
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

      {/* Offer Proposal Modal Overlay */}
      {biddingJobId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-955/70 backdrop-blur-sm select-none animate-in fade-in duration-200">
          <div className={`rounded-[24px] max-w-lg w-full overflow-hidden shadow-xl border animate-in zoom-in-95 duration-200 ${isDark ? 'bg-[#22211e] border-neutral-800/80 text-[#f2efe9]' : 'bg-white border-slate-300 text-slate-800'
            }`}>

            {/* Header */}
            <div className={`p-5 border-b flex justify-between items-center ${isDark ? 'border-neutral-855 bg-[#1c1b18]/45' : 'border-slate-100 bg-slate-50/50'
              }`}>
              <div>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider border ${isDark
                    ? 'text-emerald-400 bg-emerald-950/20 border-emerald-900/30'
                    : 'text-emerald-600 bg-emerald-50 border-slate-300'
                  }`}>
                  Offer Proposal
                </span>
                <h3 className={`font-extrabold text-sm mt-1.5 leading-snug ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
                  Submit an Offer
                </h3>
              </div>
              <button
                onClick={() => setBiddingJobId(null)}
                className={`p-1.5 rounded-lg border transition-colors ${isDark ? 'border-neutral-800 hover:bg-slate-800 text-neutral-450' : 'border-slate-300 hover:bg-slate-100 text-slate-450 hover:text-slate-700'
                  }`}
              >
                ✕
              </button>
            </div>

            {/* Content Form */}
            {success ? (
              <div className="p-8 text-center space-y-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto text-xl font-bold border ${isDark ? 'bg-emerald-955/20 text-emerald-450 border-emerald-900/30' : 'bg-emerald-50 text-emerald-600 border-slate-300'
                  }`}>
                  ✓
                </div>
                <h4 className={`font-bold text-sm ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>Offer Submitted!</h4>
                <p className={`text-xs ${isDark ? 'text-[#b4b0a9]' : 'text-slate-450'}`}>
                  Your proposal has been logged and the client will be notified.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendBid} className="p-5 space-y-4">
                {/* Offer Price Input */}
                <div>
                  <label className={`block text-[10px] font-bold uppercase tracking-wide mb-1.5 ${isDark ? 'text-[#b4b0a9]' : 'text-slate-450'}`}>
                    Your Offered Price (₱)
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={bidPrice}
                    onChange={(e) => setBidPrice(Number(e.target.value))}
                    className={`w-full px-4 py-3 rounded-xl border outline-none font-medium text-sm transition-all ${isDark
                        ? 'bg-[#1c1b18] border-neutral-850 text-[#f2efe9] focus:border-emerald-500'
                        : 'bg-slate-50 border-slate-300 text-slate-755 focus:border-emerald-500'
                      }`}
                  />
                </div>

                {/* Proposal Message Textarea */}
                <div>
                  <label className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-655'}`}>
                    Proposal Message / Cover Letter
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Hello, I have standard replacement units in my kit and can perform this task tomorrow..."
                    value={bidMessage}
                    onChange={(e) => setBidMessage(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border outline-none font-medium text-sm resize-none transition-all ${isDark
                        ? 'bg-[#1c1b18] border-neutral-850 text-[#f2efe9] focus:border-emerald-500'
                        : 'bg-slate-50 border-slate-300 text-slate-700 focus:border-emerald-500'
                      }`}
                  />
                </div>

                {/* Actions */}
                <div className={`pt-3 border-t flex items-center justify-end space-x-2.5 ${isDark ? 'border-neutral-850' : 'border-slate-100'}`}>
                  <button
                    type="button"
                    onClick={() => setBiddingJobId(null)}
                    className={`px-4 py-2.5 border font-bold text-xs rounded-xl transition-all ${isDark
                        ? 'border-neutral-800 hover:bg-[#2c2b27] text-[#b4b0a9]'
                        : 'border-slate-300 hover:bg-slate-50 text-slate-500'
                      }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95"
                  >
                    {loading ? 'Submitting...' : 'Submit Offer'}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
