import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { JobEngagement } from '../../types';
import { usePagination } from '../../hooks/usePagination';
import { apiCancelBooking, apiEscalateCancellationRequest, apiRespondCancellationRequest, apiHideBooking, apiEscalateCompletion } from '../../api/bookings.api';
import { useToast } from '../ui/Toast';
import ConfirmModal, { ConfirmModalState } from '../ui/ConfirmModal';
import ReviewModal from '../seeker/ReviewModal';
import { apiSubmitReview, apiUpdateReview } from '../../api/reviews.api';
import ProviderActivityTabs from './activity/ProviderActivityTabs';
import ProviderCancellationDeclineModal from './activity/ProviderCancellationDeclineModal';
import ProviderBookingCancellationModal from './activity/ProviderBookingCancellationModal';
import {
  countProviderActivityTab,
  filterProviderActivityItems,
} from './activity/providerActivity.utils';
import type { ProviderActivitySort, ProviderActivityTab } from './activity/types';
import ProviderActivityList from './activity/ProviderActivityList';
import ProviderWorkloadPanel from './activity/ProviderWorkloadPanel';
import { getApiErrorMessage } from '../../lib/api/errors';
import { normalizeOfferStatus } from '../../lib/offerStatus';
import SafetyReportModal from '../activity/SafetyReportModal';
import { activityGroupOrder, getActivityCategory, getBookingActivityGroup } from '../activity/activityPresentation';


