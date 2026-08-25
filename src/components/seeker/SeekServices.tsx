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

      {/* Provider Services Card Grid */}
      {isLoading ? (
        <ServiceListingSkeleton count={6} />
      ) : filteredServices.length === 0 ? (
        <div className="space-y-4">
          <EmptyState
            icon={Search}
            title="No Services Found"
            description={
              searchQuery || selectedCategory !== 'All Categories' || activeFilter !== 'all'
                ? `No services matched your current filters ("${searchQuery || selectedCategory}"). Try adjusting your search keywords or clearing your category filters.`
                : 'There are currently no active service listings published in Cordova. Check back soon or post a custom service request!'
            }
            actionLabel={searchQuery || selectedCategory !== 'All Categories' || activeFilter !== 'all' ? 'Clear All Filters' : 'Post a Custom Request'}
            onAction={() => {
              if (searchQuery || selectedCategory !== 'All Categories' || activeFilter !== 'all') {
                setSearchQuery('');
                setSelectedCategory('All Categories');
                setActiveFilter('all');
              } else {
                router.push('/seeker/post-request');
              }
            }}
            accentColor="orange"
          />

          {/* Contextual Category Suggestion Prompt */}
          <div
            className={`p-4 rounded-2xl border text-center flex flex-col sm:flex-row items-center justify-between gap-3 transition-colors ${
              isDark
                ? 'bg-[#1c1b18] border-neutral-800 text-neutral-300'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <div className="text-left text-xs">
              <span className="font-extrabold block text-slate-900 dark:text-[#f2efe9]">
                Can't find what you're looking for?
              </span>
              <span className="text-[11px] text-slate-500 dark:text-[#b4b0a9]">
                Suggest a new service category for Cordova, and we will source local providers.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsSuggestModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs transition-all shadow-sm active:scale-95 flex-shrink-0 cursor-pointer"
            >
              + Suggest a Category
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedServices.map((service) => {
              const provider = getProviderDetails(service.providerId);
              const trustScore = service.providerTrustScore ?? provider?.trustScore ?? 100;
              const isVerified = (service as any).providerVerificationStatus === 'APPROVED' || provider?.isVerified || true;
              const { cash, gcash } = getServicePaymentMethods(service);
              const ctaText = getPrimaryBookingCTA(service);
              const isOwned = !!(user && service.providerId === user.id);
              const activeEngagement = jobEngagements.find(je => 
                je.seekerId === user?.id &&
                je.serviceId === service.id &&
                ['pending_provider', 'queued', 'in_progress', 'awaiting_seeker_approval', 'disputed'].includes(je.status)
              );

              return (
                <div
                  key={service.id}
                  className={`rounded-[24px] p-5 border transition-all duration-200 ease-out flex flex-col justify-between h-full hover:-translate-y-1 ${isDark
                      ? 'bg-[#22211e] border-neutral-855 hover:border-orange-500/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)]'
                      : 'bg-white border-slate-200 hover:border-orange-500/50 hover:shadow-xl'
                    }`}
                >
                  <div>
                    {/* Card Header: Profile Info */}
                    <div className="flex items-start justify-between">
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          if (service.providerId) {
                            router.push(`/seeker/user-profile?id=${service.providerId}`);
                          }
                        }}
                        className="flex items-center space-x-3 group/author cursor-pointer select-none rounded-xl p-1 -m-1 transition-all hover:bg-slate-100/70 dark:hover:bg-neutral-800/60"
                        title={`View ${service.providerName}'s profile`}
                      >
                        <div className="relative flex-shrink-0">
                          <img
                            src={service.providerAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(service.providerName || 'Provider')}&background=random`}
                            alt={service.providerName}
                            className="w-10 h-10 rounded-full object-cover border border-slate-100 dark:border-neutral-700 transition-all duration-200 group-hover/author:scale-105 group-hover/author:ring-2 group-hover/author:ring-orange-500/50"
                          />
                        </div>
                        <div>
                          <h4 className={`font-bold text-xs leading-tight transition-colors duration-200 group-hover/author:text-orange-500 ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
                            {service.providerName}
                          </h4>

                          {isVerified && (
                            <span className="inline-flex items-center text-[10px] text-emerald-600 font-semibold mt-0.5">
                              <ShieldCheck className={`w-3.5 h-3.5 mr-0.5 ${isDark ? 'text-emerald-455 fill-emerald-950/20' : 'fill-emerald-50 text-emerald-600'}`} />
                              Verified
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Rating star / Trust badge */}
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          if (service.providerId) {
                            router.push(`/seeker/user-profile?id=${service.providerId}&tab=reviews`);
                          }
                        }}
                        className="text-right flex flex-col items-end cursor-pointer group/rating select-none transition-all"
                        title="View provider reviews and trust history"
                      >
                        {service.reviewCount && service.reviewCount > 0 ? (
                          <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md border text-[11px] font-bold transition-all group-hover/rating:border-amber-400 ${isDark
                              ? 'bg-amber-950/20 text-amber-400 border-amber-900/30'
                              : 'bg-amber-50 border-amber-150/50 text-amber-700'
                            }`}>
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            <span>{service.rating.toFixed(1)}</span>
                            <span className="text-[9px] text-slate-400 font-normal">({service.reviewCount})</span>
                          </span>
                        ) : (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-extrabold uppercase tracking-wider ${isDark
                              ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/40'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}>
                            <span>NEW</span>
                          </span>
                        )}

                        <span className={`text-[10px] font-bold mt-1 block transition-colors ${
                          trustScore >= 85 
                            ? (isDark ? 'text-emerald-400 group-hover/rating:text-emerald-300' : 'text-emerald-600 group-hover/rating:text-emerald-700')
                            : (isDark ? 'text-[#b4b0a9] group-hover/rating:text-[#f2efe9]' : 'text-slate-500 group-hover/rating:text-slate-700')
                        }`}>
                          {trustScore >= 85 ? `★ Top Rated (${trustScore} pts)` : isVerified ? `🛡️ Verified Member` : `🛡️ Good Standing`}
                        </span>
                      </div>
                    </div>

                    {/* Category Tag & Ownership Badge */}
                    <div className="mt-4 flex items-center justify-between">
                      <span className={`inline-block px-2.5 py-1 text-[9px] font-bold rounded-lg border uppercase tracking-wider ${isDark
                          ? 'text-orange-400 bg-orange-950/20 border-orange-900/30'
                          : 'text-orange-600 bg-orange-50 border-orange-100/50'
                        }`}>
                        {service.category}
                      </span>
                      {isOwned && (
                        <span className={`inline-flex items-center px-2.5 py-1 text-[9px] font-bold rounded-lg border uppercase tracking-wider ${isDark
                            ? 'text-orange-400 bg-orange-950/20 border-orange-900/30'
                            : 'text-orange-655 bg-orange-50 border-orange-200'
                          }`}>
                          👤 Owned by You
                        </span>
                      )}
                    </div>

                    {/* Service Listing Details */}
                    <div className="mt-3">
                      <h3 className={`font-extrabold text-sm leading-snug ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
                        {service.title}
                      </h3>
                      <p className={`text-xs mt-2 line-clamp-2 leading-relaxed ${isDark ? 'text-[#b4b0a9]' : 'text-slate-455'}`}>
                        {service.description}
                      </p>
                    </div>
                  </div>

                  {/* Divider Line */}
                  <div className={`border-t my-4 ${isDark ? 'border-neutral-850' : 'border-slate-100'}`} />

                  {/* Availability/Queue & Price block */}
                  <div className="flex items-center justify-between">
                    {/* Left: Status */}
                    <div className="flex flex-col space-y-1">
                      {service.queueSize >= (service.queueLimit || 5) ? (
                        <div className={`flex items-center text-xs font-semibold ${isDark ? 'text-rose-400' : 'text-rose-600'}`}>
                          <Clock className="w-3.5 h-3.5 mr-1 text-rose-500 animate-none" />
                          <span>Queue Full ({service.queueSize}/{service.queueLimit || 5})</span>
                        </div>
                      ) : service.queueSize > 0 ? (
                        <div className={`flex items-center text-xs font-semibold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                          <Clock className="w-3.5 h-3.5 mr-1 text-amber-500 animate-none" />
                          <span>Busy (Queue: {service.queueSize})</span>
                        </div>
                      ) : (
                        <div className={`flex items-center text-xs font-semibold ${isDark ? 'text-emerald-450' : 'text-emerald-600'}`}>
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-500 animate-none" />
                          <span>Available Now</span>
                        </div>
                      )}
                      {/* Service type badge — only shown for SESSION_BASED */}
                      {service.serviceType === 'SESSION_BASED' && (
                        <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-md border w-fit ${
                          isDark
                            ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        }`}>
                          <RefreshCw className="w-2.5 h-2.5" />
                          Session-based
                        </span>
                      )}
                    </div>

                    {/* Right: Price */}
                    <div className="text-right">
                      {service.priceType && service.priceType !== 'FIXED' ? (
                        <>
                          <span className={`text-base font-extrabold ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
                            ₱{service.price}
                          </span>
                          <span className={`text-[10px] font-bold ml-1 ${isDark ? 'text-[#b4b0a9]' : 'text-slate-400'}`}>
                            {service.priceType === 'PER_SESSION' ? '/ session'
                              : service.priceType === 'PER_HOUR' ? '/ hour'
                              : service.priceType === 'PER_DAY' ? '/ day'
                              : service.priceType === 'PER_PROJECT' ? '/ project'
                              : service.priceType === 'STARTS_AT' ? 'starting at'
                              : ''}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className={`text-[10px] font-bold uppercase tracking-wider block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-400'}`}>Starting at</span>
                          <span className={`text-base font-extrabold ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>₱{service.price}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Payment Methods Badges — driven by provider's selection */}
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {cash && (
                      <span className={`inline-flex items-center border text-[10px] font-semibold px-2 py-0.5 rounded-lg space-x-1 ${isDark ? 'bg-[#1c1b18] border-neutral-855 text-[#b4b0a9]' : 'bg-slate-50 border-slate-200 text-slate-500'
                        }`}>
                        <MapPin className={`w-3 h-3 ${isDark ? 'text-[#b4b0a9]' : 'text-slate-450'}`} />
                        <span>On-site Cash</span>
                      </span>
                    )}
                    {gcash && (
                      <span className={`inline-flex items-center border text-[10px] font-semibold px-2 py-0.5 rounded-lg space-x-1 ${isDark ? 'bg-orange-950/20 border-orange-900/30 text-orange-400' : 'bg-orange-50 border-orange-100 text-orange-600'
                        }`}>
                        <Smartphone className={`w-3 h-3 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
                        <span>GCash</span>
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 space-y-2">
                    {isOwned ? (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => router.push(`/provider/service-manager?id=${service.id}`)}
                            className={`flex-1 font-bold text-[11px] py-3 rounded-xl transition-all shadow-sm active:scale-[0.98] flex items-center justify-center space-x-1.5 cursor-pointer ${isDark
                                ? 'bg-orange-950/20 border border-orange-900/30 text-orange-400 hover:bg-orange-955'
                                : 'bg-orange-50 border border-orange-200 text-orange-655 hover:bg-orange-100'
                              }`}
                          >
                            <span>Edit Listing</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => router.push(`/provider/service-manager`)}
                            className={`flex-1 font-bold text-[11px] py-3 rounded-xl transition-all shadow-sm active:scale-[0.98] flex items-center justify-center space-x-1.5 cursor-pointer ${isDark
                                ? 'bg-[#22211e] border border-neutral-800/80 text-[#b4b0a9] hover:bg-[#2c2b27]'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              }`}
                          >
                            <span>Performance</span>
                          </button>
                        </div>
                        <p className={`text-[10px] font-medium text-center ${isDark ? 'text-neutral-500' : 'text-slate-400'}`} title="Self-transaction policy: Marketplace transactions with your own account are not allowed.">
                          You cannot book your own service.
                        </p>
                      </div>
                    ) : activeEngagement ? (
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => router.push(`/seeker/seeker-activity?tab=all&booking=${activeEngagement.id}`)}
                          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center space-x-1.5 cursor-pointer"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>
                            {activeEngagement.status === 'in_progress' ? 'Job In Progress — View Activity' :
                             activeEngagement.status === 'queued' ? 'In Queue — View Activity' :
                             activeEngagement.status === 'pending_provider' ? 'Pending Approval — View Activity' :
                             activeEngagement.status === 'awaiting_seeker_approval' ? 'Approval Needed — View Activity' :
                             'Active Booking — View Activity'}
                          </span>
                        </button>
                        <p className={`text-[10px] font-medium text-center ${isDark ? 'text-orange-400/90' : 'text-orange-600'}`}>
                          You have an active booking for this service.
                        </p>
                      </div>
                    ) : service.queueSize >= (service.queueLimit || 5) ? (
                      /* Queue is Full */
                      cash ? (
                        /* If Cash is supported, allow direct cash booking OR join waitlist for online queue */
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleJoinWaitlist(service)}
                            disabled={joiningWaitlistId === service.id}
                            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] py-3 rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center space-x-1 cursor-pointer disabled:opacity-60"
                          >
                            <Bell className="w-3 h-3" />
                            <span>{joiningWaitlistId === service.id ? 'Joining...' : 'Notify Me'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleBookListing(service, 'On-site Cash')}
                            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold text-[11px] py-3 rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center space-x-1 cursor-pointer"
                          >
                            <MapPin className="w-3 h-3" />
                            <span>Direct Cash</span>
                          </button>
                        </div>
                      ) : (
                        /* Online only and queue is full — waitlist only */
                        <button
                          type="button"
                          onClick={() => handleJoinWaitlist(service)}
                          disabled={joiningWaitlistId === service.id}
                          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-60"
                        >
                          <Bell className="w-3.5 h-3.5" />
                          <span>{joiningWaitlistId === service.id ? 'Joining Waitlist...' : 'Notify Me When Open'}</span>
                        </button>
                      )
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleBookListing(service, cash ? 'On-site Cash' : 'GCash')}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Book Service</span>
                      </button>
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
            totalItems={filteredServices.length}
            variant="seeker"
          />
        </div>
      )}

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
