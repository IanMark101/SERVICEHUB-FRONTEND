import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { JobEngagement } from '../../types';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  Play,
  HelpCircle,
  MessageSquare,
  AlertCircle,
  Search,
  ChevronDown,
  Loader2,
  Trash2
} from 'lucide-react';
import { usePagination } from '../../hooks/usePagination';
import PaginationBar from '../ui/PaginationBar';
import { apiCancelBooking, apiEscalateCancellationRequest, apiHideBooking, apiRespondCancellationRequest } from '../../api/bookings.api';
import { apiSubmitReview, apiUpdateReview } from '../../api/reviews.api';
import ReviewModal from './ReviewModal';
import { useToast } from '../ui/Toast';
import ConfirmModal, { ConfirmModalState } from '../ui/ConfirmModal';
import EmptyState from '../ui/EmptyState';
import { ActivityItemSkeleton } from '../ui/SkeletonCard';
import LifecycleStepper from '../ui/LifecycleStepper';
import SeekerActivityTabs from './activity/SeekerActivityTabs';
import SeekerCancellationRequestModal from './activity/SeekerCancellationRequestModal';
import SeekerDisputeModal from './activity/SeekerDisputeModal';
import {
  countSeekerActivityStatus,
  filterSeekerActivityEngagements
} from './activity/seekerActivity.utils';
import { SeekerActivitySort, SeekerActivityTab } from './activity/types';
import SeekerActivityItem from './activity/SeekerActivityItem';
import SeekerActivityList from './activity/SeekerActivityList';


