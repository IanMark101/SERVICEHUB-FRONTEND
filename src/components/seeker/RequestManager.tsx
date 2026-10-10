import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApiCacheRefresh } from '../../hooks/useApiCacheRefresh';
import { useApp } from '../../context/AppContext';
import {
  ClipboardText as ClipboardList,
  Trash as Trash2,
  PencilSimple as Edit2,
  UsersThree as UsersRound,
  WarningCircle as AlertCircle,
  ArrowRight,
  CircleNotch as Loader2,
  FolderSimple,
  Alarm,
  MapPin,
  Lightning,
} from '@phosphor-icons/react';
import { usePagination } from '../../hooks/usePagination';
import PaginationBar from '../ui/PaginationBar';
import ConfirmModal, { ConfirmModalState } from '../ui/ConfirmModal';
import { apiMatchProviders } from '../../api/ai.api';
import { apiGetMyRequests } from '../../api/requests.api';
import { mapRequestToJobRequest } from '../../context/mappers';
import { JobRequest } from '../../types';
import { formatUrgencyDisplay } from '../provider/browse-jobs/browseJobs.utils';
import EmptyState from '../ui/EmptyState';
import EditRequestModal, { EditRequestState } from './request-manager/EditRequestModal';
import RequestPaymentMethods from '../ui/RequestPaymentMethods';
import { isRequestUrgency } from '../../lib/requestUrgency';
import { requestDeleteBlockedReason } from '../../lib/requestDeletion';

