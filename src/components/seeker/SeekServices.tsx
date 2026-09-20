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
  const { services, users, isDark, user, dbCategories, jobEngagements } = useApp();
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
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 450);
    return () => clearTimeout(t);
  }, []);

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
    setIsLoading(true);
    setLinkedServiceId(null);
    setSelectedCategory(cat);
    setTimeout(() => setIsLoading(false), 300);
  };

  const handleFilterChange = (filter: typeof activeFilter) => {
    if (filter === activeFilter) return;
    setIsLoading(true);
    setActiveFilter(filter);
    setTimeout(() => setIsLoading(false), 250);
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
    endIndex
  } = usePagination(filteredServices, 6);

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
    <div className={`workspace-page space-y-8 select-none transition-colors duration-200 ${isDark ? 'text-[#f2efe9]' : 'text-slate-800'}`}>

      <LimitedModeDashboardCard role="seeker" />

      {/* Search Banner: Warm, integrated discovery hero */}
      <div className="relative overflow-hidden rounded-2xl border border-black/[0.07] bg-gradient-to-b from-[#fffdfa] to-[#faf8f5] px-6 py-6 text-center shadow-[0_2px_12px_-4px_rgba(23,23,22,0.05)] transition-colors sm:px-8 sm:py-7 dark:border-white/[0.08] dark:from-[#1e1d1a] dark:to-[#171615] dark:shadow-none">
        {/* Subtle warm accent hairline */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#c86544]/50 to-transparent" />

        <div className="relative z-10 mx-auto w-full max-w-2xl space-y-2">
          <h2 className="text-2xl font-bold leading-tight tracking-[-0.03em] text-[#171716] dark:text-[#f2efe9] sm:text-3xl">
            Find local experts for any task.
          </h2>
          <p className="mx-auto max-w-md text-xs leading-relaxed text-[#66645f] dark:text-[#aaa69f] sm:text-sm">
            Search our trusted community marketplace for specialized services.
          </p>

          {/* Inputs Row inside Banner */}
          <form role="search" onSubmit={(event) => {
            event.preventDefault();
            document.getElementById('service-results')?.scrollIntoView({
              behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
              block: 'start',
            });
          }} className={`service-search-control mx-auto mt-4 flex w-full max-w-xl items-center rounded-xl border p-1 shadow-sm transition-all focus-within:ring-2 focus-within:ring-[#c86544]/20 ${
            isDark ? 'bg-[#1c1b18] border-neutral-800' : 'bg-white border-black/10'
          }`}>
            <span className={`pl-3 ${isDark ? 'text-[#aaa59d]' : 'text-[#6f6a64]'}`}>
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
              className={`service-search-input min-w-0 flex-1 border-none bg-transparent px-3 py-2 text-sm focus:outline-none ${
                isDark ? 'text-[#f2efe9] placeholder:text-[#aaa59d]' : 'text-[#171716] placeholder:text-[#6f6a64]'
              }`}
            />
            <button
              type="submit"
              aria-controls="service-results"
              className="workspace-primary-button flex-shrink-0 rounded-lg border px-5 py-2 text-xs font-bold transition-all"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Quick Filters Row */}
      <div role="group" aria-label="Quick service filters" className={`flex flex-wrap items-center gap-2 border-b pb-4 ${isDark ? 'border-neutral-800/80' : 'border-black/10'}`}>
        <span className={`mr-2 text-xs font-semibold ${isDark ? 'text-[#aaa59d]' : 'text-[#625d57]'}`}>Quick filters</span>
        {quickFilters.map((filter) => (
          <button
            key={filter.id}
            type="button"
            aria-pressed={activeFilter === filter.id}
            onClick={() => handleFilterChange(filter.id)}
            title={filter.title}
            className={`min-h-8 rounded-full border px-3.5 py-1 text-xs font-semibold transition-colors ${activeFilter === filter.id
              ? isDark ? 'border-[#c86544]/40 bg-[#c86544]/20 text-[#f3b69f]' : 'border-[#e5c0b2] bg-[#f7ede8] text-[#92452b]'
              : isDark ? 'border-white/10 bg-[#201f1d] text-[#aaa59d] hover:bg-white/10 hover:text-white' : 'border-black/10 bg-[#fffdfa] text-[#625d57] hover:bg-white hover:text-[#171716]'
            }`}
          >{filter.label}</button>
        ))}
      </div>

      {/* Horizontal Category pills row */}
      <div role="group" aria-label="Service categories" className="mt-2 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            aria-pressed={selectedCategory === cat}
            onClick={() => handleCategoryChange(cat)}
            className={`min-h-8 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${selectedCategory === cat
                ? isDark
                  ? 'border-[#c86544]/40 bg-[#c86544]/20 text-[#f3b69f]'
                  : 'border-[#e5c0b2] bg-[#f7ede8] text-[#92452b]'
                : isDark
                  ? 'border-white/10 bg-[#201f1d] text-[#aaa59d] hover:bg-white/10 hover:text-white'
                  : 'border-black/10 bg-[#fffdfa] text-[#625d57] hover:bg-white hover:text-[#171716]'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div id="service-results" className="scroll-mt-24">
      <ServiceMarketplaceGrid
        model={{
          router,
          isDark,
          isLoading,
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
          prefetchProviderSummary
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