export default function SeekerActivity({ currentUserId }: { currentUserId?: string }) {
  const { jobEngagements, confirmJobCompletion, disputeJob, cancelQueue, services, jobRequests, isDark, refreshEngagements, refreshAll, notifications, user } = useApp();
  const { success, error: toastError, info } = useToast();
  const router = useRouter();
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [loadingActionType, setLoadingActionType] = useState<'complete' | 'cancel' | 'escalate' | 'dispute' | 'cancel_submit' | 'hide' | 'respond_cancellation' | null>(null);

  const searchParams = useSearchParams();
  const bookingIdParam = searchParams.get('booking');
  const [highlightedBookingId, setHighlightedBookingId] = useState<string | null>(null);

  // Confirm Modal state
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState | null>(null);

  // Active user is the authenticated user — use prop if passed (e.g. admin view), otherwise fall back to current user from context
  const resolvedUserId = currentUserId || user?.id;
  const myEngagements = resolvedUserId
    ? jobEngagements.filter(je => je.seekerId === resolvedUserId)
    : jobEngagements; // if no userId yet, show all (context already scopes to user)

  // Filter Tab State
  const [activeTab, setActiveTab] = useState<SeekerActivityTab>('all');
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
      const allowed: SeekerActivityTab[] = ['all', 'action_required', 'pending', 'active', 'waiting', 'disputed', 'canceled'];
      if (allowed.includes(tabParam as SeekerActivityTab)) {
        setActiveTab(tabParam as SeekerActivityTab);
      }
    }
  }, [tabParam]);

  useEffect(() => {
    if (bookingIdParam) {
      const found = myEngagements.find(e => e.id === bookingIdParam || e.completedServiceId === bookingIdParam);
      if (found) {
        let targetTab: typeof activeTab = 'all';
        if (found.status === 'in_progress') targetTab = 'active';
        else if (found.status === 'queued' || found.status === 'pending_provider') targetTab = 'waiting';
        else if (found.status === 'awaiting_seeker_approval') targetTab = 'action_required';
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
  const [sortBy, setSortBy] = useState<SeekerActivitySort>('newest');

  // Helper to resolve category of a job engagement
  const getCategoryForEngagement = (je: JobEngagement) => {
    if (je.serviceId) {
      const s = services.find(srv => srv.id === je.serviceId);
      if (s) return s.category;
    }
    const req = jobRequests.find(r => r.seekerId === je.seekerId && r.title === je.title);
    if (req) return req.category;
    return 'General';
  };

  // Dispute Dialog Modal State
  const [disputingJob, setDisputingJob] = useState<JobEngagement | null>(null);
  const [disputeReason, setDisputeReason] = useState<string>('');

  // Review Modal State
  const [reviewingEngagement, setReviewingEngagement] = useState<JobEngagement | null>(null);

  const countStatus = (status: JobEngagement['status'] | 'action_required') =>
    countSeekerActivityStatus(myEngagements, status);

  const filteredEngagements = filterSeekerActivityEngagements({
    activeTab,
    engagements: myEngagements,
    searchQuery,
    sortBy,
    categoryForEngagement: getCategoryForEngagement
  });


  // Pagination
  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedEngagements,
    goToPage,
    nextPage,
    prevPage,
    startIndex,
    endIndex
  } = usePagination(filteredEngagements, 6);

  const handleConfirmJobCompletion = async (jobId: string) => {
    setLoadingItemId(jobId);
    setLoadingActionType('complete');
    try {
      await confirmJobCompletion(jobId);
    } catch (err) {
      // already toasted
    } finally {
      setLoadingItemId(null);
      setLoadingActionType(null);
    }
  };

  const handleDisputeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputingJob || !disputeReason.trim()) return;
    setLoadingItemId(disputingJob.id);
    setLoadingActionType('dispute');
    try {
      await disputeJob(disputingJob.id, disputeReason);
      setDisputingJob(null);
      setDisputeReason('');
    } catch (err) {
      // already toasted
    } finally {
      setLoadingItemId(null);
      setLoadingActionType(null);
    }
  };

  const handleReviewSubmit = async (rating: number, comment: string, tags: string[], reviewId?: string) => {
    if (reviewId) {
      await apiUpdateReview(reviewId, {
        rating,
        text: comment,
        tags
      });
      success('Review Updated! ⭐', 'Your review has been updated.');
    } else {
      if (!reviewingEngagement || !reviewingEngagement.completedServiceId) return;
      await apiSubmitReview({
        completedServiceId: reviewingEngagement.completedServiceId,
        rating,
        text: comment,
        tags
      });
      success('Review Submitted! ⭐', 'Thank you for your feedback.');
    }
    refreshEngagements();
  };


  const [cancelingJob, setCancelingJob] = useState<JobEngagement | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');

  const handleCancelClick = async (je: JobEngagement) => {
    setCancelingJob(je);
    setCancelReason('');
  };


  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelingJob) return;
    setLoadingItemId(cancelingJob.id);
    setLoadingActionType('cancel_submit');
    try {
      const res = await apiCancelBooking(cancelingJob.id, cancelReason);
      if (res.success) {
        if (cancelingJob.started) {
          info('Cancellation Request Sent', 'The provider will review your request.');
        } else {
          success('Booking Cancelled', 'The reason was recorded and any eligible online refund was submitted.');
        }
        setCancelingJob(null);
        setCancelReason('');
        refreshEngagements();
      } else {
        toastError('Request Failed', res.message || 'Failed to submit request.');
      }
    } catch (err: any) {
      toastError('Request Failed', err.response?.data?.message || 'Error submitting request.');
    } finally {
      setLoadingItemId(null);
      setLoadingActionType(null);
    }
  };


  const handleEscalateClick = async (requestId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Escalate to Admin',
      message: 'Escalate this dispute to Admin? Administrators will review the booking details and chat logs to make a final decision.',
      confirmText: 'Escalate Dispute',
      cancelText: 'Cancel',
      variant: 'warning',
      onConfirm: async () => {
        setConfirmModal(prev => prev ? { ...prev, isLoading: true } : null);
        setLoadingItemId(requestId);
        setLoadingActionType('escalate');
        try {
          const res = await apiEscalateCancellationRequest(requestId);
          if (res.success) {
            success('Escalated to Admin', 'An administrator will review and resolve your case.');
            refreshEngagements();
          } else {
            toastError('Escalation Failed', res.message || 'Failed to escalate request.');
          }
        } catch (err: any) {
          toastError('Escalation Failed', err.response?.data?.message || 'Error escalating request.');
        } finally {
          setLoadingItemId(null);
          setLoadingActionType(null);
          setConfirmModal(null);
        }
      }
    });
  };

  const handleRespondCancellation = async (requestId: string, approve: boolean) => {
    const note = approve ? undefined : window.prompt('Explain why you are declining this cancellation request:')?.trim();
    if (!approve && (!note || note.length < 3)) return;
    setLoadingItemId(requestId);
    setLoadingActionType('respond_cancellation');
    try {
      await apiRespondCancellationRequest(requestId, approve, note);
      success(approve ? 'Cancellation Approved' : 'Cancellation Declined', approve ? 'The booking was cancelled and any eligible refund was submitted.' : 'The provider may escalate the decision to Admin.');
      refreshEngagements();
    } catch (err: any) {
      toastError('Response failed', err.response?.data?.error || err.message);
    } finally {
      setLoadingItemId(null);
      setLoadingActionType(null);
    }
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

  return (
    <div className={`space-y-6 select-none transition-colors duration-200 ${isDark ? 'text-[#f2efe9]' : 'text-slate-800'}`}>



      <SeekerActivityTabs
        activeTab={activeTab}
        isDark={isDark}
        totalCount={myEngagements.length}
        countStatus={countStatus}
        onTabChange={handleTabChange}
      />

      <SeekerActivityList
        model={{
          myEngagements, isDark, searchQuery, setSearchQuery, sortBy, setSortBy,
          isLoading, filteredEngagements, activeTab, router, paginatedEngagements,
          highlightedBookingId, getCategoryForEngagement,
          loadingItemId, loadingActionType, setReviewingEngagement,
          handleDeleteClick, setDisputingJob, setConfirmModal,
          handleConfirmJobCompletion, handleEscalateClick, handleCancelClick, handleRespondCancellation,
          currentUserId: resolvedUserId,
          currentPage, totalPages, goToPage, nextPage, prevPage, startIndex, endIndex
        }}
      />

      <SeekerDisputeModal
        engagement={disputingJob}
        reason={disputeReason}
        isDark={isDark}
        isSubmitting={loadingItemId === disputingJob?.id && loadingActionType === 'dispute'}
        isActionDisabled={!!loadingItemId}
        onReasonChange={setDisputeReason}
        onClose={() => setDisputingJob(null)}
        onSubmit={handleDisputeSubmit}
      />

      <SeekerCancellationRequestModal
        engagement={cancelingJob}
        reason={cancelReason}
        isDark={isDark}
        isSubmitting={loadingItemId === cancelingJob?.id && loadingActionType === 'cancel_submit'}
        isActionDisabled={!!loadingItemId}
        onReasonChange={setCancelReason}
        onClose={() => setCancelingJob(null)}
        onSubmit={handleCancelSubmit}
      />
      {reviewingEngagement && (() => {
        const existingReview = reviewingEngagement.reviews?.find((r: any) => r.authorId === currentUserId);
        return (
          <ReviewModal
            isOpen={!!reviewingEngagement}
            onClose={() => setReviewingEngagement(null)}
            onSubmit={handleReviewSubmit}
            targetName={reviewingEngagement.providerName}
            targetRole="provider"
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
