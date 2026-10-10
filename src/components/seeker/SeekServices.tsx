import MarketplacePresentation from '../marketplace/MarketplacePresentation';
import { orderServiceCategories } from '../../lib/category-catalog';
import useNearbyMarketplace from '../../hooks/useNearbyMarketplace';
import MarketplaceLocationControl from '../location/MarketplaceLocationControl';
import MarketplaceEmptyState from '../location/MarketplaceEmptyState';
import MarketplaceResultsSummary from '../location/MarketplaceResultsSummary';
import ServiceDetailsModal from './seek-services/ServiceDetailsModal';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { ServiceListing } from '../../types';
import { MagnifyingGlass as Search } from '@phosphor-icons/react';
import RequestServiceModal from './RequestServiceModal';
import LimitedModeDashboardCard from '../landing/LimitedModeDashboardCard';
import TransactionBlockedModal from '../ui/TransactionBlockedModal';
import { useTransactionPermission } from '../../hooks/useTransactionPermission';
import { joinServiceRoom } from '../../lib/socket';
import { apiJoinWaitlist } from '../../api/bookings.api';
import { useToast } from '../ui/Toast';
import { apiGetProviderSummary } from '../../api/ai.api';
import ServiceMarketplaceGrid from './seek-services/ServiceMarketplaceGrid';
import { getApiErrorMessage, getApiErrorStatus } from '../../lib/api/errors';

