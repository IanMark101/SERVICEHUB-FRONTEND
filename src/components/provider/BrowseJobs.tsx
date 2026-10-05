import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { MagnifyingGlass as Search } from '@phosphor-icons/react';
import { usePagination } from '../../hooks/usePagination';
import PaginationBar from '../ui/PaginationBar';
import LimitedModeDashboardCard from '../landing/LimitedModeDashboardCard';
import TransactionBlockedModal from '../ui/TransactionBlockedModal';
import { useTransactionPermission } from '../../hooks/useTransactionPermission';
import EmptyState from '../ui/EmptyState';
import { JobRequestSkeleton } from '../ui/SkeletonCard';
import ProposalModal from './browse-jobs/ProposalModal';
import JobRequestDetailsModal from './browse-jobs/JobRequestDetailsModal';
import { requestUrgencyRank } from '../../lib/requestUrgency';
import { useToast } from '../ui/Toast';
import { apiGetMyServices } from '../../api/services.api';
import { mapServiceToListing } from '../../context/mappers';
import type { ServiceListing, JobRequest } from '../../types';
import { hasActiveOffer } from '../../lib/offerStatus';
import JobRequestCard from './browse-jobs/JobRequestCard';

export default function BrowseJobs({
  currentProviderId
}: {
  currentProviderId?: string;
}) {
  const router = useRouter();
  const { jobRequests, bids, submitBid, isDark, user } = useApp();
  const { canTransact } = useTransactionPermission();
  const { warning } = useToast();
  const effectiveProviderId = currentProviderId || user?.id || '';
  const getProposalCount = (requestId: string, serverCount?: number) =>
    serverCount ?? bids.filter((bid) => bid.requestId === requestId && (bid.status === 'pending' || bid.status === 'PENDING')).length;

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [linkedRequestId, setLinkedRequestId] = useState<string | null>(null);
  React.useEffect(() => {
    const timer = window.setTimeout(() => setLinkedRequestId(new URLSearchParams(window.location.search).get('request')), 0);
    return () => window.clearTimeout(timer);
  }, []);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [activeFilter, setActiveFilter] = useState<'all' | 'urgent' | 'high-budget' | 'few-offers'>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [listingCheck, setListingCheck] = useState<{ status: 'loading' | 'ready' | 'error'; items: ServiceListing[] }>({ status: 'loading', items: [] });

  const loadMyListings = React.useCallback(async () => {
    try {
      const response = await apiGetMyServices();
      if (!response?.success || !Array.isArray(response.data)) throw new Error('Listings unavailable');
      setListingCheck({ status: 'ready', items: response.data.map(mapServiceToListing) });
    } catch {
      setListingCheck({ status: 'error', items: [] });
    }
  }, []);

  React.useEffect(() => {
    let active = true;
    queueMicrotask(() => { if (active) void loadMyListings(); });
    window.addEventListener('focus', loadMyListings);
    return () => { active = false; window.removeEventListener('focus', loadMyListings); };
  }, [loadMyListings]);

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
  const [previewRequest, setPreviewRequest] = useState<JobRequest | null>(null);
  const [bidPrice, setBidPrice] = useState<number>(0);
  const [bidDuration, setBidDuration] = useState<number>(60);
  const [bidMessage, setBidMessage] = useState<string>('');
  const [bidAvailability, setBidAvailability] = useState('');
  const sendingOfferRef = React.useRef(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [sendingOffer, setSendingOffer] = useState(false);
  const [blockedModalOpen, setBlockedModalOpen] = useState<boolean>(false);

  const categories = ['All Categories', ...Array.from(new Set(jobRequests.map((request) => request.category))).sort()];

  const quickFilters: { id: 'all' | 'urgent' | 'high-budget' | 'few-offers'; label: string; title: string }[] = [
    { id: 'all', label: 'All', title: 'Show all requests' },
    { id: 'urgent', label: 'Urgent', title: 'Filter by high urgency job requests' },
    { id: 'high-budget', label: 'High Budget', title: 'Filter by budget ₱500 and above' },
    { id: 'few-offers', label: 'Few Offers', title: 'Filter by low competition jobs (1 or fewer offers)' },
  ];

  // Filtering Logic
  const filteredRequests = jobRequests.filter((req) => {
    // 0. Only show active OPEN requests (hide paused, closed, canceled, or already booked requests)
    const isClosedOrPaused = req.status === 'CLOSED' || (req.status as string) === 'closed' || (req.status as string) === 'paused' || req.status === 'CANCELED' || req.status === 'IN_PROGRESS' || (req.status as string) === 'in_progress';
    if (isClosedOrPaused) return false;
    // A public post cannot become private because of old provider-only metadata.
    // Listing inquiries remain restricted, with the owner's read-only card visible.
    if (req.targetServiceId && req.targetProviderId !== effectiveProviderId && req.seekerId !== effectiveProviderId) return false;

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
      matchesFilter = requestUrgencyRank(req.urgency) >= 3;
    } else if (activeFilter === 'high-budget') {
      // ₱500+ is considered high-budget for local neighborhood services
      matchesFilter = req.budget >= 500;
    } else if (activeFilter === 'few-offers') {
      const bidCount = getProposalCount(req.id, req.offersCount);
      matchesFilter = bidCount <= 1;
    }

    return matchesSearch && matchesCategory && matchesFilter;
  });

  // Sorting Logic driven by active Quick Filter
  const sortedRequests = [...filteredRequests].sort((a, b) => {
    if (linkedRequestId && (a.id === linkedRequestId || b.id === linkedRequestId)) {
      return a.id === linkedRequestId ? -1 : 1;
    }
    if (activeFilter === 'urgent') {
      return requestUrgencyRank(b.urgency) - requestUrgencyRank(a.urgency);
    } else if (activeFilter === 'high-budget') {
      return b.budget - a.budget;
    } else if (activeFilter === 'few-offers') {
      const aBidCount = getProposalCount(a.id, a.offersCount);
      const bBidCount = getProposalCount(b.id, b.offersCount);
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

  const eligibleListingsFor = (category: string) => listingCheck.items.filter((listing) =>
    listing.providerId === effectiveProviderId && listing.category.trim().toLocaleLowerCase() === category.trim().toLocaleLowerCase()
    && listing.status === 'ACTIVE' && !listing.isPaused);

  const handleOpenBid = (reqId: string, initialPrice: number, serviceId: string) => {
    if (!canTransact) {
      setBlockedModalOpen(true);
      return;
    }
    setSelectedRequestId(reqId);
    const targetServiceId = jobRequests.find((request) => request.id === reqId)?.targetServiceId || serviceId;
    setSelectedServiceId(targetServiceId);
    const selectedListing = listingCheck.items.find((listing) => listing.id === targetServiceId);
    setBidPrice(selectedListing?.price || initialPrice);
    setBidDuration(selectedListing?.estimatedDurationMins || 60);
    setBidMessage('');
    setBidAvailability('');
  };

  const handleServiceChange = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    const listing = listingCheck.items.find((item) => item.id === serviceId);
    if (listing) {
      setBidPrice(listing.price);
      setBidDuration(listing.estimatedDurationMins || 60);
    }
  };

  const handleSendOfferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestId || sendingOfferRef.current) return;

    const targetReq = jobRequests.find(r => r.id === selectedRequestId);
    if (targetReq && (targetReq.status === 'CLOSED' || (targetReq.status as string) === 'closed' || (targetReq.status as string) === 'paused')) {
      warning('Request unavailable', 'The seeker paused this request, so it is no longer accepting offers.');
      setSelectedRequestId(null);
      return;
    }

    sendingOfferRef.current = true;
    setSendingOffer(true);
    try {
      const sent = await submitBid(selectedRequestId, effectiveProviderId, selectedServiceId || undefined, bidPrice, bidDuration, bidMessage, bidAvailability.trim() || undefined);
      if (sent) setSelectedRequestId(null);
    } finally {
      setSendingOffer(false);
      sendingOfferRef.current = false;
    }
  };

  return (
    <div className={`workspace-page space-y-8 select-none transition-colors duration-200 ${isDark ? 'text-white' : 'text-ink'}`}>

      <LimitedModeDashboardCard role="provider" />

      {/* Search Banner: mirrors the seeker discovery hero with provider color semantics. */}
      <div className="relative overflow-hidden rounded-2xl border border-black/[0.07] bg-gradient-to-b from-[#fffdfa] to-[#faf8f5] px-4 py-5 text-center shadow-[0_2px_12px_-4px_rgba(23,23,22,0.05)] transition-colors sm:px-8 sm:py-7 dark:border-white/[0.08] dark:from-[#1e1d1a] dark:to-[#171615] dark:shadow-none">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

        <div className="relative z-10 mx-auto w-full max-w-2xl space-y-2">
          <h2 className="text-2xl font-bold leading-tight tracking-[-0.03em] text-ink dark:text-white sm:text-3xl">
            Find client requests for any task.
          </h2>
          <p className="workspace-muted mx-auto max-w-md text-xs leading-relaxed sm:text-sm">
            Browse open requests and send offers to local clients.
          </p>

          {/* Inputs Row inside Banner */}
          <form role="search" onSubmit={(event) => {
            event.preventDefault();
            document.getElementById('job-request-results')?.scrollIntoView({
              behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
              block: 'start',
            });
          }} className={`service-search-control mx-auto mt-4 flex w-full max-w-xl min-w-0 items-center rounded-xl border p-1 shadow-sm transition-all focus-within:ring-2 focus-within:ring-emerald-500/20 ${isDark ? 'bg-[#1c1b18] border-neutral-800' : 'bg-white border-black/10'
            }`}>
            <span className={`pl-3 ${isDark ? 'text-ink-muted' : 'text-ink-muted'}`}>
              <Search className="w-4 h-4" />
            </span>
            <input
              aria-label="Search job requests"
              type="text"
              placeholder="What job or service request are you looking for?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`service-search-input min-w-0 flex-1 border-none bg-transparent px-3 py-2 text-sm focus:outline-none ${isDark ? 'text-white placeholder:text-ink-muted' : 'text-ink placeholder:text-ink-muted'
                }`}
            />
            <button
              type="submit"
              aria-controls="job-request-results"
              className="workspace-primary-button flex-shrink-0 rounded-lg border px-3 py-2 text-xs font-bold transition-all sm:px-5"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Filter and Category Controls */}
      <div className="space-y-4">
        {/* Quick Filters Row */}
        <div role="group" aria-label="Quick job filters" className={`flex flex-wrap items-center gap-2 border-b pb-4 ${isDark ? 'border-neutral-800/80' : 'border-black/10'}`}>
          <span className={`mr-2 text-xs font-semibold ${isDark ? 'text-ink-muted' : 'text-ink-muted'}`}>Quick filters</span>
          {quickFilters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              aria-pressed={activeFilter === filter.id}
              onClick={() => handleFilterChange(filter.id)}
              title={filter.title}
              className={`min-h-10 rounded-full border px-3.5 py-1 text-xs font-semibold transition-colors ${activeFilter === filter.id
                ? isDark
                  ? 'border-[#059669]/40 bg-[#059669]/20 text-[#9be5c2]'
                  : 'border-[#a7f3d0] bg-[#e7f4ec] text-[#056b4f]'
                : isDark
                  ? 'border-white/10 bg-[#201f1d] text-ink-muted hover:bg-white/10 hover:text-white'
                  : 'border-black/10 bg-[#fffdfa] text-ink-muted hover:bg-white hover:text-ink'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Categories Bar and Sort Controls */}
        <div className="mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div role="group" aria-label="Job categories" className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                aria-pressed={selectedCategory === cat}
                onClick={() => handleCategoryChange(cat)}
                className={`min-h-10 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${selectedCategory === cat
                    ? isDark
                      ? 'border-[#059669]/40 bg-[#059669]/20 text-[#9be5c2]'
                      : 'border-[#a7f3d0] bg-[#e7f4ec] text-[#056b4f]'
                    : isDark
                      ? 'border-white/10 bg-[#201f1d] text-ink-muted hover:bg-white/10 hover:text-white'
                      : 'border-black/10 bg-[#fffdfa] text-ink-muted hover:bg-white hover:text-ink'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-3 flex-shrink-0">
            <span className={`inline-flex items-center min-h-10 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${isDark
                ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/30'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
              {sortedRequests.length} Job{sortedRequests.length === 1 ? '' : 's'} Available
            </span>
          </div>
        </div>
      </div>

      {/* Job Requests Card Grid */}
      <section id="job-request-results" aria-label="Job request results" className="marketplace-results scroll-mt-24">
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
          <div className="marketplace-results-grid">
            {paginatedRequests.map((req) => {
              const totalBids = getProposalCount(req.id, req.offersCount);
              const previousOffer = bids.find(b => b.requestId === req.id && b.providerId === effectiveProviderId && hasActiveOffer(b));
              const hasSentBid = Boolean(previousOffer);

              // Check if request belongs to currently logged-in user
              const isOwned = !!(user && req.seekerId === user.id);

              return <JobRequestCard
                key={req.id}
                request={req}
                proposalCount={totalBids}
                isOwned={isOwned}
                offerState={hasSentBid ? (previousOffer?.status === 'accepted' || previousOffer?.status === 'ACCEPTED' ? 'accepted' : 'submitted') : null}
                isDark={isDark}
                onProfile={(reviews) => router.push(`/profile/${encodeURIComponent(req.seekerId)}${reviews ? '?tab=reviews' : ''}`)}
                onDetails={() => setPreviewRequest(req)}
                onSendOffer={() => {
                  if (!canTransact) { setBlockedModalOpen(true); return; }
                  handleOpenBid(req.id, req.budget, req.targetServiceId || '');
                }}
              />;
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
      </section>

      <ProposalModal
        request={jobRequests.find((request) => request.id === selectedRequestId)}
        listings={eligibleListingsFor(jobRequests.find((request) => request.id === selectedRequestId)?.category || '').filter((listing) => !jobRequests.find((request) => request.id === selectedRequestId)?.targetServiceId || listing.id === jobRequests.find((request) => request.id === selectedRequestId)?.targetServiceId)}
        serviceId={selectedServiceId}
        onServiceChange={handleServiceChange}
        isSubmitting={sendingOffer}
        isDark={isDark}
        price={bidPrice}
        duration={bidDuration}
        message={bidMessage}
        availability={bidAvailability}
        onAvailabilityChange={setBidAvailability}
        onPriceChange={setBidPrice}
        onDurationChange={setBidDuration}
        onMessageChange={setBidMessage}
        onClose={() => { if (!sendingOfferRef.current) setSelectedRequestId(null); }}
        onSubmit={handleSendOfferSubmit}
      />

      <JobRequestDetailsModal
        request={previewRequest}
        isOpen={Boolean(previewRequest)}
        onClose={() => setPreviewRequest(null)}
        onOpenBid={(reqId, budget, targetSvcId) => {
          setPreviewRequest(null);
          handleOpenBid(reqId, budget || 0, targetSvcId || '');
        }}
        isOwned={Boolean(user && previewRequest && previewRequest.seekerId === user.id)}
        hasSentBid={Boolean(
          previewRequest &&
            bids.some(
              (b) =>
                b.requestId === previewRequest.id &&
                b.providerId === effectiveProviderId &&
                hasActiveOffer(b)
            )
        )}
        previousOffer={
          previewRequest
            ? bids.find(
                (b) =>
                  b.requestId === previewRequest.id &&
                  b.providerId === effectiveProviderId &&
                  hasActiveOffer(b)
              )
            : undefined
        }
        canTransact={canTransact}
        onOpenBlockedModal={() => setBlockedModalOpen(true)}
        isDark={isDark}
        router={router}
      />

      {/* Transaction Blocked Modal */}
      <TransactionBlockedModal
        isOpen={blockedModalOpen}
        onClose={() => setBlockedModalOpen(false)}
      />

    </div>
  );
}
