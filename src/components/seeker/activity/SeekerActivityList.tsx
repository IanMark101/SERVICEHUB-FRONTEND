"use client";

import { AlertTriangle, CheckCircle2, Clock, Play, Search } from 'lucide-react';
import PaginationBar from '../../ui/PaginationBar';
import EmptyState from '../../ui/EmptyState';
import { ActivityItemSkeleton } from '../../ui/SkeletonCard';
import SeekerActivityItem from './SeekerActivityItem';
import type { JobEngagement } from '../../../types';

export default function SeekerActivityList({ model }: { model: any }) {
  const {
    myEngagements, isDark, searchQuery, setSearchQuery, sortBy, setSortBy,
    isLoading, filteredEngagements, activeTab, router, paginatedEngagements,
    highlightedBookingId, getCategoryForEngagement, currentUserId,
    loadingItemId, loadingActionType, setReviewingEngagement,
    handleDeleteClick, setDisputingJob, setConfirmModal,
    handleConfirmJobCompletion, handleEscalateClick, handleCancelClick, handleRespondCancellation,
    currentPage, totalPages, goToPage, nextPage, prevPage, startIndex, endIndex
  } = model;

  return (
    <>
      {/* Cards list matching filters */}
      <div className="space-y-6">

        {/* Search & Sort Panel */}
        {myEngagements.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Search Box */}
            <div className={`flex items-center rounded-xl px-3 py-2 w-full sm:max-w-md border transition-all ${isDark ? 'bg-[#1c1b18] border-neutral-800/80' : 'bg-slate-50 border-slate-300'
              }`}>
              <span className={isDark ? 'text-[#b4b0a9]' : 'text-slate-400'}>
                <Search className="w-4 h-4 mr-2" />
              </span>
              <input
                type="text"
                placeholder="Search by job title or provider name..."
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
                  handleRespondCancellation
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
