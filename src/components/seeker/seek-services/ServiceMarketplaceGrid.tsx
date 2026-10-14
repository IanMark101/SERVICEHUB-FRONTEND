'use client';

import { useState } from 'react';
import {
  MagnifyingGlass as Search,
} from '@phosphor-icons/react';
import type { ServiceListing } from '../../../types';
import { PaginationBarView } from '../../ui/PaginationBar';
import EmptyState from '../../ui/EmptyState';
import MarketplaceEmptyState from '../../location/MarketplaceEmptyState';
import type { MarketplaceLocation } from '../../../lib/location';
import { ServiceListingSkeleton } from '../../ui/SkeletonCard';
import type { Dispatch, SetStateAction } from 'react';
import type { JobEngagement, User } from '../../../types';
import type { UserSession } from '../../auth/LoginContainer';
import ServiceDetailsModal from './ServiceDetailsModal';
import ServiceMarketplaceCard from './ServiceMarketplaceCard';
import useSavedListings from '../../../hooks/useSavedListings';

type MarketplaceFilter = 'all' | 'available' | 'rated' | 'low-queue';
type PaymentMethod = 'GCash' | 'On-site Cash';

interface ServiceMarketplaceGridModel {
  router: { push: (href: string) => void };
  isDark: boolean;
  isLoading: boolean;
  servicesError?: boolean;
  refreshServices?: () => void;
  activeFilter: MarketplaceFilter;
  setActiveFilter: Dispatch<SetStateAction<MarketplaceFilter>>;
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  selectedCategory: string;
  setSelectedCategory: Dispatch<SetStateAction<string>>;
  totalItems?: number;
  searchLocation?: MarketplaceLocation | null;
  onChangeLocation?: () => void;
  onExpandRadius?: (radius:number) => void;
  filteredServices: ServiceListing[];
  paginatedServices: ServiceListing[];
  currentPage: number;
  totalPages: number;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  startIndex: number;
  endIndex: number;
  getProviderDetails: (providerId: string) => User | undefined;
  user: UserSession | null;
  jobEngagements: JobEngagement[];
  canTransact: boolean;
  setBlockedModalOpen: Dispatch<SetStateAction<boolean>>;
  handleBookListing: (listing: ServiceListing, method?: PaymentMethod) => void;
  handleJoinWaitlist: (listing: ServiceListing) => void;
  joiningWaitlistId: string | null;
  prefetchProviderSummary: (listing: ServiceListing) => void;
}

type GridProps = { model: ServiceMarketplaceGridModel; readOnly?: boolean };

export default function ServiceMarketplaceGrid(props: GridProps) {
  // Public examples stay inert and never mount account feedback or Saved effects.
  return props.readOnly ? <ServiceMarketplaceGridView {...props} /> : <SavedServiceMarketplaceGrid {...props} />;
}

function SavedServiceMarketplaceGrid(props: GridProps) {
  const { user, paginatedServices } = props.model;
  const saved = useSavedListings('SERVICE_LISTING', user?.id, paginatedServices.filter(item => item.providerId !== user?.id).map(item => item.id));
  return <ServiceMarketplaceGridView {...props} saved={saved} />;
}

