"use client";

import TrustScoreBadge from '../../ui/TrustScoreBadge';
import {
  Warning as AlertTriangle,
  CircleNotch as Loader2,
  ChatCircle as MessageSquare,
  Play,
  Trash as Trash2,
  FolderSimple,
  CalendarBlank,
} from '@phosphor-icons/react';
import LifecycleStepper from '../../ui/LifecycleStepper';
import type { Dispatch, SetStateAction } from 'react';
import type { JobEngagement, JobRequest } from '../../../types';
import type { UserSession } from '../../auth/LoginContainer';
import type { ProviderActivityItemData } from './providerActivity.utils';
import ActivityWorkroomSituation from '../../activity/ActivityWorkroomSituation';
import { bookingOutcomeLabels, getBookingOutcome } from '../../../lib/bookingOutcome';
import { canOpenBookingConversation, canReportBookingSafety, getEngagementBookingId } from '../../../lib/bookingActions';
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
                const formattedDate = new Date(b.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });

                return (
                  <div
                    key={b.id}
                    className={`workspace-card workspace-activity-card flex flex-col justify-between space-y-4 border border-orange-500/20 transition-colors duration-200 ${isDark ? 'bg-[#22211e] border-neutral-800/80 hover:border-neutral-700' : 'bg-white border-slate-300 hover:shadow-md'
                      }`}
                  >
                    {/* Top line: Category and Date */}
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                      <span className="text-orange-500 dark:text-orange-400">
                        <span className="inline-flex items-center gap-1"><FolderSimple className="h-3.5 w-3.5" weight="duotone" /> {req?.category || b.category || 'General'}</span>
                      </span>
                      <span className={isDark ? 'text-ink-muted' : 'text-ink-subtle'}>
                        <span className="inline-flex items-center gap-1"><CalendarBlank className="h-3.5 w-3.5" weight="duotone" /> {formattedDate}</span>
                      </span>
                    </div>

                    {/* Title & Info */}
                    <div className="space-y-2 border-b border-stone-200 pb-5 dark:border-neutral-700">
                      <h3 className={`text-xl font-extrabold leading-snug tracking-tight sm:text-2xl ${isDark ? 'text-white' : 'text-ink'}`}>
                        {req?.title || b.requestTitle || 'Service Request'}
                      </h3>
                      <button type="button" onClick={() => {
                        if (req?.seekerId) router.push(`/profile/${encodeURIComponent(req.seekerId)}`);
                      }} className="group/profile flex flex-wrap items-center gap-y-2 rounded-lg text-left text-[11px] font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500" aria-label={`View ${req?.seekerName || b.seekerName || 'seeker'} profile`}>
                        <span className={isDark ? 'text-ink-muted' : 'text-ink-subtle'}>Client:</span>
                        <span className={`ml-1 transition-colors group-hover/profile:text-emerald-600 dark:group-hover/profile:text-emerald-400 ${isDark ? 'text-white' : 'text-ink-secondary'}`}>{req?.seekerName || b.seekerName || 'Seeker'}</span>
                      </button>
                    </div>

                    <section aria-label="Current offer situation" className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-ink dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-ink">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="text-base font-bold leading-snug tracking-tight">{situation.title}</h4>
                        <span className="rounded-full border border-current/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide">{situation.label}</span>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed">{situation.detail}</p>
                      <p className="mt-3 border-t border-current/15 pt-2.5 text-xs leading-relaxed"><span className="font-bold">Next:</span> {situation.next}</p>
                      {b.availability && <p className="mt-2 text-xs leading-relaxed"><strong>Availability:</strong> {b.availability}</p>}
                    </section>

                    {/* Footer Rate and Actions */}
                    <div className={`border-t pt-4 flex flex-wrap items-center justify-between gap-3 ${isDark ? 'border-neutral-850' : 'border-slate-100'}`}>
                      <div>
                        <span className={`text-[9px] font-bold uppercase tracking-wider block ${isDark ? 'text-ink-muted' : 'text-ink-subtle'}`}>Your offer</span>
                        <span className="text-sm font-extrabold text-orange-500 dark:text-orange-400">₱{b.price}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border ${isOfferClosed(b) ? 'border-stone-300 bg-stone-100 text-ink-secondary dark:border-neutral-700 dark:bg-neutral-800 dark:text-ink' : isDark ? 'bg-orange-950/20 text-orange-400 border-orange-900/30' : 'bg-orange-50 text-orange-700 border border-orange-100'
                          }`}>
                          {situation.label}
                        </span>
                        {situation.canWithdraw && <button
                          disabled={!!loadingItemId}
                          onClick={() => handleCancelOffer(b.id)}
                          className={`px-3 py-1.5 border font-bold text-[10px] rounded-xl transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                            loadingItemId === b.id && loadingActionType === 'cancel_offer'
                              ? 'bg-[#1c1b18] border-neutral-800 text-ink-muted cursor-not-allowed opacity-60'
                              : isDark
                                ? 'border-neutral-800 hover:bg-[#2c2b27] text-ink-muted'
                                : 'border-slate-300 hover:bg-slate-50 text-ink-muted'
                          }`}
                        >
                          {loadingItemId === b.id && loadingActionType === 'cancel_offer' ? (
                            <>
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              <span>Cancelling...</span>
                            </>
                          ) : (
                            <span>Withdraw Offer</span>
                          )}
                        </button>}
                      </div>
                    </div>
                  </div>
                );
              } else {
                const je: JobEngagement = item.data;
                const paidStartBlockedReason = je.status === 'queued' ? getPaidStartBlockReason(je, activeJobId) : null;
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
                        ? 'border-emerald-500/60 bg-emerald-50/40 ring-2 ring-emerald-500/25 dark:bg-emerald-950/10'
                        : isDark
                          ? 'bg-[#22211e] border-neutral-800/80 hover:border-neutral-700'
                          : 'bg-white border-slate-300 hover:shadow-md'
                    }`}
                  >
                    {/* Top line: Category and Date */}
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                      <span className={je.status === 'canceled' ? 'text-ink-muted dark:text-ink-secondary' : 'text-emerald-500 dark:text-emerald-400'}>
                        <span className="inline-flex items-center gap-1"><FolderSimple className="h-3.5 w-3.5" weight="duotone" /> {getCategoryForEngagement(je)}</span>
                      </span>
                      <span className={isDark ? 'text-ink-muted' : 'text-ink-subtle'}>
                        <span className="inline-flex items-center gap-1"><CalendarBlank className="h-3.5 w-3.5" weight="duotone" /> {formattedDate}</span>
                      </span>
                    </div>

                    {/* Title & Info */}
                    <div className="space-y-2">
                      <h3 className={`font-extrabold text-xl sm:text-2xl leading-snug tracking-tight ${isDark ? 'text-white' : 'text-ink'}`}>
                        {je.title}
                      </h3>
                      <button type="button" onClick={() => je.seekerId && router.push(`/profile/${encodeURIComponent(je.seekerId)}`)} className="group/profile flex items-center rounded-lg text-left text-[11px] font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500" aria-label={`View ${je.seekerName}'s profile`}>
                        <span className={isDark ? 'text-ink-muted' : 'text-ink-subtle'}>Client:</span>
                        <span className={`ml-1 transition-colors group-hover/profile:text-emerald-600 dark:group-hover/profile:text-emerald-400 ${isDark ? 'text-white' : 'text-ink-secondary'}`}>{je.seekerName}</span>
                        {typeof je.seekerTrustScore === 'number' && <><span className="mx-1.5 text-slate-300 dark:text-charcoal">•</span><TrustScoreBadge score={je.seekerTrustScore} /></>}
                      </button>
                    </div>

                    <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(19rem,0.85fr)] xl:gap-7">
                      <div className="min-w-0 space-y-4">
                    <ActivityWorkroomSituation booking={je} role="provider" currentUserId={resolvedProviderId || user?.id} activeJobId={activeJobId} paidWaiting={paidWaiting} />

                    {/* Dispute note inside card */}
                    {je.status === 'disputed' && je.disputeReason && (
                      <div className={`border rounded-xl p-3 text-[10px] flex items-start space-x-2 ${isDark ? 'bg-red-950/15 border-red-900/30 text-red-400' : 'bg-red-50/50 border-red-100 text-red-700'
                        }`}>
                        <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                        <span>Disputed by Client: &quot;{je.disputeReason}&quot;</span>
                      </div>
                    )}

                    <ActivityCancellationPanel booking={je} role="provider" currentUserId={resolvedProviderId || user?.id} loadingItemId={loadingItemId} loadingActionType={loadingActionType} onApprove={handleApproveCancellation} onDecline={(id) => { setRespondingReqId(id); setDeclineNote(''); }} onEscalate={handleEscalateCancellation} />

                    {/* Footer Rate and Actions */}
                    <div aria-label="Booking actions" className={`booking-actions flex flex-wrap items-center justify-start gap-3 rounded-2xl border p-3 sm:p-4 [&_button]:min-h-11 ${isDark ? 'border-neutral-700 bg-neutral-800/30' : 'border-stone-200 bg-stone-50/70'}`}>
                      <p className="w-full text-xs font-bold text-ink-secondary dark:text-ink">Booking actions</p>
                      <div className="booking-actions__row">

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
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] rounded-xl transition-all active:scale-95 shadow-sm cursor-pointer"
                            >
                              Review Client
                            </button>
                          );
                        })()}
                        {je.status === 'canceled' && (
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border ${isDark ? 'text-ink-muted bg-[#1c1b18] border-neutral-855' : 'text-ink-subtle bg-slate-100 border border-slate-200'
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
                            onClick={() => router.push(`/provider/messages?booking=${getEngagementBookingId(je)}`)}
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
                                    ? 'bg-neutral-800 text-ink-muted cursor-not-allowed opacity-60'
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
                                  ? 'bg-neutral-800 text-ink-muted cursor-not-allowed opacity-60'
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
                                  ? 'bg-neutral-800 text-ink-muted cursor-not-allowed opacity-60'
                                  : je.queuePosition !== 1
                                    ? 'bg-neutral-700 text-ink-subtle cursor-not-allowed opacity-60 shadow-none active:scale-100'
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
                                  ? 'bg-[#1c1b18] border-neutral-800 text-ink-muted cursor-not-allowed opacity-60'
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

                      </div>
                    </div>
                      </div>

                      <aside className="min-w-0 xl:col-start-2 xl:row-span-2 xl:row-start-1 xl:border-l xl:border-stone-200 xl:pl-7 dark:xl:border-neutral-700">
                    <ActivityBookingFacts booking={je} role="provider" />
                      </aside>
                    <details className="group min-w-0 self-start rounded-2xl border border-stone-200 px-4 py-3 dark:border-neutral-700 xl:col-start-1 xl:row-start-2" open={je.status !== 'completed' && je.status !== 'canceled'}>
                      <summary className="cursor-pointer text-xs font-bold text-ink-secondary focus-visible:outline-2 focus-visible:outline-emerald-500 dark:text-ink">Booking journey</summary>
                      <LifecycleStepper status={je.status} closedLabel={bookingOutcomeLabels[getBookingOutcome(je) || 'canceled']} role="provider" queuePosition={je.queuePosition} isDark={isDark} isOnline={je.paymentMethod === 'GCash'} started={je.started} compact />
                    </details>
                    </div>
                  </div>
                );
              }
}