export default function RequestManager({ 
  currentUserId = 'u1',
  onNavigateToPost,
  onNavigateToActivity
}: { 
  currentUserId?: string;
  onNavigateToPost?: () => void;
  onNavigateToActivity?: () => void;
}) {
  const { jobRequests, bids, deleteJobRequest, editJobRequest, toggleJobRequestStatus, isDark } = useApp();

  // Fetch unbooked requests, including paused listings and offers awaiting acceptance/payment.
  const [myOwnRequests, setMyOwnRequests] = useState<JobRequest[] | null>(null);
  const ownerReadRevision = useRef(0);
  const [togglingRequestId, setTogglingRequestId] = useState<string | null>(null);
  const [localRequestStatuses, setLocalRequestStatuses] = useState<Record<string, JobRequest['status']>>({});
  const [localRequestEdits, setLocalRequestEdits] = useState<Record<string, Pick<JobRequest, 'title' | 'budget' | 'description'> & { urgency?: string }>>({});
  const [deletedRequestIds, setDeletedRequestIds] = useState<Set<string>>(() => new Set());

  const refreshOwnRequests = useCallback(async () => {
    const revision = ++ownerReadRevision.current;
    const res = await apiGetMyRequests();
    if (revision === ownerReadRevision.current && res.success && Array.isArray(res.data)) {
      setMyOwnRequests(res.data.map(mapRequestToJobRequest));
      // Confirmed server refresh replaces temporary edit/status overlays.
      setLocalRequestEdits({});
      setLocalRequestStatuses({});
    }
  }, []);
  useApiCacheRefresh(['requests'], refreshOwnRequests);

  useEffect(() => {
    let active = true;
    const revision = ++ownerReadRevision.current;
    apiGetMyRequests()
      .then((res) => {
        if (active && revision === ownerReadRevision.current && res.success && Array.isArray(res.data)) {
          setMyOwnRequests(res.data.map(mapRequestToJobRequest));
        }
      })
      .catch(() => {
        // fallback to public board filter
      });
    return () => { active = false; };
  }, [currentUserId]);

  const [activeAiRequestId, setActiveAiRequestId] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<Record<string, Array<{ name: string; rationale: string }>>>({});
  const [loadingAiMap, setLoadingAiMap] = useState<Record<string, boolean>>({});

  const handleToggleAiSuggestions = (requestId: string) => {
    if (activeAiRequestId === requestId) {
      setActiveAiRequestId(null);
      return;
    }

    setActiveAiRequestId(requestId);

    if (!aiSuggestions[requestId]) {
      setLoadingAiMap(prev => ({ ...prev, [requestId]: true }));
      apiMatchProviders(requestId)
        .then((res) => {
          if (res.success && res.data.suggestions) {
            setAiSuggestions(prev => ({ ...prev, [requestId]: res.data.suggestions }));
          } else if (res.success && res.data.reason) {
            setAiSuggestions(prev => ({ ...prev, [requestId]: [{ name: "No Suggestion", rationale: res.data.reason }] }));
          }
        })
        .catch((err) => {
          if (process.env.NODE_ENV === 'development') console.warn("Failed to fetch AI suggestions:", err);
          setAiSuggestions(prev => ({ ...prev, [requestId]: [{ name: "Error", rationale: err.response?.data?.error || "Failed to load recommendations" }] }));
        })
        .finally(() => {
          setLoadingAiMap(prev => ({ ...prev, [requestId]: false }));
        });
    }
  };
  
  // Booked work belongs in Activity. Apply the same rule to cached/fallback data.
  const myRequests = (myOwnRequests ?? jobRequests.filter(r => r.seekerId === currentUserId))
    .map(r => localRequestEdits[r.id] ? { ...r, ...localRequestEdits[r.id] } : r)
    .map(r => localRequestStatuses[r.id] ? { ...r, status: localRequestStatuses[r.id] } : r)
    .filter(r => !r.archivedAt && !deletedRequestIds.has(r.id) && r.status !== 'CANCELED' && (r.status as string) !== 'canceled'
      && !r.hasActiveBooking && !r.hasCompletedBooking);
  const latestDeleteData = useRef({ requests: myRequests, bids });
  useEffect(() => { latestDeleteData.current = { requests: myRequests, bids }; }, [myRequests, bids]);

  // Pagination
  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedRequests,
    goToPage,
    nextPage,
    prevPage,
    startIndex,
    endIndex
  } = usePagination(myRequests, 8);

  // Edit State
  const [editingRequest, setEditingRequest] = useState<EditRequestState | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const savingEditRef = useRef(false);
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState | null>(null);
  const [deleteRequestId, setDeleteRequestId] = useState<string | null>(null);
  const deletingRef = useRef(false);

  const protectedDeleteModal = (reason: string): ConfirmModalState => ({
    isOpen: true,
    title: 'Request can’t be deleted',
    message: reason,
    variant: 'info',
    confirmText: onNavigateToActivity && !reason.startsWith('Reopen') ? 'View Booking' : 'Got it',
    cancelText: 'Close',
    onConfirm: () => { setConfirmModal(null); setDeleteRequestId(null); if (!reason.startsWith('Reopen')) onNavigateToActivity?.(); },
  });

  const handleDeleteRequestClick = (req: JobRequest) => {
    setDeleteRequestId(req.id);
    const reason = requestDeleteBlockedReason(req, bids);
    if (reason) {
      setConfirmModal(protectedDeleteModal(reason));
      return;
    }
    setConfirmModal({
      isOpen: true,
      title: 'Delete Job Request',
      message: `Delete "${req.title}"? Providers will no longer see this request, and its pending offers will be declined.`,
      confirmText: 'Yes, Delete Request',
      cancelText: 'Cancel',
      variant: 'danger',
      onConfirm: async () => {
        if (deletingRef.current) return;
        const latest = latestDeleteData.current.requests.find(request => request.id === req.id);
        if (!latest) { setConfirmModal(null); return; }
        const blocked = requestDeleteBlockedReason(latest, latestDeleteData.current.bids);
        if (blocked) { setConfirmModal(protectedDeleteModal(blocked)); return; }
        deletingRef.current = true;
        setConfirmModal(prev => prev ? { ...prev, isLoading: true } : null);
        try {
          const deleted = await deleteJobRequest(req.id);
          if (deleted === true) {
            setDeletedRequestIds(prev => new Set(prev).add(req.id));
            setMyOwnRequests(prev => prev ? prev.filter(r => r.id !== req.id) : null);
          }
        } finally {
          deletingRef.current = false;
          setDeleteRequestId(null);
          setConfirmModal(null);
        }
      }
    });
  };

  const handleToggleAccepting = async (req: JobRequest) => {
    if (togglingRequestId) return;
    setTogglingRequestId(req.id);
    const isCurrentlyPaused = req.status === 'CLOSED' || (req.status as string) === 'closed' || (req.status as string) === 'paused';
    const nextStatus: 'OPEN' | 'CLOSED' = isCurrentlyPaused ? 'OPEN' : 'CLOSED';

    // Keep the owner's list independent of public-board refreshes and late initial reads.
    const updateLocalStatus = (status: JobRequest['status']) => {
      setLocalRequestStatuses(prev => ({ ...prev, [req.id]: status }));
      setMyOwnRequests(prev => (prev ?? jobRequests.filter(r => r.seekerId === currentUserId)).map(r => r.id === req.id ? { ...r, status } : r));
    };
    updateLocalStatus(nextStatus);

    try {
      const ok = await toggleJobRequestStatus(req.id, req.status);
      updateLocalStatus(ok ? nextStatus : req.status);
    } catch {
      updateLocalStatus(req.status);
    } finally {
      setTogglingRequestId(null);
    }
  };

  const handleOpenEdit = (req: JobRequest) => {
    setEditingRequest({
      requestId: req.id,
      jobLocation: req.jobLocation,
      originalJobLocation: req.jobLocation,
      transportationFee: req.transportationFee == null ? '' : String(req.transportationFee),
      originalTransportationFee: req.transportationFee,
      locationLocked: req.hasAcceptedOffer || req.hasPendingPaymentOffer || bids.some(bid => bid.requestId === req.id && ['pending', 'PENDING', 'accepted', 'ACCEPTED', 'pending_payment', 'PENDING_PAYMENT'].includes(bid.status)),
      title: req.title,
      budget: req.budget,
      description: req.description,
      originalUrgency: req.urgency,
      urgency: isRequestUrgency(req.urgency) ? req.urgency : undefined,
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRequest || savingEditRef.current) return;
    savingEditRef.current = true;
    setIsSavingEdit(true);

    try {
      const updated = await editJobRequest(
        editingRequest.requestId,
        editingRequest.title,
        editingRequest.budget,
        editingRequest.description,
        editingRequest.urgency,
        {
          ...(editingRequest.jobLocation && JSON.stringify(editingRequest.jobLocation) !== JSON.stringify(editingRequest.originalJobLocation) && { jobLocation: editingRequest.jobLocation }),
          ...((editingRequest.transportationFee ? Number(editingRequest.transportationFee) : null) !== (editingRequest.originalTransportationFee ?? null) && { transportationFee: editingRequest.transportationFee ? Number(editingRequest.transportationFee) : null }),
        },
      );
      if (!updated) return;

      // Keep confirmed edits visible even if the initial owner-list read arrives late.
      const requestId = editingRequest.requestId;
      setLocalRequestEdits(prev => ({ ...prev, [requestId]: updated }));
      setMyOwnRequests(prev => (prev ?? jobRequests.filter(r => r.seekerId === currentUserId))
        .map(request => request.id === requestId ? { ...request, ...updated } : request));
      setEditingRequest(null);
    } finally {
      savingEditRef.current = false;
      setIsSavingEdit(false);
    }
  };

  return (
    <div className={`workspace-page space-y-6 select-none transition-colors duration-200 ${isDark ? 'text-white' : 'text-ink'}`}>
      
      {/* Header Action Strip & Status Filter Tabs */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 ${isDark ? 'border-neutral-800/80' : 'border-slate-200'}`}>
        {/* Quick Info & Count */}
        <div className="flex items-center space-x-2">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-50 text-brand-text'}`}>
            <ClipboardList className="w-4 h-4" />
          </div>
          <div>
            <h2 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-ink'}`}>
              Your Requests
            </h2>
            <p className={`text-[11px] ${isDark ? 'text-ink-muted' : 'text-ink-muted'}`}>
              {myRequests.length} {myRequests.length === 1 ? 'task request' : 'task requests'} posted to nearby providers
            </p>
          </div>
        </div>

        <button
          onClick={onNavigateToPost}
          className="bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-md active:scale-95 flex items-center space-x-1.5 self-start sm:self-auto cursor-pointer"
        >
          <span>+ New Request</span>
        </button>
      </div>

      {/* Requests Rows */}
      {myRequests.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No requests in Request Manager"
          description="Post a task to receive offers from local providers. Once a booking is created, manage it in Activity. Repost completed requests from Activity → Completed."
          actionLabel="+ Broadcast a Request"
          onAction={() => {
            if (onNavigateToPost) onNavigateToPost();
          }}
          secondaryActionLabel="View Activity"
          onSecondaryAction={onNavigateToActivity}
          accentColor="orange"
        />
      ) : (
        <div className="space-y-6">
          <div className="space-y-4">
            {paginatedRequests.map((req) => {
              const isPaused = req.status === 'CLOSED' || (req.status as string) === 'closed' || (req.status as string) === 'paused';
              const isBooked = req.status === 'IN_PROGRESS' || (req.status as string) === 'in_progress' || req.hasActiveBooking || req.hasAcceptedOffer || bids.some(bid => bid.requestId === req.id && bid.status.toUpperCase() === 'ACCEPTED');
              const deleteBlockedReason = requestDeleteBlockedReason(req, bids);
              
              return (
                <div 
                  key={req.id} 
                  className={`workspace-card rounded-2xl border p-5 sm:p-6 flex flex-col space-y-5 ${
                    isDark 
                      ? 'bg-charcoal-surface border-neutral-800/80 hover:border-neutral-700'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Tier 1: Category on the left, controls on the right. */}
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 border ${
                        isDark ? 'bg-orange-950/30 border-orange-900/40 text-orange-400' : 'bg-orange-50 border-orange-200 text-orange-700'
                      }`}>
                        <FolderSimple className="h-3.5 w-3.5" weight="duotone" /> {req.category}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                      {!req.targetServiceId && <button
                        type="button"
                        onClick={() => handleToggleAiSuggestions(req.id)}
                        aria-expanded={activeAiRequestId === req.id}
                        aria-controls={`request-${req.id}-matches`}
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-1.5 text-xs font-semibold transition-colors active:scale-[0.98] cursor-pointer ${
                          activeAiRequestId === req.id
                            ? isDark
                              ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
                              : 'bg-orange-100 text-orange-700 border-orange-300'
                            : isDark
                              ? 'border-neutral-800 hover:bg-charcoal-hover text-ink-muted hover:text-white'
                              : 'border-slate-200 hover:bg-slate-50 text-ink-muted hover:text-ink'
                        }`}
                      >
                        <UsersRound className="w-3.5 h-3.5 text-brand-text" />
                        <span>AI Matches</span>
                      </button>}

                      {!req.targetServiceId && <button
                        type="button"
                        onClick={() => handleOpenEdit(req)}
                        aria-label={`Edit ${req.title}`}
                        className={`flex items-center gap-1.5 rounded-lg border px-3.5 py-1.5 text-xs font-semibold transition-colors active:scale-[0.98] cursor-pointer ${
                          isDark 
                            ? 'border-neutral-800 hover:bg-charcoal-hover text-ink-muted hover:text-white'
                            : 'border-slate-200 hover:bg-slate-50 text-ink-muted hover:text-ink'
                        }`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>}

                      <button
                        type="button"
                        onClick={() => handleDeleteRequestClick(req)}
                        aria-label={`Delete ${req.title}`}
                        aria-haspopup="dialog"
                        title={deleteBlockedReason || undefined}
                        className={`flex items-center gap-1.5 rounded-lg border px-3.5 py-1.5 text-xs font-semibold transition-colors active:scale-[0.98] cursor-pointer ${
                          deleteBlockedReason
                            ? isDark ? 'border-neutral-800 text-ink-muted hover:bg-charcoal-hover' : 'border-slate-200 text-ink-muted hover:bg-slate-50'
                            : isDark
                            ? 'border-red-950/45 hover:bg-red-950/20 text-red-400' 
                            : 'border-red-200 hover:bg-red-50 text-red-500'
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>

                      <div className={`ml-1 flex min-h-8 items-center gap-2 border-l pl-3 ${isDark ? 'border-neutral-800' : 'border-slate-200'}`}>
                        {isBooked ? (
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-extrabold border ${
                              isDark
                                ? 'bg-orange-950/40 text-orange-400 border-orange-900/50'
                                : 'bg-orange-50 text-orange-700 border-orange-200'
                            }`}>
                              <Lightning className="h-3.5 w-3.5" weight="fill" /> Booked
                            </span>
                            {onNavigateToActivity && (
                              <button
                                onClick={onNavigateToActivity}
                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                                  isDark
                                    ? 'bg-orange-950/30 text-orange-400 border-orange-900/50 hover:bg-orange-900/40'
                                    : 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'
                                }`}
                              >
                                View Booking
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ) : req.targetServiceId ? (
                          <span className="text-xs font-semibold text-brand-text dark:text-orange-400">{bids.some(bid => bid.requestId === req.id && bid.status.toLowerCase() === 'pending') ? 'Quote received · review offer' : 'Awaiting provider quote'}</span>
                        ) : (() => {
                          const isToggling = togglingRequestId === req.id;
                          return (
                            <>
                              <button
                                type="button"
                                disabled={!!togglingRequestId}
                                onClick={() => handleToggleAccepting(req)}
                                role="switch"
                                aria-checked={!isPaused}
                                aria-label={`${isPaused ? 'Activate' : 'Pause'} ${req.title}`}
                                className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-all duration-200 ease-in-out focus:outline-none ${
                                  isToggling ? 'opacity-80 cursor-wait' : 'cursor-pointer'
                                } ${
                                  !isPaused ? 'bg-orange-600' : isDark ? 'bg-charcoal' : 'bg-slate-300'
                                }`}
                              >
                                <span
                                  className={`pointer-events-none flex items-center justify-center h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                    !isPaused ? 'translate-x-4' : 'translate-x-0'
                                  }`}
                                >
                                  {isToggling && (
                                    <Loader2 className="w-2.5 h-2.5 text-brand-text animate-spin" />
                                  )}
                                </span>
                              </button>
                              
                              <span className={`text-xs font-bold transition-colors ${
                                isToggling
                                  ? 'text-orange-700 dark:text-orange-400'
                                  : !isPaused
                                  ? 'text-orange-700 dark:text-orange-400'
                                  : isDark
                                  ? 'text-ink-muted'
                                  : 'text-ink-subtle'
                              }`}>
                                {isToggling ? 'Updating...' : !isPaused ? 'Active' : 'Paused'}
                              </span>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Tier 2: Request content */}
                  <div className="min-w-0 space-y-1.5">
                    <h3 className={`uppercase break-words [overflow-wrap:anywhere] font-bold text-base sm:text-lg leading-snug ${isDark ? 'text-white' : 'text-ink'}`}>
                      {req.title}
                    </h3>
                    {req.description && (
                      <p className={`text-xs sm:text-sm leading-relaxed line-clamp-2 ${isDark ? 'text-ink-muted' : 'text-ink-muted'}`}>
                        {req.description}
                      </p>
                    )}
                  </div>

                  {/* Tier 3: Budget and request metadata */}
                  <RequestPaymentMethods request={req} isDark={isDark} />
                  <div className={`pt-3.5 border-t flex flex-wrap items-center justify-between gap-3 text-xs ${
                    isDark ? 'border-neutral-800/80' : 'border-slate-100'
                  }`}>
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-semibold text-ink-muted">{req.targetServiceId ? 'Displayed listing rate · final quote pending' : 'Estimated budget'}</span>
                      <span className={`font-extrabold text-sm sm:text-base ${isDark ? 'text-orange-400' : 'text-brand-text'}`}>
                        {req.targetServiceId && !req.budget ? 'Quote required' : `₱${req.budget}`}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                        isDark ? 'bg-charcoal-inset border-neutral-800 text-neutral-300' : 'bg-slate-50 border-slate-200 text-ink-muted'
                      }`}>
                        <Alarm className="h-3.5 w-3.5" weight="duotone" /> Needed {formatUrgencyDisplay(req.urgency)}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                        isDark ? 'bg-charcoal-inset border-neutral-800 text-neutral-300' : 'bg-slate-50 border-slate-200 text-ink-muted'
                      }`}>
                        <MapPin className="h-3.5 w-3.5" weight="duotone" /> {req.locationLabel || 'Job location not provided'}
                      </span>
                    </div>
                  </div>

                  {/* Collapsible AI Recommendations Section */}
                  {activeAiRequestId === req.id && (
                    <div
                      id={`request-${req.id}-matches`}
                      className={`w-full rounded-xl border p-4 animate-in slide-in-from-top-3 duration-200 ${
                        isDark ? 'border-neutral-800 bg-charcoal-inset/70' : 'border-slate-200 bg-slate-50/80'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-3">
                        <UsersRound className={`w-4 h-4 ${isDark ? 'text-orange-400' : 'text-brand-text'}`} />
                        <h4 className="text-xs font-bold text-ink dark:text-white">
                          Suggested providers
                        </h4>
                      </div>

                      {loadingAiMap[req.id] ? (
                        <div className="flex items-center space-x-2 py-2">
                          <Loader2 className="h-4 w-4 animate-spin text-brand-text" />
                          <span className="text-xs text-ink-subtle dark:text-ink-muted font-semibold pl-1">Analyzing provider capabilities and trust scores...</span>
                        </div>
                      ) : !aiSuggestions[req.id] ? (
                        <p className="text-xs text-ink-subtle dark:text-ink-subtle italic">Click the button above to generate AI-powered provider matches.</p>
                      ) : aiSuggestions[req.id].length === 0 ? (
                        <div className="flex items-start space-x-2 text-xs text-ink-muted dark:text-ink-muted">
                          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-brand-text" />
                          <span>No providers found in this category yet. Try again after more providers join.</span>
                        </div>
                      ) : aiSuggestions[req.id][0]?.name === "No Suggestion" || aiSuggestions[req.id][0]?.name === "Error" ? (
                        <div className="flex items-start space-x-2 text-xs">
                          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-brand-text" />
                          <span className="text-ink-muted dark:text-ink-muted italic">{aiSuggestions[req.id][0]?.rationale}</span>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {aiSuggestions[req.id].map((sug, idx) => (
                            <div 
                              key={idx}
                              className={`p-3 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs transition-colors ${
                                isDark ? 'bg-charcoal-surface border-neutral-800 text-white' : 'bg-white border-slate-200 text-ink'
                              }`}
                            >
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                  <span className="font-extrabold text-brand-text dark:text-orange-400">Rank #{idx + 1}</span>
                                  <span className="font-extrabold text-ink dark:text-white">{sug.name}</span>
                                </div>
                                <p className="text-ink-muted dark:text-ink-muted italic leading-normal">
                                  {sug.rationale}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>

          <PaginationBar
            currentPage={currentPage}
            totalPages={totalPages}
            goToPage={goToPage}
            nextPage={nextPage}
            prevPage={prevPage}
            startIndex={startIndex}
            endIndex={endIndex}
            totalItems={myRequests.length}
            variant="seeker"
          />
        </div>
      )}

      <EditRequestModal
        value={editingRequest}
        isDark={isDark}
        isSaving={isSavingEdit}
        onChange={setEditingRequest}
        onClose={() => { if (!savingEditRef.current) setEditingRequest(null); }}
        onSubmit={handleSaveEdit}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        state={(() => {
          const request = myRequests.find(item => item.id === deleteRequestId);
          const reason = request && requestDeleteBlockedReason(request, bids);
          // An offer accepted while the confirmation is open removes its destructive action immediately.
          return confirmModal && !confirmModal.isLoading && reason ? protectedDeleteModal(reason) : confirmModal;
        })()}
        onClose={() => { if (!deletingRef.current) { setConfirmModal(null); setDeleteRequestId(null); } }}
      />

    </div>
  );
}