export default function ProviderActivity({ currentProviderId }: { currentProviderId?: string }) {
  const searchParams = useSearchParams();
  const bookingIdParam = searchParams.get('booking');
  const offerIdParam = searchParams.get('offer');
  const urlItemId = offerIdParam ? `offer:${offerIdParam}` : bookingIdParam;
  const [openOverride, setOpenOverride] = useState<{ from: string | null; id: string | null } | null>(null);
  const openItemId = openOverride?.from === urlItemId ? openOverride.id : urlItemId;
  const tabParam = searchParams.get('tab');
  const deepLinkKey = `${tabParam ?? ''}:${bookingIdParam ?? ''}`;
  const manuallyOverriddenLink = useRef<string | null>(null);
  const appliedBookingLink = useRef<string | null>(null);
  const [highlightedBookingId, setHighlightedBookingId] = useState<string | null>(null);

  const openItem = (id: string, kind: 'booking' | 'offer') => {
    setOpenOverride({ from: urlItemId, id: kind === 'offer' ? `offer:${id}` : id });
    const params = new URLSearchParams(searchParams.toString());
    params.delete('booking');
    params.delete('offer');
    params.set(kind === 'offer' ? 'offer' : 'booking', id);
    router.push(`/provider/provider-activity?${params.toString()}`, { scroll: false });
  };

  const closeItem = () => {
    setOpenOverride({ from: urlItemId, id: null });
    const params = new URLSearchParams(searchParams.toString());
    params.delete('booking');
    params.delete('offer');
    const query = params.toString();
    router.push(`/provider/provider-activity${query ? `?${query}` : ''}`, { scroll: false });
  };
  const {
    jobEngagements,
    engagementsStatus,
    bids,
    jobRequests,
    requestJobApproval,
    declineBid,
    providerStartJob,
    services,
    isDark,
    refreshEngagements,
    applyBookingAction,
    user
  } = useApp();
  const { success, error: toastError, info } = useToast();
  const router = useRouter();

  // Use prop if passed (e.g. admin view), otherwise fall back to current user from context
  const resolvedProviderId = currentProviderId || user?.id;

  // Filter engagements and bids for resolvedProviderId
  const myEngagements = useMemo(() => resolvedProviderId
    ? jobEngagements.filter(je => je.providerId === resolvedProviderId)
    : jobEngagements, [jobEngagements, resolvedProviderId]);
  const activeJobId = resolvedProviderId
    ? myEngagements.find((engagement) => engagement.started && ['in_progress', 'disputed'].includes(engagement.status))?.id
    : undefined;
  const paidWaiting = myEngagements.some((engagement) => engagement.status === 'queued' && engagement.paymentMethod === 'GCash');
  const myOffers = useMemo(() => bids.filter(b => (!resolvedProviderId || b.providerId === resolvedProviderId)
    && normalizeOfferStatus(b.status) !== 'accepted'), [bids, resolvedProviderId]);

  // Filter state
  const [activeTab, setActiveTab] = useState<ProviderActivityTab>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 450);
    return () => clearTimeout(t);
  }, []);

  const handleTabChange = (tab: typeof activeTab) => {
    if (tab === activeTab) return;
    manuallyOverriddenLink.current = deepLinkKey;
    setIsLoading(true);
    setActiveTab(tab);
    setTimeout(() => setIsLoading(false), 250);
  };
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [loadingActionType, setLoadingActionType] = useState<string | null>(null);
  const [cancelingBookingId, setCancelingBookingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const cancelingBooking = myEngagements.find((booking) => booking.id === cancelingBookingId) || null;
  const [reportingEngagement, setReportingEngagement] = useState<JobEngagement | null>(null);

  // Confirm Modal state
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState | null>(null);

  // The shared data loader owns initial, socket, and focus refreshes. Changing
  // a local filter or receiving a notification must not reload the workspace.

  useEffect(() => {
    if (tabParam && manuallyOverriddenLink.current !== deepLinkKey) {
      const targetTab = tabParam === 'canceled' && offerIdParam ? 'closed_offers' : tabParam;
      const allowed: ProviderActivityTab[] = ['all', 'in_progress', 'waiting', 'pending_offers', 'closed_offers', 'awaiting_approval', 'disputed', 'completed', 'canceled'];
      if (allowed.includes(targetTab as ProviderActivityTab)) {
        const timer = window.setTimeout(() => {
          if (manuallyOverriddenLink.current !== deepLinkKey) setActiveTab(targetTab as ProviderActivityTab);
        }, 0);
        return () => window.clearTimeout(timer);
      }
    }
  }, [tabParam, offerIdParam, deepLinkKey]);

  useEffect(() => {
    if (bookingIdParam && manuallyOverriddenLink.current !== deepLinkKey && appliedBookingLink.current !== deepLinkKey) {
      const found = myEngagements.find(e => e.id === bookingIdParam || e.completedServiceId === bookingIdParam);
      if (found) {
        let targetTab: typeof activeTab = 'all';
        if (found.status === 'in_progress') targetTab = found.started ? 'in_progress' : 'waiting';
        else if (found.status === 'queued' || found.status === 'pending_provider') targetTab = 'waiting';
        else if (found.status === 'awaiting_seeker_approval') targetTab = 'awaiting_approval';
        else if (found.status === 'disputed') targetTab = 'disputed';
        else if (found.status === 'completed') targetTab = 'completed';
        else if (found.status === 'canceled') targetTab = 'canceled';

        const stateTimer = window.setTimeout(() => {
          if (manuallyOverriddenLink.current === deepLinkKey) return;
          appliedBookingLink.current = deepLinkKey;
          setActiveTab(targetTab);
          setHighlightedBookingId(found.id);
        }, 0);

        return () => {
          window.clearTimeout(stateTimer);
        };
      }
    } else if (!bookingIdParam) {
      appliedBookingLink.current = null;
    }
  }, [bookingIdParam, deepLinkKey, myEngagements]);

  useEffect(() => {
    if (!highlightedBookingId) return;
    const timer = window.setTimeout(() => setHighlightedBookingId(null), 3000);
    return () => window.clearTimeout(timer);
  }, [highlightedBookingId]);

  // Search & Sort States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<ProviderActivitySort>('newest');

  const getCategoryForEngagement = (engagement: JobEngagement) => getActivityCategory(engagement, services, jobRequests);

  const getRequestForBid = (requestId: string) =>
    jobRequests.find((request) => request.id === requestId);

  const countTabItems = (tab: ProviderActivityTab) =>
    countProviderActivityTab(tab, myEngagements, myOffers);

  const filteredItems = filterProviderActivityItems({
    activeTab,
    engagements: myEngagements,
    pendingBids: myOffers,
    jobRequests,
    services,
    searchQuery,
    sortBy,
  });

  const prioritizedItems = [...filteredItems].sort((left, right) => {
    const groupFor = (item: typeof left) => item.type === 'bid'
      ? 'waiting' as const
      : getBookingActivityGroup(item.data, 'provider', resolvedProviderId, activeJobId, paidWaiting);
    return activityGroupOrder.indexOf(groupFor(left)) - activityGroupOrder.indexOf(groupFor(right));
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
  } = usePagination(prioritizedItems, 6);

  const [respondingReqId, setRespondingReqId] = useState<string | null>(null);
  const [declineNote, setDeclineNote] = useState<string>('');
  const [reviewingEngagement, setReviewingEngagement] = useState<JobEngagement | null>(null);

  const handleReviewSubmit = async (rating: number, comment: string, tags: string[], reviewId?: string) => {
    if (reviewId) {
      const res = await apiUpdateReview(reviewId, {
        rating,
        text: comment,
        tags
      });
      if (res.data && reviewingEngagement) applyBookingAction({ id: reviewingEngagement.id, review: res.data });
      success('Review updated', 'Your review for the seeker has been updated.');
    } else {
      if (!reviewingEngagement || !reviewingEngagement.completedServiceId) return;
      const res = await apiSubmitReview({
        completedServiceId: reviewingEngagement.completedServiceId,
        rating,
        text: comment,
        tags
      });
      if (res.data) applyBookingAction({ id: reviewingEngagement.id, review: res.data });
      success('Seeker review submitted', 'Thank you for your rating and feedback.');
    }
  };

  const handleProviderStartJob = async (id: string) => {
    if (loadingItemId) return;
    setLoadingItemId(id);
    setLoadingActionType('start');
    try {
      await providerStartJob(id);
    } catch {
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
    } catch {
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
    } catch (err: unknown) {
      toastError('Unable to escalate', getApiErrorMessage(err, 'Unable to escalate this completion.'));
    } finally {
      setLoadingItemId(null);
      setLoadingActionType(null);
    }
  };

  const handleProviderRemoveFromQueue = async (id: string) => {
    setCancelingBookingId(id);
    setCancelReason('');
  };

  const submitProviderCancellation = async () => {
    if (!cancelingBookingId || cancelReason.trim().length < 3) return;
    const id = cancelingBookingId;
    setLoadingItemId(id);
    setLoadingActionType('remove');
    try {
      const response = await apiCancelBooking(id, cancelReason.trim());
      if (!response.success) throw new Error(response.message || 'Unable to cancel this booking.');
      if (response.data) applyBookingAction({ id, ...response.data });
      if (response.data?.immediate) {
        success('Booking Cancelled', 'The reason was recorded and any eligible online refund was submitted.');
      } else {
        info('Cancellation Request Sent', 'The seeker must review the request because work has started.');
      }
      setCancelingBookingId(null);
      setCancelReason('');
    } catch (err: unknown) {
      toastError('Cancellation failed', getApiErrorMessage(err, 'Unable to cancel this booking.'));
    } finally {
      setLoadingItemId(null);
      setLoadingActionType(null);
    }
  };

  const handleEscalateCancellation = async (requestId: string) => {
    setLoadingItemId(requestId);
    setLoadingActionType('escalate_cancellation');
    try {
      const res = await apiEscalateCancellationRequest(requestId);
      if (!res.success) throw new Error(res.message || 'Unable to escalate this cancellation.');
      if (res.data) applyBookingAction({ id: res.data.bookingId, cancellationRequest: res.data });
      success('Escalated to Admin', 'An administrator will review the cancellation decision.');
    } catch (err: unknown) {
      toastError('Escalation failed', getApiErrorMessage(err, 'Unable to escalate this cancellation.'));
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
    } catch {
      // already toasted
    } finally {
      setLoadingItemId(null);
      setLoadingActionType(null);
    }
  };

  const handleApproveCancellation = async (requestId: string) => {
    const booking = myEngagements.find((item) => item.cancellationRequests?.some((request) => request.id === requestId));
    const onlinePayment = booking?.paymentMethod === 'GCash';
    setConfirmModal({
      isOpen: true,
      title: 'Approve Cancellation',
      message: onlinePayment
        ? 'Approve this cancellation request? The booking will be cancelled and any eligible GCash Test Mode refund will be processed.'
        : 'Approve this cancellation request? The booking will be cancelled. Cash payments are arranged directly, so ServiceHub does not issue a cash refund.',
      confirmText: onlinePayment ? 'Approve & Refund' : 'Approve Cancellation',
      cancelText: 'Keep Booking',
      variant: 'warning',
      onConfirm: async () => {
        setConfirmModal(prev => prev ? { ...prev, isLoading: true } : null);
        setLoadingItemId(requestId);
        setLoadingActionType('approve_cancellation');
        try {
          const res = await apiRespondCancellationRequest(requestId, true);
          if (res.success) {
            if (res.data?.booking) applyBookingAction({ id: res.data.booking.id, ...res.data });
            success('Cancellation Approved', onlinePayment ? 'Booking cancelled and any eligible GCash Test Mode refund was submitted.' : 'Booking cancelled. ServiceHub has not collected a cash payment.');
          } else {
            toastError('Action Failed', res.message || 'Failed to approve cancellation.');
          }
        } catch (err: unknown) {
          toastError('Action Failed', getApiErrorMessage(err, 'Error responding to cancellation request.'));
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
            applyBookingAction({ id: je.id, hidden: true });
            success('Removed', 'Record removed from your activity list.');
          } else {
            toastError('Remove Failed', res.message || 'Failed to remove record.');
          }
        } catch (err: unknown) {
          toastError('Remove Failed', getApiErrorMessage(err, 'Error removing record.'));
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
    if (!respondingReqId || declineNote.trim().length < 3 || loadingItemId) return;
    setLoadingItemId(respondingReqId);
    setLoadingActionType('decline_cancellation');
    try {
      const res = await apiRespondCancellationRequest(respondingReqId, false, declineNote);
      if (res.success) {
        if (res.data?.booking) applyBookingAction({ id: res.data.booking.id, ...res.data });
        info('Cancellation Declined', 'The seeker has been notified and may escalate to admin.');
        setRespondingReqId(null);
        setDeclineNote('');
      } else {
        toastError('Action Failed', res.message || 'Failed to decline cancellation.');
      }
    } catch (err: unknown) {
      toastError('Action Failed', getApiErrorMessage(err, 'Error declining cancellation.'));
    } finally {
      setLoadingItemId(null);
      setLoadingActionType(null);
    }
  };


  return (
    <div className={`workspace-page workspace-activity-view space-y-5 transition-colors duration-200 ${isDark ? 'text-white' : 'text-ink'}`}>



      {!openItemId && <ProviderWorkloadPanel
        onOpen={(id) => openItem(id, 'booking')}
        onStart={(id) => { void handleProviderStartJob(id); }}
        startingBookingId={loadingActionType === 'start' ? loadingItemId : null}
        isDark={isDark}
      />}

      {!openItemId && <ProviderActivityTabs
        activeTab={activeTab}
        isDark={isDark}
        countTabItems={countTabItems}
        onTabChange={handleTabChange}
      />}

      <ProviderActivityList
        model={{
          myOffers, myEngagements, isDark, searchQuery, setSearchQuery,
          sortBy, setSortBy, isLoading, engagementsStatus, retryBooking: refreshEngagements, filteredItems, activeTab, router,
          paginatedItems, getRequestForBid, getCategoryForEngagement,
          loadingItemId, loadingActionType, highlightedBookingId,
          handleCancelOffer, handleApproveCancellation, handleDeleteClick,
          handleProviderStartJob, handleRequestJobApproval, handleCompletionEscalation,
          handleProviderRemoveFromQueue, handleEscalateCancellation, setRespondingReqId, setDeclineNote,
          activeJobId,
          setReviewingEngagement, openSafetyReport: setReportingEngagement, resolvedProviderId, user, currentPage,
          totalPages, goToPage, nextPage, prevPage, startIndex, endIndex,
          openItemId, openItem, closeItem
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

      <SafetyReportModal
        engagement={reportingEngagement}
        targetRole="seeker"
        isDark={isDark}
        onClose={() => setReportingEngagement(null)}
        onSubmitted={(created) => {
          if (created) success('Report submitted', 'Your private safety report was sent to an administrator.');
          else info('Report already received', 'This same incident is already in the moderation queue.');
        }}
      />

      <ProviderBookingCancellationModal
        booking={cancelingBooking}
        value={cancelReason}
        onChange={setCancelReason}
        onClose={() => { if (!loadingItemId) { setCancelingBookingId(null); setCancelReason(''); } }}
        onSubmit={submitProviderCancellation}
        isSubmitting={loadingItemId === cancelingBookingId && loadingActionType === 'remove'}
      />

      {/* Review Modal for Rating Clients */}
      {reviewingEngagement && (() => {
        const existingReview = reviewingEngagement.reviews?.find((review) => review.authorId === (resolvedProviderId || user?.id));
        return (
          <ReviewModal
            isOpen={!!reviewingEngagement}
            onClose={() => setReviewingEngagement(null)}
            onSubmit={handleReviewSubmit}
            targetName={reviewingEngagement.seekerName}
            targetRole="seeker"
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
