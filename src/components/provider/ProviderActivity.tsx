import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { JobEngagement } from '../../types';
import {
  Wrench,
  Trash2,
  Send,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Play,
  Calendar,
  Sparkles,
  Search,
  MessageSquare,
  X,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { usePagination } from '../../hooks/usePagination';
import PaginationBar from '../PaginationBar';
import { apiRespondCancellationRequest } from '../../api/bookings.api';
import { useToast } from '../Toast';
import ConfirmModal, { ConfirmModalState } from '../ConfirmModal';


export default function ProviderActivity({ currentProviderId = 'u3' }: { currentProviderId?: string }) {
  const searchParams = useSearchParams();
  const bookingIdParam = searchParams.get('booking');
  const [highlightedBookingId, setHighlightedBookingId] = useState<string | null>(null);
  const {
    jobEngagements,
    bids,
    jobRequests,
    requestJobApproval,
    confirmJobCompletion,
    declineBid,
    providerStartJob,
    providerRemoveFromQueue,
    services,
    isDark,
    refreshEngagements,
    refreshAll,
    notifications
  } = useApp();
  const { success, error: toastError, info } = useToast();

  // Filter engagements and bids for currentProviderId
  const myEngagements = jobEngagements.filter(je => je.providerId === currentProviderId);
  const myPendingBids = bids.filter(b => b.providerId === currentProviderId && b.status === 'pending');

  // Filter state
  const [activeTab, setActiveTab] = useState<'all' | 'in_progress' | 'waiting' | 'pending_offers' | 'awaiting_approval' | 'disputed' | 'canceled'>('all');
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [loadingActionType, setLoadingActionType] = useState<string | null>(null);

  // Confirm Modal state
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState | null>(null);

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
      const allowed = ['all', 'in_progress', 'waiting', 'pending_offers', 'awaiting_approval', 'disputed', 'canceled'];
      if (allowed.includes(tabParam)) {
        setActiveTab(tabParam as any);
      }
    }
  }, [tabParam]);

  useEffect(() => {
    if (bookingIdParam) {
      const found = myEngagements.find(e => e.id === bookingIdParam || e.completedServiceId === bookingIdParam);
      if (found) {
        let targetTab: typeof activeTab = 'all';
        if (found.status === 'in_progress') targetTab = 'in_progress';
        else if (found.status === 'queued' || found.status === 'pending_provider') targetTab = 'waiting';
        else if (found.status === 'awaiting_seeker_approval') targetTab = 'awaiting_approval';
        else if (found.status === 'disputed') targetTab = 'disputed';
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
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price_desc' | 'price_asc'>('newest');

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

  // Helper to fetch details of a request for a bid
  const getRequestForBid = (requestId: string) => {
    return jobRequests.find(r => r.id === requestId);
  };

  // Counts helper
  const countTabItems = (tab: typeof activeTab) => {
    switch (tab) {
      case 'in_progress':
        return myEngagements.filter(je => je.status === 'in_progress').length;
      case 'waiting':
        return myEngagements.filter(je => je.status === 'queued' || je.status === 'pending_provider').length;
      case 'pending_offers':
        return myPendingBids.length;
      case 'awaiting_approval':
        return myEngagements.filter(je => je.status === 'awaiting_seeker_approval').length;
      case 'disputed':
        return myEngagements.filter(je => je.status === 'disputed').length;
      case 'canceled':
        return myEngagements.filter(je => je.status === 'canceled').length;
      default:
        // Exclude completed and canceled engagements from the 'all' counter
        return myEngagements.filter(je => je.status !== 'completed' && je.status !== 'canceled').length + myPendingBids.length;
    }
  };

  const getFilteredItems = () => {
    const combined: Array<{ type: 'bid' | 'engagement', data: any }> = [];

    // Add bids
    if (activeTab === 'all' || activeTab === 'pending_offers') {
      myPendingBids.forEach(b => {
        const req = getRequestForBid(b.requestId);
        const matchesSearch =
          searchQuery.trim() === '' ||
          (req?.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (req?.seekerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (req?.category || '').toLowerCase().includes(searchQuery.toLowerCase());

        if (matchesSearch) {
          combined.push({ type: 'bid', data: b });
        }
      });
    }

    // Add engagements
    myEngagements.forEach(je => {
      // Exclude completed engagements from ProviderActivity completely
      if (je.status === 'completed') return;
      // Exclude canceled engagements from 'all' tab
      if (je.status === 'canceled' && activeTab !== 'canceled') return;

      let matchesTab = false;
      if (activeTab === 'all') matchesTab = true;
      else if (activeTab === 'in_progress' && je.status === 'in_progress') matchesTab = true;
      else if (activeTab === 'waiting' && (je.status === 'queued' || je.status === 'pending_provider')) matchesTab = true;
      else if (activeTab === 'awaiting_approval' && je.status === 'awaiting_seeker_approval') matchesTab = true;
      else if (activeTab === 'disputed' && je.status === 'disputed') matchesTab = true;
      else if (activeTab === 'canceled' && je.status === 'canceled') matchesTab = true;

      if (!matchesTab) return;

      const matchesSearch =
        searchQuery.trim() === '' ||
        je.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        je.seekerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getCategoryForEngagement(je).toLowerCase().includes(searchQuery.toLowerCase());

      if (matchesSearch) {
        combined.push({ type: 'engagement', data: je });
      }
    });

    // Sort combined items
    return [...combined].sort((a, b) => {
      const dateA = new Date(a.type === 'bid' ? a.data.createdAt : a.data.createdAt).getTime();
      const dateB = new Date(b.type === 'bid' ? b.data.createdAt : b.data.createdAt).getTime();
      const priceA = Number(a.type === 'bid' ? a.data.price : a.data.price);
      const priceB = Number(b.type === 'bid' ? b.data.price : b.data.price);

      if (sortBy === 'newest') return dateB - dateA;
      if (sortBy === 'oldest') return dateA - dateB;
      if (sortBy === 'price_desc') return priceB - priceA;
      if (sortBy === 'price_asc') return priceA - priceB;
      return 0;
    });
  };

  const filteredItems = getFilteredItems();

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
  } = usePagination(filteredItems, 6);

  const [respondingReqId, setRespondingReqId] = useState<string | null>(null);
  const [declineNote, setDeclineNote] = useState<string>('');

  const handleProviderStartJob = async (id: string) => {
    setLoadingItemId(id);
    setLoadingActionType('start');
    try {
      await providerStartJob(id);
    } catch (err) {
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
    } catch (err) {
      // already toasted
    } finally {
      setLoadingItemId(null);
      setLoadingActionType(null);
    }
  };

  const handleForceApprove = async (id: string) => {
    setLoadingItemId(id);
    setLoadingActionType('force_approve');
    try {
      await confirmJobCompletion(id);
    } catch (err) {
      // already toasted
    } finally {
      setLoadingItemId(null);
      setLoadingActionType(null);
    }
  };

  const handleProviderRemoveFromQueue = async (id: string) => {
    setLoadingItemId(id);
    setLoadingActionType('remove');
    try {
      await providerRemoveFromQueue(id);
    } catch (err) {
      // already toasted
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
    } catch (err) {
      // already toasted
    } finally {
      setLoadingItemId(null);
      setLoadingActionType(null);
    }
  };

  const handleApproveCancellation = async (requestId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Approve Cancellation',
      message: 'Approve this cancellation request? The booking will be cancelled and the seeker refunded.',
      confirmText: 'Approve & Refund',
      cancelText: 'Keep Booking',
      variant: 'warning',
      onConfirm: async () => {
        setConfirmModal(prev => prev ? { ...prev, isLoading: true } : null);
        setLoadingItemId(requestId);
        setLoadingActionType('approve_cancellation');
        try {
          const res = await apiRespondCancellationRequest(requestId, true);
          if (res.success) {
            success('Cancellation Approved', 'Booking cancelled and seeker will be refunded.');
            refreshEngagements();
          } else {
            toastError('Action Failed', res.message || 'Failed to approve cancellation.');
          }
        } catch (err: any) {
          toastError('Action Failed', err.response?.data?.message || 'Error responding to cancellation request.');
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
    if (!respondingReqId) return;
    setLoadingItemId(respondingReqId);
    setLoadingActionType('decline_cancellation');
    try {
      const res = await apiRespondCancellationRequest(respondingReqId, false, declineNote);
      if (res.success) {
        info('Cancellation Declined', 'The seeker has been notified and may escalate to admin.');
        setRespondingReqId(null);
        setDeclineNote('');
        refreshEngagements();
      } else {
        toastError('Action Failed', res.message || 'Failed to decline cancellation.');
      }
    } catch (err: any) {
      toastError('Action Failed', err.response?.data?.message || 'Error declining cancellation.');
    } finally {
      setLoadingItemId(null);
      setLoadingActionType(null);
    }
  };


  return (
    <div className={`space-y-6 select-none transition-colors duration-200 ${isDark ? 'text-[#f2efe9]' : 'text-slate-800'}`}>



      {/* Filter Pills */}
      <div className={`flex flex-wrap gap-2 border-b pb-4 ${isDark ? 'border-neutral-800/80' : 'border-slate-200'}`}>
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${activeTab === 'all'
              ? isDark
                ? 'bg-[#f2efe9] border-[#f2efe9] text-slate-950 shadow-sm'
                : 'bg-slate-900 border-slate-900 text-white shadow-sm'
              : isDark
                ? 'bg-[#22211e] hover:bg-[#2c2b27] border-neutral-850 text-[#b4b0a9]'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-500'
            }`}
        >
          All ({countTabItems('all')})
        </button>

        <button
          onClick={() => setActiveTab('in_progress')}
          className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${activeTab === 'in_progress'
              ? isDark
                ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400 font-extrabold'
                : 'bg-emerald-50 border-emerald-200 text-emerald-600 font-extrabold'
              : isDark
                ? 'bg-[#22211e] hover:bg-[#2c2b27] border-neutral-850 text-[#b4b0a9]'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-500'
            }`}
        >
          In Progress ({countTabItems('in_progress')})
        </button>

        <button
          onClick={() => setActiveTab('waiting')}
          className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${activeTab === 'waiting'
              ? isDark
                ? 'bg-amber-955/20 border-amber-900/30 text-amber-450 font-extrabold'
                : 'bg-amber-50 border-amber-200 text-amber-600 font-extrabold'
              : isDark
                ? 'bg-[#22211e] hover:bg-[#2c2b27] border-neutral-850 text-[#b4b0a9]'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-500'
            }`}
        >
          Waiting ({countTabItems('waiting')})
        </button>

        <button
          onClick={() => setActiveTab('pending_offers')}
          className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${activeTab === 'pending_offers'
              ? isDark
                ? 'bg-orange-950/20 border-orange-900/30 text-orange-400 font-extrabold'
                : 'bg-orange-50 border-orange-200 text-orange-600 font-extrabold'
              : isDark
                ? 'bg-[#22211e] hover:bg-[#2c2b27] border-neutral-850 text-[#b4b0a9]'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-500'
            }`}
        >
          Pending Offers ({countTabItems('pending_offers')})
        </button>

        <button
          onClick={() => setActiveTab('awaiting_approval')}
          className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${activeTab === 'awaiting_approval'
              ? isDark
                ? 'bg-purple-950/20 border-purple-900/30 text-purple-400 font-extrabold'
                : 'bg-purple-50 border-purple-200 text-purple-600 font-extrabold'
              : isDark
                ? 'bg-[#22211e] hover:bg-[#2c2b27] border-neutral-850 text-[#b4b0a9]'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-500'
            }`}
        >
          Awaiting Approval ({countTabItems('awaiting_approval')})
        </button>

        <button
          onClick={() => setActiveTab('disputed')}
          className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${activeTab === 'disputed'
              ? isDark
                ? 'bg-red-955/20 border-red-900/30 text-red-400 font-extrabold'
                : 'bg-red-50 border-red-200 text-red-655 font-extrabold'
              : isDark
                ? 'bg-[#22211e] hover:bg-[#2c2b27] border-neutral-855 text-[#b4b0a9]'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-500'
            }`}
        >
          Disputes ({countTabItems('disputed')})
        </button>

        <button
          onClick={() => setActiveTab('canceled')}
          className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${activeTab === 'canceled'
              ? isDark
                ? 'bg-neutral-800/40 border-neutral-750 text-[#f2efe9] font-extrabold'
                : 'bg-slate-100 border-slate-300 text-slate-700 font-extrabold'
              : isDark
                ? 'bg-[#22211e] hover:bg-[#2c2b27] border-neutral-855 text-[#b4b0a9]'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-550'
            }`}
        >
          Canceled ({countTabItems('canceled')})
        </button>

      </div>

      {/* Grid of job/bid cards */}
      <div className="space-y-6">

        {/* Search & Sort Panel */}
        {(myPendingBids.length > 0 || myEngagements.length > 0) && (
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Search Box */}
            <div className={`flex items-center rounded-xl px-3 py-2 w-full sm:max-w-md border transition-all ${isDark ? 'bg-[#1c1b18] border-neutral-800/80' : 'bg-slate-50 border-slate-300'
              }`}>
              <span className={isDark ? 'text-[#b4b0a9]' : 'text-slate-400'}>
                <Search className="w-4 h-4 mr-2" />
              </span>
              <input
                type="text"
                placeholder="Search by job title, client name or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-xs w-full text-slate-800 dark:text-[#f2efe9] placeholder-slate-400"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <span className={`text-xs font-semibold whitespace-nowrap ${isDark ? 'text-[#b4b0a9]' : 'text-slate-550'}`}>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className={`px-3 py-2 rounded-xl border outline-none font-bold text-xs transition-all ${isDark
                    ? 'bg-[#1c1b18] border-neutral-800/80 text-[#f2efe9]'
                    : 'bg-white border-slate-300 text-slate-700'
                  }`}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price_desc">Budget: High to Low</option>
                <option value="price_asc">Budget: Low to High</option>
              </select>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredItems.length === 0 ? (
            <div className={`col-span-2 rounded-[24px] p-12 border text-center text-sm font-medium transition-colors duration-200 ${isDark ? 'bg-[#22211e] border-neutral-800/80 text-[#b4b0a9]' : 'bg-white border-slate-200 text-slate-500'
              }`}>
              No active jobs or proposals fit the selected category.
            </div>
          ) : (
            paginatedItems.map((item) => {
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
                        📁 {req?.category || 'General'}
                      </span>
                      <span className={isDark ? 'text-[#b4b0a9]' : 'text-slate-400'}>
                        📅 {formattedDate}
                      </span>
                    </div>

                    {/* Title & Info */}
                    <div className="space-y-2">
                      <h3 className={`font-extrabold text-sm leading-snug tracking-tight ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
                        {req?.title || 'Public Job Proposal'}
                      </h3>
                      <div className="flex items-center text-[11px] font-bold">
                        <span className={isDark ? 'text-[#b4b0a9]' : 'text-slate-455'}>Client:</span>
                        <span className={`ml-1 ${isDark ? 'text-[#f2efe9]' : 'text-slate-700'}`}>{req?.seekerName || 'Platform Seeker'}</span>
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

                    {/* Escrow/Payment details banner */}
                    {hasEscrow && (
                      je.paymentMethod === 'GCash' ? (
                        <div className={`rounded-xl p-3 border text-[10px] leading-relaxed flex items-center justify-between transition-all ${isDark ? 'bg-emerald-955/15 border-emerald-900/20 text-emerald-400' : 'bg-emerald-50/40 border-emerald-100 text-emerald-700'
                          }`}>
                          <span className="font-semibold">🔒 Escrow Protected (GCash Hold)</span>
                          <span className="font-extrabold">₱{je.price} Secured</span>
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
                        return (
                          <div className={`border rounded-xl p-4 text-xs flex flex-col space-y-3 ${isDark ? 'bg-orange-950/20 border-orange-900/30 text-orange-400' : 'bg-orange-50 border-orange-200 text-orange-700'
                            }`}>
                            <div className="flex items-start space-x-2">
                              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 animate-bounce" />
                              <div>
                                <span className="font-extrabold block">Cancellation Requested by Seeker</span>
                                <span className="text-[10px] leading-relaxed block mt-0.5">Reason: "{activeReq.reason || 'No explanation provided'}"</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
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
                            </div>
                          </div>
                        );
                      }
                      if (activeReq.status === 'DECLINED') {
                        return (
                          <div className={`border rounded-xl p-3 text-[10px] flex items-start space-x-2 ${isDark ? 'bg-[#1c1b18] border-neutral-850 text-[#b4b0a9]' : 'bg-slate-50 border-slate-200 text-slate-500'
                            }`}>
                            <Clock className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                            <span>You declined the cancellation request. Note: "{activeReq.providerNote || 'None'}"</span>
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
                        <span className={`text-[9px] font-bold uppercase tracking-wider block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-450'}`}>Escrow Amount</span>
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
                        {je.status === 'completed' && (
                          <span className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border ${isDark ? 'text-emerald-455 bg-emerald-955/20 border-emerald-900/30' : 'text-emerald-700 bg-emerald-50 border-emerald-100'
                            }`}>
                            Completed
                          </span>
                        )}
                        {je.status === 'canceled' && (
                          <span className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border ${isDark ? 'text-neutral-500 bg-[#1c1b18] border-neutral-855' : 'text-slate-400 bg-slate-100 border border-slate-200'
                            }`}>
                            Canceled
                          </span>
                        )}

                        {/* Direct Chat shortcut */}
                        {['in_progress', 'queued', 'disputed'].includes(je.status) && (
                          <button className={`p-2 border rounded-xl flex items-center justify-center cursor-pointer transition-colors ${isDark ? 'border-neutral-800 hover:bg-slate-800 text-[#f2efe9]' : 'border-slate-300 hover:bg-slate-50 text-slate-700'
                            }`} title="Message Client">
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Action buttons */}
                        {je.status === 'in_progress' && (() => {
                          const isStarted = !!je.started;
                          if (!isStarted) {
                            return (
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
                            );
                          }
                          return (
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
                          );
                        })()}

                        {je.status === 'awaiting_seeker_approval' && (
                          <button
                            disabled={!!loadingItemId}
                            onClick={() => handleForceApprove(je.id)}
                            className={`px-3.5 py-1.5 font-extrabold text-[10px] rounded-xl transition-all shadow-sm active:scale-95 flex items-center justify-center space-x-1 cursor-pointer ${
                              loadingItemId === je.id && loadingActionType === 'force_approve'
                                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed opacity-60'
                                : isDark
                                  ? 'bg-[#f2efe9] hover:bg-white text-slate-950'
                                  : 'bg-slate-900 hover:bg-slate-800 text-white'
                            }`}
                            title="Speed up demo testing by simulating Seeker releasing cash"
                          >
                            {loadingItemId === je.id && loadingActionType === 'force_approve' ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                                <span>Approving...</span>
                              </>
                            ) : (
                              <span>Force Approve</span>
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
            })
          )}
        </div>

        <PaginationBar
          currentPage={currentPage}
          totalPages={totalPages}
          goToPage={goToPage}
          nextPage={nextPage}
          prevPage={prevPage}
          startIndex={startIndex}
          endIndex={endIndex}
          totalItems={filteredItems.length}
          variant="provider"
        />
      </div>

      {/* Decline cancellation request modal overlay */}
      {respondingReqId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm select-none animate-in fade-in duration-200">
          <div className={`rounded-[24px] max-w-lg w-full overflow-hidden shadow-xl border animate-in zoom-in-95 duration-200 ${isDark ? 'bg-[#22211e] border-neutral-800/80 text-[#f2efe9]' : 'bg-white border-slate-200 text-slate-800'
            }`}>

            <div className={`p-5 border-b flex justify-between items-center ${isDark ? 'border-neutral-850 bg-[#1c1b18]/45' : 'border-slate-100 bg-slate-50/50'
              }`}>
              <h3 className={`font-extrabold text-sm flex items-center space-x-1.5 ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span>Decline Cancellation Request</span>
              </h3>
              <button
                onClick={() => setRespondingReqId(null)}
                className={`p-1.5 rounded-lg border transition-colors ${isDark ? 'border-neutral-800 hover:bg-slate-800 text-neutral-455' : 'border-slate-200 hover:bg-slate-100 text-slate-400'
                  }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDeclineSubmit} className="p-5 space-y-4">
              <p className={`text-[10px] leading-relaxed ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>
                Provide an explanation note to the seeker explaining why you are declining their cancellation request (e.g. work already in progress, resources purchased).
              </p>

              <div>
                <label className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-655'}`}>
                  Decline Reason / Explanation Note
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explain why you are declining the cancellation..."
                  value={declineNote}
                  onChange={(e) => setDeclineNote(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border outline-none font-medium text-sm resize-none transition-all ${isDark
                      ? 'bg-[#1c1b18] border-neutral-850 text-[#f2efe9] focus:border-[#10b981]/80 focus:ring-1 focus:ring-[#10b981]/30'
                      : 'bg-slate-50 border-slate-200 text-slate-700 focus:border-[#10b981]'
                    }`}
                />
              </div>

              {/* Actions */}
              <div className={`pt-3 border-t flex items-center justify-end space-x-2.5 ${isDark ? 'border-neutral-850' : 'border-slate-100'}`}>
                <button
                  type="button"
                  onClick={() => setRespondingReqId(null)}
                  className={`px-4 py-2.5 border font-bold text-xs rounded-xl transition-all ${isDark
                      ? 'border-neutral-800 hover:bg-[#2c2b27] text-[#b4b0a9]'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-500'
                    }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!!loadingItemId}
                  className={`px-5 py-2.5 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center space-x-1.5 cursor-pointer ${
                    loadingItemId === respondingReqId && loadingActionType === 'decline_cancellation'
                      ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed opacity-60'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {loadingItemId === respondingReqId && loadingActionType === 'decline_cancellation' ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                      <span>Declining...</span>
                    </>
                  ) : (
                    <span>Decline Request</span>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        state={confirmModal}
        onClose={() => setConfirmModal(null)}
      />

    </div>
  );
}
