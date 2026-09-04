"use client";

import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  MessageSquare,
  Play,
  Trash2
} from 'lucide-react';
import LifecycleStepper from '../../ui/LifecycleStepper';
import type { JobEngagement } from '../../../types';

export default function SeekerActivityItem({ engagement: je, model }: { engagement: JobEngagement; model: any }) {
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
    handleRespondCancellation
  } = model;

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
                  className={`rounded-[24px] p-6 border shadow-sm flex flex-col justify-between space-y-4 transition-all duration-500 ${
                    je.id === highlightedBookingId
                      ? 'ring-2 ring-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.6)] border-orange-500 scale-[1.01]'
                      : isDark
                        ? 'bg-[#22211e] border-neutral-800/80 hover:border-neutral-700'
                        : 'bg-white border-slate-300 hover:shadow-md'
                  }`}
                >

                  {/* Top Line: Category & Date */}
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                    <span className={isDark ? 'text-orange-400' : 'text-orange-600'}>
                      📁 {getCategoryForEngagement(je)}
                    </span>
                    <span className={isDark ? 'text-[#b4b0a9]' : 'text-slate-400'}>
                      📅 {formattedDate}
                    </span>
                  </div>

                  {/* Title & Provider Info */}
                  <div className="space-y-2.5">
                    <h3 className={`font-extrabold text-sm leading-snug tracking-tight ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
                      {je.title}
                    </h3>

                    <div className="flex items-center space-x-2.5">
                      <img
                        src={je.providerAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(je.providerName || 'Provider')}&background=random`}
                        alt={je.providerName}
                        className="w-7 h-7 rounded-full object-cover border border-slate-105 shadow-sm"
                      />
                      <div className="flex flex-wrap items-center gap-1 text-[11px] font-bold">
                        <span className={isDark ? 'text-[#b4b0a9]' : 'text-slate-450'}>Provider:</span>
                        <span className={isDark ? 'text-[#f2efe9]' : 'text-slate-700'}>{je.providerName}</span>
                        <span className="text-slate-300 dark:text-neutral-800">•</span>
                        <span className={`inline-flex items-center text-[9px] px-1.5 py-0.5 rounded-md font-bold ${isDark ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-50 text-orange-600'
                          }`}>
                          92% Trust
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 5-Step Visual Lifecycle Stepper */}
                  <LifecycleStepper
                    status={je.status}
                    role="seeker"
                    queuePosition={je.queuePosition}
                    isDark={isDark}
                  />

                  {/* Escrow/Payment details banner */}
                  {hasEscrow && (
                    je.paymentMethod === 'GCash' ? (
                      <div className={`rounded-xl p-3 border text-[10px] leading-relaxed flex items-center justify-between transition-all ${isDark ? 'bg-orange-950/15 border-orange-900/20 text-orange-400' : 'bg-orange-50/40 border-orange-100 text-orange-700'
                        }`}>
                        <span className="font-semibold">GCash Payment Confirmed</span>
                        <span className="font-extrabold">₱{je.price} Paid Online</span>
                      </div>
                    ) : (
                      <div className={`rounded-xl p-3 border text-[10px] leading-relaxed flex items-center justify-between transition-all ${isDark ? 'bg-blue-950/15 border-blue-900/20 text-blue-400' : 'bg-blue-50/40 border-blue-100 text-blue-700'
                        }`}>
                        <span className="font-semibold">💵 On-Site Cash Payment</span>
                        <span className="font-extrabold">₱{je.price} Payable</span>
                      </div>
                    )
                  )}

                  {/* Dispute note inside card */}
                  {je.status === 'disputed' && je.disputeReason && (
                    <div className={`border rounded-xl p-3 text-[10px] flex items-start space-x-2 ${isDark ? 'bg-red-955/15 border-red-900/30 text-red-400' : 'bg-red-50/50 border-red-200 text-red-750'
                      }`}>
                      <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      <span>Dispute Filed: "{je.disputeReason}" (Awaiting Moderator review)</span>
                    </div>
                  )}

                  {/* Cancellation Request status inside card */}
                  {je.cancellationRequests && je.cancellationRequests.length > 0 && (() => {
                    const activeReq = je.cancellationRequests[0];
                    if (activeReq.status === 'PENDING') {
                      const requestedBySeeker = activeReq.requestedBy === currentUserId;
                      return (
                        <div className={`border rounded-xl p-3 text-[10px] flex flex-col gap-2 ${isDark ? 'bg-orange-950/15 border-orange-900/20 text-orange-400' : 'bg-orange-50/50 border-orange-200 text-orange-700'
                          }`}>
                          <div className="flex items-start gap-2"><Clock className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /><span>{requestedBySeeker ? 'Cancellation requested: awaiting provider response.' : `Provider requested cancellation: "${activeReq.reason || 'No reason provided'}"`}</span></div>
                          {!requestedBySeeker && <div className="flex gap-2"><button onClick={() => handleRespondCancellation(activeReq.id, true)} className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[9px] font-bold text-white">Approve</button><button onClick={() => handleRespondCancellation(activeReq.id, false)} className="rounded-lg bg-red-600 px-2.5 py-1 text-[9px] font-bold text-white">Decline</button></div>}
                        </div>
                      );
                    }
                    if (activeReq.status === 'DECLINED') {
                      const requestedBySeeker = activeReq.requestedBy === currentUserId;
                      return (
                        <div className={`border rounded-xl p-3 text-[10px] flex flex-col space-y-2 ${isDark ? 'bg-red-950/15 border-red-900/20 text-red-400' : 'bg-red-50/50 border-red-200 text-red-700'
                          }`}>
                          <div className="flex items-start space-x-2">
                            <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                            <span>{requestedBySeeker ? 'Cancellation declined by provider' : 'You declined the provider cancellation request'}: "{activeReq.responderNote || activeReq.providerNote || 'No explanation provided'}"</span>
                          </div>
                          {requestedBySeeker && <button
                            disabled={!!loadingItemId}
                            onClick={() => handleEscalateClick(activeReq.id)}
                            className={`self-start px-2.5 py-1 font-extrabold text-[9px] rounded-lg transition-all active:scale-95 cursor-pointer flex items-center space-x-1 ${
                              loadingItemId === activeReq.id && loadingActionType === 'escalate'
                                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed opacity-60'
                                : 'bg-red-650 hover:bg-red-750 text-white'
                            }`}
                          >
                            {loadingItemId === activeReq.id && loadingActionType === 'escalate' ? (
                              <>
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                <span>Escalating...</span>
                              </>
                            ) : (
                              <span>Escalate to Admin</span>
                            )}
                          </button>}
                        </div>
                      );
                    }
                    if (activeReq.status === 'ESCALATED') {
                      return (
                        <div className={`border rounded-xl p-3 text-[10px] flex items-start space-x-2 ${isDark ? 'bg-amber-950/15 border-amber-900/20 text-amber-400' : 'bg-amber-50/50 border-amber-200 text-amber-700'
                          }`}>
                          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-amber-500" />
                          <span>Dispute Escalated to Admin: Awaiting administrator review.</span>
                        </div>
                      );
                    }
                    if (activeReq.status === 'RESOLVED') {
                      return (
                        <div className={`border rounded-xl p-3 text-[10px] flex items-start space-x-2 ${isDark ? 'bg-neutral-800/40 border-neutral-700 text-[#b4b0a9]' : 'bg-slate-50 border-slate-200 text-slate-500'
                          }`}>
                          <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                          <span>Dispute Resolved: Cancellation Request Rejected by Admin. Note: "{activeReq.adminNote || 'None'}"</span>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* Footer details & Context Actions */}
                  <div className={`border-t pt-4 flex items-center justify-between ${isDark ? 'border-neutral-850' : 'border-slate-100'}`}>
                    <div>
                      <span className={`text-[9px] font-bold uppercase tracking-wider block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-450'}`}>Contract Rate</span>
                      <span className={`text-sm font-extrabold ${isDark ? 'text-orange-500' : 'text-orange-600'}`}>₱{je.price}</span>
                    </div>

                    {/* Context actions */}
                    <div className="flex items-center space-x-2">

                      {/* Status Pills */}
                      {je.status === 'in_progress' && (
                        <span className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border flex items-center ${isDark ? 'bg-emerald-955/15 border-emerald-900/30 text-emerald-450' : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                          }`}>
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse" />
                          In Progress
                        </span>
                      )}

                      {je.status === 'queued' && (
                        <span className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border ${isDark ? 'text-amber-450 bg-amber-955/20 border-amber-900/30' : 'text-amber-700 bg-amber-50 border border-amber-100'
                          }`}>
                          Queued
                        </span>
                      )}

                      {je.status === 'pending_provider' && (
                        <span className={`text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border ${isDark ? 'bg-[#1c1b18] border-neutral-850 text-[#b4b0a9]' : 'bg-slate-50 border-slate-200 text-slate-450'
                          }`}>
                          Awaiting Accept
                        </span>
                      )}

                      {je.status === 'completed' && (() => {
                        const myReview = je.reviews && je.reviews.find((r: any) => r.authorId === currentUserId);
                        const canEdit = myReview && myReview.editableUntil
                          ? new Date() < new Date(myReview.editableUntil)
                          : myReview && myReview.createdAt
                          ? new Date().getTime() - new Date(myReview.createdAt).getTime() < 24 * 60 * 60 * 1000
                          : false;

                        return myReview ? (
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border ${isDark ? 'text-emerald-455 bg-emerald-955/15 border-emerald-900/30' : 'text-emerald-700 bg-emerald-50 border-emerald-100'
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
                            className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-[10px] rounded-xl transition-all active:scale-95 shadow-sm cursor-pointer"
                          >
                            Leave Review
                          </button>
                        );
                      })()}

                      {je.status === 'canceled' && (
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border ${isDark ? 'text-neutral-500 bg-[#1c1b18] border-neutral-855' : 'text-slate-400 bg-slate-100 border border-slate-200'
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
                          onClick={() => router.push(`/seeker/messages?booking=${je.id}`)}
                          className={`p-2 border rounded-xl flex items-center justify-center cursor-pointer transition-colors ${isDark ? 'border-neutral-800 hover:bg-slate-800 text-[#f2efe9]' : 'border-slate-300 hover:bg-slate-50 text-slate-700'
                          }`}
                          title="Open Conversation"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Explicit Action Triggers */}
                      {je.status === 'awaiting_seeker_approval' && (
                        <div className="flex flex-col items-end space-y-2">
                          <p className="text-[10px] text-orange-500 font-semibold text-right max-w-xs">
                            {je.paymentMethod === 'GCash'
                              ? '⚠️ Releasing funds is final. Verify the service is fully completed to your satisfaction before releasing payment.'
                              : '⚠️ Please ensure you pay the provider the agreed cash amount on-site. Confirming completes the transaction.'}
                          </p>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setDisputingJob(je)}
                              className={`px-3 py-1.5 border font-bold text-[10px] rounded-xl transition-all cursor-pointer ${isDark
                                  ? 'border-neutral-800 hover:bg-red-955/20 hover:text-red-400 hover:border-red-900/30 text-[#b4b0a9]'
                                  : 'border-slate-300 hover:bg-red-50 hover:text-red-655 hover:border-red-200 text-slate-550'
                                }`}
                            >
                              Report Issue
                            </button>
                            <button
                              disabled={!!loadingItemId}
                              onClick={() => {
                                const isOnline = je.paymentMethod === 'GCash';
                                setConfirmModal({
                                  isOpen: true,
                                  title: isOnline ? 'Confirm Online Booking Completion' : 'Complete Transaction',
                                  message: isOnline
                                    ? 'Confirm that the work is complete? This releases ServiceHub’s internal payment hold and records the provider earning. This action is final.'
                                    : 'Have you paid the provider on-site and want to complete this transaction?',
                                  confirmText: isOnline ? 'Release Cash' : 'Complete Transaction',
                                  cancelText: 'Cancel',
                                  variant: 'warning',
                                  onConfirm: async () => {
                                    setConfirmModal((prev: any) => prev ? { ...prev, isLoading: true } : null);
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
                                  ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed opacity-60'
                                  : 'bg-orange-600 hover:bg-orange-700 text-white'
                              }`}
                            >
                              {loadingItemId === je.id && loadingActionType === 'complete' ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                                  <span>{je.paymentMethod === 'GCash' ? 'Releasing Funds...' : 'Completing...'}</span>
                                </>
                              ) : (
                                <span>{je.paymentMethod === 'GCash' ? 'Release Cash' : 'Complete Transaction'}</span>
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Cancellation Actions */}
                      {['queued', 'pending_provider', 'in_progress'].includes(je.status) && (() => {
                        const activeReq = je.cancellationRequests?.[0];
                        // If there is an active request that is pending or escalated, do not show cancellation trigger buttons
                        if (activeReq && ['PENDING', 'ESCALATED'].includes(activeReq.status)) {
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
                                ? 'bg-[#1c1b18] border-neutral-800 text-neutral-500 cursor-not-allowed opacity-60'
                                : isDark
                                  ? 'border-neutral-800 hover:bg-[#2c2b27] text-[#b4b0a9]'
                                  : 'border-slate-300 hover:bg-slate-50 text-slate-550'
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
              );
}
