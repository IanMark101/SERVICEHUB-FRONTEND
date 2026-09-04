import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { ServiceListing } from '../../types';
import { Search, Star, ShieldCheck, Clock, CheckCircle2, MapPin, Smartphone, RefreshCw, Sparkles, Bell } from 'lucide-react';
import RequestServiceModal from './RequestServiceModal';
import { usePagination } from '../../hooks/usePagination';
import PaginationBar from '../ui/PaginationBar';
import { getServicePaymentMethods, getPrimaryBookingCTA, getFormattedPrice, getServiceTypeLabel } from '../../lib/paymentUtils';
import LimitedModeDashboardCard from '../landing/LimitedModeDashboardCard';
import TransactionBlockedModal from '../ui/TransactionBlockedModal';
import { useTransactionPermission } from '../../hooks/useTransactionPermission';
import { joinServiceRoom } from '../../lib/socket';
import { apiJoinWaitlist } from '../../api/bookings.api';
import { useToast } from '../ui/Toast';
import EmptyState from '../ui/EmptyState';
import { ServiceListingSkeleton } from '../ui/SkeletonCard';
import SuggestCategoryModal from './SuggestCategoryModal';
import { apiGetProviderSummary } from '../../api/ai.api';
import ServiceMarketplaceGrid from './seek-services/ServiceMarketplaceGrid';

export default function SeekServices() {
  const router = useRouter();
  const { services, users, isDark, user, dbCategories, jobEngagements } = useApp();
  const { canTransact } = useTransactionPermission();
  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
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

  const categories = [
    'All Categories',
    ...dbCategories.map(c => c.name)
  ];


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
    } catch (err: any) {
      if (err?.response?.status === 409 || err?.response?.data?.error?.includes('already')) {
        toastInfo('You are already on the waitlist for this service.');
      } else {
        toastError(err?.response?.data?.error || 'Failed to join waitlist. Please try again.');
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
    const matchesSearch = 
      service.title.toLowerCase().includes(query) ||
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
      const queueLimit = (service as any).queueLimit ?? 5;
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
    <div className={`space-y-8 select-none transition-colors duration-200 ${isDark ? 'text-[#f2efe9]' : 'text-slate-800'}`}>

      <LimitedModeDashboardCard role="seeker" />

      {/* Search Banner */}
      <div className={`rounded-[24px] p-8 border shadow-sm relative overflow-hidden text-center flex flex-col items-center justify-center transition-colors duration-200 ${isDark ? 'bg-[#22211e] border-neutral-800/80' : 'bg-white border-slate-200'
        }`}>
        <div className="max-w-2xl relative z-10 space-y-3 w-full">
          <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
            Find local experts for any task.
          </h2>
          <p className={`text-xs sm:text-sm max-w-md mx-auto leading-relaxed ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>
            Search our trusted community marketplace for specialized services.
          </p>

          {/* Inputs Row inside Banner */}
          <div className={`flex items-center rounded-2xl p-1.5 shadow-inner mt-6 max-w-xl mx-auto w-full border ${isDark ? 'bg-[#1c1b18] border-neutral-800/85' : 'bg-slate-50 border-slate-200'
            }`}>
            <span className={`pl-3 ${isDark ? 'text-[#b4b0a9]' : 'text-slate-450'}`}>
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="What service are you looking for?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full bg-transparent border-none py-2 px-3 text-xs focus:outline-none ${isDark ? 'text-[#f2efe9] placeholder-neutral-500' : 'text-slate-800 placeholder-slate-400'
                }`}
            />
            <button
              type="button"
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95 flex-shrink-0"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Quick Filters Row */}
      <div className={`flex flex-wrap items-center gap-2 border-b pb-4 ${isDark ? 'border-neutral-800/80' : 'border-slate-200'}`}>
        <span className={`text-[10px] font-bold uppercase tracking-wider mr-2 ${isDark ? 'text-[#b4b0a9]' : 'text-slate-455'}`}>Quick Filters:</span>
        <button
          onClick={() => handleFilterChange('all')}
          className={`px-3 py-1 rounded-xl text-[10px] font-bold border transition-all ${activeFilter === 'all'
              ? isDark
                ? 'bg-orange-950/20 text-orange-400 border-orange-900/30'
                : 'bg-orange-50 text-orange-600 border border-orange-200'
              : isDark
                ? 'bg-[#22211e] hover:bg-[#2c2b27] border-neutral-850 text-[#b4b0a9]'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-500'
            }`}
        >
          All
        </button>
        <button
          onClick={() => handleFilterChange('available')}
          className={`px-3 py-1 rounded-xl text-[10px] font-bold border transition-all ${activeFilter === 'available'
              ? isDark
                ? 'bg-orange-950/20 text-orange-400 border-orange-900/30'
                : 'bg-orange-50 text-orange-600 border border-orange-200'
              : isDark
                ? 'bg-[#22211e] hover:bg-[#2c2b27] border-neutral-850 text-[#b4b0a9]'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-500'
            }`}
          title="Filter by listings that are not paused"
        >
          Available Now
        </button>
        <button
          onClick={() => handleFilterChange('rated')}
          className={`px-3 py-1 rounded-xl text-[10px] font-bold border transition-all ${activeFilter === 'rated'
              ? isDark
                ? 'bg-orange-950/20 text-orange-400 border-orange-900/30'
                : 'bg-orange-50 text-orange-600 border border-orange-200'
              : isDark
                ? 'bg-[#22211e] hover:bg-[#2c2b27] border-neutral-850 text-[#b4b0a9]'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-500'
            }`}
          title="Filter by rating 4.8 and above"
        >
          Top Rated
        </button>
        <button
          onClick={() => handleFilterChange('low-queue')}
          className={`px-3 py-1 rounded-xl text-[10px] font-bold border transition-all ${activeFilter === 'low-queue'
              ? isDark
                ? 'bg-orange-950/20 text-orange-400 border-orange-900/30'
                : 'bg-orange-50 text-orange-600 border border-orange-200'
              : isDark
                ? 'bg-[#22211e] hover:bg-[#2c2b27] border-neutral-850 text-[#b4b0a9]'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-500'
            }`}
          title="Filter by low workload queue size"
        >
          Low Queue
        </button>
      </div>

      {/* Horizontal Category pills row */}
      <div className="flex flex-wrap gap-2.5 mt-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`px-4 py-2 text-xs font-bold rounded-full border transition-all ${selectedCategory === cat
                ? isDark
                  ? 'bg-[#f2efe9] border-[#f2efe9] text-slate-950'
                  : 'bg-[#1a2238] border-[#1a2238] text-white shadow-sm'
                : isDark
                  ? 'bg-[#22211e] hover:bg-[#2c2b27] border-neutral-850 text-[#b4b0a9]'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

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
