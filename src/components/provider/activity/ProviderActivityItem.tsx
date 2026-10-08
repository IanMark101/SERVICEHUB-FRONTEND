"use client";

import ActivityDetailLayout, { ActivityDetailActions } from '../../activity/ActivityDetailLayout';
import ActivityDetailSituation from '../../activity/ActivityDetailSituation';
import ActivityFacts, { formatActivityDuration } from '../../activity/ActivityFacts';
import OfferProgressHistory from '../../activity/OfferProgressHistory';
import {
  Warning as AlertTriangle,
  CircleNotch as Loader2,
  ChatCircle as MessageSquare,
  Play,
  Trash as Trash2,
} from '@phosphor-icons/react';
import LifecycleStepper from '../../ui/LifecycleStepper';
import BookingProgressHistory from '../../activity/BookingProgressHistory';
import type { Dispatch, SetStateAction } from 'react';
import type { JobEngagement, JobRequest } from '../../../types';
import type { UserSession } from '../../auth/LoginContainer';
import type { ProviderActivityItemData } from './providerActivity.utils';
import ActivityWorkroomSituation from '../../activity/ActivityWorkroomSituation';
import { bookingOutcomeLabels, getBookingOutcome } from '../../../lib/bookingOutcome';
import ActivityBookingFacts from '../../activity/ActivityBookingFacts';
import ActivityCancellationPanel from '../../activity/ActivityCancellationPanel';
import { getPaidStartBlockReason } from '../../activity/paidStartReadiness';
import { isOfferClosed, offerSituation } from '../../../lib/offerStatus';

export interface ProviderActivityItemModel {
  isDark: boolean;
  getRequestForBid: (requestId: string) => JobRequest | undefined;
  getCategoryForEngagement: (engagement: JobEngagement) => string;
  loadingItemId: string | null;
  loadingActionType: string | null;
  highlightedBookingId: string | null;
  handleCancelOffer: (id: string) => void;
  handleApproveCancellation: (id: string) => void;
  handleDeleteClick: (engagement: JobEngagement) => void;
  handleProviderStartJob: (id: string) => void;
  handleRequestJobApproval: (id: string) => void;
  handleCompletionEscalation: (id: string) => void;
  handleProviderRemoveFromQueue: (id: string) => void;
  handleEscalateCancellation: (id: string) => void;
  router: { push: (href: string) => void };
  setRespondingReqId: Dispatch<SetStateAction<string | null>>;
  setDeclineNote: Dispatch<SetStateAction<string>>;
  setReviewingEngagement: Dispatch<SetStateAction<JobEngagement | null>>;
  openSafetyReport: (engagement: JobEngagement) => void;
  resolvedProviderId?: string;
  user: UserSession | null;
  activeJobId?: string;
  paidWaiting?: boolean;
}

