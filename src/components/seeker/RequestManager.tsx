import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ClipboardList, Trash2, Edit2, Check, X, MessageSquare, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { usePagination } from '../../hooks/usePagination';
import PaginationBar from '../ui/PaginationBar';
import ConfirmModal, { ConfirmModalState } from '../ui/ConfirmModal';
import { apiMatchProviders } from '../../api/ai.api';
import { apiGetMyRequests } from '../../api/requests.api';
import { mapRequestToJobRequest } from '../../context/mappers';
import { JobRequest } from '../../types';
import { formatUrgencyDisplay } from '../provider/BrowseJobs';

interface EditModalState {
  requestId: string;
  title: string;
  budget: number;
  description: string;
}

export default function RequestManager({ 
  currentUserId = 'u1',
  onNavigateToOffers, 
  onNavigateToPost,
  onNavigateToActivity
}: { 
  currentUserId?: string;
  onNavigateToOffers?: () => void;
  onNavigateToPost?: () => void;
  onNavigateToActivity?: () => void;
}) {
  const { jobRequests, bids, deleteJobRequest, editJobRequest, toggleJobRequestStatus, isDark } = useApp();

  // Fetch the seeker's own requests directly so all statuses show up
  const [myOwnRequests, setMyOwnRequests] = useState<JobRequest[] | null>(null);

  const fetchMyRequests = () => {
    apiGetMyRequests()
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setMyOwnRequests(res.data.map(mapRequestToJobRequest));
        }
      })
      .catch(() => {
        // fallback to public board filter
      });
  };

  useEffect(() => {
    fetchMyRequests();
  }, []);

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
          console.warn("Failed to fetch AI suggestions:", err);
          setAiSuggestions(prev => ({ ...prev, [requestId]: [{ name: "Error", rationale: err.response?.data?.error || "Failed to load recommendations" }] }));
        })
        .finally(() => {
          setLoadingAiMap(prev => ({ ...prev, [requestId]: false }));
        });
    }
  };
  
  // Find current seeker's requests — prefer direct fetch, fallback to context filter (filter out canceled)
  const myRequests = (myOwnRequests ?? jobRequests.filter(r => r.seekerId === currentUserId))
    .filter(r => r.status !== 'CANCELED' && (r.status as string) !== 'canceled');

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
  const [editingRequest, setEditingRequest] = useState<EditModalState | null>(null);
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState | null>(null);

  const handleDeleteRequest = async (requestId: string) => {
    await deleteJobRequest(requestId);
    setMyOwnRequests(prev => prev ? prev.filter(r => r.id !== requestId) : null);
  };

  const handleDeleteRequestClick = (req: JobRequest) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Job Request',
      message: `Are you sure you want to delete "${req.title}"? This will remove your request and any associated bids.`,
      confirmText: 'Yes, Delete Request',
      cancelText: 'Cancel',
      variant: 'danger',
      onConfirm: async () => {
        setConfirmModal(prev => prev ? { ...prev, isLoading: true } : null);
        try {
          await handleDeleteRequest(req.id);
        } finally {
          setConfirmModal(null);
        }
      }
    });
  };

  const handleToggleAccepting = async (req: JobRequest) => {
    const isCurrentlyPaused = req.status === 'CLOSED' || (req.status as string) === 'closed' || (req.status as string) === 'paused';
    const nextStatus: 'OPEN' | 'CLOSED' = isCurrentlyPaused ? 'OPEN' : 'CLOSED';

    // 1. Instant optimistic local update (0ms switch flip in advance, NO flicker!)
    setMyOwnRequests(prev => prev ? prev.map(r => r.id === req.id ? { ...r, status: nextStatus } : r) : null);

    // 2. Dispatch background API update (toast notification fires when update is confirmed)
    const ok = await toggleJobRequestStatus(req.id, req.status);
    if (!ok) {
      // Rollback on network failure
      setMyOwnRequests(prev => prev ? prev.map(r => r.id === req.id ? { ...r, status: req.status } : r) : null);
    }
  };

  const handleOpenEdit = (req: any) => {
    setEditingRequest({
      requestId: req.id,
      title: req.title,
      budget: req.budget,
      description: req.description
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRequest) return;
    
    editJobRequest(
      editingRequest.requestId,
      editingRequest.title,
      editingRequest.budget,
      editingRequest.description
    );
    
    setEditingRequest(null);
  };

  return (
    <div className={`space-y-6 select-none transition-colors duration-200 ${isDark ? 'text-[#f2efe9]' : 'text-slate-800'}`}>
      
      {/* Header Action Strip & Status Filter Tabs */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 ${isDark ? 'border-neutral-800/80' : 'border-slate-200'}`}>
        {/* Quick Info & Count */}
        <div className="flex items-center space-x-2">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-50 text-orange-600'}`}>
            <ClipboardList className="w-4 h-4" />
          </div>
          <div>
            <h2 className={`text-sm font-extrabold ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
              Broadcasted Requests
            </h2>
            <p className={`text-[11px] ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>
              {myRequests.length} {myRequests.length === 1 ? 'task request' : 'task requests'} posted to local Cordova providers
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
        <div className={`rounded-[24px] p-12 border text-center text-sm font-medium transition-colors duration-200 ${
          isDark ? 'bg-[#22211e] border-neutral-800/80 text-[#b4b0a9]' : 'bg-white border-slate-200 text-slate-500'
        }`}>
          You haven't broadcasted any public task requests yet. Click "+ New Request" to start.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-4">
            {paginatedRequests.map((req) => {
              const offerCount = bids.filter(b => b.requestId === req.id && b.status === 'pending').length;
              const isPaused = req.status === 'CLOSED' || (req.status as string) === 'closed' || (req.status as string) === 'paused';
              const isBooked = req.status === 'IN_PROGRESS' || (req.status as string) === 'in_progress';
              
              return (
                <div 
                  key={req.id} 
                  className={`rounded-[26px] p-6 border transition-all duration-200 flex flex-col space-y-4 shadow-sm hover:shadow-md ${
                    isDark 
                      ? 'bg-[#22211e] border-neutral-800/80 hover:border-neutral-700' 
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Tier 1: Header Bar (Badges on Left, Action Controls on Right) */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    {/* Left: Category & Urgency Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 border ${
                        isDark ? 'bg-orange-950/30 border-orange-900/40 text-orange-400' : 'bg-orange-50 border-orange-200 text-orange-700'
                      }`}>
                        📁 {req.category}
                      </span>

                      <span className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 border ${
                        isDark ? 'bg-amber-955/20 border-amber-900/30 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-800'
                      }`}>
                        ⏰ Needed: {formatUrgencyDisplay(req.urgency)}
                      </span>

                      <span className={`px-2.5 py-1 rounded-xl text-xs font-semibold border ${
                        isDark ? 'bg-[#1c1b18] border-neutral-800 text-neutral-400' : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}>
                        📍 Central Cordova
                      </span>
                    </div>

                    {/* Right: Action Buttons & Toggle */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Offers count badge */}
                      <button
                        onClick={onNavigateToOffers}
                        className={`inline-flex items-center space-x-1 px-3 py-1.5 border rounded-xl transition-all text-xs font-extrabold cursor-pointer ${
                          offerCount > 0
                            ? isDark 
                              ? 'bg-orange-950/40 text-orange-400 border-orange-800/60 hover:bg-orange-900/50' 
                              : 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200'
                            : isDark
                              ? 'bg-[#1c1b18] text-[#b4b0a9] border-neutral-800 hover:bg-[#2c2b27]'
                              : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Offers [{offerCount}]</span>
                      </button>

                      {/* AI suggestions button */}
                      <button
                        onClick={() => handleToggleAiSuggestions(req.id)}
                        className={`inline-flex items-center space-x-1 px-3 py-1.5 border rounded-xl transition-all text-xs font-bold cursor-pointer ${
                          activeAiRequestId === req.id
                            ? isDark
                              ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
                              : 'bg-orange-100 text-orange-700 border-orange-300'
                            : isDark
                              ? 'border-neutral-800 hover:bg-[#2c2b27] text-[#b4b0a9] hover:text-[#f2efe9]'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                        <span>AI Matches</span>
                      </button>

                      {/* Edit button */}
                      <button
                        onClick={() => handleOpenEdit(req)}
                        className={`px-3 py-1.5 border font-bold text-xs rounded-xl transition-all flex items-center space-x-1 cursor-pointer ${
                          isDark 
                            ? 'border-neutral-800 hover:bg-[#2c2b27] text-[#b4b0a9] hover:text-[#f2efe9]' 
                            : 'border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      {/* Delete button */}
                      <button
                        onClick={() => handleDeleteRequestClick(req)}
                        className={`px-3 py-1.5 border font-bold text-xs rounded-xl transition-all flex items-center space-x-1 cursor-pointer ${
                          isDark 
                            ? 'border-red-950/45 hover:bg-red-950/20 text-red-400' 
                            : 'border-red-200 hover:bg-red-50 text-red-500'
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>

                      {/* Toggle accepting switch — locked when already booked */}
                      <div className={`flex items-center space-x-2 border-l pl-3 ml-1 ${isDark ? 'border-neutral-850' : 'border-slate-200'}`}>
                        {isBooked ? (
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-extrabold border ${
                              isDark
                                ? 'bg-blue-950/40 text-blue-400 border-blue-900/50'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}>
                              ⚡ Booked
                            </span>
                            {onNavigateToActivity && (
                              <button
                                onClick={onNavigateToActivity}
                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                                  isDark
                                    ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/50 hover:bg-emerald-900/40'
                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                }`}
                              >
                                View Booking
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleToggleAccepting(req)}
                              className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-250 ease-in-out focus:outline-none ${
                                !isPaused ? 'bg-emerald-500' : isDark ? 'bg-neutral-800' : 'bg-slate-300'
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-250 ease-in-out ${
                                  !isPaused ? 'translate-x-4' : 'translate-x-0'
                                }`}
                              />
                            </button>
                            
                            <span className={`text-xs font-bold ${!isPaused ? 'text-emerald-600 dark:text-emerald-400' : isDark ? 'text-neutral-500' : 'text-slate-400'}`}>
                              {!isPaused ? 'Active' : 'Paused'}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tier 2: Title & Description */}
                  <div className="space-y-1.5">
                    <h3 className={`font-extrabold text-base sm:text-lg leading-snug ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
                      {req.title}
                    </h3>
                    {req.description && (
                      <p className={`text-xs sm:text-sm leading-relaxed line-clamp-2 ${isDark ? 'text-[#b4b0a9]' : 'text-slate-600'}`}>
                        {req.description}
                      </p>
                    )}
                  </div>

                  {/* Tier 3: Bottom Metrics Bar */}
                  <div className={`pt-3.5 border-t flex flex-wrap items-center justify-between gap-3 text-xs ${
                    isDark ? 'border-neutral-850/80' : 'border-slate-100'
                  }`}>
                    {/* Budget Highlight */}
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Est. Budget:</span>
                      <span className={`font-extrabold text-sm sm:text-base ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                        ₱{req.budget}
                      </span>
                    </div>

                    {/* Metadata Pills */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                        isDark ? 'bg-[#1c1b18] border-neutral-800 text-neutral-300' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}>
                        💬 {offerCount} {offerCount === 1 ? 'Offer' : 'Offers'} Received
                      </span>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                        isDark ? 'bg-[#1c1b18] border-neutral-800 text-neutral-300' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}>
                        ⚡ {formatUrgencyDisplay(req.urgency)}
                      </span>
                    </div>
                  </div>

                  {/* Collapsible AI Recommendations Section */}
                  {activeAiRequestId === req.id && (
                    <div className={`w-full border-t p-4 mt-2 rounded-2xl animate-in slide-in-from-top-3 duration-200 ${
                      isDark ? 'border-neutral-850 bg-[#1c1b18]/50' : 'border-slate-100 bg-slate-50/70'
                    }`}>
                      <div className="flex items-center space-x-2 mb-3">
                        <Sparkles className={`w-4 h-4 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-[#f2efe9]">
                          Suggested Providers (Gemini Matchmaker)
                        </h4>
                      </div>

                      {loadingAiMap[req.id] ? (
                        <div className="flex items-center space-x-2 py-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce" />
                          <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce delay-100" />
                          <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce delay-200" />
                          <span className="text-xs text-slate-400 dark:text-neutral-400 font-semibold pl-1">Analyzing provider capabilities and trust scores...</span>
                        </div>
                      ) : !aiSuggestions[req.id] ? (
                        <p className="text-xs text-slate-400 dark:text-neutral-500 italic">Click the button above to generate AI-powered provider matches.</p>
                      ) : aiSuggestions[req.id].length === 0 ? (
                        <div className="flex items-start space-x-2 text-xs text-slate-500 dark:text-[#b4b0a9]">
                          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-amber-500" />
                          <span>No providers found in this category yet. Try again after more providers join.</span>
                        </div>
                      ) : aiSuggestions[req.id][0]?.name === "No Suggestion" || aiSuggestions[req.id][0]?.name === "Error" ? (
                        <div className="flex items-start space-x-2 text-xs">
                          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-amber-500" />
                          <span className="text-slate-500 dark:text-[#b4b0a9] italic">{aiSuggestions[req.id][0]?.rationale}</span>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {aiSuggestions[req.id].map((sug, idx) => (
                            <div 
                              key={idx}
                              className={`p-3 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs transition-colors ${
                                isDark ? 'bg-[#22211e] border-neutral-800 text-[#f2efe9]' : 'bg-white border-slate-200 text-slate-800'
                              }`}
                            >
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                  <span className="font-extrabold text-orange-600 dark:text-orange-400">Rank #{idx + 1}</span>
                                  <span className="font-extrabold text-slate-900 dark:text-white">{sug.name}</span>
                                </div>
                                <p className="text-slate-650 dark:text-[#b4b0a9] italic leading-normal">
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

      {/* Edit Form Modal Overlay */}
      {editingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm select-none animate-in fade-in duration-200">
          <div className={`rounded-[24px] max-w-lg w-full overflow-hidden shadow-xl border animate-in zoom-in-95 duration-200 ${
            isDark ? 'bg-[#22211e] border-neutral-800/80 text-[#f2efe9]' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            
            {/* Header */}
            <div className={`p-5 border-b flex justify-between items-center ${
              isDark ? 'border-neutral-855 bg-[#1c1b18]/45' : 'border-slate-100 bg-slate-50/50'
            }`}>
              <h3 className={`font-extrabold text-sm ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
                Edit Request details
              </h3>
              <button 
                onClick={() => setEditingRequest(null)}
                className={`p-1.5 rounded-lg border transition-colors ${
                  isDark ? 'border-neutral-800 hover:bg-slate-800 text-neutral-450' : 'border-slate-200 hover:bg-slate-100 text-slate-400'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4">
              {/* Title */}
              <div>
                <label className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-655'}`}>
                  Request Title
                </label>
                <input 
                  type="text"
                  required
                  value={editingRequest.title}
                  onChange={(e) => setEditingRequest({ ...editingRequest, title: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border outline-none font-medium text-sm transition-all ${
                    isDark 
                      ? 'bg-[#1c1b18] border-neutral-850 text-[#f2efe9] focus:border-orange-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-700 focus:border-orange-500'
                  }`}
                />
              </div>
 
              {/* Budget */}
              <div>
                <label className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-655'}`}>
                  Estimated Budget (₱)
                </label>
                <input 
                  type="number"
                  required
                  min={1}
                  value={editingRequest.budget}
                  onChange={(e) => setEditingRequest({ ...editingRequest, budget: Number(e.target.value) })}
                  className={`w-full px-4 py-3 rounded-xl border outline-none font-semibold text-sm transition-all ${
                    isDark 
                      ? 'bg-[#1c1b18] border-neutral-855 text-[#f2efe9] focus:border-orange-500/80' 
                      : 'bg-slate-50 border-slate-200 text-slate-750 focus:border-orange-500'
                  }`}
                />
              </div>
 
              {/* Description */}
              <div>
                <label className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-655'}`}>
                  Description
                </label>
                <textarea 
                  rows={4}
                  required
                  value={editingRequest.description}
                  onChange={(e) => setEditingRequest({ ...editingRequest, description: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border outline-none font-medium text-sm resize-none transition-all ${
                    isDark 
                      ? 'bg-[#1c1b18] border-neutral-855 text-[#f2efe9] focus:border-orange-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-700 focus:border-orange-500'
                  }`}
                />
              </div>

              {/* Actions */}
              <div className={`pt-3 border-t flex items-center justify-end space-x-2.5 ${isDark ? 'border-neutral-850' : 'border-slate-100'}`}>
                <button
                  type="button"
                  onClick={() => setEditingRequest(null)}
                  className={`px-4 py-2.5 border font-bold text-xs rounded-xl transition-all ${
                    isDark 
                      ? 'border-neutral-800 hover:bg-[#2c2b27] text-[#b4b0a9]' 
                      : 'border-slate-200 hover:bg-slate-50 text-slate-500'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95"
                >
                  Save Changes
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal state={confirmModal} onClose={() => setConfirmModal(null)} />

    </div>
  );
}
