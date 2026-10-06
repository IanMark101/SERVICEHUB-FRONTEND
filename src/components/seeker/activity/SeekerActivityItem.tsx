"use client";
import TrustScoreBadge from '../../ui/TrustScoreBadge';
import {
  WarningCircle as AlertCircle,
  Warning as AlertTriangle,
  CircleNotch as Loader2,
  ChatCircle as MessageSquare,
  ArrowCounterClockwise as RotateCcw,
  Trash as Trash2,
  FolderSimple,
  CalendarBlank,
} from '@phosphor-icons/react';
import LifecycleStepper from '../../ui/LifecycleStepper';
import type { Dispatch, SetStateAction } from 'react';
import type { JobEngagement } from '../../../types';
import type { ConfirmModalState } from '../../ui/ConfirmModal';
import UserAvatar from '../../ui/UserAvatar';
import ActivityWorkroomSituation from '../../activity/ActivityWorkroomSituation';
import { bookingOutcomeLabels, getBookingOutcome } from '../../../lib/bookingOutcome';
import { canOpenBookingConversation, canReportBookingSafety, getEngagementBookingId } from '../../../lib/bookingActions';
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

              const formattedDate = new Date(je.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });

              return (
                <div
                  key={je.id}
                  id={`booking-${je.id}`}
                  className={`workspace-card flex w-full flex-col space-y-5 rounded-2xl border p-5 transition-all duration-200 sm:p-7 ${
                    je.status === 'canceled'
                      ? 'border-stone-300 bg-white dark:border-neutral-700 dark:bg-[#22211e]'
                      : je.id === highlightedBookingId
                      ? 'border-orange-500/60 bg-orange-50/40 ring-2 ring-orange-500/25 dark:bg-orange-950/10'
                      : isDark
                        ? 'bg-[#22211e] border-neutral-800/80 hover:border-neutral-700'
                        : 'bg-white border-slate-300 hover:shadow-md'
                  }`}
                >

                  {/* Top Line: Category & Date */}
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                    <span className={je.status === 'canceled' ? 'text-ink-muted dark:text-ink-secondary' : isDark ? 'text-orange-400' : 'text-orange-600'}>
                      <span className="inline-flex items-center gap-1"><FolderSimple className="h-3.5 w-3.5" weight="duotone" /> {getCategoryForEngagement(je)}</span>
                    </span>
                    <span className={isDark ? 'text-ink-muted' : 'text-ink-subtle'}>
                      <span className="inline-flex items-center gap-1"><CalendarBlank className="h-3.5 w-3.5" weight="duotone" /> {formattedDate}</span>
                    </span>
                  </div>

                  {/* Title & Provider Info */}
                  <div className="space-y-2.5 border-b border-stone-200 pb-5 dark:border-neutral-700">
                    <h3 className={`text-xl font-extrabold leading-snug tracking-tight sm:text-2xl ${isDark ? 'text-white' : 'text-ink'}`}>
                      {je.title}
                    </h3>

                    <button type="button" onClick={() => je.providerId && router.push(`/profile/${encodeURIComponent(je.providerId)}`)} className="group/profile flex items-center space-x-2.5 rounded-lg text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500" aria-label={`View ${je.providerName}'s profile`}>
                      <UserAvatar src={je.providerAvatar} name={je.providerName || 'Provider'} alt="" size={30} role="provider" />
                      <div className="flex flex-wrap items-center gap-1 text-[11px] font-bold">
                        <span className={isDark ? 'text-ink-muted' : 'text-ink-subtle'}>Provider:</span>
                        <span className={`transition-colors group-hover/profile:text-orange-600 dark:group-hover/profile:text-orange-400 ${isDark ? 'text-white' : 'text-ink-secondary'}`}>{je.providerName}</span>
                        {typeof je.providerTrustScore === 'number' && <><span className="text-slate-300 dark:text-charcoal">•</span><TrustScoreBadge score={je.providerTrustScore} /></>}
                      </div>
                    </button>
                  </div>

                  <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(19rem,0.85fr)] xl:gap-7">
                    <div className="min-w-0 space-y-4">
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
                   <div aria-label="Booking actions" className={`booking-actions flex flex-wrap items-center justify-start gap-3 rounded-2xl border p-3 sm:p-4 [&_button]:min-h-11 ${isDark ? 'border-neutral-700 bg-neutral-800/30' : 'border-stone-200 bg-stone-50/70'}`}>
                    <p className="w-full text-xs font-bold text-ink-secondary dark:text-ink">Booking actions</p>

                    {/* Context actions */}
                    <div className="booking-actions__row">

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
                        <span className={`text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border ${isDark ? 'bg-[#1c1b18] border-neutral-850 text-ink-muted' : 'bg-slate-50 border-slate-200 text-ink-subtle'
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
                                  isDark ? 'bg-neutral-800 border-neutral-700 text-neutral-300' : 'bg-slate-100 border-slate-200 text-ink-secondary'
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
                          <span className={`text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border ${isDark ? 'text-ink-muted bg-[#1c1b18] border-neutral-855' : 'text-ink-subtle bg-slate-100 border border-slate-200'
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

                      {canOpenBookingConversation(je) && (
                        <button
                          onClick={() => router.push(`/seeker/messages?booking=${getEngagementBookingId(je)}`)}
                          className={`p-2 border rounded-xl flex items-center justify-center cursor-pointer transition-colors ${isDark ? 'border-neutral-800 hover:bg-slate-800 text-white' : 'border-slate-300 hover:bg-slate-50 text-ink-secondary'
                          }`}
                          aria-label="Open Conversation"
                          title="Open Conversation"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {canReportBookingSafety(je) && (
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
                                  ? 'bg-neutral-800 text-ink-muted cursor-not-allowed opacity-60'
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
                                ? 'bg-[#1c1b18] border-neutral-800 text-ink-muted cursor-not-allowed opacity-60'
                                : isDark
                                  ? 'border-neutral-800 hover:bg-[#2c2b27] text-ink-muted'
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

                    </div>
                  </div>
                    </div>

                    <aside className="min-w-0 xl:col-start-2 xl:row-span-2 xl:row-start-1 xl:border-l xl:border-stone-200 xl:pl-7 dark:xl:border-neutral-700">
                  <ActivityBookingFacts booking={je} role="seeker" />
                    </aside>
                  <details className="group min-w-0 self-start rounded-2xl border border-stone-200 px-4 py-3 dark:border-neutral-700 xl:col-start-1 xl:row-start-2" open={je.status !== 'completed' && je.status !== 'canceled'}>
                    <summary className="cursor-pointer text-xs font-bold text-ink-secondary focus-visible:outline-2 focus-visible:outline-orange-500 dark:text-ink">Booking journey</summary>
                    <LifecycleStepper status={je.status} closedLabel={bookingOutcomeLabels[getBookingOutcome(je) || 'canceled']} role="seeker" queuePosition={je.queuePosition} isDark={isDark} isOnline={je.paymentMethod === 'GCash'} started={je.started} compact />
                  </details>
                  </div>

                </div>
              );
}
