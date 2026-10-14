import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import {
  Plus,
  Warning as AlertTriangle,
  CheckCircle as CheckCircle2,
  FolderSimple,
} from '@phosphor-icons/react';
import { usePagination } from '../../hooks/usePagination';
import PaginationBar from '../ui/PaginationBar';
import ConfirmModal, { ConfirmModalState } from '../ui/ConfirmModal';
import { apiGetMyServices } from '../../api/services.api';
import { mapServiceToListing } from '../../context/mappers';
import type { ServiceListing } from '../../types';
import EditServiceModal, { EditServiceState } from './service-manager/EditServiceModal';
import ManagedServiceCard from './ManagedServiceCard';
import WorkspaceTabs from '../ui/WorkspaceTabs';
import { useToast } from '../ui/Toast';

type ServiceFilterTab = 'all' | 'active' | 'rejected';

export default function ServiceManager({
  currentProviderId,
  onNavigateToOffer
}: {
  currentProviderId?: string;
  onNavigateToOffer?: () => void;
}) {
  const searchParams = useSearchParams();
  const { error } = useToast();
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
      photos: s.photos ?? [],
      serviceLocation: s.serviceLocation,
      publicMapPin: s.publicMapPin ?? false,
      serviceLocationMode: s.serviceLocationMode ?? 'PROVIDER_VISITS',
      venueAddress: s.venueAddress,
      coverageRadiusKm: s.coverageRadiusKm,
      transportationFee: s.transportationFee == null ? '' : String(s.transportationFee),
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
    if (!editingService.serviceLocation && editingService.serviceLocationMode !== (services.find(service => service.id === editingService.serviceId)?.serviceLocationMode ?? 'PROVIDER_VISITS')) {
      error(editingService.serviceLocationMode === 'PROVIDER_VISITS' ? 'Choose your service area' : 'Choose where seekers can visit you', editingService.serviceLocationMode === 'PROVIDER_VISITS' ? 'Choose a city or barangay where you offer this service.' : 'Mark the place where seekers can visit you on the map.');
      return;
    }

    const saved = await editServiceListing(
      editingService.serviceId,
      editingService.title,
      editingService.price,
      editingService.description,
      {
        ...(editingService.serviceLocation && { serviceLocation: editingService.serviceLocation }),
        publicMapPin: editingService.publicMapPin ?? false,
        coverageRadiusKm: editingService.coverageRadiusKm ?? null,
        photoIds: (editingService.photos ?? []).map(photo => photo.id),
        serviceLocationMode: editingService.serviceLocationMode,
        venueAddress: editingService.venueAddress?.trim() || null,
        transportationFee: editingService.priceType === 'BY_AGREEMENT' || editingService.serviceLocationMode === 'SEEKER_VISITS' ? null : editingService.transportationFee ? Number(editingService.transportationFee) : null,
        priceType: editingService.priceType,
        serviceType: editingService.serviceType,
        estimatedDurationMins: Math.max(15, Math.min(480, Number(editingService.estimatedDurationMins) || 60)),
        paymentMethods: editingService.paymentMethods,
      }
    );
    if (saved) setEditingService(null);
  };

  return (
    <div className={`workspace-page space-y-6 transition-colors duration-200 ${isDark ? 'text-white' : 'text-ink'}`}>

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
        <div className={`rounded-[24px] p-12 border text-center text-sm font-medium transition-colors duration-200 ${isDark ? 'bg-charcoal-surface border-neutral-800/80 text-ink-muted' : 'bg-white border-slate-200 text-ink-muted'
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
            {paginatedServices.map(service => <ManagedServiceCard key={service.id} service={service} isDark={isDark} highlighted={targetServiceId === service.id} toggling={togglingServiceId === service.id} onEdit={() => handleOpenEdit(service)} onDelete={() => handleDeleteServiceClick(service)} onToggle={() => void handleToggleStatus(service.id)} />)}
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
        key={editingService?.serviceId}
        value={editingService}
        isDark={isDark}
        userId={user?.id}
        onChange={setEditingService}
        onClose={() => setEditingService(null)}
        onSubmit={handleSaveEdit}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal state={confirmModal} onClose={() => setConfirmModal(null)} />

    </div>
  );
}
