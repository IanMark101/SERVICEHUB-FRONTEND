import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import {
  PencilSimple as Edit3,
  Trash as Trash2,
  Plus,
  Warning as AlertTriangle,
  CheckCircle as CheckCircle2,
  WarningCircle as AlertCircle,
  CircleNotch as Loader2,
  FolderSimple,
  Money,
  DeviceMobile,
  Timer,
  UsersThree,
} from '@phosphor-icons/react';
import { usePagination } from '../../hooks/usePagination';
import PaginationBar from '../ui/PaginationBar';
import ConfirmModal, { ConfirmModalState } from '../ui/ConfirmModal';
import { apiGetMyServices } from '../../api/services.api';
import { mapServiceToListing } from '../../context/mappers';
import type { ServiceListing } from '../../types';
import EditServiceModal, { EditServiceState } from './service-manager/EditServiceModal';
import WorkspaceTabs from '../ui/WorkspaceTabs';
import ContentCaseAction from '../moderation/ContentCaseAction';

type ServiceFilterTab = 'all' | 'active' | 'rejected';

export default function ServiceManager({
  currentProviderId,
  onNavigateToOffer
}: {
  currentProviderId?: string;
  onNavigateToOffer?: () => void;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const targetServiceId = searchParams.get('id');
  const initialStatus = searchParams.get('status');
  const { services, setServices, editServiceListing, toggleServiceListingStatus, deleteServiceListing, isDark, user } = useApp();

  const effectiveProviderId = currentProviderId || user?.id;

  const [togglingServiceId, setTogglingServiceId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<ServiceFilterTab>(() => {
    if (initialStatus === 'rejected') return 'rejected';
    if (initialStatus === 'pending') return 'rejected';
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

  // Sync provider's own services (active, paused, removed, and revision-required) from DB on mount
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

  const handleDeleteServiceClick = (service: ServiceListing) => {
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
    let rejected = 0;

    myServices.forEach(s => {
      const status = s.status || (s.isPaused ? 'INACTIVE' : 'ACTIVE');
      if (status === 'ACTIVE') active++;
      else if (['REJECTED', 'PENDING_REVIEW'].includes(status)) rejected++;
    });

    return {
      all: myServices.length,
      active,
      rejected
    };
  }, [myServices]);

  // Filtered services based on activeTab
  const filteredServices = useMemo(() => {
    if (activeTab === 'active') {
      return myServices.filter(s => (s.status || 'ACTIVE') === 'ACTIVE');
    }
    if (activeTab === 'rejected') {
      return myServices.filter(s => ['REJECTED', 'PENDING_REVIEW'].includes(s.status || ''));
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
        const timer = window.setTimeout(() => {
          if (['REJECTED', 'PENDING_REVIEW'].includes(match.status || '')) setActiveTab('rejected');
          else if (match.status === 'ACTIVE') setActiveTab('active');
        }, 0);
        return () => window.clearTimeout(timer);
      }
    }
  }, [targetServiceId, services]);

  const handleOpenEdit = (s: ServiceListing) => {
    const needsExactPrice = s.priceType === 'STARTS_AT' || s.priceType === 'CUSTOM';
    setEditingService({
      serviceId: s.id,
      title: s.title,
      price: needsExactPrice ? 0 : s.price,
      priceType: needsExactPrice || s.priceType === 'PER_SESSION' ? 'FIXED' : s.priceType || 'FIXED',
      serviceType: 'ONE_TIME',
      estimatedDurationMins: Number(s.estimatedDurationMins || 60),
      description: s.description,
      paymentMethods: { cash: !!s.paymentMethods?.cash, gcash: !!s.paymentMethods?.gcash }
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    const saved = await editServiceListing(
      editingService.serviceId,
      editingService.title,
      editingService.price,
      editingService.description,
      {
        priceType: editingService.priceType,
        serviceType: editingService.serviceType,
        estimatedDurationMins: Math.max(15, Math.min(480, Number(editingService.estimatedDurationMins) || 60)),
        paymentMethods: editingService.paymentMethods,
      }
    );
    if (saved) setEditingService(null);
  };

  return (
    <div className={`workspace-page space-y-6 select-none transition-colors duration-200 ${isDark ? 'text-white' : 'text-ink'}`}>

      {/* Header Action Strip & Status Filter Tabs */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 ${isDark ? 'border-neutral-800/80' : 'border-slate-200'}`}>
        
        <WorkspaceTabs
          activeValue={activeTab}
          onChange={setActiveTab}
          ariaLabel="Filter service listings"
          tone="provider"
          items={[
            { value: 'all', label: 'All Listings', count: counts.all, icon: <FolderSimple size={15} /> },
            { value: 'active', label: 'Active', count: counts.active, icon: <CheckCircle2 size={15} /> },
            { value: 'rejected', label: 'Needs Revision', count: counts.rejected, icon: <AlertTriangle size={15} /> },
          ]}
        />

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
        <div className={`rounded-[24px] p-12 border text-center text-sm font-medium transition-colors duration-200 ${isDark ? 'bg-[#22211e] border-neutral-800/80 text-ink-muted' : 'bg-white border-slate-200 text-ink-muted'
          }`}>
          {activeTab === 'rejected'
            ? 'No services need changes.'

            : activeTab === 'active'
            ? 'No active listings found.'
            : 'You don\'t have any service listings yet. Click "New Listing" to offer a service.'}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-4">
            {paginatedServices.map((service) => {
              const isPaused = service.isPaused;
              const isRejected = ['REJECTED', 'PENDING_REVIEW'].includes(service.status || '');
              const isRemoved = service.status === 'SUSPENDED';
              const isHighlighted = targetServiceId === service.id;
              const needsExactPrice = service.priceType === 'STARTS_AT' || service.priceType === 'CUSTOM' || Number(service.price) < 50;

              return (
                <div
                  key={service.id}
                  className={`workspace-card rounded-2xl border p-5 sm:p-6 flex flex-col space-y-5 ${
                    isHighlighted ? 'ring-2 ring-emerald-500' : ''
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
                      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 border ${
                        isDark ? 'bg-emerald-950/30 border-emerald-900/40 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      }`}>
                        <FolderSimple className="h-3.5 w-3.5" weight="duotone" /> {service.category}
                      </span>

                      {isRejected && (
                        <span className="px-2.5 py-1 rounded-xl text-xs font-extrabold uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/30 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Needs changes
                        </span>
                      )}

                      {isRemoved && <span className="inline-flex items-center gap-1 rounded-xl border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-bold text-red-500"><AlertCircle className="size-3.5" /> Removed by Admin</span>}
                    </div>

                    {/* Right: Actions (Edit, Delete, Status Toggle) */}
                    <div className="flex min-w-0 max-w-full flex-wrap items-center gap-2">
                      {!isRemoved && <button
                        onClick={() => handleOpenEdit(service)}
                        className={`px-3.5 py-1.5 border font-semibold text-xs rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
                          isRejected
                            ? 'bg-red-600 text-white hover:bg-red-700 border-red-600 shadow-sm'
                            : isDark
                            ? 'border-neutral-800 hover:bg-[#2c2b27] text-ink-muted hover:text-white'
                            : 'border-slate-200 hover:bg-slate-50 text-ink-muted hover:text-ink'
                        }`}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{isRejected ? 'Revise Listing' : 'Edit'}</span>
                      </button>}

                      <button
                        onClick={() => handleDeleteServiceClick(service)}
                        className={`px-3.5 py-1.5 border font-semibold text-xs rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
                          isDark
                            ? 'border-red-950/45 hover:bg-red-950/20 text-red-400'
                            : 'border-red-200 hover:bg-red-50 text-red-500'
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>

                      {/* Toggle Status switch (only for active services) */}
                      {!isRejected && !isRemoved && (() => {
                        const isToggling = togglingServiceId === service.id;
                        return (
                          <div className={`flex items-center space-x-2 border-l pl-3 ml-1 ${isDark ? 'border-neutral-850' : 'border-slate-200'}`}>
                            <button
                              type="button"
                              disabled={isToggling || needsExactPrice}
                              onClick={() => handleToggleStatus(service.id)}
                              className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-all duration-200 ease-in-out focus:outline-none ${
                                isToggling ? 'opacity-80 cursor-wait' : 'cursor-pointer'
                              } ${
                                !needsExactPrice && !isPaused ? 'bg-emerald-500' : isDark ? 'bg-neutral-800' : 'bg-slate-300'
                              }`}
                            >
                              <span
                                className={`pointer-events-none flex items-center justify-center h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                  !needsExactPrice && !isPaused ? 'translate-x-4' : 'translate-x-0'
                                }`}
                              >
                                {isToggling && (
                                  <Loader2 className="w-2.5 h-2.5 text-emerald-600 animate-spin" />
                                )}
                              </span>
                            </button>
                            <span className={`text-xs font-bold transition-colors ${
                              isToggling
                                ? 'text-emerald-700 dark:text-emerald-400'
                                : !isPaused
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : isDark
                                ? 'text-ink-muted'
                                : 'text-ink-subtle'
                            }`}>
                              {isToggling ? 'Updating...' : needsExactPrice ? 'Price needed' : !isPaused ? 'Active' : 'Paused'}
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {needsExactPrice && (
                    <div className={`rounded-xl border px-4 py-3 text-xs ${isDark ? 'border-emerald-900/50 bg-emerald-950/20 text-emerald-200' : 'border-emerald-200 bg-emerald-50 text-emerald-900'}`}>
                      Enter a final price in Edit Listing. This older listing is hidden from seekers until it has an exact bookable price.
                    </div>
                  )}

                  {/* Tier 2: Title & Description */}
                  <div className="space-y-1.5">
                    <h3 className={`uppercase break-words [overflow-wrap:anywhere] font-bold text-base sm:text-lg leading-snug ${isDark ? 'text-white' : 'text-ink'}`}>
                      {service.title}
                    </h3>
                    {service.description && (
                      <p className={`text-xs sm:text-sm leading-relaxed line-clamp-2 ${isDark ? 'text-ink-muted' : 'text-ink-muted'}`}>
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
                      <span className="text-[11px] font-semibold text-ink-muted">Rate</span>
                      <span className={`font-extrabold text-sm sm:text-base ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        {needsExactPrice ? 'Price needed' : `₱${service.price}`}
                        <span className="text-xs font-semibold ml-0.5 text-ink-subtle">
                          {needsExactPrice ? '' : service.priceType === 'PER_HOUR' ? ' / hr' : service.priceType === 'PER_DAY' ? ' / day' : service.priceType === 'PER_PROJECT' ? ' / project' : ' fixed price'}
                        </span>
                      </span>
                    </div>

                    {/* Metadata Pills */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border inline-flex items-center gap-1 ${
                        isDark ? 'bg-[#1c1b18] border-neutral-800 text-neutral-300' : 'bg-slate-50 border-slate-200 text-ink-muted'
                      }`}>
                        <Timer className="h-3.5 w-3.5" weight="duotone" /> {service.estimatedDurationMins ? `${service.estimatedDurationMins}m Duration` : '60m Duration'}
                      </span>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border inline-flex items-center gap-1 ${
                        isDark ? 'bg-[#1c1b18] border-neutral-800 text-neutral-300' : 'bg-slate-50 border-slate-200 text-ink-muted'
                      }`}>
                        <UsersThree className="h-3.5 w-3.5" weight="duotone" /> {service.providerWaitingCount ?? service.queueSize ?? 0} paid waiting across your work
                      </span>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border inline-flex items-center gap-1 ${
                        isDark ? 'bg-[#1c1b18] border-neutral-800 text-neutral-300' : 'bg-slate-50 border-slate-200 text-ink-muted'
                      }`}>
                        <Money className="h-3.5 w-3.5" weight="duotone" /> Cash
                      </span>
                      {service.paymentMethods?.gcash && (
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border inline-flex items-center gap-1 ${
                          isDark ? 'bg-emerald-950/30 border-emerald-900/40 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600'
                        }`}>
                          <DeviceMobile className="h-3.5 w-3.5" weight="duotone" /> GCash
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Tier 4: Admin Rejection Callout Box */}
                  {isRejected && (
                    <div className={`p-4 rounded-2xl border ${isDark ? 'bg-red-950/20 border-red-900/40 text-red-300' : 'bg-red-50 border-red-200 text-red-800'} space-y-2.5 animate-in fade-in`}>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <span className="font-extrabold text-xs uppercase tracking-wider">What to fix:</span>
                      </div>
                      <p className={`text-xs sm:text-sm p-3 rounded-xl border leading-relaxed font-semibold italic ${
                        isDark ? 'bg-[#1c1b18] border-red-900/30 text-white' : 'bg-white border-red-100 text-ink'
                      }`}>
                        &quot;{service.adminNotes || 'Check your service details, then save to publish.'}&quot;
                      </p>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                        <span className={`text-xs font-medium ${isDark ? 'text-ink-subtle' : 'text-ink-muted'}`}>
                          Customers cannot see this service yet. Open Edit Listing, check the details, and save to publish. No admin approval is needed.
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(service)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer self-start sm:self-auto"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit Listing</span>
                        </button>
                        <ContentCaseAction caseType="APPEAL" contentType="SERVICE_LISTING" resourceId={service.id} isDark={isDark} />
                      </div>
                    </div>
                  )}
                  {isRemoved && <div className={`rounded-2xl border p-4 text-xs leading-5 ${isDark ? 'border-red-900/40 bg-red-950/20 text-red-200' : 'border-red-200 bg-red-50 text-red-900'}`}><strong>This listing was removed from public view.</strong> Existing bookings are still managed in Activity. <ContentCaseAction caseType="APPEAL" contentType="SERVICE_LISTING" resourceId={service.id} isDark={isDark} label="Appeal this removal" /></div>}

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
        hasMobileNumber={Boolean(user?.phone?.trim())}
        onChange={setEditingService}
        onClose={() => setEditingService(null)}
        onSubmit={handleSaveEdit}
        onOpenProfile={() => {
          setEditingService(null);
          router.push('/provider/account-settings#contact-information');
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal state={confirmModal} onClose={() => setConfirmModal(null)} />

    </div>
  );
}