function ServiceMarketplaceGridView({ model, readOnly = false, saved }: GridProps & { saved?: ReturnType<typeof useSavedListings> }) {
  const {
    router,
    isDark,
    isLoading,
    servicesError,
    refreshServices,
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    filteredServices,
    totalItems = filteredServices.length,
    searchLocation,
    onChangeLocation,
    onExpandRadius,
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
    handleBookListing,
    handleJoinWaitlist,
    joiningWaitlistId,
    prefetchProviderSummary
  } = model;

  const [previewListing, setPreviewListing] = useState<ServiceListing | null>(null);

  return (
    <>
      {saved?.error && <p role="alert" className="workspace-surface rounded-xl border p-3 text-sm">{saved.error} <button type="button" onClick={saved.refresh} className="font-semibold underline">Retry Saved</button></p>}
      {servicesError && filteredServices.length > 0 && <div role="alert" className="workspace-surface rounded-xl border p-4 text-sm">
        Could not refresh services. Showing the last loaded listings.{' '}
        <button type="button" className="font-semibold" onClick={refreshServices}>Try again</button>
      </div>}
      {/* Provider Services Card Grid */}
      {isLoading ? (
        <ServiceListingSkeleton count={6} />
      ) : servicesError && filteredServices.length === 0 ? (
        <div role="alert"><EmptyState icon={Search} title="Services could not be loaded" description="Check your connection and try again." actionLabel="Try again" onAction={refreshServices} /></div>
      ) : filteredServices.length === 0 ? (
        <div className="space-y-4">
          <MarketplaceEmptyState workspace="seeker" location={searchLocation || null} search={searchQuery} category={selectedCategory}
            hasFilters={!!searchQuery || selectedCategory !== 'All Categories' || activeFilter !== 'all'}
            onChangeLocation={onChangeLocation} onExpandRadius={onExpandRadius}
            onClearFilters={() => { setSearchQuery(''); setSelectedCategory('All Categories'); setActiveFilter('all'); }}
            onPostRequest={() => router.push('/seeker/post-request')}/>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="marketplace-results-grid">
            {paginatedServices.map((service: ServiceListing) => {
              const provider = getProviderDetails(service.providerId);
              const activeEngagement = jobEngagements.find(booking => booking.seekerId === user?.id && booking.serviceId === service.id && ['pending_provider', 'queued', 'in_progress', 'awaiting_seeker_approval', 'disputed'].includes(booking.status));
              return <ServiceMarketplaceCard key={service.id} service={service} trustScore={service.providerTrustScore ?? provider?.trustScore}
                verified={service.providerVerificationStatus === 'APPROVED' || provider?.isVerified === true} isDark={isDark} isOwned={!!user && service.providerId === user.id}
                activeEngagement={activeEngagement} joiningWaitlistId={joiningWaitlistId}
                readOnly={readOnly} saved={saved?.isSaved(service.id)} saving={saved?.isBusy(service.id)} onToggleSaved={saved ? () => { void saved.toggle(service.id); } : undefined}
                onDetails={() => setPreviewListing(service)} onProfile={() => router.push(`/profile/${encodeURIComponent(service.providerId)}`)}
                onReviews={() => router.push(`/profile/${encodeURIComponent(service.providerId)}?tab=reviews&reviewRole=provider`)}
                onEdit={() => router.push(`/provider/service-manager?id=${service.id}`)} onActivity={() => { if (activeEngagement) router.push(`/seeker/seeker-activity?tab=all&booking=${activeEngagement.id}`); }}
                onBook={method => handleBookListing(service, method)} onJoinWaitlist={() => handleJoinWaitlist(service)} prefetch={() => prefetchProviderSummary(service)} />;
            })}
          </div>

          <PaginationBarView
            isDark={isDark}
            currentPage={currentPage}
            totalPages={totalPages}
            goToPage={goToPage}
            nextPage={nextPage}
            prevPage={prevPage}
            startIndex={startIndex}
            endIndex={endIndex}
            totalItems={totalItems}
            variant="seeker"
          />
        </div>
      )}

      {/* Service Details Inspection Modal */}
      {!readOnly && <ServiceDetailsModal
        listing={previewListing}
        isOpen={!!previewListing}
        onClose={() => setPreviewListing(null)}
        onBookListing={handleBookListing}
        onJoinWaitlist={handleJoinWaitlist}
        joiningWaitlistId={joiningWaitlistId}
        isOwned={!!(user && previewListing && previewListing.providerId === user.id)}
        activeEngagement={
          previewListing
            ? jobEngagements.find(
                (je) =>
                  je.seekerId === user?.id &&
                  je.serviceId === previewListing.id &&
                  ['pending_provider', 'queued', 'in_progress', 'awaiting_seeker_approval', 'disputed'].includes(je.status)
              )
            : undefined
        }
        isDark={isDark}
        router={router}
        prefetchProviderSummary={prefetchProviderSummary}
      />}
    </>
  );
}
