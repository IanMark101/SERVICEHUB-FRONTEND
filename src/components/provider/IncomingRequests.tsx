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
        <div className={`rounded-[28px] p-12 sm:p-16 border text-center transition-all ${
          isDark ? 'bg-[#22211e] border-neutral-850 text-[#b4b0a9]' : 'bg-white border-slate-200 shadow-sm text-slate-500'
        }`}>
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-emerald-500/10 text-emerald-500">
            <Inbox className="w-8 h-8" />
          </div>
          <h3 className={`text-base font-extrabold mb-1 ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
            No Pending Direct Requests
          </h3>
          <p className="text-xs max-w-md mx-auto">
            When seekers book your active services directly, their requests will appear here for you to accept or decline.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingRequests.map((je) => {
            const seekerUser = users.find(u => u.id === je.seekerId);
            const matchedService = services.find(s => s.id === je.serviceId);
            const isVerified = seekerUser?.verificationStatus === 'APPROVED' || seekerUser?.isVerified;
            const trustScore = seekerUser?.trustScore ?? 50;

            return (
              <div 
                key={je.id} 
                className={`rounded-[24px] p-5 sm:p-6 border shadow-sm space-y-4 transition-all duration-200 ${
                  isDark 
                    ? 'bg-[#22211e] border-neutral-850 hover:border-neutral-750' 
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
                }`}
              >
                {/* Top Tier: Badges & Rate */}
                <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-850">
                  <div className="flex flex-wrap items-center gap-2">
                    {matchedService?.category && (
                      <span className="px-3 py-1 rounded-xl text-[11px] font-extrabold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        {matchedService.category}
                      </span>
                    )}
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-[11px] font-bold ${
                      isDark ? 'bg-neutral-800 text-neutral-400' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(je.createdAt)}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      Direct Request
                    </span>
                  </div>

                  {/* Offered Rate & Payment Method */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-neutral-500 block">
                        Offered Rate
                      </span>
                      <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                        ₱{Number(je.price).toLocaleString()}
                      </span>
                    </div>
                    <div className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 shadow-sm ${
                      je.paymentMethod === 'GCash'
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    }`}>
                      {je.paymentMethod === 'GCash' ? (
                        <CreditCard className="w-3.5 h-3.5" />
                      ) : (
                        <Banknote className="w-3.5 h-3.5" />
                      )}
                      <span>{je.paymentMethod || 'On-site Cash'}</span>
                    </div>
                  </div>
                </div>

                {/* Middle Tier: Service Title & Seeker Info */}
                <div className="space-y-3">
                  <div>
                    <h3 className={`font-extrabold text-base sm:text-lg leading-snug ${
                      isDark ? 'text-[#f2efe9]' : 'text-slate-900'
                    }`}>
                      {je.title}
                    </h3>
                  </div>

                  {/* Seeker Profile Mini-Card */}
                  <div className={`p-3 sm:p-3.5 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${
                    isDark ? 'bg-[#1a1916] border-neutral-850' : 'bg-slate-50 border-slate-200/80'
                  }`}>
                    <div className="flex items-center gap-3">
                      {je.seekerAvatar ? (
                        <img 
                          src={je.seekerAvatar} 
                          alt={je.seekerName} 
                          className="w-10 h-10 rounded-full object-cover border border-neutral-700 shadow-sm"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
                          {je.seekerName ? je.seekerName.charAt(0).toUpperCase() : 'S'}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={`font-extrabold text-sm ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
                            {je.seekerName}
                          </span>
                          {isVerified && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                              <ShieldCheck className="w-3 h-3" /> Verified
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-neutral-400 font-medium">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-red-400" />
                            Cordova, Cebu
                          </span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            Trust: {trustScore}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Customer Note / Description Bubble */}
                  <div className={`p-4 rounded-2xl border transition-colors ${
                    isDark ? 'bg-[#181714] border-neutral-850' : 'bg-slate-50/80 border-slate-200'
                  }`}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-neutral-500">
                        Customer Note & Special Instructions
                      </span>
                    </div>
                    <p className={`text-xs sm:text-sm leading-relaxed pl-3 border-l-2 border-amber-500/60 font-medium ${
                      je.description ? 'italic text-slate-800 dark:text-[#f2efe9]' : 'text-slate-400 dark:text-neutral-500'
                    }`}>
                      {je.description ? `"${je.description}"` : 'No additional note provided by the seeker.'}
                    </p>
                  </div>
                </div>

                {/* Bottom Tier: Actions */}
                <div className={`pt-3 border-t flex flex-wrap items-center justify-between gap-3 ${
                  isDark ? 'border-neutral-850' : 'border-slate-100'
                }`}>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-neutral-400 hidden sm:block">
                    Accepting unlocks private messaging and initiates the job booking contract.
                  </p>

                  <div className="flex items-center gap-2.5 ml-auto">
                    <button
                      type="button"
                      disabled={!!loadingJobId}
                      onClick={() => handleRespond(je.id, false)}
                      className={`px-4 sm:px-5 py-2.5 border font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        loadingJobId === je.id && loadingAction === 'declining'
                          ? 'bg-neutral-800 border-neutral-800 text-neutral-500 cursor-not-allowed opacity-60'
                          : isDark 
                            ? 'border-neutral-800 hover:bg-red-950/30 hover:text-red-400 hover:border-red-900/40 text-[#b4b0a9]' 
                            : 'border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-600'
                      }`}
                    >
                      {loadingJobId === je.id && loadingAction === 'declining' ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Declining...</span>
                        </>
                      ) : (
                        <>
                          <X className="w-3.5 h-3.5" />
                          <span>Decline</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={!!loadingJobId}
                      onClick={() => handleRespond(je.id, true)}
                      className={`px-5 sm:px-6 py-2.5 font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer ${
                        loadingJobId === je.id && loadingAction === 'accepting'
                          ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed opacity-60'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/20'
                      }`}
                    >
                      {loadingJobId === je.id && loadingAction === 'accepting' ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
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
