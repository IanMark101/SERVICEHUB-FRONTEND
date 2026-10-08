"use client";

import FormSelect from '../../ui/FormSelect';
import { Warning as AlertTriangle, CheckCircle as CheckCircle2, Clock, Play, MagnifyingGlass as Search, ArrowLeft } from '@phosphor-icons/react';
import PaginationBar from '../../ui/PaginationBar';
import EmptyState from '../../ui/EmptyState';
import { ActivityItemSkeleton } from '../../ui/SkeletonCard';
import SeekerActivityItem from './SeekerActivityItem';
import type { JobEngagement } from '../../../types';
import type { Dispatch, SetStateAction } from 'react';
import type { SeekerActivityItemModel } from './SeekerActivityItem';
import type { SeekerActivitySort, SeekerActivityTab } from './types';
import ActivityFeed, { type ActivityFeedEntry } from '../../activity/ActivityFeed';
import { getBookingOutcome } from '../../../lib/bookingOutcome';
import { getActivityPaymentCopy, getActivityQueueCopy, getBookingActivityGroup } from '../../activity/activityPresentation';
import { getActivitySituation } from '../../activity/ActivitySituation';
import BookingDetailState, { type ActivityLoadStatus } from '../../activity/BookingDetailState';

interface SeekerActivityListModel extends SeekerActivityItemModel {
  myEngagements: JobEngagement[];
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  sortBy: SeekerActivitySort;
  setSortBy: Dispatch<SetStateAction<SeekerActivitySort>>;
  isLoading: boolean;
  engagementsStatus: ActivityLoadStatus;
  retryBooking: () => Promise<void>;
  filteredEngagements: JobEngagement[];
  activeTab: SeekerActivityTab;
  paginatedEngagements: JobEngagement[];
  currentPage: number;
  totalPages: number;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  startIndex: number;
  endIndex: number;
  openBookingId: string | null;
  openBooking: (id: string) => void;
  closeBooking: () => void;
}

