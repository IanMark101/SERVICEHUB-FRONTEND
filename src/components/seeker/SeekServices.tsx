import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { ServiceListing } from '../../types';
import { MagnifyingGlass as Search } from '@phosphor-icons/react';
import RequestServiceModal from './RequestServiceModal';
import { usePagination } from '../../hooks/usePagination';
import LimitedModeDashboardCard from '../landing/LimitedModeDashboardCard';
import TransactionBlockedModal from '../ui/TransactionBlockedModal';
import { useTransactionPermission } from '../../hooks/useTransactionPermission';
import { joinServiceRoom } from '../../lib/socket';
import { apiJoinWaitlist } from '../../api/bookings.api';
import { useToast } from '../ui/Toast';
import SuggestCategoryModal from './SuggestCategoryModal';
import { apiGetProviderSummary } from '../../api/ai.api';
import ServiceMarketplaceGrid from './seek-services/ServiceMarketplaceGrid';
import { getApiErrorMessage, getApiErrorStatus } from '../../lib/api/errors';

export default function SeekServices() {
  const router = useRouter();
  const { services, servicesLoading, users, isDark, user, dbCategories, jobEngagements } = useApp();
  const { canTransact } = useTransactionPermission();
  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [linkedServiceId, setLinkedServiceId] = useState<string | null>(null);
  const [selectedListing, setSelectedListing] = useState<ServiceListing | null>(null);
  const [blockedModalOpen, setBlockedModalOpen] = useState<boolean>(false);
  const [joiningWaitlistId, setJoiningWaitlistId] = useState<string | null>(null);
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState<boolean>(false);

  // Quick Filters state
  const [activeFilter, setActiveFilter] = useState<'all' | 'available' | 'rated' | 'low-queue'>('all');

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

  const categories = [
    'All Categories',
    ...dbCategories.map(c => c.name)
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

  // Filter listings based on category tabs, search strings, and quick filter options
  const filteredServices = services.filter(service => {
    // 0. Marketplace visibility guard: hide paused or unapproved listings
    if (service.isPaused) return false;
    if (service.status && service.status !== 'ACTIVE') return false;

    // 1. Search Query filter
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = linkedServiceId
      ? service.id === linkedServiceId
      : service.title.toLowerCase().includes(query) ||
      service.description.toLowerCase().includes(query) ||
      service.providerName.toLowerCase().includes(query) ||
      service.category.toLowerCase().includes(query) ||
      // Special aliases for common abbreviations or alternate terms
      (query === 'aircon' && (service.title.toLowerCase().includes('air conditioner') || service.category.toLowerCase().includes('aircon') || service.category.toLowerCase().includes('ac'))) ||
      (query === 'ac' && (service.title.toLowerCase().includes('air conditioner') || service.title.toLowerCase().includes('aircon'))) ||
      (query === 'electrical' && service.category.toLowerCase().includes('electrical')) ||
      (query === 'electrician' && service.category.toLowerCase().includes('electrical'));

    // 2. Category Tab filter — pills use live DB category names
    const matchesCategory = selectedCategory === 'All Categories' || service.category.toLowerCase() === selectedCategory.toLowerCase();

    // 3. Quick Filter conditions
    let matchesQuickFilter = true;
    if (activeFilter === 'available') {
      // Show services that are not paused AND not at queue capacity
      const queueLimit = service.queueLimit ?? 5;
      matchesQuickFilter = !service.isPaused && service.queueSize < queueLimit;
    } else if (activeFilter === 'rated') {
      // Top Rated: trustScore >= 80 → rating >= 4.0 (trustScore / 20)
      matchesQuickFilter = service.rating >= 4.0;
    } else if (activeFilter === 'low-queue') {
      // Low queue: 2 or fewer people in line
      matchesQuickFilter = service.queueSize <= 2;
    }
    return matchesSearch && matchesCategory && matchesQuickFilter;
  });

  // Pagination
  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedServices,
    goToPage,
    nextPage,
    prevPage,
    startIndex,
    endIndex,
    reset: resetPage,
  } = usePagination(filteredServices, 6);

  useEffect(() => {
    resetPage();
  }, [activeFilter, resetPage, searchQuery, selectedCategory]);

  const hasActiveFilters = Boolean(searchQuery.trim()) || selectedCategory !== 'All Categories' || activeFilter !== 'all';

  const clearFilters = () => {
    setLinkedServiceId(null);
    setSearchQuery('');
    setSelectedCategory('All Categories');
    setActiveFilter('all');
  };

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
    <div className={`workspace-page space-y-5 transition-colors duration-200 ${isDark ? 'text-[#f2efe9]' : 'text-slate-800'}`}>

      <LimitedModeDashboardCard role="seeker" />

      <section className="marketplace-discovery workspace-surface" aria-labelledby="marketplace-title">
        <div className="marketplace-discovery__copy">
          <h2 id="marketplace-title">Find the right local expert.</h2>
          <p className="workspace-muted">
            Compare verified providers, availability, trust, and pricing in one place.
          </p>
        </div>

        <form
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            document.getElementById('service-results')?.scrollIntoView({
              behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
              block: 'start',
            });
          }}
          className="service-search-control marketplace-search"
        >
            <span className="marketplace-search__icon" aria-hidden="true">
              <Search className="w-4 h-4" />
            </span>
            <label htmlFor="service-search-query" className="sr-only">Search service listings</label>
            <input
              id="service-search-query"
              type="text"
              placeholder="What service are you looking for?"
              value={searchQuery}
              onChange={(e) => {
                setLinkedServiceId(null);
                setSearchQuery(e.target.value);
              }}
              className="service-search-input min-w-0 flex-1 border-none bg-transparent px-3 py-2 text-sm"
            />
            <button
              type="submit"
              aria-controls="service-results"
              className="workspace-primary-button min-h-11 flex-shrink-0 rounded-xl border px-5 py-2.5 text-xs font-bold transition-all"
            >
              Search
            </button>
        </form>
      </section>

      <section className="marketplace-filter-panel" aria-label="Filter service listings">
        <div className="marketplace-filter-row">
          <div role="group" aria-label="Availability filters" className="marketplace-filter-group">
            <span className="marketplace-filter-label">Availability</span>
            <div className="marketplace-filter-options">
              {quickFilters.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  aria-pressed={activeFilter === filter.id}
                  onClick={() => handleFilterChange(filter.id)}
                  title={filter.title}
                  className="marketplace-filter-chip"
                >{filter.label}</button>
              ))}
            </div>
          </div>

          <div className="marketplace-results-summary" aria-live="polite" aria-atomic="true">
            <span>{servicesLoading ? 'Loading services' : `${filteredServices.length} ${filteredServices.length === 1 ? 'service' : 'services'}`}</span>
            {hasActiveFilters && (
              <button type="button" onClick={clearFilters}>Clear filters</button>
            )}
          </div>
        </div>

        <div className="marketplace-filter-row marketplace-filter-row--categories">
          <span className="marketplace-filter-label">Category</span>
          <div role="group" aria-label="Service categories" className="marketplace-category-strip">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                aria-pressed={selectedCategory === cat}
                onClick={() => handleCategoryChange(cat)}
                className="marketplace-filter-chip marketplace-filter-chip--category"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div id="service-results" className="scroll-mt-24">
        <ServiceMarketplaceGrid
          model={{
            router,
            isDark,
            isLoading: servicesLoading,
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
            setIsSuggestModalOpen,
            prefetchProviderSummary,
          }}
        />
      </div>

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

      {/* Suggest Category Modal */}
      <SuggestCategoryModal
        isOpen={isSuggestModalOpen}
        onClose={() => setIsSuggestModalOpen(false)}
        initialQuery={searchQuery}
      />

    </div>
  );
}
