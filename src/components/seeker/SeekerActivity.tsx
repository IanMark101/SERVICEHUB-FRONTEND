import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { JobEngagement } from '../../types';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  Play,
  HelpCircle,
  X,
  MessageSquare,
  AlertCircle,
  Search,
  ChevronDown
} from 'lucide-react';
import { usePagination } from '../../hooks/usePagination';
import PaginationBar from '../PaginationBar';
import { apiCancelBooking, apiEscalateCancellationRequest } from '../../api/bookings.api';
import { apiSubmitReview } from '../../api/reviews.api';
import ReviewModal from './ReviewModal';
import { useToast } from '../Toast';


export default function SeekerActivity({ currentUserId = 'u1' }: { currentUserId?: string }) {
  const { jobEngagements, confirmJobCompletion, disputeJob, cancelQueue, services, jobRequests, isDark, refreshEngagements } = useApp();
  const { success, error: toastError, info } = useToast();


  // Active user is currentUserId
  const myEngagements = jobEngagements.filter(je => je.seekerId === currentUserId);

  // Filter Tab State
  const [activeTab, setActiveTab] = useState<'all' | 'action_required' | 'pending' | 'active' | 'waiting' | 'disputed' | 'canceled'>('all');

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

  // Dispute Dialog Modal State
  const [disputingJob, setDisputingJob] = useState<JobEngagement | null>(null);
  const [disputeReason, setDisputeReason] = useState<string>('');

  // Review Modal State
  const [reviewingEngagement, setReviewingEngagement] = useState<JobEngagement | null>(null);

  // Counts helper
  const countStatus = (status: JobEngagement['status'] | 'action_required') => {
    if (status === 'action_required') {
      return myEngagements.filter(je => je.status === 'awaiting_seeker_approval').length;
    }
    return myEngagements.filter(je => je.status === status).length;
  };

  const getFilteredEngagements = () => {
    let list = myEngagements;

    // Filter by tab status
    switch (activeTab) {
      case 'action_required':
        list = myEngagements.filter(je => je.status === 'awaiting_seeker_approval');
        break;
      case 'pending':
        list = myEngagements.filter(je => je.status === 'pending_provider');
        break;
      case 'active':
        list = myEngagements.filter(je => je.status === 'in_progress');
        break;
      case 'waiting':
        list = myEngagements.filter(je => je.status === 'queued');
        break;
      case 'disputed':
        list = myEngagements.filter(je => je.status === 'disputed');
        break;
      case 'canceled':
        list = myEngagements.filter(je => je.status === 'canceled');
        break;
      default:
        list = myEngagements;
    }

    // Filter by search query
    if (searchQuery.trim() !== '') {
      list = list.filter(je =>
        je.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        je.providerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getCategoryForEngagement(je).toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort list
    return [...list].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      if (sortBy === 'newest') return dateB - dateA;
      if (sortBy === 'oldest') return dateA - dateB;
      if (sortBy === 'price_desc') return Number(b.price) - Number(a.price);
      if (sortBy === 'price_asc') return Number(a.price) - Number(b.price);
      return 0;
    });
  };

  const filteredEngagements = getFilteredEngagements();


  // Pagination
  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedEngagements,
    goToPage,
    nextPage,
    prevPage,
    startIndex,
    endIndex
  } = usePagination(filteredEngagements, 6);

  const handleDisputeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputingJob || !disputeReason.trim()) return;

    disputeJob(disputingJob.id, disputeReason);
    setDisputingJob(null);
    setDisputeReason('');
  };

  const handleReviewSubmit = async (rating: number, comment: string, tags: string[]) => {
    if (!reviewingEngagement || !reviewingEngagement.completedServiceId) return;
    await apiSubmitReview({
      completedServiceId: reviewingEngagement.completedServiceId,
      rating,
      text: comment,
      tags
    });
    success('Review Submitted! ⭐', 'Thank you for your feedback.');
    refreshEngagements();
  };


  const [cancelingJob, setCancelingJob] = useState<JobEngagement | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');

  const handleCancelClick = async (je: JobEngagement) => {
    if (!je.started) {
      if (window.confirm("Are you sure you want to cancel this booking?")) {
        try {
          const res = await apiCancelBooking(je.id);
          if (res.success) {
            success('Booking Cancelled', 'You will be refunded since the provider had not started the job.');
            refreshEngagements();
          } else {
            toastError('Cancel Failed', res.message || 'Failed to cancel booking.');
          }
        } catch (err: any) {
          toastError('Cancel Failed', err.response?.data?.message || 'Error canceling booking.');
        }
      }
    } else {
      setCancelingJob(je);
      setCancelReason('');
    }
  };


  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelingJob) return;
    try {
      const res = await apiCancelBooking(cancelingJob.id, cancelReason);
      if (res.success) {
        info('Cancellation Request Sent', 'The provider will review your request.');
        setCancelingJob(null);
        setCancelReason('');
        refreshEngagements();
      } else {
        toastError('Request Failed', res.message || 'Failed to submit request.');
      }
    } catch (err: any) {
      toastError('Request Failed', err.response?.data?.message || 'Error submitting request.');
    }
  };


  const handleEscalateClick = async (requestId: string) => {
    if (window.confirm("Escalate this to Admin? They will review the booking and chat logs to make a final decision.")) {
      try {
        const res = await apiEscalateCancellationRequest(requestId);
        if (res.success) {
          success('Escalated to Admin', 'An administrator will review and resolve your case.');
          refreshEngagements();
        } else {
          toastError('Escalation Failed', res.message || 'Failed to escalate request.');
        }
      } catch (err: any) {
        toastError('Escalation Failed', err.response?.data?.message || 'Error escalating request.');
      }
    }
  };


  const getTabClass = (tab: typeof activeTab, count: number) => {
    const isActive = activeTab === tab;
    const isEmpty = count === 0;

    let baseStyles = "px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ";

    if (isEmpty) {
      baseStyles += "opacity-35 hover:opacity-60 ";
    }

    if (isActive) {
      if (tab === 'all') {
        return baseStyles + (isDark ? 'bg-[#f2efe9] border-[#f2efe9] text-slate-950 shadow-sm' : 'bg-slate-900 border-slate-900 text-white shadow-sm');
      } else if (tab === 'action_required') {
        return baseStyles + (isDark ? 'bg-orange-950/20 border-orange-900/30 text-orange-400 font-extrabold' : 'bg-orange-50 border-orange-200 text-orange-600 font-extrabold');
      } else if (tab === 'active') {
        return baseStyles + (isDark ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-455 font-extrabold' : 'bg-emerald-50 border-emerald-200 text-emerald-600 font-extrabold');
      } else if (tab === 'waiting') {
        return baseStyles + (isDark ? 'bg-amber-950/20 border-amber-900/30 text-amber-450 font-extrabold' : 'bg-amber-50 border-amber-200 text-amber-600 font-extrabold');
      } else if (tab === 'disputed') {
        return baseStyles + (isDark ? 'bg-red-950/20 border-red-900/30 text-red-400 font-extrabold' : 'bg-red-50 border-red-200 text-red-650 font-extrabold');
      } else {
        return baseStyles + (isDark ? 'bg-neutral-800/40 border-neutral-750 text-[#f2efe9] font-extrabold' : 'bg-slate-100 border-slate-300 text-slate-700 font-extrabold');
      }
    } else {
      return baseStyles + (isDark ? 'bg-[#22211e] border-neutral-850 text-[#b4b0a9] hover:bg-[#2c2b27]' : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50');
    }
  };

  return (
    <div className={`space-y-6 select-none transition-colors duration-200 ${isDark ? 'text-[#f2efe9]' : 'text-slate-800'}`}>



      {/* Filter pills at the top */}
      <div className={`flex flex-wrap gap-2 border-b pb-4 ${isDark ? 'border-neutral-800/80' : 'border-slate-200'}`}>
        <button
          onClick={() => setActiveTab('all')}
          className={getTabClass('all', myEngagements.length)}
        >
          All ({myEngagements.length})
        </button>

        <button
          onClick={() => setActiveTab('action_required')}
          className={getTabClass('action_required', countStatus('action_required'))}
        >
          Action Required ({countStatus('action_required')})
        </button>

        <button
          onClick={() => setActiveTab('pending')}
          className={getTabClass('pending', countStatus('pending_provider'))}
        >
          Pending Provider ({countStatus('pending_provider')})
        </button>

        <button
          onClick={() => setActiveTab('active')}
          className={getTabClass('active', countStatus('in_progress'))}
        >
          Active Now ({countStatus('in_progress')})
        </button>

        <button
          onClick={() => setActiveTab('waiting')}
          className={getTabClass('waiting', countStatus('queued'))}
        >
          In Queue ({countStatus('queued')})
        </button>

        <button
          onClick={() => setActiveTab('disputed')}
          className={getTabClass('disputed', countStatus('disputed'))}
        >
          Disputes ({countStatus('disputed')})
        </button>

        <button
          onClick={() => setActiveTab('canceled')}
          className={getTabClass('canceled', countStatus('canceled'))}
        >
          Canceled ({countStatus('canceled')})
        </button>
      </div>

      {/* Cards list matching filters */}
      <div className="space-y-6">

        {/* Search & Sort Panel */}
        {myEngagements.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Search Box */}
            <div className={`flex items-center rounded-xl px-3 py-2 w-full sm:max-w-md border transition-all ${isDark ? 'bg-[#1c1b18] border-neutral-800/80' : 'bg-slate-50 border-slate-300'
              }`}>
              <span className={isDark ? 'text-[#b4b0a9]' : 'text-slate-400'}>
                <Search className="w-4 h-4 mr-2" />
              </span>
              <input
                type="text"
                placeholder="Search by job title or provider name..."
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
          {filteredEngagements.length === 0 ? (
            <div className={`col-span-2 rounded-[24px] p-12 border text-center text-sm font-medium transition-colors duration-200 ${isDark ? 'bg-[#22211e] border-neutral-800/80 text-[#b4b0a9]' : 'bg-white border-slate-300 text-slate-500'
              }`}>
              No active or historical engagements fit the selected category.
            </div>
          ) : (
            paginatedEngagements.map((je) => {
              const formattedDate = new Date(je.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });

              const hasEscrow = ['in_progress', 'awaiting_seeker_approval', 'queued', 'disputed'].includes(je.status);

              return (
                <div
                  key={je.id}
                  className={`rounded-[24px] p-6 border shadow-sm flex flex-col justify-between space-y-4 transition-colors duration-200 ${isDark ? 'bg-[#22211e] border-neutral-800/80 hover:border-neutral-700' : 'bg-white border-slate-300 hover:shadow-md'
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
                      {je.providerAvatar && (
                        <img
                          src={je.providerAvatar}
                          alt={je.providerName}
                          className="w-7 h-7 rounded-full object-cover border border-slate-105 shadow-sm"
                        />
                      )}
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

                  {/* Escrow details banner */}
                  {hasEscrow && (
                    <div className={`rounded-xl p-3 border text-[10px] leading-relaxed flex items-center justify-between transition-all ${isDark ? 'bg-orange-950/15 border-orange-900/20 text-orange-400' : 'bg-orange-50/40 border-orange-100 text-orange-700'
                      }`}>
                      <span className="font-semibold">🔒 Escrow Protected (GCash Hold)</span>
                      <span className="font-extrabold">₱{je.price} Secured</span>
                    </div>
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
                      return (
                        <div className={`border rounded-xl p-3 text-[10px] flex items-start space-x-2 ${isDark ? 'bg-orange-950/15 border-orange-900/20 text-orange-400' : 'bg-orange-50/50 border-orange-200 text-orange-700'
                          }`}>
                          <Clock className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                          <span>Cancellation Requested: Awaiting provider response.</span>
                        </div>
                      );
                    }
                    if (activeReq.status === 'DECLINED') {
                      return (
                        <div className={`border rounded-xl p-3 text-[10px] flex flex-col space-y-2 ${isDark ? 'bg-red-950/15 border-red-900/20 text-red-400' : 'bg-red-50/50 border-red-200 text-red-700'
                          }`}>
                          <div className="flex items-start space-x-2">
                            <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                            <span>Cancellation Declined by Provider: "{activeReq.providerNote || 'No explanation provided'}"</span>
                          </div>
                          <button
                            onClick={() => handleEscalateClick(activeReq.id)}
                            className="self-start px-2.5 py-1 bg-red-650 hover:bg-red-750 text-white font-extrabold text-[9px] rounded-lg transition-all active:scale-95 cursor-pointer"
                          >
                            Escalate to Admin
                          </button>
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
                        const hasReviewed = je.reviews && je.reviews.some((r: any) => r.authorId === currentUserId);
                        return hasReviewed ? (
                          <span className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border ${isDark ? 'text-emerald-455 bg-emerald-955/15 border-emerald-900/30' : 'text-emerald-700 bg-emerald-50 border-emerald-100'
                            }`}>
                            ✓ Reviewed
                          </span>
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
                        <span className={`text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border ${isDark ? 'text-neutral-500 bg-[#1c1b18] border-neutral-855' : 'text-slate-400 bg-slate-100 border border-slate-200'
                          }`}>
                          Canceled
                        </span>
                      )}

                      {/* Chat Message Shortcut Button */}
                      {['in_progress', 'queued', 'disputed'].includes(je.status) && (
                        <button className={`p-2 border rounded-xl flex items-center justify-center cursor-pointer transition-colors ${isDark ? 'border-neutral-800 hover:bg-slate-800 text-[#f2efe9]' : 'border-slate-300 hover:bg-slate-50 text-slate-700'
                          }`} title="Message Provider">
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Explicit Action Triggers */}
                      {je.status === 'awaiting_seeker_approval' && (
                        <div className="flex flex-col items-end space-y-2">
                          <p className="text-[10px] text-orange-500 font-semibold text-right max-w-xs">
                            ⚠️ Releasing funds is final. Verify the service is fully completed to your satisfaction before releasing payment.
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
                              onClick={() => {
                                if (window.confirm("Are you sure you want to release funds to the provider? This action is final and cannot be undone.")) {
                                  confirmJobCompletion(je.id);
                                }
                              }}
                              className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-[10px] rounded-xl transition-all active:scale-95 shadow-sm cursor-pointer"
                            >
                              Release Funds
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
                            onClick={() => handleCancelClick(je)}
                            className={`px-3 py-1.5 border font-bold text-[10px] rounded-xl transition-all cursor-pointer ${isDark
                                ? 'border-neutral-800 hover:bg-red-955/20 hover:text-red-400 hover:border-red-900/30 text-[#b4b0a9]'
                                : 'border-slate-300 hover:bg-red-50 hover:text-red-655 hover:border-red-200 text-slate-550'
                              }`}
                          >
                            {isStarted ? "Request Cancellation" : "Cancel Booking"}
                          </button>
                        );
                      })()}

                    </div>
                  </div>

                </div>
              );
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
          totalItems={filteredEngagements.length}
          variant="seeker"
        />
      </div>

      {/* Dispute filing popup overlay */}
      {disputingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm select-none animate-in fade-in duration-200">
          <div className={`rounded-[24px] max-w-lg w-full overflow-hidden shadow-xl border animate-in zoom-in-95 duration-200 ${isDark ? 'bg-[#22211e] border-neutral-800/80 text-[#f2efe9]' : 'bg-white border-slate-200 text-slate-800'
            }`}>

            <div className={`p-5 border-b flex justify-between items-center ${isDark ? 'border-neutral-850 bg-[#1c1b18]/45' : 'border-slate-100 bg-slate-50/50'
              }`}>
              <h3 className={`font-extrabold text-sm flex items-center space-x-1.5 ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span>File a Service Dispute</span>
              </h3>
              <button
                onClick={() => setDisputingJob(null)}
                className={`p-1.5 rounded-lg border transition-colors ${isDark ? 'border-neutral-800 hover:bg-slate-800 text-neutral-450' : 'border-slate-200 hover:bg-slate-100 text-slate-400'
                  }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDisputeSubmit} className="p-5 space-y-4">
              <p className={`text-[10px] leading-relaxed ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>
                Disputing will freeze this contract and alert a ServiceHub administrator. Describe the issues with the provider's work in detail.
              </p>

              <div>
                <label className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-655'}`}>
                  Reason for Dispute
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe what went wrong (e.g. work not finished, poor quality, provider did not show up)..."
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border outline-none font-medium text-sm resize-none transition-all ${isDark
                      ? 'bg-[#1c1b18] border-neutral-850 text-[#f2efe9] focus:border-orange-500/80 focus:ring-1 focus:ring-orange-500/30'
                      : 'bg-slate-50 border-slate-200 text-slate-700 focus:border-orange-500'
                    }`}
                />
              </div>

              {/* Actions */}
              <div className={`pt-3 border-t flex items-center justify-end space-x-2.5 ${isDark ? 'border-neutral-850' : 'border-slate-100'}`}>
                <button
                  type="button"
                  onClick={() => setDisputingJob(null)}
                  className={`px-4 py-2.5 border font-bold text-xs rounded-xl transition-all ${isDark
                      ? 'border-neutral-800 hover:bg-[#2c2b27] text-[#b4b0a9]'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-500'
                    }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95"
                >
                  File Dispute
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Cancellation request reason popup overlay */}
      {cancelingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm select-none animate-in fade-in duration-200">
          <div className={`rounded-[24px] max-w-lg w-full overflow-hidden shadow-xl border animate-in zoom-in-95 duration-200 ${isDark ? 'bg-[#22211e] border-neutral-800/80 text-[#f2efe9]' : 'bg-white border-slate-200 text-slate-800'
            }`}>

            <div className={`p-5 border-b flex justify-between items-center ${isDark ? 'border-neutral-850 bg-[#1c1b18]/45' : 'border-slate-100 bg-slate-50/50'
              }`}>
              <h3 className={`font-extrabold text-sm flex items-center space-x-1.5 ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
                <AlertCircle className="w-4 h-4 text-orange-500" />
                <span>Submit Cancellation Request</span>
              </h3>
              <button
                onClick={() => setCancelingJob(null)}
                className={`p-1.5 rounded-lg border transition-colors ${isDark ? 'border-neutral-800 hover:bg-slate-800 text-neutral-450' : 'border-slate-200 hover:bg-slate-100 text-slate-400'
                  }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCancelSubmit} className="p-5 space-y-4">
              <p className={`text-[10px] leading-relaxed ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>
                Since the provider has already started the work, you must submit a cancellation request. The provider will review your request and can choose to approve or decline it.
              </p>

              <div>
                <label className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-655'}`}>
                  Reason for Cancellation
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explain why you want to cancel this service booking..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border outline-none font-medium text-sm resize-none transition-all ${isDark
                      ? 'bg-[#1c1b18] border-neutral-850 text-[#f2efe9] focus:border-orange-500/80 focus:ring-1 focus:ring-orange-500/30'
                      : 'bg-slate-50 border-slate-200 text-slate-700 focus:border-orange-500'
                    }`}
                />
              </div>

              {/* Actions */}
              <div className={`pt-3 border-t flex items-center justify-end space-x-2.5 ${isDark ? 'border-neutral-850' : 'border-slate-100'}`}>
                <button
                  type="button"
                  onClick={() => setCancelingJob(null)}
                  className={`px-4 py-2.5 border font-bold text-xs rounded-xl transition-all ${isDark
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
                  Submit Request
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
      {reviewingEngagement && (
        <ReviewModal
          isOpen={!!reviewingEngagement}
          onClose={() => setReviewingEngagement(null)}
          onSubmit={handleReviewSubmit}
          providerName={reviewingEngagement.providerName}
          isDark={isDark}
        />
      )}

    </div>
  );
}