export default function SeekerActivityList({ model }: { model: SeekerActivityListModel }) {
  const {
    myEngagements, isDark, searchQuery, setSearchQuery, sortBy, setSortBy,
    isLoading, engagementsStatus, retryBooking, filteredEngagements, activeTab, router, paginatedEngagements,
    highlightedBookingId, getCategoryForEngagement, currentUserId,
    loadingItemId, loadingActionType, setReviewingEngagement,
    handleDeleteClick, setDisputingJob, setConfirmModal,
    handleConfirmJobCompletion, handleEscalateClick, handleCancelClick, handleRespondCancellation,
    handleRequestAgain, openSafetyReport,
    currentPage, totalPages, goToPage, nextPage, prevPage, startIndex, endIndex,
    openBookingId, openBooking, closeBooking
  } = model;

  const selectedBooking = openBookingId ? myEngagements.find((booking) => booking.id === openBookingId || booking.completedServiceId === openBookingId) : null;
  const itemModel: SeekerActivityItemModel = {
    isDark, highlightedBookingId, getCategoryForEngagement, currentUserId,
    loadingItemId, loadingActionType, setReviewingEngagement, handleDeleteClick,
    router, setDisputingJob, setConfirmModal, handleConfirmJobCompletion,
    handleEscalateClick, handleCancelClick, handleRespondCancellation,
    handleRequestAgain, openSafetyReport,
  };
  const entries: ActivityFeedEntry[] = paginatedEngagements.map((booking) => {
    const situation = getActivitySituation(booking, 'seeker', currentUserId);
    const cancellation = booking.cancellationRequests?.[0];
    const queueOverview = booking.status === 'queued' && !(
      cancellation && (
        ['PENDING', 'UNDER_REVIEW', 'ESCALATED'].includes(cancellation.status)
        || (cancellation.status === 'DECLINED' && cancellation.requestedBy === currentUserId)
      )
    );
    return {
      id: booking.id,
      group: getBookingActivityGroup(booking, 'seeker', currentUserId),
      title: booking.title,
      participant: `Provider: ${booking.providerName}`,
      status: situation.title,
      explanation: situation.detail,
      next: situation.next,
      price: booking.price,
      outcome: getBookingOutcome(booking),
      date: new Date(booking.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
      payment: getActivityPaymentCopy(booking).label,
      queue: getActivityQueueCopy(booking).label,
      action: situation.tone === 'action'
        ? situation.label === 'Your confirmation needed' ? 'Confirm the work or report an issue' : 'Review and respond in booking details'
        : 'No action needed now',
      situationLabel: situation.label,
      openLabel: situation.tone === 'action' ? 'Review decision' : booking.status === 'queued' ? 'View queue' : 'View booking',
      queueOverview,
      queuePosition: booking.queuePosition,
      queueEstimatedWait: booking.queueEstimatedWait,
    };
  });

  if (openBookingId) return (
    <div className="fixed inset-0 z-30 w-full space-y-4 overflow-y-auto bg-[#f8f6f2] p-4 dark:bg-charcoal sm:static sm:z-auto sm:mx-auto sm:max-w-[1340px] sm:overflow-visible sm:bg-transparent sm:p-0">
      {selectedBooking && <button type="button" onClick={closeBooking} className="inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-semibold text-ink-secondary hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-orange-500 dark:text-ink dark:hover:bg-charcoal">
        <ArrowLeft size={18} aria-hidden="true" /> Back to Activity
      </button>}
      {selectedBooking ? <SeekerActivityItem engagement={selectedBooking} model={itemModel} /> : <BookingDetailState status={engagementsStatus} role="seeker" onRetry={retryBooking} onBack={closeBooking} />}
    </div>
  );

  return (
    <>
      {/* Cards list matching filters */}
      <div className="space-y-5">

        {/* Search & Sort Panel */}
        {myEngagements.length > 0 && (
          <div className="workspace-activity-toolbar">
            {/* Search Box */}
            <div className="workspace-activity-search w-full sm:max-w-md">
              <span className="workspace-muted">
                <Search className="w-4 h-4 mr-2" />
              </span>
              <input
                aria-label="Search seeker activity"
                type="text"
                placeholder="Search by job title or provider name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="service-search-input w-full border-0 bg-transparent text-xs outline-none placeholder:text-ink-subtle"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
              <span className="workspace-muted whitespace-nowrap text-xs font-semibold">Sort each section:</span>
              <FormSelect
                compact
                aria-label="Sort seeker activity"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SeekerActivitySort)}
                className="min-h-11 rounded-xl border px-3 py-2 text-xs font-semibold outline-none"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price_desc">Budget: High to Low</option>
                <option value="price_asc">Budget: Low to High</option>
              </FormSelect>
            </div>
          </div>
        )}

        <div>
          {isLoading ? (
            <div>
              <ActivityItemSkeleton count={3} variant={activeTab === 'waiting' ? 'waiting' : ['completed', 'canceled', 'disputed'].includes(activeTab) ? 'history' : 'active'} />
            </div>
          ) : filteredEngagements.length === 0 ? (
            <div>
              <EmptyState
                icon={
                  activeTab === 'action_required'
                    ? CheckCircle2
                    : activeTab === 'completed'
                    ? CheckCircle2
                    : activeTab === 'waiting'
                    ? Clock
                    : activeTab === 'active'
                    ? Play
                    : activeTab === 'disputed'
                    ? AlertTriangle
                    : Search
                }
                title={
                  activeTab === 'action_required'
                    ? 'All Caught Up!'
                    : activeTab === 'pending'
                    ? 'No Bookings Before Work'
                    : activeTab === 'active'
                    ? 'No Work Underway'
                    : activeTab === 'waiting'
                    ? 'No Bookings Currently In Queue'
                    : activeTab === 'disputed'
                    ? 'No Active Disputes'
                    : activeTab === 'completed'
                    ? 'No Completed Bookings'
                    : activeTab === 'canceled'
                    ? 'No Canceled Bookings'
                    : searchQuery
                    ? 'No Matching Engagements Found'
                    : 'No Activity History Yet'
                }
                description={
                  activeTab === 'action_required'
                    ? 'You have no completion or cancellation decisions to make right now.'
                    : activeTab === 'pending'
                    ? 'You have no bookings awaiting provider approval or a start of work.'
                    : activeTab === 'active'
                    ? 'None of your booked services have been started by the provider.'
                    : activeTab === 'waiting'
                    ? 'You are not waiting in any provider queues at the moment.'
                    : activeTab === 'disputed'
                    ? 'All your transactions are proceeding normally with zero dispute cases.'
                    : activeTab === 'completed'
                    ? 'You have no completed service engagements in your records yet.'
                    : activeTab === 'canceled'
                    ? 'You have no canceled engagements in your records.'
                    : searchQuery
                    ? `No engagements matched your search "${searchQuery}". Try searching by a different provider name or job title.`
                    : 'You haven’t booked any services or accepted any offers yet. Explore the marketplace to find trusted local providers!'
                }
                actionLabel={
                  searchQuery
                    ? 'Clear Search'
                    : activeTab === 'all'
                    ? 'Browse Available Services'
                    : undefined
                }
                onAction={() => {
                  if (searchQuery) {
                    setSearchQuery('');
                  } else {
                    router.push('/seeker/seek-services');
                  }
                }}
                accentColor="orange"
              />
            </div>
          ) : (
            <ActivityFeed entries={entries} tone="seeker" onOpen={(entry) => openBooking(entry.id)} />
          )}
        </div>

        {totalPages > 1 && <PaginationBar
          currentPage={currentPage}
          totalPages={totalPages}
          goToPage={goToPage}
          nextPage={nextPage}
          prevPage={prevPage}
          startIndex={startIndex}
          endIndex={endIndex}
          totalItems={filteredEngagements.length}
          variant="seeker"
        />}
      </div>
    </>
  );
}
