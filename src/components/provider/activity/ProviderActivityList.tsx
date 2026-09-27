"use client";

import { CheckCircle as CheckCircle2, Clock, Play, MagnifyingGlass as Search, PaperPlaneTilt as Send } from '@phosphor-icons/react';
import PaginationBar from '../../ui/PaginationBar';
import EmptyState from '../../ui/EmptyState';
import { ActivityItemSkeleton } from '../../ui/SkeletonCard';
import ProviderActivityItem from './ProviderActivityItem';
import type { Dispatch, SetStateAction } from 'react';
import type { Bid, JobEngagement } from '../../../types';
import type { ProviderActivityItemModel } from './ProviderActivityItem';
import type { ProviderActivityItemData } from './providerActivity.utils';
import type { ProviderActivitySort, ProviderActivityTab } from './types';

interface ProviderActivityListModel extends ProviderActivityItemModel {
  myPendingBids: Bid[];
  myEngagements: JobEngagement[];
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  sortBy: ProviderActivitySort;
  setSortBy: Dispatch<SetStateAction<ProviderActivitySort>>;
  isLoading: boolean;
  filteredItems: ProviderActivityItemData[];
  activeTab: ProviderActivityTab;
  paginatedItems: ProviderActivityItemData[];
  currentPage: number;
  totalPages: number;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  startIndex: number;
  endIndex: number;
}

export default function ProviderActivityList({ model }: { model: ProviderActivityListModel }) {
  const {
    myPendingBids, myEngagements, isDark, searchQuery, setSearchQuery,
    sortBy, setSortBy, isLoading, filteredItems, activeTab, router,
    paginatedItems, getRequestForBid, getCategoryForEngagement,
    loadingItemId, loadingActionType, highlightedBookingId,
    handleCancelOffer, handleApproveCancellation, handleDeleteClick,
    handleProviderStartJob, handleRequestJobApproval, handleCompletionEscalation,
    handleProviderRemoveFromQueue, handleEscalateCancellation, setRespondingReqId, setDeclineNote,
    activeJobId,
    setReviewingEngagement, openSafetyReport, resolvedProviderId, user, currentPage,
    totalPages, goToPage, nextPage, prevPage, startIndex, endIndex
  } = model;

  return (
    <>
      {/* Grid of job/bid cards */}
      <div className="space-y-5">

        {/* Search & Sort Panel */}
        {(myPendingBids.length > 0 || myEngagements.length > 0) && (
          <div className="workspace-activity-toolbar">
            {/* Search Box */}
            <div className="workspace-activity-search w-full sm:max-w-md">
              <span className="workspace-muted">
                <Search className="w-4 h-4 mr-2" />
              </span>
              <input
                aria-label="Search provider activity"
                type="text"
                placeholder="Search by job title, client name or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="service-search-input w-full border-0 bg-transparent text-xs outline-none placeholder:text-[#8a857e]"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
              <span className="workspace-muted whitespace-nowrap text-xs font-semibold">Sort by:</span>
              <select
                aria-label="Sort provider activity"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as ProviderActivitySort)}
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

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {isLoading ? (
            <div className="col-span-full">
              <ActivityItemSkeleton count={3} />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="col-span-full">
              <EmptyState
                icon={
                  activeTab === 'awaiting_approval'
                    ? CheckCircle2
                    : activeTab === 'waiting'
                    ? Clock
                    : activeTab === 'in_progress'
                    ? Play
                    : activeTab === 'pending_offers'
                    ? Send
                    : Search
                }
                title={
                  activeTab === 'awaiting_approval'
                    ? 'No Work Awaiting Seeker Confirmation'
                    : activeTab === 'in_progress'
                    ? 'No Work Underway'
                    : activeTab === 'waiting'
                    ? 'No Bookings Before Work'
                    : activeTab === 'pending_offers'
                    ? 'No Submitted Proposals'
                    : activeTab === 'disputed'
                    ? 'No Active Disputes'
                    : activeTab === 'completed'
                    ? 'No Completed Jobs Yet'
                    : activeTab === 'canceled'
                    ? 'No Canceled Engagements'
                    : searchQuery
                    ? 'No Matching Jobs Found'
                    : 'No Activity History Yet'
                }
                description={
                  activeTab === 'awaiting_approval'
                    ? 'You have not marked any work complete that still needs seeker confirmation.'
                    : activeTab === 'in_progress'
                    ? 'You have no jobs that have been started and are still underway.'
                    : activeTab === 'waiting'
                    ? 'You have no incoming approvals, queued bookings, or accepted bookings waiting to start.'
                    : activeTab === 'pending_offers'
                    ? 'You haven’t submitted any offers to open seeker job requests yet.'
                    : activeTab === 'disputed'
                    ? 'All client transactions are operating smoothly with zero dispute reports.'
                    : activeTab === 'completed'
                    ? 'You have not completed any service bookings yet.'
                    : activeTab === 'canceled'
                    ? 'You have no canceled engagements in your provider records.'
                    : searchQuery
                    ? `No jobs matched your search "${searchQuery}". Try adjusting your keywords.`
                    : 'You have no active jobs or proposals yet. Check the job board to find clients looking for services!'
                }
                actionLabel={
                  searchQuery
                    ? 'Clear Search'
                    : activeTab === 'pending_offers' || activeTab === 'all'
                    ? 'Browse Open Client Requests'
                    : undefined
                }
                onAction={() => {
                  if (searchQuery) {
                    setSearchQuery('');
                  } else {
                    router.push('/provider/browse-jobs');
                  }
                }}
                accentColor="emerald"
              />
            </div>
          ) : (
            paginatedItems.map((item) => (
              <ProviderActivityItem
                key={item.data.id}
                item={item}
                model={{
                  isDark,
                  getRequestForBid,
                  getCategoryForEngagement,
                  loadingItemId,
                  loadingActionType,
                  highlightedBookingId,
                  handleCancelOffer,
                  handleApproveCancellation,
                  handleDeleteClick,
                  handleProviderStartJob,
                  handleRequestJobApproval,
                  handleCompletionEscalation,
                  handleProviderRemoveFromQueue,
                  handleEscalateCancellation,
                  activeJobId,
                  router,
                  setRespondingReqId,
                  setDeclineNote,
                  setReviewingEngagement,
                  resolvedProviderId,
                  user,
                  openSafetyReport
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
          totalItems={filteredItems.length}
          variant="provider"
        />
      </div>
    </>
  );
}