export default function SeekServices() {
  const router = useRouter();
  const { services, users, isDark, user, dbCategories, jobEngagements } = useApp();
  const { canTransact } = useTransactionPermission();
  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [locationOpen, setLocationOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [linkedServiceId, setLinkedServiceId] = useState<string | null>(null);
  const [selectedListing, setSelectedListing] = useState<ServiceListing | null>(null);
  const [blockedModalOpen, setBlockedModalOpen] = useState<boolean>(false);
  const [joiningWaitlistId, setJoiningWaitlistId] = useState<string | null>(null);

  // Quick Filters state
  const [activeFilter, setActiveFilter] = useState<'all' | 'available' | 'rated' | 'low-queue'>('all');
  const nearby = useNearbyMarketplace('seeker', user?.id, searchQuery, selectedCategory, activeFilter);
  const isLoading = nearby.loading;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const category = params.get('category');
      const serviceId = params.get('serviceId');
      if (category) setSelectedCategory(category);
      if (serviceId) setLinkedServiceId(serviceId);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const handleCategoryChange = (cat: string) => {
    if (cat === selectedCategory) return;
    setLinkedServiceId(null);
    setSelectedCategory(cat);
  };

  const handleFilterChange = (filter: typeof activeFilter) => {
    if (filter === activeFilter) return;
    setActiveFilter(filter);
  };

  const clearFilters = () => {
    setLinkedServiceId(null);
    setSearchQuery('');
    setSelectedCategory('All Categories');
    setActiveFilter('all');
  };

  const categories = [
    'All Categories',
    ...orderServiceCategories(dbCategories).map(c => c.name)
  ];
  const quickFilters = [
    { id: 'all', label: 'All', title: 'Show all active listings' },
    { id: 'available', label: 'Available Now', title: 'Listings with open queue capacity' },
    { id: 'rated', label: 'Top Rated', title: 'Listings rated 4.0 or higher' },
    { id: 'low-queue', label: 'Low Queue', title: 'Listings with two or fewer people in queue' },
  ] as const;


  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'GCash' | 'On-site Cash'>('On-site Cash');

  const handleBookListing = (listing: ServiceListing, method: 'GCash' | 'On-site Cash' = 'On-site Cash') => {
    if (!canTransact) {
      setBlockedModalOpen(true);
      return;
    }
    if (listing.isPaused) {
      toastError('This service is currently paused by the provider and is not accepting new bookings.');
      return;
    }
    const existingActive = jobEngagements.find(je => 
      je.seekerId === user?.id &&
      je.serviceId === listing.id &&
      ['pending_provider', 'queued', 'in_progress', 'awaiting_seeker_approval', 'disputed'].includes(je.status)
    );
    if (existingActive) {
      toastInfo('Active Booking', 'You already have an active booking for this service. Redirecting to Activity...');
      router.push(`/seeker/seeker-activity?tab=all&booking=${existingActive.id}`);
      return;
    }
    setSelectedPaymentMethod(method);
    setSelectedListing(listing);
  };

  const prefetchProviderSummary = (listing: ServiceListing) => {
    if (!canTransact || !listing.providerId) return;
    void apiGetProviderSummary(listing.providerId, listing.id).catch(() => {
      // Booking remains available even when the optional digest cannot load.
    });
  };

  const handleCloseModal = () => {
    setSelectedListing(null);
  };

  const handleJoinWaitlist = async (listing: ServiceListing) => {
    if (!canTransact) {
      setBlockedModalOpen(true);
      return;
    }
    const existingActive = jobEngagements.find(je => 
      je.seekerId === user?.id &&
      je.serviceId === listing.id &&
      ['pending_provider', 'queued', 'in_progress', 'awaiting_seeker_approval', 'disputed'].includes(je.status)
    );
    if (existingActive) {
      toastInfo('Active Booking', 'You already have an active booking for this service.');
      router.push(`/seeker/seeker-activity?tab=all&booking=${existingActive.id}`);
      return;
    }
    if (listing.isPaused) {
      toastError('This service is currently paused by the provider and is not accepting waitlist entries.');
      return;
    }
    setJoiningWaitlistId(listing.id);
    try {
      await apiJoinWaitlist(listing.id);
      toastSuccess(`You're on the waitlist! We will notify you as soon as a slot opens for "${listing.title}".`);
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, 'Failed to join waitlist. Please try again.');
      if (getApiErrorStatus(err) === 409 || message.toLowerCase().includes('already')) {
        toastInfo('You are already on the waitlist for this service.');
      } else {
        toastError(message);
      }
    } finally {
      setJoiningWaitlistId(null);
    }
  };

  // Explicit links open details; they never replace the filtered nearby feed.
  const linkedService = linkedServiceId ? services.find(service => service.id === linkedServiceId && service.status === 'ACTIVE' && !service.isPaused) : undefined;
  const filteredServices = nearby.items as ServiceListing[];
  const paginatedServices = filteredServices;
  const { currentPage, totalPages, goToPage, nextPage, prevPage, startIndex, endIndex } = nearby;

  // Helper to fetch matching provider user details (like verification flags)
  const getProviderDetails = (providerId: string) => {
    return users.find(u => u.id === providerId);
  };

  // ─── Join Socket.io rooms for every visible service ─────────────────────────
  // This ensures real-time queue_update events from the backend are received
  // and the queue counter badge updates instantly without waiting for polling.
  useEffect(() => {
    paginatedServices.forEach((service) => {
      joinServiceRoom(service.id);
    });
  }, [paginatedServices]);

  return (
    <div className={`workspace-page space-y-8 select-none transition-colors duration-200 ${isDark ? 'text-white' : 'text-ink'}`}>

      <LimitedModeDashboardCard role="seeker" />

      <div className="relative overflow-hidden rounded-2xl border border-black/[0.07] bg-gradient-to-b from-[#fffdfa] to-[#faf8f5] px-4 py-5 text-center shadow-[0_2px_12px_-4px_rgba(23,23,22,0.05)] transition-colors sm:px-8 sm:py-7 dark:border-white/[0.08] dark:bg-none dark:bg-charcoal-surface dark:shadow-none">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-brand/50 to-transparent" />
        <div className="relative z-10 mx-auto w-full max-w-2xl space-y-2">
          <h2 className="text-2xl font-bold leading-tight tracking-[-0.03em] text-ink dark:text-white sm:text-3xl">Find local experts for any task.</h2>
          <p className="mx-auto max-w-md text-xs leading-relaxed text-ink-muted dark:text-ink-muted sm:text-sm">Browse provider services nearby, then narrow by service, category or availability.</p>
          <form role="search" onSubmit={(event) => {
            event.preventDefault();
            nearby.submitSearch?.();
            if (!nearby.location) { setLocationOpen(true); return; }
            document.getElementById('service-results')?.scrollIntoView({
              behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
              block: 'start',
            });
          }} className={`service-search-control mx-auto mt-4 flex w-full max-w-xl min-w-0 items-center rounded-xl border p-1 shadow-sm transition-all focus-within:ring-2 focus-within:ring-brand/20 ${
            isDark ? 'bg-charcoal-inset border-neutral-800' : 'bg-white border-black/10'
          }`}>
            <span className={`pl-3 ${isDark ? 'text-ink-muted' : 'text-ink-muted'}`}>
              <Search className="w-4 h-4" />
            </span>
            <label htmlFor="service-search-query" className="sr-only">Search service listings</label>
            <input
              id="service-search-query"
              type="text"
              maxLength={100}
              placeholder="What service are you looking for?"
              value={searchQuery}
              onChange={(e) => {
                setLinkedServiceId(null);
                setSearchQuery(e.target.value);
              }}
              className={`service-search-input min-w-0 flex-1 border-none bg-transparent px-3 py-2 text-sm focus:outline-none ${
                isDark ? 'text-white placeholder:text-ink-muted' : 'text-ink placeholder:text-ink-muted'
              }`}
            />
            <button
              type="submit"
              aria-controls="service-results"
              className="workspace-primary-button flex-shrink-0 rounded-lg border px-3 py-2 text-xs font-bold transition-all sm:px-5"
            >
              Search
            </button>
          </form>
          <MarketplaceLocationControl workspace="seeker" value={nearby.location} open={locationOpen} onOpenChange={setLocationOpen} onApply={nearby.applyLocation} />
        </div>
      </div>

      <MarketplacePresentation role="seeker">
      <div role="group" aria-label="Quick service filters" className="marketplace-filter-row">
        <span className="marketplace-filter-label">Quick filters</span>
        {quickFilters.map(filter => (
          <button key={filter.id} type="button" aria-pressed={activeFilter === filter.id}
            onClick={() => handleFilterChange(filter.id)} title={filter.title} className="marketplace-chip">
            {filter.label}
          </button>
        ))}
      </div>

      <div role="group" aria-label="Service categories" className="marketplace-category-row">
        {categories.map(cat => (
          <button key={cat} type="button" aria-pressed={selectedCategory === cat}
            onClick={() => handleCategoryChange(cat)} className="marketplace-chip">{cat}</button>
        ))}
      </div>

      <div id="service-results" className="marketplace-results scroll-mt-24">
      <div className="marketplace-result-context">
      <MarketplaceResultsSummary workspace="seeker" location={nearby.location} search={searchQuery} category={selectedCategory} filterLabel={activeFilter !== 'all' ? quickFilters.find(filter => filter.id === activeFilter)?.label : undefined} total={nearby.totalItems} loading={nearby.loading}/>
      {nearby.location && !nearby.loading && !nearby.error && <span className="marketplace-count">{nearby.totalItems} Service{nearby.totalItems === 1 ? '' : 's'} Available</span>}
      </div>
      {nearby.refreshError && <div role="alert" className="workspace-surface mb-4 rounded-xl border p-4 text-sm">
        Could not refresh services. Showing the last loaded results.{' '}
        <button type="button" className="font-semibold" onClick={nearby.refresh}>Try again</button>
      </div>}
      {!nearby.location && !nearby.initializing ? <MarketplaceEmptyState workspace="seeker" location={null} search={searchQuery} category={selectedCategory} hasFilters={!!searchQuery || selectedCategory !== 'All Categories' || activeFilter !== 'all'} onChangeLocation={() => setLocationOpen(true)} onClearFilters={clearFilters} onPostRequest={() => router.push('/seeker/post-request')}/> : <ServiceMarketplaceGrid
        model={{
          router,
          isDark,
          isLoading,
          servicesError: !!nearby.error,
          refreshServices: nearby.refresh,
          totalItems: nearby.totalItems,
          searchLocation: nearby.location,
          onChangeLocation: () => setLocationOpen(true),
          onExpandRadius: radiusKm => { if (nearby.location) nearby.applyLocation({ ...nearby.location, radiusKm }); },
          activeFilter,
          setActiveFilter,
          searchQuery,
          setSearchQuery,
          selectedCategory,
          setSelectedCategory,
          filteredServices,
          paginatedServices,
          currentPage,
          totalPages,
          goToPage,
          nextPage,
          prevPage,
          startIndex,
          endIndex,
          getProviderDetails,
          user,
          jobEngagements,
          canTransact,
          setBlockedModalOpen,
          handleBookListing,
          handleJoinWaitlist,
          joiningWaitlistId,
          prefetchProviderSummary
        }}
      />}
      </div>
      </MarketplacePresentation>

      <ServiceDetailsModal listing={linkedService || null} isOpen={!!linkedService} onClose={() => setLinkedServiceId(null)} onBookListing={(listing, method) => { setLinkedServiceId(null); handleBookListing(listing, method); }} onJoinWaitlist={handleJoinWaitlist} joiningWaitlistId={joiningWaitlistId} isOwned={linkedService?.providerId === user?.id} activeEngagement={jobEngagements.find(engagement => engagement.serviceId === linkedService?.id && engagement.seekerId === user?.id && ['pending_provider', 'queued', 'in_progress', 'awaiting_seeker_approval', 'disputed'].includes(engagement.status))} isDark={isDark} router={router} prefetchProviderSummary={prefetchProviderSummary}/>

      {/* Direct Booking Modal trigger */}
      {selectedListing && (
        <RequestServiceModal
          listing={selectedListing}
          initialPaymentMethod={selectedPaymentMethod}
          onClose={handleCloseModal}
        />
      )}

      {/* Transaction Blocked Modal */}
      <TransactionBlockedModal
        isOpen={blockedModalOpen}
        onClose={() => setBlockedModalOpen(false)}
      />

    </div>
  );
}