export default function ProviderActivityItem({ item, model }: { item: ProviderActivityItemData; model: ProviderActivityItemModel }) {
  const {
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
    user,
    activeJobId,
    paidWaiting,
    openSafetyReport
  } = model;

  if (item.type === 'bid') {
    const b = item.data;
    const situation = offerSituation(b);
    const req = getRequestForBid(b.requestId);
    const closed = isOfferClosed(b);
    const seekerId = req?.seekerId || b.seekerId;
    const seekerName = req?.seekerName || b.seekerName || 'Seeker';
    const formattedDate = new Date(b.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    return (
      <ActivityDetailLayout
        id={`offer-${b.id}`} role="provider" isDark={isDark}
        title={req?.title || b.requestTitle || 'Service Request'}
        category={req?.category || b.category || 'General'} date={formattedDate} closed={closed}
        participant={{ name: seekerName, avatar: b.seekerAvatar || req?.seekerAvatar, trustScore: b.seekerTrustScore ?? req?.seekerTrustScore }}
        onOpenProfile={seekerId ? () => router.push(`/profile/${encodeURIComponent(seekerId)}`) : undefined}
        facts={<ActivityFacts title="Offer details" label="Offer facts" rows={[
          { label: 'Seeker', value: seekerName },
          { label: 'Your offer', value: <span className={closed ? '' : 'text-emerald-700 dark:text-emerald-400'}>₱{b.price}</span> },
          { label: 'Estimated duration', value: formatActivityDuration(b.estimatedDuration) },
          ...(b.availability?.trim() ? [{ label: 'Your availability', value: b.availability }] : []),
          { label: 'Booking', value: 'No booking created', detail: 'This is an offer on a service request, not a confirmed booking.' },
        ]} />}
        journeyLabel="Offer journey" journey={<OfferProgressHistory offer={b} />}
      >
        <ActivityDetailSituation situation={situation} role="provider" closed={closed}
          action={closed ? 'No action needed for this offer.' : situation.canWithdraw ? 'No required action. You can withdraw this offer below while it awaits a decision.' : 'No required action right now.'} />
        <ActivityDetailActions title="Offer actions">
          <span className={`rounded-lg border px-2.5 py-1.5 text-[10px] font-bold ${closed
            ? 'border-stone-300 bg-stone-100 text-ink-secondary dark:border-neutral-700 dark:bg-charcoal dark:text-ink'
            : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-400'}`}>{situation.label}</span>
          {situation.canWithdraw && <button
            disabled={!!loadingItemId} onClick={() => handleCancelOffer(b.id)}
            className="flex items-center justify-center gap-1 rounded-xl border border-stone-300 px-3 py-1.5 text-[10px] font-bold text-ink-secondary transition-colors hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-700 dark:text-ink dark:hover:bg-charcoal-hover"
          >
            {loadingItemId === b.id && loadingActionType === 'cancel_offer' ? <><Loader2 className="h-3 w-3 animate-spin" /><span>Cancelling...</span></> : <span>Withdraw Offer</span>}
          </button>}
        </ActivityDetailActions>
      </ActivityDetailLayout>
    );
  }
  const je: JobEngagement = item.data;
  const paidStartBlockedReason = je.status === 'queued' ? getPaidStartBlockReason(je, activeJobId) : null;
  const formattedDate = new Date(je.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <ActivityDetailLayout
      id={`booking-${je.id}`} role="provider" isDark={isDark}
      title={je.title} category={je.category || getCategoryForEngagement(je)} date={formattedDate}
      closed={je.status === 'canceled'} highlighted={je.id === highlightedBookingId}
      participant={{ name: je.seekerName, avatar: je.seekerAvatar, trustScore: je.seekerTrustScore }}
      onOpenProfile={je.seekerId ? () => router.push(`/profile/${encodeURIComponent(je.seekerId)}`) : undefined}
      facts={<ActivityBookingFacts booking={je} role="provider" />}
      journey={<>
        <LifecycleStepper status={je.status} closedLabel={bookingOutcomeLabels[getBookingOutcome(je) || 'canceled']} role="provider" queuePosition={je.queuePosition} isDark={isDark} isOnline={je.paymentMethod === 'GCash'} started={je.started} compact />
        <BookingProgressHistory booking={je} />
      </>}
    >
      <ActivityWorkroomSituation booking={je} role="provider" currentUserId={resolvedProviderId || user?.id} activeJobId={activeJobId} paidWaiting={paidWaiting} />

      {/* Dispute note inside card */}
      {je.status === 'disputed' && je.disputeReason && (
        <div className={`border rounded-xl p-3 text-[10px] flex items-start space-x-2 ${isDark ? 'bg-red-950/15 border-red-900/30 text-red-400' : 'bg-red-50/50 border-red-100 text-red-700'
          }`}>
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>Disputed by Seeker: &quot;{je.disputeReason}&quot;</span>
        </div>
      )}

      <ActivityCancellationPanel booking={je} role="provider" currentUserId={resolvedProviderId || user?.id} loadingItemId={loadingItemId} loadingActionType={loadingActionType} onApprove={handleApproveCancellation} onDecline={(id) => { setRespondingReqId(id); setDeclineNote(''); }} onEscalate={handleEscalateCancellation} />

      {/* Footer Rate and Actions */}
      <ActivityDetailActions>

          {/* Status badge */}
          {je.status === 'in_progress' && (
            <span className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border flex items-center ${isDark ? 'bg-emerald-950/15 border-emerald-900/30 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-600'
              }`}>
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse" />
              Active
            </span>
          )}
          {je.status === 'queued' && (
            <span className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border ${isDark ? 'text-amber-400 bg-amber-950/20 border-amber-900/30' : 'text-amber-700 bg-amber-50 border border-amber-100'
              }`}>
              {je.queuePosition === 1 ? paidStartBlockedReason ? 'Start Unavailable' : 'Ready to Start' : `Queue Position ${je.queuePosition || '—'}`}
            </span>
          )}
          {je.status === 'pending_provider' && (
            <button type="button" onClick={() => router.push('/provider/incoming-requests')} className="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-[10px] font-extrabold text-white transition-colors hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500">Review request</button>
          )}
          {je.status === 'awaiting_seeker_approval' && (
            <span className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border ${isDark ? 'text-orange-400 bg-orange-950/20 border-orange-900/30' : 'text-orange-700 bg-orange-50 border-orange-100'
              }`}>
              Awaiting Seeker
            </span>
          )}
          {je.status === 'disputed' && (
            <span className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border ${isDark ? 'text-red-400 bg-red-950/20 border-red-900/30' : 'text-red-700 bg-red-50 border-red-100'
              }`}>
              Disputed
            </span>
          )}
          {je.status === 'completed' && (() => {
            const myReview = je.reviews && je.reviews.find((review) => review.authorId === (resolvedProviderId || user?.id));
            const canEdit = myReview && myReview.editableUntil
              ? new Date() < new Date(myReview.editableUntil)
              : myReview && myReview.createdAt
              ? new Date().getTime() - new Date(myReview.createdAt).getTime() < 24 * 60 * 60 * 1000
              : false;

            return myReview ? (
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border ${
                  isDark ? 'text-emerald-400 bg-emerald-950/20 border-emerald-900/30' : 'text-emerald-700 bg-emerald-50 border-emerald-100'
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
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] rounded-xl transition-all active:scale-95 shadow-sm cursor-pointer"
              >
                Review Seeker
              </button>
            );
          })()}
          {je.status === 'canceled' && (
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border ${isDark ? 'text-ink-muted bg-charcoal-inset border-neutral-855' : 'text-ink-subtle bg-slate-100 border border-slate-200'
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
              onClick={() => router.push(`/provider/messages?booking=${je.id}`)}
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
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[10px] font-bold transition-colors ${isDark ? 'border-neutral-700 text-neutral-300 hover:border-emerald-800 hover:bg-emerald-950/20 hover:text-emerald-300' : 'border-emerald-200 text-emerald-800 hover:border-emerald-300 hover:bg-emerald-50'}`}
              title="Report a separate safety or conduct concern"
            >
              <AlertTriangle className="h-3.5 w-3.5" /> Safety report
            </button>
          )}

          {/* Action buttons */}
          {je.status === 'in_progress' && (() => {
            const isStarted = !!je.started;
            if (!isStarted) {
              return (
                <div className="flex items-center gap-1.5">
                <button
                  disabled={!!loadingItemId || !!(activeJobId && activeJobId !== je.id) || (je.paymentMethod === 'On-site Cash' && paidWaiting)}
                  onClick={() => handleProviderStartJob(je.id)}
                  title={activeJobId && activeJobId !== je.id ? 'Finish your current job before starting another' : je.paymentMethod === 'On-site Cash' && paidWaiting ? 'Start the paid bookings ahead before this cash job' : 'Start this accepted booking'}
                  className={`px-3.5 py-1.5 text-white font-extrabold text-[10px] rounded-xl transition-all shadow-sm active:scale-95 flex items-center space-x-1 cursor-pointer ${
                    (loadingItemId === je.id && loadingActionType === 'start') || (activeJobId && activeJobId !== je.id) || (je.paymentMethod === 'On-site Cash' && paidWaiting)
                      ? 'bg-charcoal text-ink-muted cursor-not-allowed opacity-60'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {loadingItemId === je.id && loadingActionType === 'start' ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      <span>Starting...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 mr-1" />
                      <span>Start Job</span>
                    </>
                  )}
                </button>
                {!je.cancellationRequests?.some((request) => ['PENDING', 'DECLINED', 'ESCALATED', 'UNDER_REVIEW'].includes(request.status)) && <button disabled={!!loadingItemId} onClick={() => handleProviderRemoveFromQueue(je.id)} className="rounded-xl border border-red-200 px-3 py-1.5 text-[10px] font-bold text-red-600">Cancel Booking</button>}
                </div>
              );
            }
            return (
              <div className="flex items-center gap-1.5">
              <button
                disabled={!!loadingItemId}
                data-action="finish"
                onClick={() => handleRequestJobApproval(je.id)}
                className={`px-3.5 py-1.5 text-white font-extrabold text-[10px] rounded-xl transition-all shadow-sm active:scale-95 flex items-center justify-center space-x-1 cursor-pointer ${
                  loadingItemId === je.id && loadingActionType === 'complete'
                    ? 'bg-charcoal text-ink-muted cursor-not-allowed opacity-60'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {loadingItemId === je.id && loadingActionType === 'complete' ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Mark Work Finished</span>
                )}
              </button>
              {!je.cancellationRequests?.some((request) => ['PENDING', 'DECLINED', 'ESCALATED', 'UNDER_REVIEW'].includes(request.status)) && <button disabled={!!loadingItemId} onClick={() => handleProviderRemoveFromQueue(je.id)} className="rounded-xl border border-red-200 px-3 py-1.5 text-[10px] font-bold text-red-600">Request Cancellation</button>}
              </div>
            );
          })()}

          {je.status === 'awaiting_seeker_approval' && (
            <button
              disabled={!!loadingItemId}
              data-action="admin-review"
              onClick={() => handleCompletionEscalation(je.id)}
              className="px-3.5 py-1.5 font-extrabold rounded-xl transition-all shadow-sm flex items-center justify-center space-x-1 cursor-pointer"
              title="Available after 72 hours without seeker confirmation"
            >
              {loadingItemId === je.id && loadingActionType === 'completion_escalation' ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Request Admin Review</span>
              )}
            </button>
          )}

          {je.status === 'queued' && (
            <div className="flex items-center space-x-1.5">
              <button
                disabled={!!loadingItemId || !!paidStartBlockedReason}
                onClick={() => {
                  if (!paidStartBlockedReason) handleProviderStartJob(je.id);
                }}
                title={paidStartBlockedReason || 'Start the next paid job in your workload'}
                className={`px-3.5 py-1.5 text-white font-extrabold text-[10px] rounded-xl transition-all shadow-sm active:scale-95 flex items-center space-x-1 cursor-pointer ${
                  (loadingItemId === je.id && loadingActionType === 'start') || paidStartBlockedReason
                    ? 'bg-charcoal text-ink-muted cursor-not-allowed opacity-60'
                    : je.queuePosition !== 1
                      ? 'bg-charcoal text-ink-subtle cursor-not-allowed opacity-60 shadow-none active:scale-100'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {loadingItemId === je.id && loadingActionType === 'start' ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    <span>Starting...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 mr-1" />
                    <span>{je.queuePosition === 1 ? 'Start' : 'Waiting'}</span>
                  </>
                )}
              </button>
              <button
                disabled={!!loadingItemId}
                onClick={() => handleProviderRemoveFromQueue(je.id)}
                className={`px-3 py-1.5 border font-bold text-[10px] rounded-xl transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                  loadingItemId === je.id && loadingActionType === 'remove'
                    ? 'bg-charcoal-inset border-neutral-800 text-ink-muted cursor-not-allowed opacity-60'
                    : isDark
                      ? 'border-neutral-800 hover:bg-red-950/20 hover:text-red-400 hover:border-red-900/30 text-ink-muted'
                      : 'border-slate-200 text-ink-muted hover:bg-slate-50 border-slate-200'
                }`}
              >
                {loadingItemId === je.id && loadingActionType === 'remove' ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    <span>Canceling...</span>
                  </>
                ) : (
                  <span>Cancel Booking</span>
                )}
              </button>
            </div>
          )}

        </ActivityDetailActions>

    </ActivityDetailLayout>
  );
}
