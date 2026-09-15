"use client";

import { Warning as AlertTriangle, CheckCircle as CheckCircle2, Clock, Play, MagnifyingGlass as Search } from '@phosphor-icons/react';
import PaginationBar from '../../ui/PaginationBar';
import EmptyState from '../../ui/EmptyState';
import { ActivityItemSkeleton } from '../../ui/SkeletonCard';
import SeekerActivityItem from './SeekerActivityItem';
import type { JobEngagement } from '../../../types';
import type { Dispatch, SetStateAction } from 'react';
import type { SeekerActivityItemModel } from './SeekerActivityItem';
import type { SeekerActivitySort, SeekerActivityTab } from './types';

interface SeekerActivityListModel extends SeekerActivityItemModel {
  myEngagements: JobEngagement[];
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  sortBy: SeekerActivitySort;
  setSortBy: Dispatch<SetStateAction<SeekerActivitySort>>;
  isLoading: boolean;
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
}

export default function SeekerActivityList({ model }: { model: SeekerActivityListModel }) {
  const {
    myEngagements, isDark, searchQuery, setSearchQuery, sortBy, setSortBy,
    isLoading, filteredEngagements, activeTab, router, paginatedEngagements,
    highlightedBookingId, getCategoryForEngagement, currentUserId,
    loadingItemId, loadingActionType, setReviewingEngagement,
    handleDeleteClick, setDisputingJob, setConfirmModal,
    handleConfirmJobCompletion, handleEscalateClick, handleCancelClick, handleRespondCancellation,
    handleRequestAgain,
    currentPage, totalPages, goToPage, nextPage, prevPage, startIndex, endIndex
  } = model;

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
                className="service-search-input w-full border-0 bg-transparent text-xs outline-none placeholder:text-[#8a857e]"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
              <span className="workspace-muted whitespace-nowrap text-xs font-semibold">Sort by:</span>
              <select
                aria-label="Sort seeker activity"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SeekerActivitySort)}
                className="min-h-11 rounded-xl border px-3 py-2 text-xs font-semibold outline-none"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price_desc">Budget: High to Low</option>
                <option value="price_asc">Budget: Low to High</option>
              </select>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {isLoading ? (
            <div className="col-span-2">
              <ActivityItemSkeleton count={3} />
            </div>
          ) : filteredEngagements.length === 0 ? (
            <div className="col-span-2">
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
                    : activeTab === 'active'
                    ? 'No Active Services In Progress'
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
                    ? 'You have no service engagements requiring your confirmation or review right now.'
                    : activeTab === 'active'
                    ? 'None of your booked services are currently ongoing.'
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
            paginatedEngagements.map((engagement: JobEngagement) => (
              <SeekerActivityItem
                key={engagement.id}
                engagement={engagement}
                model={{
                  isDark,
                  highlightedBookingId,
                  getCategoryForEngagement,
                  currentUserId,
                  loadingItemId,
                  loadingActionType,
                  setReviewingEngagement,
                  handleDeleteClick,
                  router,
                  setDisputingJob,
                  setConfirmModal,
                  handleConfirmJobCompletion,
                  handleEscalateClick,
                  handleCancelClick,
                  handleRespondCancellation,
                  handleRequestAgain
                }}
              />
            ))
          )}
        </div>

        <PaginationBar
          currentPage={currentPage}
          totalPages={totalPages}
          goToPage={goToPage}
          nextPage={nextPage}
          prevPage={prevPage}
          startIndex={startIndex}
          endIndex={endIndex}
          totalItems={filteredEngagements.length}
          variant="seeker"
        />
      </div>
    </>
  );
}
