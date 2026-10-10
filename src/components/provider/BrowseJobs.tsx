import MarketplacePresentation from '../marketplace/MarketplacePresentation';
import { orderServiceCategories } from '../../lib/category-catalog';
import useNearbyMarketplace from '../../hooks/useNearbyMarketplace';
import MarketplaceLocationControl from '../location/MarketplaceLocationControl';
import MarketplaceEmptyState from '../location/MarketplaceEmptyState';
import MarketplaceResultsSummary from '../location/MarketplaceResultsSummary';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { MagnifyingGlass as Search } from '@phosphor-icons/react';
import PaginationBar from '../ui/PaginationBar';
import LimitedModeDashboardCard from '../landing/LimitedModeDashboardCard';
import TransactionBlockedModal from '../ui/TransactionBlockedModal';
import { useTransactionPermission } from '../../hooks/useTransactionPermission';
import EmptyState from '../ui/EmptyState';
import { JobRequestSkeleton } from '../ui/SkeletonCard';
import ProposalModal from './browse-jobs/ProposalModal';
import JobRequestDetailsModal from './browse-jobs/JobRequestDetailsModal';
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
  const { jobRequests: allRequests, bids, submitBid, isDark, user, dbCategories = [] } = useApp();
  const { canTransact } = useTransactionPermission();
  const { warning } = useToast();
  const effectiveProviderId = currentProviderId || user?.id || '';
  const getProposalCount = (requestId: string, serverCount?: number) =>
    serverCount ?? bids.filter((bid) => bid.requestId === requestId && (bid.status === 'pending' || bid.status === 'PENDING')).length;

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [locationOpen, setLocationOpen] = useState(false);
  const [linkedRequestId, setLinkedRequestId] = useState<string | null>(null);
  React.useEffect(() => {
    const timer = window.setTimeout(() => setLinkedRequestId(new URLSearchParams(window.location.search).get('request')), 0);
    return () => window.clearTimeout(timer);
  }, []);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [activeFilter, setActiveFilter] = useState<'all' | 'urgent' | 'high-budget' | 'few-offers'>('all');
  const nearby = useNearbyMarketplace('provider', effectiveProviderId, searchQuery, selectedCategory, activeFilter);
  const jobRequests = nearby.items as JobRequest[];
  const isLoading = nearby.loading;
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

  const handleCategoryChange = (cat: string) => setSelectedCategory(cat);
  const handleFilterChange = (filter: typeof activeFilter) => setActiveFilter(filter);
  const clearFilters = () => { setSearchQuery(''); setSelectedCategory('All Categories'); setActiveFilter('all'); };

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

  const categories = ['All Categories', ...orderServiceCategories(dbCategories).map(category => category.name)];

  const quickFilters: { id: 'all' | 'urgent' | 'high-budget' | 'few-offers'; label: string; title: string }[] = [
    { id: 'all', label: 'All', title: 'Show all requests' },
    { id: 'urgent', label: 'Urgent', title: 'Filter by high urgency service requests' },
    { id: 'high-budget', label: 'High Budget', title: 'Filter by budget ₱500 and above' },
    { id: 'few-offers', label: 'Few Offers', title: 'Filter by service requests with few offers (1 or fewer offers)' },
  ];

  const sortedRequests = jobRequests;
  const paginatedRequests = jobRequests;
  const { currentPage, totalPages, goToPage, nextPage, prevPage, startIndex, endIndex } = nearby;
  const [proposalRequest, setProposalRequest] = useState<JobRequest | null>(null);
  React.useEffect(() => {
    if (linkedRequestId) {
      const request = allRequests.find(item => item.id === linkedRequestId);
      if (request) queueMicrotask(() => { setPreviewRequest(request); setLinkedRequestId(null); });
    }
  }, [linkedRequestId, allRequests]);

  const eligibleListingsFor = (category: string) => listingCheck.items.filter((listing) =>
    listing.providerId === effectiveProviderId && listing.category.trim().toLocaleLowerCase() === category.trim().toLocaleLowerCase()
    && listing.status === 'ACTIVE' && !listing.isPaused);

  const handleOpenBid = (reqId: string, initialPrice: number, serviceId: string) => {
    if (!canTransact) {
      setBlockedModalOpen(true);
      return;
    }
    setSelectedRequestId(reqId);
    setProposalRequest(jobRequests.find(request => request.id === reqId) || allRequests.find(request => request.id === reqId) || previewRequest);
    const targetServiceId = jobRequests.find((request) => request.id === reqId)?.targetServiceId || serviceId;
    setSelectedServiceId(targetServiceId);
    const selectedListing = listingCheck.items.find((listing) => listing.id === targetServiceId);
    setBidPrice(selectedListing ? selectedListing.price + (selectedListing.transportationFee ?? 0) : initialPrice);
    setBidDuration(selectedListing?.estimatedDurationMins || 60);
    setBidMessage('');
    setBidAvailability('');
  };

  const handleServiceChange = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    const listing = listingCheck.items.find((item) => item.id === serviceId);
    if (listing) {
      setBidPrice(listing.price + (listing.transportationFee ?? 0));
      setBidDuration(listing.estimatedDurationMins || 60);
    }
  };

  const handleSendOfferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestId || sendingOfferRef.current) return;

    const targetReq = jobRequests.find(r => r.id === selectedRequestId) || proposalRequest;
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

      <div className="relative overflow-hidden rounded-2xl border border-black/[0.07] bg-gradient-to-b from-[#fffdfa] to-[#faf8f5] px-4 py-5 text-center shadow-[0_2px_12px_-4px_rgba(23,23,22,0.05)] transition-colors sm:px-8 sm:py-7 dark:border-white/[0.08] dark:bg-none dark:bg-charcoal-surface dark:shadow-none">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
        <div className="relative z-10 mx-auto w-full max-w-2xl space-y-2">
          <h2 className="text-2xl font-bold leading-tight tracking-[-0.03em] text-ink dark:text-white sm:text-3xl">Find seeker requests for any task.</h2>
          <p className="workspace-muted mx-auto max-w-md text-xs leading-relaxed sm:text-sm">Browse open requests and send offers to local service seekers.</p>
          <form role="search" onSubmit={(event) => {
            event.preventDefault();
            nearby.submitSearch?.();
            if (!nearby.location) { setLocationOpen(true); return; }
            document.getElementById('job-request-results')?.scrollIntoView({
              behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
              block: 'start',
            });
          }} className={`service-search-control mx-auto mt-4 flex w-full max-w-xl min-w-0 items-center rounded-xl border p-1 shadow-sm transition-all focus-within:ring-2 focus-within:ring-emerald-500/20 ${isDark ? 'bg-charcoal-inset border-neutral-800' : 'bg-white border-black/10'
            }`}>
            <span className={`pl-3 ${isDark ? 'text-ink-muted' : 'text-ink-muted'}`}>
              <Search className="w-4 h-4" />
            </span>
            <input
              aria-label="Search service requests"
              type="text"
              maxLength={100}
              placeholder="What service request are you looking for?"
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
          <MarketplaceLocationControl workspace="provider" value={nearby.location} open={locationOpen} onOpenChange={setLocationOpen} onApply={nearby.applyLocation} />
        </div>
      </div>

      <MarketplacePresentation role="provider">
      <div role="group" aria-label="Quick service request filters" className="marketplace-filter-row">
        <span className="marketplace-filter-label">Quick filters</span>
        {quickFilters.map(filter => (
          <button key={filter.id} type="button" aria-pressed={activeFilter === filter.id}
            onClick={() => handleFilterChange(filter.id)} title={filter.title} className="marketplace-chip">
            {filter.label}
          </button>
        ))}
      </div>

      <div role="group" aria-label="Service request categories" className="marketplace-category-row">
        {categories.map(cat => (
          <button key={cat} type="button" aria-pressed={selectedCategory === cat}
            onClick={() => handleCategoryChange(cat)} className="marketplace-chip">{cat}</button>
        ))}
      </div>

      {/* Job Requests Card Grid */}
      <section id="job-request-results" aria-label="Service request results" className="marketplace-results scroll-mt-24">
      <div className="marketplace-result-context">
      <MarketplaceResultsSummary workspace="provider" location={nearby.location} search={searchQuery} category={selectedCategory} filterLabel={activeFilter !== 'all' ? quickFilters.find(filter => filter.id === activeFilter)?.label : undefined} total={nearby.totalItems} loading={nearby.loading}/>
      {nearby.location && !nearby.loading && !nearby.error && <span className="marketplace-count">{nearby.totalItems} Service Request{nearby.totalItems === 1 ? '' : 's'} Available</span>}
      </div>
      {nearby.refreshError && <div role="alert" className="workspace-surface mb-4 rounded-xl border p-4 text-sm">
        Could not refresh requests. Showing the last loaded results.{' '}
        <button type="button" className="font-semibold" onClick={nearby.refresh}>Try again</button>
      </div>}
      {!nearby.location && !nearby.initializing ? <MarketplaceEmptyState workspace="provider" location={null} search={searchQuery} category={selectedCategory} hasFilters={!!searchQuery || selectedCategory !== 'All Categories' || activeFilter !== 'all'} onChangeLocation={() => setLocationOpen(true)} onClearFilters={clearFilters}/> : nearby.error ? <div role="alert"><EmptyState icon={Search} title="Requests could not be loaded" description={nearby.error} actionLabel="Try again" onAction={nearby.refresh} accentColor="emerald" /></div> : isLoading ? (
        <JobRequestSkeleton count={6} />
      ) : sortedRequests.length === 0 ? (
        <MarketplaceEmptyState workspace="provider" location={nearby.location} search={searchQuery} category={selectedCategory}
          hasFilters={!!searchQuery || selectedCategory !== 'All Categories' || activeFilter !== 'all'}
          onChangeLocation={() => setLocationOpen(true)} onExpandRadius={radiusKm => { if (nearby.location) nearby.applyLocation({ ...nearby.location, radiusKm }); }} onClearFilters={clearFilters}/>
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
                    onProfile={(reviews) => router.push(`/profile/${encodeURIComponent(req.seekerId)}${reviews ? '?tab=reviews&reviewRole=seeker' : ''}`)}
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
            totalItems={nearby.totalItems}
            variant="provider"
          />
        </div>
      )}
      </section>
      </MarketplacePresentation>

      <ProposalModal
        request={selectedRequestId ? proposalRequest || undefined : undefined}
        listings={eligibleListingsFor(proposalRequest?.category || '').filter(listing => !proposalRequest?.targetServiceId || listing.id === proposalRequest.targetServiceId)}
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
