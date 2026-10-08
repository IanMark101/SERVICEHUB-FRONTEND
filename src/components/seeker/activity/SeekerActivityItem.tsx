"use client";
import ActivityDetailLayout, { ActivityDetailActions } from '../../activity/ActivityDetailLayout';
import {
  WarningCircle as AlertCircle,
  Warning as AlertTriangle,
  CircleNotch as Loader2,
  ChatCircle as MessageSquare,
  ArrowCounterClockwise as RotateCcw,
  Trash as Trash2,
} from '@phosphor-icons/react';
import LifecycleStepper from '../../ui/LifecycleStepper';
import BookingProgressHistory from '../../activity/BookingProgressHistory';
import type { Dispatch, SetStateAction } from 'react';
import type { JobEngagement } from '../../../types';
import type { ConfirmModalState } from '../../ui/ConfirmModal';
import ActivityWorkroomSituation from '../../activity/ActivityWorkroomSituation';
import { bookingOutcomeLabels, getBookingOutcome } from '../../../lib/bookingOutcome';
import ActivityBookingFacts from '../../activity/ActivityBookingFacts';
import ActivityCancellationPanel from '../../activity/ActivityCancellationPanel';

export interface SeekerActivityItemModel {
  isDark: boolean;
  highlightedBookingId: string | null;
  getCategoryForEngagement: (engagement: JobEngagement) => string;
  currentUserId?: string;
  loadingItemId: string | null;
  loadingActionType: string | null;
  setReviewingEngagement: Dispatch<SetStateAction<JobEngagement | null>>;
  handleDeleteClick: (engagement: JobEngagement) => void;
  router: { push: (href: string) => void };
  setDisputingJob: Dispatch<SetStateAction<JobEngagement | null>>;
  setConfirmModal: Dispatch<SetStateAction<ConfirmModalState | null>>;
  handleConfirmJobCompletion: (id: string) => void;
  handleEscalateClick: (id: string) => void;
  handleCancelClick: (engagement: JobEngagement) => void;
  handleRespondCancellation: (id: string, approve: boolean, note?: string) => void;
  handleRequestAgain: (engagement: JobEngagement) => void;
  openSafetyReport: (engagement: JobEngagement) => void;
}

