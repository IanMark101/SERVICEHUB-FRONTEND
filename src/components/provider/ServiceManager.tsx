import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { Wrench, Edit3, Trash2, Plus, AlertTriangle, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { usePagination } from '../../hooks/usePagination';
import PaginationBar from '../ui/PaginationBar';
import ConfirmModal, { ConfirmModalState } from '../ui/ConfirmModal';
import { apiGetMyServices } from '../../api/services.api';
import { mapServiceToListing } from '../../context/mappers';
import type { ServiceListing } from '../../types';
import EditServiceModal, { EditServiceState } from './service-manager/EditServiceModal';

type ServiceFilterTab = 'all' | 'active' | 'pending' | 'rejected';

export default function ServiceManager({
  currentProviderId,
  onNavigateToOffer
}: {
  currentProviderId?: string;
  onNavigateToOffer?: () => void;
}) {
  const searchParams = useSearchParams();
  const targetServiceId = searchParams.get('id');
  const initialStatus = searchParams.get('status');
  const { services, setServices, editServiceListing, toggleServiceListingStatus, deleteServiceListing, isDark, user } = useApp();

  const effectiveProviderId = currentProviderId || user?.id;

  const [togglingServiceId, setTogglingServiceId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<ServiceFilterTab>(() => {
    if (initialStatus === 'rejected') return 'rejected';
    if (initialStatus === 'pending') return 'pending';
    return 'all';
  });

  const handleToggleStatus = async (serviceId: string) => {
    if (togglingServiceId) return;
    setTogglingServiceId(serviceId);
    try {
      await toggleServiceListingStatus(serviceId);
    } finally {
      setTogglingServiceId(null);
    }
  };

  // Sync provider's own services (active, pending, rejected) from DB on mount
  useEffect(() => {
    apiGetMyServices()
      .then(res => {
        if (res.success && Array.isArray(res.data)) {
          const myMapped: ServiceListing[] = res.data.map(mapServiceToListing);
          setServices((prev: ServiceListing[]) => {
            const map = new Map<string, ServiceListing>();
            prev.forEach((s: ServiceListing) => map.set(s.id, s));
            myMapped.forEach((s: ServiceListing) => map.set(s.id, s));
            return Array.from(map.values());
          });
        }
      })
      .catch(() => {});
  }, [setServices]);

  const [confirmModal, setConfirmModal] = useState<ConfirmModalState | null>(null);

  const handleDeleteServiceClick = (service: any) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Service Listing',
      message: `Are you sure you want to delete "${service.title}"? This will remove your service listing from the marketplace.`,
      confirmText: 'Yes, Delete Listing',
      cancelText: 'Cancel',
      variant: 'danger',
      onConfirm: async () => {
        setConfirmModal(prev => prev ? { ...prev, isLoading: true } : null);
        try {
          await deleteServiceListing(service.id);
        } finally {
          setConfirmModal(null);
        }
      }
    });
  };

  // Find current provider's services
  const myServices = useMemo(() => {
    if (!effectiveProviderId) return [];
    return services.filter(s => s.providerId === effectiveProviderId);
  }, [services, effectiveProviderId]);

  // Counts for each tab
  const counts = useMemo(() => {
    let active = 0;
    let pending = 0;
    let rejected = 0;

    myServices.forEach(s => {
      const status = s.status || (s.isPaused ? 'INACTIVE' : 'ACTIVE');
      if (status === 'ACTIVE') active++;
      else if (status === 'PENDING_REVIEW') pending++;
      else if (status === 'REJECTED') rejected++;
    });

    return {
      all: myServices.length,
      active,
      pending,
      rejected
    };
  }, [myServices]);

  // Filtered services based on activeTab
  const filteredServices = useMemo(() => {
    if (activeTab === 'active') {
      return myServices.filter(s => (s.status || 'ACTIVE') === 'ACTIVE');
    }
    if (activeTab === 'pending') {
      return myServices.filter(s => s.status === 'PENDING_REVIEW');
    }
    if (activeTab === 'rejected') {
      return myServices.filter(s => s.status === 'REJECTED');
    }
    return myServices;
  }, [myServices, activeTab]);

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

  const [editingService, setEditingService] = useState<EditServiceState | null>(null);

  // Switch tab when redirected with query param, without auto-opening modal
  useEffect(() => {
    if (targetServiceId && services.length > 0) {
      const match = services.find(s => s.id === targetServiceId);
      if (match) {
        if (match.status === 'REJECTED') setActiveTab('rejected');
        else if (match.status === 'PENDING_REVIEW') setActiveTab('pending');
        else if (match.status === 'ACTIVE') setActiveTab('active');
      }
    }
  }, [targetServiceId, services]);

  const handleOpenEdit = (s: any) => {
    setEditingService({
      serviceId: s.id,
      title: s.title,
      price: s.price,
      priceType: s.priceType || 'FIXED',
      serviceType: s.serviceType || 'ONE_TIME',
      estimatedDurationMins: Number(s.estimatedDurationMins || 60),
      description: s.description
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    editServiceListing(
      editingService.serviceId,
      editingService.title,
      editingService.price,
      editingService.description,
      {
        priceType: editingService.priceType,
        serviceType: editingService.serviceType,
        estimatedDurationMins: Math.max(15, Math.min(480, Number(editingService.estimatedDurationMins) || 60)),
      }
    );
    setEditingService(null);
  };

  return (
    <div className={`space-y-6 select-none transition-colors duration-200 ${isDark ? 'text-[#f2efe9]' : 'text-slate-800'}`}>

      {/* Header Action Strip & Status Filter Tabs */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 ${isDark ? 'border-neutral-800/80' : 'border-slate-200'}`}>
        
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center space-x-1.5 ${
              activeTab === 'all'
                ? (isDark ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/50' : 'bg-emerald-50 text-emerald-700 border border-emerald-200')
                : (isDark ? 'bg-[#1c1b18] text-neutral-400 hover:text-white border border-neutral-850' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200')
            }`}
          >
            <span>All Listings</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isDark ? 'bg-neutral-800' : 'bg-slate-200'}`}>
              {counts.all}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('active')}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center space-x-1.5 ${
              activeTab === 'active'
                ? (isDark ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/50' : 'bg-emerald-50 text-emerald-700 border border-emerald-200')
                : (isDark ? 'bg-[#1c1b18] text-neutral-400 hover:text-white border border-neutral-850' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200')
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Active</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isDark ? 'bg-neutral-800' : 'bg-slate-200'}`}>
              {counts.active}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center space-x-1.5 ${
              activeTab === 'pending'
                ? (isDark ? 'bg-amber-950/40 text-amber-400 border border-amber-900/50' : 'bg-amber-50 text-amber-700 border border-amber-200')
                : (isDark ? 'bg-[#1c1b18] text-neutral-400 hover:text-white border border-neutral-850' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200')
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Under Review</span>
            {counts.pending > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isDark ? 'bg-amber-950/60 text-amber-300' : 'bg-amber-100 text-amber-800'}`}>
                {counts.pending}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rejected')}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center space-x-1.5 ${
              activeTab === 'rejected'
                ? (isDark ? 'bg-red-950/40 text-red-400 border border-red-900/50' : 'bg-red-50 text-red-700 border border-red-200')
                : (isDark ? 'bg-[#1c1b18] text-neutral-400 hover:text-white border border-neutral-850' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200')
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
            <span>Needs Revision</span>
            {counts.rejected > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-red-600 text-white font-bold animate-pulse">
                {counts.rejected}
              </span>
            )}
          </button>
        </div>

        {/* New Listing CTA */}
        <button
          onClick={onNavigateToOffer}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-md active:scale-95 flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Listing</span>
        </button>
      </div>

      {/* Services List */}
      {filteredServices.length === 0 ? (
        <div className={`rounded-[24px] p-12 border text-center text-sm font-medium transition-colors duration-200 ${isDark ? 'bg-[#22211e] border-neutral-800/80 text-[#b4b0a9]' : 'bg-white border-slate-200 text-slate-500'
          }`}>
          {activeTab === 'rejected'
            ? 'No listings requiring revision.'
            : activeTab === 'pending'
            ? 'No listings currently under review.'
            : activeTab === 'active'
            ? 'No active listings found.'
            : 'You don\'t have any service listings yet. Click "New Listing" to offer a service.'}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-4">
            {paginatedServices.map((service) => {
              const isPaused = service.isPaused;
              const isRejected = service.status === 'REJECTED';
              const isPending = service.status === 'PENDING_REVIEW';
              const isHighlighted = targetServiceId === service.id;

              return (
                <div
                  key={service.id}
                  className={`rounded-[26px] p-6 border transition-all duration-200 flex flex-col space-y-4 ${
                    isHighlighted ? 'ring-2 ring-emerald-500 shadow-lg' : 'shadow-sm hover:shadow-md'
                  } ${
                    isDark
                      ? isRejected
                        ? 'bg-[#22211e] border-red-900/40'
                        : 'bg-[#22211e] border-neutral-800/80 hover:border-neutral-700'
                      : isRejected
                      ? 'bg-red-50/25 border-red-200'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Tier 1: Header Bar (Badges on Left, Action Controls on Right) */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    {/* Left: Category & Type Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 border ${
                        isDark ? 'bg-emerald-950/30 border-emerald-900/40 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      }`}>
                        📁 {service.category}
                      </span>

                      {(service as any).serviceType === 'SESSION_BASED' && (
                        <span className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 border ${
                          isDark ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-400' : 'bg-emerald-50/80 border-emerald-200 text-emerald-700'
                        }`}>
                          ↺ Session-based
                        </span>
                      )}

                      {isRejected && (
                        <span className="px-2.5 py-1 rounded-xl text-xs font-extrabold uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/30 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Revision Required
                        </span>
                      )}

                      {isPending && (
                        <span className="px-2.5 py-1 rounded-xl text-xs font-extrabold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/30 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Under Review
                        </span>
                      )}
                    </div>

                    {/* Right: Actions (Edit, Delete, Status Toggle) */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleOpenEdit(service)}
                        className={`px-3.5 py-1.5 border font-bold text-xs rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer ${
                          isRejected
                            ? 'bg-red-600 text-white hover:bg-red-700 border-red-600 shadow-sm'
                            : isDark
                            ? 'border-neutral-800 hover:bg-[#2c2b27] text-[#b4b0a9] hover:text-[#f2efe9]'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{isRejected ? 'Revise Listing' : 'Edit'}</span>
                      </button>

                      <button
                        onClick={() => handleDeleteServiceClick(service)}
                        className={`px-3.5 py-1.5 border font-bold text-xs rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer ${
                          isDark
                            ? 'border-red-950/45 hover:bg-red-950/20 text-red-400'
                            : 'border-red-200 hover:bg-red-50 text-red-500'
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>

                      {/* Toggle Status switch (only for active services) */}
                      {!isRejected && !isPending && (() => {
                        const isToggling = togglingServiceId === service.id;
                        return (
                          <div className={`flex items-center space-x-2 border-l pl-3 ml-1 ${isDark ? 'border-neutral-850' : 'border-slate-200'}`}>
                            <button
                              type="button"
                              disabled={isToggling}
                              onClick={() => handleToggleStatus(service.id)}
                              className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-all duration-200 ease-in-out focus:outline-none ${
                                isToggling ? 'opacity-80 cursor-wait' : 'cursor-pointer'
                              } ${
                                !isPaused ? 'bg-emerald-500' : isDark ? 'bg-neutral-800' : 'bg-slate-300'
                              }`}
                            >
                              <span
                                className={`pointer-events-none flex items-center justify-center h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                  !isPaused ? 'translate-x-4' : 'translate-x-0'
                                }`}
                              >
                                {isToggling && (
                                  <Loader2 className="w-2.5 h-2.5 text-emerald-600 animate-spin" />
                                )}
                              </span>
                            </button>
                            <span className={`text-xs font-bold transition-colors ${
                              isToggling
                                ? 'text-amber-500 dark:text-amber-400'
                                : !isPaused
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : isDark
                                ? 'text-neutral-500'
                                : 'text-slate-400'
                            }`}>
                              {isToggling ? 'Updating...' : !isPaused ? 'Active' : 'Paused'}
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Tier 2: Title & Description */}
                  <div className="space-y-1.5">
                    <h3 className={`font-extrabold text-base sm:text-lg leading-snug ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
                      {service.title}
                    </h3>
                    {service.description && (
                      <p className={`text-xs sm:text-sm leading-relaxed line-clamp-2 ${isDark ? 'text-[#b4b0a9]' : 'text-slate-600'}`}>
                        {service.description}
                      </p>
                    )}
                  </div>

                  {/* Tier 3: Bottom Metrics & Feature Badges */}
                  <div className={`pt-3.5 border-t flex flex-wrap items-center justify-between gap-3 text-xs ${
                    isDark ? 'border-neutral-850/80' : 'border-slate-100'
                  }`}>
                    {/* Price & Unit */}
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Rate:</span>
                      <span className={`font-extrabold text-sm sm:text-base ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        ₱{service.price}
                        <span className="text-xs font-semibold ml-0.5 text-slate-400">
                          {(service as any).priceType === 'PER_SESSION' ? ' / session' : (service as any).priceType === 'PER_HOUR' ? ' / hr' : (service as any).priceType === 'PER_DAY' ? ' / day' : (service as any).priceType === 'PER_PROJECT' ? ' / project' : ' base price'}
                        </span>
                      </span>
                    </div>

                    {/* Metadata Pills */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                        isDark ? 'bg-[#1c1b18] border-neutral-800 text-neutral-300' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}>
                        ⏱️ {service.estimatedDurationMins ? `${service.estimatedDurationMins}m Duration` : '60m Duration'}
                      </span>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                        isDark ? 'bg-[#1c1b18] border-neutral-800 text-neutral-300' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}>
                        👥 {service.queueSize || 0} in Queue
                      </span>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                        isDark ? 'bg-[#1c1b18] border-neutral-800 text-neutral-300' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}>
                        💵 Cash
                      </span>
                      {(service as any).paymentMethods?.gcash && (
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                          isDark ? 'bg-emerald-950/30 border-emerald-900/40 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600'
                        }`}>
                          💳 GCash
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Tier 4: Admin Rejection Callout Box */}
                  {isRejected && (
                    <div className={`p-4 rounded-2xl border ${isDark ? 'bg-red-950/20 border-red-900/40 text-red-300' : 'bg-red-50 border-red-200 text-red-800'} space-y-2.5 animate-in fade-in`}>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <span className="font-extrabold text-xs uppercase tracking-wider">Admin Review Feedback:</span>
                      </div>
                      <p className={`text-xs sm:text-sm p-3 rounded-xl border leading-relaxed font-semibold italic ${
                        isDark ? 'bg-[#1c1b18] border-red-900/30 text-[#f2efe9]' : 'bg-white border-red-100 text-slate-800'
                      }`}>
                        "{service.adminNotes || 'Please review your service title, category, or pricing and resubmit for approval.'}"
                      </p>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                        <span className={`text-xs font-medium ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                          This listing is hidden from seekers until revised and re-approved by admin.
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(service)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer self-start sm:self-auto"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit & Resubmit Listing</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Tier 4: Pending Review Callout Box */}
                  {isPending && (
                    <div className={`p-3.5 rounded-2xl border flex items-center space-x-2.5 text-xs ${
                      isDark ? 'bg-amber-955/15 border-amber-900/30 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-800'
                    }`}>
                      <Clock className="w-4 h-4 flex-shrink-0 text-amber-500" />
                      <span className="font-medium">
                        <strong>Pending Moderation:</strong> This service listing is currently under review by our admin team. It will appear on the public marketplace once approved.
                      </span>
                    </div>
                  )}
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
            variant="provider"
          />
        </div>
      )}

      <EditServiceModal
        value={editingService}
        isDark={isDark}
        onChange={setEditingService}
        onClose={() => setEditingService(null)}
        onSubmit={handleSaveEdit}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal state={confirmModal} onClose={() => setConfirmModal(null)} />

    </div>
  );
}
