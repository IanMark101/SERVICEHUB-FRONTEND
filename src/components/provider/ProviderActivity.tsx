import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { JobEngagement } from '../../types';
import {
  Wrench,
  Trash2,
  Send,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Play,
  Calendar,
  Sparkles,
  Search,
  MessageSquare,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { usePagination } from '../../hooks/usePagination';
import PaginationBar from '../ui/PaginationBar';
import { apiCancelBooking, apiEscalateCancellationRequest, apiRespondCancellationRequest, apiHideBooking, apiEscalateCompletion } from '../../api/bookings.api';
import { useToast } from '../ui/Toast';
import ConfirmModal, { ConfirmModalState } from '../ui/ConfirmModal';
import EmptyState from '../ui/EmptyState';
import { ActivityItemSkeleton } from '../ui/SkeletonCard';
import LifecycleStepper from '../ui/LifecycleStepper';
import ReviewModal from '../seeker/ReviewModal';
import { apiSubmitReview, apiUpdateReview } from '../../api/reviews.api';
import ProviderActivityTabs from './activity/ProviderActivityTabs';
import ProviderCancellationDeclineModal from './activity/ProviderCancellationDeclineModal';
import {
  countProviderActivityTab,
  filterProviderActivityItems,
} from './activity/providerActivity.utils';
import type { ProviderActivitySort, ProviderActivityTab } from './activity/types';
import ProviderActivityItem from './activity/ProviderActivityItem';
import ProviderActivityList from './activity/ProviderActivityList';


export default function ProviderActivity({ currentProviderId }: { currentProviderId?: string }) {
  const searchParams = useSearchParams();
  const bookingIdParam = searchParams.get('booking');
  const [highlightedBookingId, setHighlightedBookingId] = useState<string | null>(null);
  const {
    jobEngagements,
    bids,
    jobRequests,
    requestJobApproval,
    declineBid,
    providerStartJob,
    services,
    isDark,
    refreshEngagements,
    refreshAll,
    notifications,
    user
  } = useApp();
  const { success, error: toastError, info } = useToast();
  const router = useRouter();

  // Use prop if passed (e.g. admin view), otherwise fall back to current user from context
  const resolvedProviderId = currentProviderId || user?.id;

  // Filter engagements and bids for resolvedProviderId
  const myEngagements = resolvedProviderId
    ? jobEngagements.filter(je => je.providerId === resolvedProviderId)
    : jobEngagements;
  const myPendingBids = resolvedProviderId
    ? bids.filter(b => b.providerId === resolvedProviderId && b.status === 'pending')
    : bids.filter(b => b.status === 'pending');

  // Filter state
  const [activeTab, setActiveTab] = useState<ProviderActivityTab>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 450);
    return () => clearTimeout(t);
  }, []);

  const handleTabChange = (tab: typeof activeTab) => {
    if (tab === activeTab) return;
    setIsLoading(true);
    setActiveTab(tab);
    setTimeout(() => setIsLoading(false), 250);
  };
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [loadingActionType, setLoadingActionType] = useState<string | null>(null);

  // Confirm Modal state
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState | null>(null);

  // Debounced auto-refresh effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const triggerDebounce = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        refreshEngagements();
        refreshAll();
      }, 300);
    };

    triggerDebounce();

    const handleFocus = () => {
      triggerDebounce();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('focus', handleFocus);
    };
  }, [activeTab, notifications.length, refreshEngagements, refreshAll]);

  const tabParam = searchParams.get('tab');

  useEffect(() => {
    if (tabParam) {
      const allowed: ProviderActivityTab[] = ['all', 'in_progress', 'waiting', 'pending_offers', 'awaiting_approval', 'disputed', 'canceled'];
      if (allowed.includes(tabParam as ProviderActivityTab)) {
        setActiveTab(tabParam as ProviderActivityTab);
      }
    }
  }, [tabParam]);

  useEffect(() => {
    if (bookingIdParam) {
      const found = myEngagements.find(e => e.id === bookingIdParam || e.completedServiceId === bookingIdParam);
      if (found) {
        let targetTab: typeof activeTab = 'all';
        if (found.status === 'in_progress') targetTab = 'in_progress';
        else if (found.status === 'queued' || found.status === 'pending_provider') targetTab = 'waiting';
        else if (found.status === 'awaiting_seeker_approval') targetTab = 'awaiting_approval';
        else if (found.status === 'disputed') targetTab = 'disputed';
        else if (found.status === 'completed') targetTab = 'completed';
        else if (found.status === 'canceled') targetTab = 'canceled';

        setActiveTab(targetTab);
        setHighlightedBookingId(found.id);

        const scrollTimer = setTimeout(() => {
          const element = document.getElementById(`booking-${found.id}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 300);

        const clearTimer = setTimeout(() => {
          setHighlightedBookingId(null);
        }, 3000);

        return () => {
          clearTimeout(scrollTimer);
          clearTimeout(clearTimer);
        };
      }
    }
  }, [bookingIdParam, myEngagements.length]);

  // Search & Sort States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<ProviderActivitySort>('newest');

  const getCategoryForEngagement = (engagement: JobEngagement) => {
    if (engagement.serviceId) {
      const service = services.find((item) => item.id === engagement.serviceId);
      if (service) return service.category;
    }

    return jobRequests.find(
      (request) => request.seekerId === engagement.seekerId && request.title === engagement.title,
    )?.category || 'General';
  };

  const getRequestForBid = (requestId: string) =>
    jobRequests.find((request) => request.id === requestId);

  const countTabItems = (tab: ProviderActivityTab) =>
    countProviderActivityTab(tab, myEngagements, myPendingBids);

  const filteredItems = filterProviderActivityItems({
    activeTab,
    engagements: myEngagements,
    pendingBids: myPendingBids,
    jobRequests,
    services,
    searchQuery,
    sortBy,
  });

  // Pagination
  const {
    currentPage,
    totalPages,
    paginatedItems,
    goToPage,
    nextPage,
    prevPage,
    startIndex,
    endIndex
  } = usePagination(filteredItems, 6);

  const [respondingReqId, setRespondingReqId] = useState<string | null>(null);
  const [declineNote, setDeclineNote] = useState<string>('');
  const [reviewingEngagement, setReviewingEngagement] = useState<JobEngagement | null>(null);

  const handleReviewSubmit = async (rating: number, comment: string, tags: string[], reviewId?: string) => {
    if (reviewId) {
      await apiUpdateReview(reviewId, {
        rating,
        text: comment,
        tags
      });
      success('Review Updated! ⭐', 'Your review for the client has been updated.');
    } else {
      if (!reviewingEngagement || !reviewingEngagement.completedServiceId) return;
      await apiSubmitReview({
        completedServiceId: reviewingEngagement.completedServiceId,
        rating,
        text: comment,
        tags
      });
      success('Client Review Submitted! ⭐', 'Thank you for your rating and feedback.');
    }
    refreshEngagements();
  };

  const handleProviderStartJob = async (id: string) => {
    setLoadingItemId(id);
    setLoadingActionType('start');
    try {
      await providerStartJob(id);
    } catch (err) {
      // already toasted
    } finally {
      setLoadingItemId(null);
      setLoadingActionType(null);
    }
  };

  const handleRequestJobApproval = async (id: string) => {
    setLoadingItemId(id);
    setLoadingActionType('complete');
    try {
      await requestJobApproval(id);
    } catch (err) {
      // already toasted
    } finally {
      setLoadingItemId(null);
      setLoadingActionType(null);
    }
  };

  const handleCompletionEscalation = async (id: string) => {
    setLoadingItemId(id);
    setLoadingActionType('completion_escalation');
    try {
      await apiEscalateCompletion(id, 'The seeker has not responded to the completion request after the required waiting period.');
      success('Review requested', 'The completion was sent to an administrator for review.');
      refreshEngagements();
    } catch (err: any) {
      toastError('Unable to escalate', err.response?.data?.error || err.message);
    } finally {
      setLoadingItemId(null);
      setLoadingActionType(null);
    }
  };

  const handleProviderRemoveFromQueue = async (id: string) => {
    const reason = window.prompt('Explain why you need to cancel this booking:');
    if (!reason || reason.trim().length < 3) return;
    setLoadingItemId(id);
    setLoadingActionType('remove');
    try {
      const response = await apiCancelBooking(id, reason.trim());
      if (response.data?.immediate) {
        success('Booking Cancelled', 'The reason was recorded and any eligible online refund was submitted.');
      } else {
        info('Cancellation Request Sent', 'The seeker must review the request because work has started.');
      }
      refreshEngagements();
    } catch (err: any) {
      toastError('Cancellation failed', err.response?.data?.error || err.message);
    } finally {
      setLoadingItemId(null);
      setLoadingActionType(null);
    }
  };

  const handleEscalateCancellation = async (requestId: string) => {
    setLoadingItemId(requestId);
    setLoadingActionType('escalate_cancellation');
    try {
      await apiEscalateCancellationRequest(requestId);
      success('Escalated to Admin', 'An administrator will review the cancellation decision.');
      refreshEngagements();
    } catch (err: any) {
      toastError('Escalation failed', err.response?.data?.error || err.message);
    } finally {
      setLoadingItemId(null);
      setLoadingActionType(null);
    }
  };

  const handleCancelOffer = async (bidId: string) => {
    setLoadingItemId(bidId);
    setLoadingActionType('cancel_offer');
    try {
      await declineBid(bidId);
    } catch (err) {
      // already toasted
    } finally {
      setLoadingItemId(null);
      setLoadingActionType(null);
    }
  };

  const handleApproveCancellation = async (requestId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Approve Cancellation',
      message: 'Approve this cancellation request? The booking will be cancelled and the seeker refunded.',
      confirmText: 'Approve & Refund',
      cancelText: 'Keep Booking',
      variant: 'warning',
      onConfirm: async () => {
        setConfirmModal(prev => prev ? { ...prev, isLoading: true } : null);
        setLoadingItemId(requestId);
        setLoadingActionType('approve_cancellation');
        try {
          const res = await apiRespondCancellationRequest(requestId, true);
          if (res.success) {
            success('Cancellation Approved', 'Booking cancelled and seeker will be refunded.');
            refreshEngagements();
          } else {
            toastError('Action Failed', res.message || 'Failed to approve cancellation.');
          }
        } catch (err: any) {
          toastError('Action Failed', err.response?.data?.message || 'Error responding to cancellation request.');
        } finally {
          setLoadingItemId(null);
          setLoadingActionType(null);
          setConfirmModal(null);
        }
      }
    });
  };

  const handleDeleteClick = (je: JobEngagement) => {
    setConfirmModal({
      isOpen: true,
      title: 'Remove from Activity',
      message: 'Are you sure you want to remove this record from your activity view? It will no longer be visible here.',
      confirmText: 'Remove',
      cancelText: 'Cancel',
      variant: 'danger',
      onConfirm: async () => {
        setConfirmModal(prev => prev ? { ...prev, isLoading: true } : null);
        setLoadingItemId(je.id);
        setLoadingActionType('hide');
        try {
          const res = await apiHideBooking(je.id);
          if (res.success) {
            success('Removed', 'Record removed from your activity list.');
            refreshEngagements();
          } else {
            toastError('Remove Failed', res.message || 'Failed to remove record.');
          }
        } catch (err: any) {
          toastError('Remove Failed', err.response?.data?.message || 'Error removing record.');
        } finally {
          setLoadingItemId(null);
          setLoadingActionType(null);
          setConfirmModal(null);
        }
      }
    });
  };

  const handleDeclineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!respondingReqId) return;
    setLoadingItemId(respondingReqId);
    setLoadingActionType('decline_cancellation');
    try {
      const res = await apiRespondCancellationRequest(respondingReqId, false, declineNote);
      if (res.success) {
        info('Cancellation Declined', 'The seeker has been notified and may escalate to admin.');
        setRespondingReqId(null);
        setDeclineNote('');
        refreshEngagements();
      } else {
        toastError('Action Failed', res.message || 'Failed to decline cancellation.');
      }
    } catch (err: any) {
      toastError('Action Failed', err.response?.data?.message || 'Error declining cancellation.');
    } finally {
      setLoadingItemId(null);
      setLoadingActionType(null);
    }
  };


  return (
    <div className={`space-y-6 select-none transition-colors duration-200 ${isDark ? 'text-[#f2efe9]' : 'text-slate-800'}`}>



      <ProviderActivityTabs
        activeTab={activeTab}
        isDark={isDark}
        countTabItems={countTabItems}
        onTabChange={handleTabChange}
      />

      <ProviderActivityList
        model={{
          myPendingBids, myEngagements, isDark, searchQuery, setSearchQuery,
          sortBy, setSortBy, isLoading, filteredItems, activeTab, router,
          paginatedItems, getRequestForBid, getCategoryForEngagement,
          loadingItemId, loadingActionType, highlightedBookingId,
          handleCancelOffer, handleApproveCancellation, handleDeleteClick,
          handleProviderStartJob, handleRequestJobApproval, handleCompletionEscalation,
          handleProviderRemoveFromQueue, handleEscalateCancellation, setRespondingReqId, setDeclineNote,
          setReviewingEngagement, resolvedProviderId, user, currentPage,
          totalPages, goToPage, nextPage, prevPage, startIndex, endIndex
        }}
      />

      <ProviderCancellationDeclineModal
        requestId={respondingReqId}
        declineNote={declineNote}
        isDark={isDark}
        isSubmitting={
          loadingItemId === respondingReqId &&
          loadingActionType === "decline_cancellation"
        }
        isActionDisabled={!!loadingItemId}
        onDeclineNoteChange={setDeclineNote}
        onClose={() => setRespondingReqId(null)}
        onSubmit={handleDeclineSubmit}
      />

      {/* Review Modal for Rating Clients */}
      {reviewingEngagement && (() => {
        const existingReview = reviewingEngagement.reviews?.find((r: any) => r.authorId === (resolvedProviderId || user?.id));
        return (
          <ReviewModal
            isOpen={!!reviewingEngagement}
            onClose={() => setReviewingEngagement(null)}
            onSubmit={handleReviewSubmit}
            targetName={reviewingEngagement.seekerName}
            targetRole="client"
            isDark={isDark}
            isEdit={!!existingReview}
            reviewId={existingReview?.id}
            initialRating={existingReview?.rating || 0}
            initialComment={existingReview?.text || ''}
            initialTags={Array.isArray(existingReview?.tags) ? existingReview.tags : []}
          />
        );
      })()}

      {/* Confirmation Modal */}
      <ConfirmModal
        state={confirmModal}
        onClose={() => setConfirmModal(null)}
      />

    </div>
  );
}
