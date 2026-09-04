"use client";

import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  MessageSquare,
  Play,
  Send,
  Sparkles,
  Trash2,
  Wrench
} from 'lucide-react';
import LifecycleStepper from '../../ui/LifecycleStepper';
import type { JobEngagement } from '../../../types';

export default function ProviderActivityItem({ item, model }: { item: any; model: any }) {
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
    user
  } = model;

              if (item.type === 'bid') {
                const b = item.data;
                const req = getRequestForBid(b.requestId);
                const formattedDate = new Date(b.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });

                return (
                  <div
                    key={b.id}
                    className={`rounded-[24px] p-6 border shadow-sm flex flex-col justify-between space-y-4 transition-colors duration-200 border-orange-500/20 ${isDark ? 'bg-[#22211e] border-neutral-800/80 hover:border-neutral-700' : 'bg-white border-slate-300 hover:shadow-md'
                      }`}
                  >
                    {/* Top line: Category and Date */}
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                      <span className="text-orange-500 dark:text-orange-400">
                        📁 {req?.category || b.category || 'General'}
                      </span>
                      <span className={isDark ? 'text-[#b4b0a9]' : 'text-slate-400'}>
                        📅 {formattedDate}
                      </span>
                    </div>

                    {/* Title & Info */}
                    <div className="space-y-2">
                      <h3 className={`font-extrabold text-sm leading-snug tracking-tight ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
                        {req?.title || b.requestTitle || 'Service Request'}
                      </h3>
                      <div className="flex items-center text-[11px] font-bold">
                        <span className={isDark ? 'text-[#b4b0a9]' : 'text-slate-455'}>Client:</span>
                        <span className={`ml-1 ${isDark ? 'text-[#f2efe9]' : 'text-slate-700'}`}>{req?.seekerName || b.seekerName || 'Seeker'}</span>
                      </div>
                    </div>

                    {/* Footer Rate and Actions */}
                    <div className={`border-t pt-4 flex items-center justify-between ${isDark ? 'border-neutral-850' : 'border-slate-100'}`}>
                      <div>
                        <span className={`text-[9px] font-bold uppercase tracking-wider block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-455'}`}>Your Bid</span>
                        <span className="text-sm font-extrabold text-orange-500 dark:text-orange-400">₱{b.price}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border ${isDark ? 'bg-orange-955/20 text-orange-400 border-orange-900/30' : 'bg-orange-50 text-orange-655 border border-orange-100'
                          }`}>
                          Offer Sent
                        </span>
                        <button
                          disabled={!!loadingItemId}
                          onClick={() => handleCancelOffer(b.id)}
                          className={`px-3 py-1.5 border font-bold text-[10px] rounded-xl transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                            loadingItemId === b.id && loadingActionType === 'cancel_offer'
                              ? 'bg-[#1c1b18] border-neutral-800 text-neutral-500 cursor-not-allowed opacity-60'
                              : isDark
                                ? 'border-neutral-800 hover:bg-[#2c2b27] text-[#b4b0a9]'
                                : 'border-slate-300 hover:bg-slate-50 text-slate-550'
                          }`}
                        >
                          {loadingItemId === b.id && loadingActionType === 'cancel_offer' ? (
                            <>
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              <span>Cancelling...</span>
                            </>
                          ) : (
                            <span>Cancel Offer</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              } else {
                const je: JobEngagement = item.data;
                const formattedDate = new Date(je.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });
                const hasEscrow = ['in_progress', 'awaiting_seeker_approval', 'queued', 'disputed'].includes(je.status);

                return (
                  <div
                    key={je.id}
                    id={`booking-${je.id}`}
                    className={`rounded-[24px] p-6 border shadow-sm flex flex-col justify-between space-y-4 transition-all duration-500 border-emerald-500/20 ${
                      je.id === highlightedBookingId
                        ? 'ring-2 ring-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.6)] border-emerald-500 scale-[1.01]'
                        : isDark
                          ? 'bg-[#22211e] border-neutral-800/80 hover:border-neutral-700'
                          : 'bg-white border-slate-300 hover:shadow-md'
                    }`}
                  >
                    {/* Top line: Category and Date */}
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                      <span className="text-emerald-500 dark:text-emerald-400">
                        📁 {getCategoryForEngagement(je)}
                      </span>
                      <span className={isDark ? 'text-[#b4b0a9]' : 'text-slate-400'}>
                        📅 {formattedDate}
                      </span>
                    </div>

                    {/* Title & Info */}
                    <div className="space-y-2">
                      <h3 className={`font-extrabold text-sm leading-snug tracking-tight ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
                        {je.title}
                      </h3>
                      <div className="flex items-center text-[11px] font-bold">
                        <span className={isDark ? 'text-[#b4b0a9]' : 'text-slate-455'}>Client:</span>
                        <span className={`ml-1 ${isDark ? 'text-[#f2efe9]' : 'text-slate-700'}`}>{je.seekerName}</span>
                        <span className="text-slate-300 dark:text-neutral-800 mx-1.5">•</span>
                        <span className={`inline-flex items-center text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                          92% Trust
                        </span>
                      </div>
                    </div>

                    {/* 5-Step Visual Lifecycle Stepper */}
                    <LifecycleStepper
                      status={je.status}
                      role="provider"
                      queuePosition={je.queuePosition}
                      isDark={isDark}
                    />

                    {/* Escrow/Payment details banner */}
                    {hasEscrow && (
                      je.paymentMethod === 'GCash' ? (
                        <div className={`rounded-xl p-3 border text-[10px] leading-relaxed flex items-center justify-between transition-all ${isDark ? 'bg-emerald-955/15 border-emerald-900/20 text-emerald-400' : 'bg-emerald-50/40 border-emerald-100 text-emerald-700'
                          }`}>
                          <span className="font-semibold">GCash Payment Confirmed</span>
                          <span className="font-extrabold">₱{je.price} Paid Online</span>
                        </div>
                      ) : (
                        <div className={`rounded-xl p-3 border text-[10px] leading-relaxed flex items-center justify-between transition-all ${isDark ? 'bg-blue-950/15 border-blue-900/20 text-blue-400' : 'bg-blue-50/40 border-blue-100 text-blue-700'
                          }`}>
                          <span className="font-semibold">💵 On-Site Cash Payment</span>
                          <span className="font-extrabold">₱{je.price} Receivable</span>
                        </div>
                      )
                    )}

                    {/* Dispute note inside card */}
                    {je.status === 'disputed' && je.disputeReason && (
                      <div className={`border rounded-xl p-3 text-[10px] flex items-start space-x-2 ${isDark ? 'bg-red-955/15 border-red-900/30 text-red-455' : 'bg-red-50/50 border-red-100 text-red-700'
                        }`}>
                        <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                        <span>Disputed by Client: "{je.disputeReason}"</span>
                      </div>
                    )}

                    {/* Cancellation Request status inside card */}
                    {je.cancellationRequests && je.cancellationRequests.length > 0 && (() => {
                      const activeReq = je.cancellationRequests[0];
                      if (activeReq.status === 'PENDING') {
                        const requestedByProvider = activeReq.requestedBy === resolvedProviderId;
                        return (
                          <div className={`border rounded-xl p-4 text-xs flex flex-col space-y-3 ${isDark ? 'bg-orange-950/20 border-orange-900/30 text-orange-400' : 'bg-orange-50 border-orange-200 text-orange-700'
                            }`}>
                            <div className="flex items-start space-x-2">
                              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 animate-bounce" />
                              <div>
                                <span className="font-extrabold block">{requestedByProvider ? 'Your Cancellation Request' : 'Cancellation Requested by Seeker'}</span>
                                <span className="text-[10px] leading-relaxed block mt-0.5">Reason: "{activeReq.reason || 'No explanation provided'}"</span>
                              </div>
                            </div>

                            {requestedByProvider ? (
                              <p className="text-[10px] font-bold">Awaiting seeker response.</p>
                            ) : <div className="flex items-center gap-2">
                              <button
                                disabled={!!loadingItemId}
                                onClick={() => handleApproveCancellation(activeReq.id)}
                                className={`px-3 py-1.5 text-white font-extrabold text-[10px] rounded-lg transition-all active:scale-95 flex items-center justify-center space-x-1.5 cursor-pointer ${
                                  loadingItemId === activeReq.id && loadingActionType === 'approve_cancellation'
                                    ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed opacity-60'
                                    : 'bg-emerald-600 hover:bg-emerald-700'
                                }`}
                              >
                                {loadingItemId === activeReq.id && loadingActionType === 'approve_cancellation' ? (
                                  <>
                                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                    <span>Approving...</span>
                                  </>
                                ) : (
                                  <span>Approve & Refund</span>
                                )}
                              </button>
                              <button
                                disabled={!!loadingItemId}
                                onClick={() => {
                                  setRespondingReqId(activeReq.id);
                                  setDeclineNote('');
                                }}
                                className="px-3 py-1.5 bg-red-650 hover:bg-red-755 text-white font-extrabold text-[10px] rounded-lg transition-all active:scale-95 cursor-pointer"
                              >
                                Decline Request
                              </button>
                            </div>}
                          </div>
                        );
                      }
                      if (activeReq.status === 'DECLINED') {
                        const requestedByProvider = activeReq.requestedBy === resolvedProviderId;
                        return (
                          <div className={`border rounded-xl p-3 text-[10px] flex items-start space-x-2 ${isDark ? 'bg-[#1c1b18] border-neutral-850 text-[#b4b0a9]' : 'bg-slate-50 border-slate-200 text-slate-500'
                            }`}>
                            <Clock className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                            <div>
                              <span>{requestedByProvider ? 'The seeker declined your cancellation request.' : 'You declined the cancellation request.'} Note: "{activeReq.responderNote || activeReq.providerNote || 'None'}"</span>
                              {requestedByProvider && <button onClick={() => handleEscalateCancellation(activeReq.id)} className="ml-2 rounded-lg bg-red-600 px-2.5 py-1 text-[9px] font-bold text-white">Escalate to Admin</button>}
                            </div>
                          </div>
                        );
                      }
                      if (activeReq.status === 'ESCALATED') {
                        return (
                          <div className={`border rounded-xl p-3 text-[10px] flex items-start space-x-2 ${isDark ? 'bg-red-955/15 border-red-900/30 text-red-400' : 'bg-red-50/50 border-red-250 text-red-750'
                            }`}>
                            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-red-500" />
                            <span>Seeker escalated cancellation request to Admin for review.</span>
                          </div>
                        );
                      }
                      if (activeReq.status === 'RESOLVED') {
                        return (
                          <div className={`border rounded-xl p-3 text-[10px] flex items-start space-x-2 ${isDark ? 'bg-neutral-800/40 border-neutral-700 text-[#b4b0a9]' : 'bg-slate-50 border-slate-205 text-slate-500'
                            }`}>
                            <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                            <span>Admin resolved cancellation request. Note: "{activeReq.adminNote || 'None'}"</span>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {/* Footer Rate and Actions */}
                    <div className={`border-t pt-4 flex items-center justify-between ${isDark ? 'border-neutral-850' : 'border-slate-100'}`}>
                      <div>
                        <span className={`text-[9px] font-bold uppercase tracking-wider block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-450'}`}>
                          {je.paymentMethod === 'On-site Cash' ? 'Service Amount' : 'Online Payment'}
                        </span>
                        <span className="text-sm font-extrabold text-emerald-500 dark:text-emerald-400">₱{je.price}</span>
                      </div>

                      <div className="flex items-center space-x-1.5">

                        {/* Status badge */}
                        {je.status === 'in_progress' && (
                          <span className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border flex items-center ${isDark ? 'bg-emerald-955/15 border-emerald-900/30 text-emerald-455' : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                            }`}>
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse" />
                            Active
                          </span>
                        )}
                        {je.status === 'queued' && (
                          <span className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border ${isDark ? 'text-amber-455 bg-amber-955/20 border-amber-900/30' : 'text-amber-700 bg-amber-50 border border-amber-100'
                            }`}>
                            Queued
                          </span>
                        )}
                        {je.status === 'pending_provider' && (
                          <span className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border ${isDark ? 'text-neutral-450 bg-[#1c1b18] border border-neutral-850' : 'text-slate-450 bg-slate-50 border border-slate-150'
                            }`}>
                            Incoming
                          </span>
                        )}
                        {je.status === 'awaiting_seeker_approval' && (
                          <span className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border ${isDark ? 'text-orange-400 bg-orange-950/20 border-orange-900/30' : 'text-orange-655 bg-orange-55 border-orange-100'
                            }`}>
                            Awaiting Seeker
                          </span>
                        )}
                        {je.status === 'disputed' && (
                          <span className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border ${isDark ? 'text-red-400 bg-red-955/20 border-red-900/30' : 'text-red-650 bg-red-50 border-red-100'
                            }`}>
                            Disputed
                          </span>
                        )}
                        {je.status === 'completed' && (() => {
                          const myReview = je.reviews && je.reviews.find((r: any) => r.authorId === (resolvedProviderId || user?.id));
                          const canEdit = myReview && myReview.editableUntil
                            ? new Date() < new Date(myReview.editableUntil)
                            : myReview && myReview.createdAt
                            ? new Date().getTime() - new Date(myReview.createdAt).getTime() < 24 * 60 * 60 * 1000
                            : false;

                          return myReview ? (
                            <div className="flex items-center gap-1.5">
                              <span className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border ${
                                isDark ? 'text-emerald-455 bg-emerald-955/20 border-emerald-900/30' : 'text-emerald-700 bg-emerald-50 border-emerald-100'
                              }`}>
                                ✓ Reviewed ({myReview.rating}★)
                              </span>
                              {canEdit && (
                                <button
                                  onClick={() => setReviewingEngagement(je)}
                                  className={`px-2.5 py-1.5 text-[10px] font-bold rounded-lg border transition-all hover:opacity-80 active:scale-95 cursor-pointer ${
                                    isDark ? 'bg-neutral-800 border-neutral-700 text-neutral-300' : 'bg-slate-100 border-slate-200 text-slate-700'
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
                            <span className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border ${isDark ? 'text-neutral-500 bg-[#1c1b18] border-neutral-855' : 'text-slate-400 bg-slate-100 border border-slate-200'
                              }`}>
                              Canceled
                            </span>
                            <button
                              onClick={() => handleDeleteClick(je)}
                              className={`p-2 border rounded-xl flex items-center justify-center cursor-pointer transition-colors ${
                                isDark
                                  ? 'border-neutral-800 hover:bg-red-950/20 hover:text-red-400 hover:border-red-900/30 text-neutral-500'
                                  : 'border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-400'
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
                            className={`p-2 border rounded-xl flex items-center justify-center cursor-pointer transition-colors ${isDark ? 'border-neutral-800 hover:bg-slate-800 text-[#f2efe9]' : 'border-slate-300 hover:bg-slate-50 text-slate-700'
                            }`}
                            title="Open Conversation"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Action buttons */}
                        {je.status === 'in_progress' && (() => {
                          const isStarted = !!je.started;
                          if (!isStarted) {
                            return (
                              <div className="flex items-center gap-1.5">
                              <button
                                disabled={!!loadingItemId}
                                onClick={() => handleProviderStartJob(je.id)}
                                className={`px-3.5 py-1.5 text-white font-extrabold text-[10px] rounded-xl transition-all shadow-sm active:scale-95 flex items-center space-x-1 cursor-pointer ${
                                  loadingItemId === je.id && loadingActionType === 'start'
                                    ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed opacity-60'
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
                              {!je.cancellationRequests?.some((request: any) => ['PENDING', 'ESCALATED'].includes(request.status)) && <button disabled={!!loadingItemId} onClick={() => handleProviderRemoveFromQueue(je.id)} className="rounded-xl border border-red-200 px-3 py-1.5 text-[10px] font-bold text-red-600">Cancel Booking</button>}
                              </div>
                            );
                          }
                          return (
                            <div className="flex items-center gap-1.5">
                            <button
                              disabled={!!loadingItemId}
                              onClick={() => handleRequestJobApproval(je.id)}
                              className={`px-3.5 py-1.5 text-white font-extrabold text-[10px] rounded-xl transition-all shadow-sm active:scale-95 flex items-center justify-center space-x-1 cursor-pointer ${
                                loadingItemId === je.id && loadingActionType === 'complete'
                                  ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed opacity-60'
                                  : 'bg-emerald-600 hover:bg-emerald-700'
                              }`}
                            >
                              {loadingItemId === je.id && loadingActionType === 'complete' ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                                  <span>Completing...</span>
                                </>
                              ) : (
                                <span>Mark Completed</span>
                              )}
                            </button>
                            {!je.cancellationRequests?.some((request: any) => ['PENDING', 'ESCALATED'].includes(request.status)) && <button disabled={!!loadingItemId} onClick={() => handleProviderRemoveFromQueue(je.id)} className="rounded-xl border border-red-200 px-3 py-1.5 text-[10px] font-bold text-red-600">Request Cancellation</button>}
                            </div>
                          );
                        })()}

                        {je.status === 'awaiting_seeker_approval' && (
                          <button
                            disabled={!!loadingItemId}
                            onClick={() => handleCompletionEscalation(je.id)}
                            className={`px-3.5 py-1.5 font-extrabold text-[10px] rounded-xl transition-all shadow-sm active:scale-95 flex items-center justify-center space-x-1 cursor-pointer ${
                              loadingItemId === je.id && loadingActionType === 'completion_escalation'
                                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed opacity-60'
                                : isDark
                                  ? 'bg-[#f2efe9] hover:bg-white text-slate-950'
                                  : 'bg-slate-900 hover:bg-slate-800 text-white'
                            }`}
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
                              disabled={!!loadingItemId}
                              onClick={() => handleProviderStartJob(je.id)}
                              className={`px-3.5 py-1.5 text-white font-extrabold text-[10px] rounded-xl transition-all shadow-sm active:scale-95 flex items-center space-x-1 cursor-pointer ${
                                loadingItemId === je.id && loadingActionType === 'start'
                                  ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed opacity-60'
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
                                  <span>Start</span>
                                </>
                              )}
                            </button>
                            <button
                              disabled={!!loadingItemId}
                              onClick={() => handleProviderRemoveFromQueue(je.id)}
                              className={`px-3 py-1.5 border font-bold text-[10px] rounded-xl transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                                loadingItemId === je.id && loadingActionType === 'remove'
                                  ? 'bg-[#1c1b18] border-neutral-800 text-neutral-500 cursor-not-allowed opacity-60'
                                  : isDark
                                    ? 'border-neutral-800 hover:bg-red-955/20 hover:text-red-400 hover:border-red-900/30 text-[#b4b0a9]'
                                    : 'border-slate-205 text-slate-500 hover:bg-slate-50 border-slate-200'
                              }`}
                            >
                              {loadingItemId === je.id && loadingActionType === 'remove' ? (
                                <>
                                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                  <span>Removing...</span>
                                </>
                              ) : (
                                <span>Remove</span>
                              )}
                            </button>
                          </div>
                        )}

                      </div>
                    </div>
                  </div>
                );
              }
}