export default function SeekerActivityItem({ engagement: je, model }: { engagement: JobEngagement; model: SeekerActivityItemModel }) {
  const {
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
    handleRequestAgain,
    openSafetyReport
  } = model;

  const formattedDate = new Date(je.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <ActivityDetailLayout
      id={`booking-${je.id}`} role="seeker" isDark={isDark}
      title={je.title} category={je.category || getCategoryForEngagement(je)} date={formattedDate}
      closed={je.status === 'canceled'} highlighted={je.id === highlightedBookingId}
      participant={{ name: je.providerName, avatar: je.providerAvatar, trustScore: je.providerTrustScore }}
      onOpenProfile={je.providerId ? () => router.push(`/profile/${encodeURIComponent(je.providerId)}`) : undefined}
      facts={<ActivityBookingFacts booking={je} role="seeker" />}
      journey={<>
        <LifecycleStepper status={je.status} closedLabel={bookingOutcomeLabels[getBookingOutcome(je) || 'canceled']} role="seeker" queuePosition={je.queuePosition} isDark={isDark} isOnline={je.paymentMethod === 'GCash'} started={je.started} compact />
        <BookingProgressHistory booking={je} />
      </>}
    >
      <ActivityWorkroomSituation booking={je} role="seeker" currentUserId={currentUserId} />

      {/* Dispute note inside card */}
      {je.status === 'disputed' && je.disputeReason && (
        <div className={`border rounded-xl p-3 text-[10px] flex items-start space-x-2 ${isDark ? 'bg-red-950/15 border-red-900/30 text-red-400' : 'bg-red-50/50 border-red-200 text-red-800'
          }`}>
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>Dispute Filed: &quot;{je.disputeReason}&quot; (Awaiting Moderator review)</span>
        </div>
      )}

      <ActivityCancellationPanel booking={je} role="seeker" currentUserId={currentUserId} loadingItemId={loadingItemId} loadingActionType={loadingActionType} onApprove={(id) => handleRespondCancellation(id, true)} onDecline={(id) => handleRespondCancellation(id, false)} onEscalate={handleEscalateClick} />

      {/* Footer details & Context Actions */}
       <ActivityDetailActions>

          {/* Status Pills */}
          {je.status === 'in_progress' && (
            <span className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border flex items-center ${isDark ? 'bg-emerald-950/15 border-emerald-900/30 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-600'
              }`}>
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse" />
              In Progress
            </span>
          )}

          {je.status === 'queued' && (
            <span className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border ${isDark ? 'text-amber-400 bg-amber-950/20 border-amber-900/30' : 'text-amber-700 bg-amber-50 border border-amber-100'
              }`}>
              {je.queuePosition === 1 ? 'First in Queue' : `Queue Position ${je.queuePosition || '—'}`}
            </span>
          )}

          {je.status === 'pending_provider' && (
            <span className={`text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border ${isDark ? 'bg-charcoal-inset border-neutral-850 text-ink-muted' : 'bg-slate-50 border-slate-200 text-ink-subtle'
              }`}>
              Awaiting Accept
            </span>
          )}

          {je.status === 'completed' && (() => {
            const myReview = je.reviews && je.reviews.find((review) => review.authorId === currentUserId);
            const canEdit = myReview && myReview.editableUntil
              ? new Date() < new Date(myReview.editableUntil)
              : myReview && myReview.createdAt
              ? new Date().getTime() - new Date(myReview.createdAt).getTime() < 24 * 60 * 60 * 1000
              : false;

            return myReview ? (
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border ${isDark ? 'text-emerald-400 bg-emerald-950/15 border-emerald-900/30' : 'text-emerald-700 bg-emerald-50 border-emerald-100'
                  }`}>
                  ✓ Reviewed ({myReview.rating}★)
                </span>
                {canEdit && (
                  <button
                    onClick={() => setReviewingEngagement(je)}
                    className={`px-2.5 py-1.5 text-[10px] font-bold rounded-lg border transition-all hover:opacity-80 active:scale-95 cursor-pointer ${
                      isDark ? 'bg-charcoal border-neutral-700 text-neutral-300' : 'bg-slate-100 border-slate-200 text-ink-secondary'
                    }`}
                    title="Edit review (available within 24 hours of posting)"
                  >
                    Edit (24h)
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => setReviewingEngagement(je)}
                className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-[10px] rounded-xl transition-all active:scale-95 shadow-sm cursor-pointer"
              >
                Leave Review
              </button>
            );
          })()}

          {je.status === 'completed' && je.repostRequestId && (
            <button
              type="button"
              onClick={() => router.push(`/seeker/post-request?repost=${encodeURIComponent(je.repostRequestId!)}`)}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-3.5 text-sm font-semibold text-orange-800 transition-colors hover:bg-orange-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-200"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" /> Repost request
            </button>
          )}

          {je.status === 'completed' && je.serviceId && (
            <button
              type="button"
              onClick={() => handleRequestAgain(je)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-orange-200 bg-orange-50 px-3.5 py-1.5 text-[10px] font-extrabold text-orange-700 transition-colors hover:bg-orange-100 dark:border-orange-900/30 dark:bg-orange-950/20 dark:text-orange-400"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Request Again
            </button>
          )}

          {je.status === 'canceled' && (
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border ${isDark ? 'text-ink-muted bg-charcoal-inset border-neutral-855' : 'text-ink-subtle bg-slate-100 border border-slate-200'
                }`}>
                {bookingOutcomeLabels[getBookingOutcome(je) || 'canceled']}
              </span>
              <button
                onClick={() => handleDeleteClick(je)}
                className={`p-2 border rounded-xl flex items-center justify-center cursor-pointer transition-colors ${
                  isDark
                    ? 'border-neutral-800 hover:bg-red-950/20 hover:text-red-400 hover:border-red-900/30 text-ink-muted'
                    : 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-300'
                }`}
                title="Remove from activity view"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Open Conversation — accessible on all non-pending booking statuses */}
          {je.status !== 'pending_provider' && (
            <button
              onClick={() => router.push(`/seeker/messages?booking=${je.id}`)}
              className={`p-2 border rounded-xl flex items-center justify-center cursor-pointer transition-colors ${isDark ? 'border-neutral-800 hover:bg-charcoal text-white' : 'border-slate-300 hover:bg-slate-50 text-ink-secondary'
              }`}
              aria-label="Open Conversation"
              title="Open Conversation"
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </button>
          )}

          {['queued', 'in_progress', 'awaiting_seeker_approval', 'disputed', 'completed', 'canceled'].includes(je.status) && (
            <button
              type="button"
              onClick={() => openSafetyReport(je)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[10px] font-bold transition-colors ${isDark ? 'border-neutral-700 text-neutral-300 hover:border-orange-800 hover:bg-orange-950/20 hover:text-orange-300' : 'border-orange-200 text-orange-800 hover:border-orange-300 hover:bg-orange-50'}`}
              title="Report a separate safety or conduct concern"
            >
              <AlertTriangle className="h-3.5 w-3.5" /> Safety report
            </button>
          )}

          {/* Explicit Action Triggers */}
          {je.status === 'awaiting_seeker_approval' && (
            <div className="booking-completion">
              <p className="booking-completion__notice">
                {je.paymentMethod !== 'On-site Cash'
                  ? 'Confirming completion is final. ServiceHub updates the GCash Test Mode payment record; it does not perform a real provider payout.'
                  : 'Please ensure you pay the provider the agreed cash amount on-site. Confirming completes the transaction.'}
              </p>
              <div className="booking-completion__buttons">
                <button
                  type="button"
                  disabled={!!loadingItemId}
                  onClick={() => setDisputingJob(je)}
                  className={`px-3 py-1.5 border font-bold text-[10px] rounded-xl transition-all cursor-pointer ${isDark
                      ? 'border-neutral-800 hover:bg-red-950/20 hover:text-red-400 hover:border-red-900/30 text-ink-muted'
                      : 'border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300'
                    }`}
                >
                  Report Issue
                </button>
                <button
                  type="button"
                  data-action="complete"
                  disabled={!!loadingItemId}
                  onClick={() => {
                    const isOnline = je.paymentMethod !== 'On-site Cash';
                    setConfirmModal({
                      isOpen: true,
                      title: isOnline ? 'Confirm Online Booking Completion' : 'Complete Transaction',
                      message: isOnline
                        ? 'Confirm that the work is complete? ServiceHub will update the GCash Test Mode payment record. It does not perform a real provider payout, and this action is final.'
                        : 'Have you paid the provider on-site and want to complete this transaction?',
                      confirmText: isOnline ? 'Confirm Completion' : 'Complete Transaction',
                      cancelText: 'Cancel',
                      variant: 'warning',
                      onConfirm: async () => {
                        setConfirmModal((prev) => prev ? { ...prev, isLoading: true } : null);
                        try {
                          await handleConfirmJobCompletion(je.id);
                        } finally {
                          setConfirmModal(null);
                        }
                      }
                    });
                  }}
                  className={`px-3.5 py-1.5 font-extrabold text-[10px] rounded-xl transition-all active:scale-95 shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer ${
                    loadingItemId === je.id && loadingActionType === 'complete'
                      ? 'bg-charcoal text-ink-muted cursor-not-allowed opacity-60'
                      : 'bg-orange-600 hover:bg-orange-700 text-white'
                  }`}
                >
                  {loadingItemId === je.id && loadingActionType === 'complete' ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      <span>{je.paymentMethod !== 'On-site Cash' ? 'Confirming...' : 'Completing...'}</span>
                    </>
                  ) : (
                    <span>{je.paymentMethod !== 'On-site Cash' ? 'Confirm Completion' : 'Complete Transaction'}</span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Cancellation Actions */}
          {['queued', 'pending_provider', 'in_progress'].includes(je.status) && (() => {
            const activeReq = je.cancellationRequests?.[0];
            // If there is an active request that is pending or escalated, do not show cancellation trigger buttons
            if (activeReq && ['PENDING', 'DECLINED', 'ESCALATED', 'UNDER_REVIEW'].includes(activeReq.status)) {
              return null;
            }

            // Otherwise, show the cancel button
            const isStarted = !!je.started;
            return (
              <button
                disabled={!!loadingItemId}
                onClick={() => handleCancelClick(je)}
                className={`px-3 py-1.5 border font-bold text-[10px] rounded-xl transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                  loadingItemId === je.id && loadingActionType === 'cancel'
                    ? 'bg-charcoal-inset border-neutral-800 text-ink-muted cursor-not-allowed opacity-60'
                    : isDark
                      ? 'border-neutral-800 hover:bg-charcoal-hover text-ink-muted'
                      : 'border-slate-300 hover:bg-slate-50 text-ink-muted'
                }`}
              >
                {loadingItemId === je.id && loadingActionType === 'cancel' ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <span>{isStarted ? "Request Cancellation" : "Cancel Booking"}</span>
                )}
              </button>
            );
          })()}

        </ActivityDetailActions>

    </ActivityDetailLayout>
  );
}
