import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ServiceListing } from '../../types';
import { Search, Star, ShieldCheck, Clock, CheckCircle2, MapPin, Smartphone } from 'lucide-react';
import RequestServiceModal from './RequestServiceModal';
import { usePagination } from '../../hooks/usePagination';
import PaginationBar from '../PaginationBar';

export default function SeekServices() {
  const { services, users, isDark } = useApp();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [selectedListing, setSelectedListing] = useState<ServiceListing | null>(null);

  // Quick Filters state
  const [activeFilter, setActiveFilter] = useState<'all' | 'near' | 'available' | 'rated' | 'low-queue'>('all');

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

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'GCash' | 'On-site Cash'>('On-site Cash');

  const handleBookListing = (listing: ServiceListing, method: 'GCash' | 'On-site Cash' = 'On-site Cash') => {
    setSelectedPaymentMethod(method);
    setSelectedListing(listing);
  };

  const handleCloseModal = () => {
    setSelectedListing(null);
  };

  // Filter listings based on category tabs, search strings, and quick filter options
  const filteredServices = services.filter(service => {
    // 1. Search Query filter
    const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.providerName.toLowerCase().includes(searchQuery.toLowerCase());

    // 2. Category Tab filter
    const targetCategory = categoryMap[selectedCategory];
    const matchesCategory = selectedCategory === 'All Categories' || service.category === targetCategory;

    // 3. Quick Filter conditions
    let matchesQuickFilter = true;
    if (activeFilter === 'available') {
      matchesQuickFilter = !service.isPaused;
    } else if (activeFilter === 'rated') {
      matchesQuickFilter = service.rating >= 4.8;
    } else if (activeFilter === 'low-queue') {
      matchesQuickFilter = service.queueSize <= 1;
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

  return (
    <div className={`space-y-8 select-none transition-colors duration-200 ${isDark ? 'text-[#f2efe9]' : 'text-slate-800'}`}>

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
          onClick={() => setActiveFilter('all')}
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
          onClick={() => setActiveFilter('available')}
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
          onClick={() => setActiveFilter('rated')}
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
          onClick={() => setActiveFilter('low-queue')}
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
            onClick={() => setSelectedCategory(cat)}
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
      {filteredServices.length === 0 ? (
        <div className={`rounded-[24px] p-12 border text-center text-sm font-medium transition-colors duration-200 ${isDark ? 'bg-[#22211e] border-neutral-800/80 text-[#b4b0a9]' : 'bg-white border-slate-200 text-slate-500'
          }`}>
          No service listings found matching the active criteria.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedServices.map((service) => {
              const provider = getProviderDetails(service.providerId);
              const trustScore = provider?.email === 'johnfrans@gmail.com' ? '96' : '99';
              const isVerified = provider?.isVerified ?? false;
              const supportsGCash = service.price >= 1000;

              return (
                <div
                  key={service.id}
                  className={`rounded-[24px] p-5 border transition-all duration-200 flex flex-col justify-between h-full ${isDark
                      ? 'bg-[#22211e] border-neutral-855 hover:border-orange-500/40 hover:shadow-lg'
                      : 'bg-white border-slate-200 hover:border-orange-500/40 hover:shadow-md'
                    }`}
                >
                  <div>
                    {/* Card Header: Profile Info */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={service.providerAvatar}
                          alt={service.providerName}
                          className="w-10 h-10 rounded-full object-cover border border-slate-100"
                        />
                        <div>
                          <h4 className={`font-bold text-xs leading-tight ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
                            {service.providerName}
                          </h4>

                          {isVerified && (
                            <span className="inline-flex items-center text-[10px] text-emerald-600 font-semibold mt-0.5">
                              <ShieldCheck className={`w-3.5 h-3.5 mr-0.5 ${isDark ? 'text-emerald-450 fill-emerald-950/20' : 'fill-emerald-50 text-emerald-600'}`} />
                              Verified
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Rating star / Trust badge */}
                      <div className="text-right flex flex-col items-end">
                        <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md border text-[11px] font-bold ${isDark
                            ? 'bg-amber-950/20 text-amber-400 border-amber-900/30'
                            : 'bg-amber-50 border-amber-150/50 text-amber-700'
                          }`}>
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          <span>{service.rating}</span>
                        </span>
                        <span className={`text-[10px] font-bold mt-1 block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-450'}`}>
                          {trustScore}% Trust
                        </span>
                      </div>
                    </div>

                    {/* Category Tag */}
                    <div className="mt-4">
                      <span className={`inline-block px-2.5 py-1 text-[9px] font-bold rounded-lg border uppercase tracking-wider ${isDark
                          ? 'text-orange-400 bg-orange-950/20 border-orange-900/30'
                          : 'text-orange-600 bg-orange-50 border-orange-100/50'
                        }`}>
                        {service.category}
                      </span>
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
                      {service.queueSize > 0 ? (
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
                    </div>

                    {/* Right: Price */}
                    <div className="text-right">
                      <span className={`text-[10px] font-bold uppercase tracking-wider block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-400'}`}>Starting at</span>
                      <span className={`text-base font-extrabold ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>₱{service.price}</span>
                    </div>
                  </div>

                  {/* Payment Methods Badges */}
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    <span className={`inline-flex items-center border text-[10px] font-semibold px-2 py-0.5 rounded-lg space-x-1 ${isDark ? 'bg-[#1c1b18] border-neutral-855 text-[#b4b0a9]' : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}>
                      <MapPin className={`w-3 h-3 ${isDark ? 'text-[#b4b0a9]' : 'text-slate-450'}`} />
                      <span>On-site Cash</span>
                    </span>
                    {supportsGCash && (
                      <span className={`inline-flex items-center border text-[10px] font-semibold px-2 py-0.5 rounded-lg space-x-1 ${isDark ? 'bg-orange-950/20 border-orange-900/30 text-orange-400' : 'bg-orange-50 border-orange-100 text-orange-600'
                        }`}>
                        <Smartphone className={`w-3 h-3 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
                        <span>GCash</span>
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 space-y-2">
                    <button
                      type="button"
                      onClick={() => handleBookListing(service, 'On-site Cash')}
                      className={`w-full font-bold text-xs py-3 rounded-xl transition-all shadow-sm active:scale-[0.98] flex items-center justify-center space-x-1.5 cursor-pointer ${isDark
                          ? 'bg-[#f2efe9] hover:bg-white text-slate-950'
                          : 'bg-[#1a2238] hover:bg-[#111726] text-white'
                        }`}
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Request On-site</span>
                    </button>

                    {supportsGCash && (
                      <button
                        type="button"
                        onClick={() => handleBookListing(service, 'GCash')}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-sm active:scale-[0.98] flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>Request via GCash</span>
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

    </div>
  );
}
