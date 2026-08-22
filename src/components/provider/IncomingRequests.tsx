import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Check, 
  X, 
  User, 
  MapPin, 
  Loader2, 
  MessageSquare, 
  Clock, 
  ShieldCheck, 
  Star, 
  Banknote, 
  CreditCard,
  Inbox,
  Sparkles
} from 'lucide-react';
import TransactionBlockedModal from '../ui/TransactionBlockedModal';
import { useTransactionPermission } from '../../hooks/useTransactionPermission';
import LimitedModeDashboardCard from '../landing/LimitedModeDashboardCard';

export default function IncomingRequests({ currentProviderId = 'u3' }: { currentProviderId?: string }) {
  const { jobEngagements, respondToDirectBooking, users, services, isDark } = useApp();
  const { canTransact } = useTransactionPermission();
  const [loadingJobId, setLoadingJobId] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<'accepting' | 'declining' | null>(null);
  const [blockedModalOpen, setBlockedModalOpen] = useState<boolean>(false);

  const handleRespond = async (jobId: string, accept: boolean) => {
    if (accept && !canTransact) {
      setBlockedModalOpen(true);
      return;
    }
    setLoadingJobId(jobId);
    setLoadingAction(accept ? 'accepting' : 'declining');
    try {
      await respondToDirectBooking(jobId, accept);
    } catch (err) {
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

  // Compute relative time from a full ISO timestamp
  const formatTimeAgo = (isoStr: string): string => {
    if (!isoStr) return 'Just now';
    const diffMs = Date.now() - new Date(isoStr).getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    if (diffSecs < 60) return diffSecs <= 1 ? 'Just now' : `${diffSecs}s ago`;
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs} hr${diffHrs > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffHrs / 24)} day${Math.floor(diffHrs / 24) > 1 ? 's' : ''} ago`;
  };

  return (
    <div className={`space-y-6 select-none transition-colors duration-200 ${isDark ? 'text-[#f2efe9]' : 'text-slate-800'}`}>
      
      <LimitedModeDashboardCard role="provider" />

      {pendingRequests.length === 0 ? (
        <div className={`rounded-[24px] p-12 border text-center transition-all ${
          isDark ? 'bg-[#22211e] border-neutral-850 text-[#b4b0a9]' : 'bg-white border-slate-200 shadow-sm text-slate-500'
        }`}>
          <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center bg-emerald-500/10 text-emerald-500">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className={`text-sm font-extrabold mb-1 ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
            No Pending Direct Requests
          </h3>
          <p className="text-xs max-w-md mx-auto text-slate-500 dark:text-neutral-400">
            When seekers book your active services directly, their requests will appear here for you to accept or decline.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
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
                  <div className="flex items-center gap-3 min-w-0">
                    {je.seekerAvatar ? (
                      <img 
                        src={je.seekerAvatar} 
                        alt={je.seekerName} 
                        className="w-10 h-10 rounded-full object-cover border border-neutral-700/60 shadow-sm shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-extrabold text-sm shadow-sm shrink-0">
                        {je.seekerName ? je.seekerName.charAt(0).toUpperCase() : 'S'}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`font-extrabold text-sm truncate ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
                          {je.seekerName}
                        </span>
                        {isVerified && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                            <ShieldCheck className="w-3 h-3" /> Verified
                          </span>
                        )}
                        <span className="text-slate-300 dark:text-neutral-700">•</span>
                        <span className={`font-bold text-xs ${isDark ? 'text-amber-400/90' : 'text-amber-600'}`}>
                          {je.title}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-neutral-400 font-medium">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-red-400" />
                          {location}
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-0.5 font-semibold text-amber-500">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          Trust: {trustScore}
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(je.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Offered Rate & Payment */}
                  <div className="flex items-center gap-2.5 sm:text-right shrink-0">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-neutral-500 block">
                        Offered Rate
                      </span>
                      <span className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400">
                        ₱{Number(je.price).toLocaleString()}
                      </span>
                    </div>
                    <div className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold border flex items-center gap-1 shadow-xs ${
                      je.paymentMethod === 'GCash'
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    }`}>
                      {je.paymentMethod === 'GCash' ? <CreditCard className="w-3 h-3" /> : <Banknote className="w-3 h-3" />}
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
                    <span className="font-semibold text-slate-400 dark:text-neutral-500 shrink-0">Note:</span>
                    <span className={`italic font-medium ${isDark ? 'text-[#f2efe9]' : 'text-slate-700'}`}>
                      "{je.description}"
                    </span>
                  </div>
                )}

                {/* Row 3: Action Buttons Footer */}
                <div className={`mt-3 pt-3 border-t flex items-center justify-between gap-3 ${
                  isDark ? 'border-neutral-850/80' : 'border-slate-100'
                }`}>
                  <span className="text-[11px] font-medium text-slate-400 dark:text-neutral-500 hidden sm:inline">
                    Accepting unlocks private messaging & initiates the job contract.
                  </span>

                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      type="button"
                      disabled={!!loadingJobId}
                      onClick={() => handleRespond(je.id, false)}
                      className={`px-3.5 py-1.5 border font-bold text-xs rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
                        loadingJobId === je.id && loadingAction === 'declining'
                          ? 'bg-neutral-800 border-neutral-800 text-neutral-500 cursor-not-allowed opacity-60'
                          : isDark 
                            ? 'border-neutral-800 hover:bg-red-950/30 hover:text-red-400 hover:border-red-900/40 text-[#b4b0a9]' 
                            : 'border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-600'
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
                          ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed opacity-60'
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
