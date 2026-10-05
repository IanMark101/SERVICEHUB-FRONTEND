import TrustScoreBadge from '../ui/TrustScoreBadge';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useApp } from '../../context/AppContext';
import { 
  Check, 
  X, 
  MapPin, 
  Loader2, 
  MessageSquare, 
  Clock, 
  ShieldCheck, 
  Banknote, 
  CreditCard,
  Inbox,
} from 'lucide-react';
import TransactionBlockedModal from '../ui/TransactionBlockedModal';
import { useTransactionPermission } from '../../hooks/useTransactionPermission';
import LimitedModeDashboardCard from '../landing/LimitedModeDashboardCard';

export default function IncomingRequests({ currentProviderId = 'u3' }: { currentProviderId?: string }) {
  const { jobEngagements, jobRequests, bids, respondToDirectBooking, isDark, requestsStatus, engagementsStatus, refreshAll } = useApp();
  const { canTransact } = useTransactionPermission();
  const [loadingJobId, setLoadingJobId] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<'accepting' | 'declining' | null>(null);
  const [blockedModalOpen, setBlockedModalOpen] = useState<boolean>(false);
  const [referenceTime, setReferenceTime] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setReferenceTime(Date.now()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const handleRespond = async (jobId: string, accept: boolean) => {
    if (accept && !canTransact) {
      setBlockedModalOpen(true);
      return;
    }
    setLoadingJobId(jobId);
    setLoadingAction(accept ? 'accepting' : 'declining');
    try {
      await respondToDirectBooking(jobId, accept);
    } catch {
      // already toasted
    } finally {
      setLoadingJobId(null);
      setLoadingAction(null);
    }
  };

  // Filter pending direct bookings
  const pendingRequests = jobEngagements.filter(
    je => je.providerId === currentProviderId && je.status === 'pending_provider'
  );
  const quoteInquiries = jobRequests.filter((request) =>
    request.targetProviderId === currentProviderId && request.targetServiceId && request.status === 'OPEN' &&
    !bids.some((bid) => bid.requestId === request.id && bid.providerId === currentProviderId &&
      ['pending', 'pending_payment', 'PENDING', 'PENDING_PAYMENT', 'accepted', 'ACCEPTED'].includes(bid.status))
  );

  // Compute relative time from a full ISO timestamp
  const formatTimeAgo = (isoStr: string): string => {
    if (!isoStr) return 'Just now';
    if (!referenceTime) return 'Recently';
    const diffMs = referenceTime - new Date(isoStr).getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    if (diffSecs < 60) return diffSecs <= 1 ? 'Just now' : `${diffSecs}s ago`;
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs} hr${diffHrs > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffHrs / 24)} day${Math.floor(diffHrs / 24) > 1 ? 's' : ''} ago`;
  };

  return (
    <div className={`space-y-6 select-none transition-colors duration-200 ${isDark ? 'text-white' : 'text-ink'}`}>
      
      <LimitedModeDashboardCard role="provider" />

      {pendingRequests.length === 0 && quoteInquiries.length === 0 && (requestsStatus === 'loading' || engagementsStatus === 'loading') ? (
        <div role="status" className={`rounded-[24px] border p-12 text-center ${isDark ? 'border-neutral-850 bg-[#22211e] text-ink-muted' : 'border-slate-200 bg-white text-ink-muted'}`}>
          <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin" aria-hidden="true" />
          Loading incoming requests...
        </div>
      ) : pendingRequests.length === 0 && quoteInquiries.length === 0 && (requestsStatus === 'error' || engagementsStatus === 'error') ? (
        <div className={`rounded-[24px] border p-12 text-center ${isDark ? 'border-neutral-850 bg-[#22211e] text-ink-muted' : 'border-slate-200 bg-white text-ink-muted'}`}>
          <p className="text-sm font-semibold">Incoming requests could not be loaded.</p>
          <button type="button" onClick={refreshAll} className="mt-3 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white">Try again</button>
        </div>
      ) : pendingRequests.length === 0 && quoteInquiries.length === 0 ? (
        <div className={`rounded-[24px] p-12 border text-center transition-all ${
          isDark ? 'bg-[#22211e] border-neutral-850 text-ink-muted' : 'bg-white border-slate-200 shadow-sm text-ink-muted'
        }`}>
          <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center bg-emerald-500/10 text-emerald-500">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className={`text-sm font-extrabold mb-1 ${isDark ? 'text-white' : 'text-ink'}`}>
            No Incoming Requests
          </h3>
          <p className="text-xs max-w-md mx-auto text-ink-muted dark:text-ink-muted">
            When seekers choose your priced listings, their booking requests will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {quoteInquiries.map((request) => (
            <div key={request.id} className={`rounded-[20px] border p-4 sm:p-5 shadow-sm ${isDark ? 'border-neutral-850 bg-[#22211e]' : 'border-slate-200 bg-white'}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-600 dark:text-orange-400">Existing listing inquiry · final price needed</span>
                  <h3 className="uppercase break-words [overflow-wrap:anywhere] text-sm font-extrabold">{request.title}</h3>
                  <p className="text-xs text-ink-muted dark:text-ink-muted">From {request.seekerName}</p>
                </div>
                <Link href={`/provider/browse-services?request=${encodeURIComponent(request.id)}`} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700">
                  Send quote
                </Link>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-xs leading-relaxed text-ink-muted dark:text-ink-secondary">{request.description}</p>
              <p className="mt-2 text-xs font-semibold text-ink-muted dark:text-ink-muted">{request.budget ? `Listed rate: ₱${request.budget}` : 'Custom price · quote required'}</p>
              <p className="mt-1 text-xs font-semibold text-ink-muted dark:text-ink-muted">Seeker selected: {request.preferredPaymentMethod}</p>
            </div>
          ))}
          {pendingRequests.map((je) => {
            const isVerified = je.seekerVerificationStatus === 'APPROVED';
            const trustScore = typeof je.seekerTrustScore === 'number' ? je.seekerTrustScore : 50;
            const location = je.seekerLocation || 'Cordova, Cebu';

            return (
              <div 
                key={je.id} 
                className={`rounded-[20px] p-4 sm:p-5 border shadow-sm transition-all duration-200 ${
                  isDark 
                    ? 'bg-[#22211e] border-neutral-850 hover:border-neutral-800' 
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
                }`}
              >
                {/* Row 1: Header with Seeker Profile (Left) & Price/Payment (Right) */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {/* Left: Avatar + Name + Badges */}
                  <Link href={`/profile/${encodeURIComponent(je.seekerId)}`} className="group/profile flex min-w-0 items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500" aria-label={`View ${je.seekerName}'s profile`}>
                    {je.seekerAvatar ? (
                      <Image unoptimized width={40} height={40}
                        src={je.seekerAvatar} 
                        alt={je.seekerName} 
                        className="w-10 h-10 rounded-full object-cover border border-neutral-700/60 shadow-sm shrink-0 transition-transform group-hover/profile:scale-[1.03]"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-extrabold text-sm shadow-sm shrink-0">
                        {je.seekerName ? je.seekerName.charAt(0).toUpperCase() : 'S'}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`font-extrabold text-sm truncate transition-colors group-hover/profile:text-emerald-600 dark:group-hover/profile:text-emerald-400 ${isDark ? 'text-white' : 'text-ink'}`}>
                          {je.seekerName}
                        </span>
                        {isVerified && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                            <ShieldCheck className="w-3 h-3" /> Verified
                          </span>
                        )}
                        <span className="text-slate-300 dark:text-ink-secondary">•</span>
                        <span className={`font-bold text-xs ${isDark ? 'text-amber-400/90' : 'text-amber-600'}`}>
                          {je.title}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] text-ink-muted dark:text-ink-muted font-medium">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-red-400" />
                          {location}
                        </span>
                        <span>•</span>
                        <TrustScoreBadge score={trustScore} />
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(je.createdAt)}
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* Right: Offered Rate & Payment */}
                  <div className="flex items-center gap-2.5 sm:text-right shrink-0">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-ink-subtle dark:text-ink-subtle block">
                        Booking Total
                      </span>
                      <span className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400">
                        ₱{Number(je.price).toLocaleString()}
                      </span>
                      {!!je.quantity && je.quantity > 1 && <span className="block text-[10px] text-ink-muted dark:text-ink-muted">{je.quantity} {je.priceType === 'PER_DAY' ? 'days' : 'hours'} requested</span>}
                    </div>
                    <div className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold border flex items-center gap-1 shadow-xs ${
                      je.paymentMethod !== 'On-site Cash'
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    }`}>
                      {je.paymentMethod !== 'On-site Cash' ? <CreditCard className="w-3 h-3" /> : <Banknote className="w-3 h-3" />}
                      <span>{je.paymentMethod || 'On-site Cash'}</span>
                    </div>
                  </div>
                </div>

                {/* Row 2: Customer Note (Compact Single-Container Inline Strip) */}
                {je.description && (
                  <div className={`mt-3 px-3.5 py-2.5 rounded-xl border flex items-start gap-2 text-xs leading-relaxed ${
                    isDark ? 'bg-[#181714] border-neutral-850' : 'bg-slate-50 border-slate-200/80'
                  }`}>
                    <MessageSquare className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span className="font-semibold text-ink-subtle dark:text-ink-subtle shrink-0">Note:</span>
                    <span className={`italic font-medium ${isDark ? 'text-white' : 'text-ink-secondary'}`}>
                      &quot;{je.description}&quot;
                    </span>
                  </div>
                )}

                {je.preferredSchedule && (
                  <div className={`mt-2 px-3.5 py-2.5 rounded-xl border flex flex-wrap items-start gap-2 text-xs leading-relaxed ${
                    isDark ? 'bg-[#181714] border-neutral-850' : 'bg-slate-50 border-slate-200/80'
                  }`}>
                    <Clock className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="font-semibold text-ink-subtle dark:text-ink-subtle shrink-0">Preferred schedule:</span>
                    <span className={isDark ? 'text-white' : 'text-ink-secondary'}>{je.preferredSchedule}</span>
                  </div>
                )}

                {/* Row 3: Action Buttons Footer */}
                <div className={`mt-3 pt-3 border-t flex items-center justify-between gap-3 ${
                  isDark ? 'border-neutral-850/80' : 'border-slate-100'
                }`}>
                  <span className="text-[11px] font-medium text-ink-subtle dark:text-ink-subtle hidden sm:inline">
                    Accepting confirms this booking and unlocks private messaging. Starting the job remains a separate action.
                  </span>

                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      type="button"
                      disabled={!!loadingJobId}
                      onClick={() => handleRespond(je.id, false)}
                      className={`px-3.5 py-1.5 border font-bold text-xs rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
                        loadingJobId === je.id && loadingAction === 'declining'
                          ? 'bg-neutral-800 border-neutral-800 text-ink-muted cursor-not-allowed opacity-60'
                          : isDark 
                            ? 'border-neutral-800 hover:bg-red-950/30 hover:text-red-400 hover:border-red-900/40 text-ink-muted'
                            : 'border-slate-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-ink-secondary'
                      }`}
                    >
                      {loadingJobId === je.id && loadingAction === 'declining' ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Declining...</span>
                        </>
                      ) : (
                        <>
                          <X className="w-3 h-3" />
                          <span>Decline</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={!!loadingJobId}
                      onClick={() => handleRespond(je.id, true)}
                      className={`px-4 sm:px-5 py-1.5 font-extrabold text-xs rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1 cursor-pointer ${
                        loadingJobId === je.id && loadingAction === 'accepting'
                          ? 'bg-neutral-800 text-ink-muted cursor-not-allowed opacity-60'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      }`}
                    >
                      {loadingJobId === je.id && loadingAction === 'accepting' ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Accepting...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept Job</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Transaction Blocked Modal */}
      <TransactionBlockedModal
        isOpen={blockedModalOpen}
        onClose={() => setBlockedModalOpen(false)}
      />

    </div>
  );
}
