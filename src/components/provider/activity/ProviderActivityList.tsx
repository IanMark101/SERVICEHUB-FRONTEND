"use client";

import { CheckCircle2, Clock, Play, Search, Send } from 'lucide-react';
import PaginationBar from '../../ui/PaginationBar';
import EmptyState from '../../ui/EmptyState';
import { ActivityItemSkeleton } from '../../ui/SkeletonCard';
import ProviderActivityItem from './ProviderActivityItem';

export default function ProviderActivityList({ model }: { model: any }) {
  const {
    myPendingBids, myEngagements, isDark, searchQuery, setSearchQuery,
    sortBy, setSortBy, isLoading, filteredItems, activeTab, router,
    paginatedItems, getRequestForBid, getCategoryForEngagement,
    loadingItemId, loadingActionType, highlightedBookingId,
    handleCancelOffer, handleApproveCancellation, handleDeleteClick,
    handleProviderStartJob, handleRequestJobApproval, handleCompletionEscalation,
    handleProviderRemoveFromQueue, handleEscalateCancellation, setRespondingReqId, setDeclineNote,
    setReviewingEngagement, resolvedProviderId, user, currentPage,
    totalPages, goToPage, nextPage, prevPage, startIndex, endIndex
  } = model;

  return (
    <>
      {/* Grid of job/bid cards */}
      <div className="space-y-6">

        {/* Search & Sort Panel */}
        {(myPendingBids.length > 0 || myEngagements.length > 0) && (
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Search Box */}
            <div className={`flex items-center rounded-xl px-3 py-2 w-full sm:max-w-md border transition-all ${isDark ? 'bg-[#1c1b18] border-neutral-800/80' : 'bg-slate-50 border-slate-300'
              }`}>
              <span className={isDark ? 'text-[#b4b0a9]' : 'text-slate-400'}>
                <Search className="w-4 h-4 mr-2" />
              </span>
              <input
                type="text"
                placeholder="Search by job title, client name or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-xs w-full text-slate-800 dark:text-[#f2efe9] placeholder-slate-400"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <span className={`text-xs font-semibold whitespace-nowrap ${isDark ? 'text-[#b4b0a9]' : 'text-slate-550'}`}>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className={`px-3 py-2 rounded-xl border outline-none font-bold text-xs transition-all ${isDark
                    ? 'bg-[#1c1b18] border-neutral-800/80 text-[#f2efe9]'
                    : 'bg-white border-slate-300 text-slate-700'
                  }`}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price_desc">Budget: High to Low</option>
                <option value="price_asc">Budget: Low to High</option>
              </select>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoading ? (
            <div className="col-span-2">
              <ActivityItemSkeleton count={3} />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="col-span-2">
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
                    ? 'All Actions Addressed!'
                    : activeTab === 'in_progress'
                    ? 'No Active Jobs In Progress'
                    : activeTab === 'waiting'
                    ? 'No Bookings Waiting in Queue'
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
                    ? 'You have no pending direct requests or cancellation reviews needing response.'
                    : activeTab === 'in_progress'
                    ? 'You are not currently working on any active service engagements.'
                    : activeTab === 'waiting'
                    ? 'Your service queues currently have no clients waiting in line.'
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
            paginatedItems.map((item: any) => (
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
                  router,
                  setRespondingReqId,
                  setDeclineNote,
                  setReviewingEngagement,
                  resolvedProviderId,
                  user
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
