import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Check, X, Calendar, User, MapPin, Loader2 } from 'lucide-react';
import TransactionBlockedModal from '../TransactionBlockedModal';
import { useTransactionPermission } from '../../hooks/useTransactionPermission';

export default function IncomingRequests({ currentProviderId = 'u3' }: { currentProviderId?: string }) {
  const { jobEngagements, respondToDirectBooking, isDark } = useApp();
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
      


      {pendingRequests.length === 0 ? (
        <div className={`rounded-[24px] p-12 border text-center text-sm font-medium transition-colors duration-200 ${
          isDark ? 'bg-[#22211e] border-neutral-800/80 text-[#b4b0a9]' : 'bg-white border-slate-200 text-slate-500'
        }`}>
          No pending direct booking requests at the moment.
        </div>
      ) : (
        <div className="space-y-4">
          {pendingRequests.map((je) => {
            const formattedDate = new Date(je.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });

            return (
              <div 
                key={je.id} 
                className={`rounded-[24px] p-6 border shadow-sm space-y-4 transition-colors duration-200 ${
                  isDark ? 'bg-[#22211e] border-neutral-850' : 'bg-white border-slate-200 hover:shadow-md'
                }`}
              >
                
                {/* Header title */}
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className={`font-extrabold text-sm leading-snug ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
                      {je.title} • <span className={`font-semibold text-[11px] ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>{formatTimeAgo(je.createdAt)}</span>
                    </h3>
                    
                    <div className="flex items-center space-x-1.5 mt-1">
                      <User className={`w-3.5 h-3.5 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`} />
                      <span className={`text-xs font-semibold ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>
                        From: <span className={isDark ? 'text-[#f2efe9]' : 'text-slate-700'}>{je.seekerName}</span>
                      </span>
                    </div>
                  </div>

                  {/* Budget & Location box on right */}
                  <div className="text-right">
                    <span className={`text-[10px] font-bold uppercase tracking-wider block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-400'}`}>Offered Budget</span>
                    <span className={`text-lg font-extrabold ${isDark ? 'text-[#f2efe9]' : 'text-slate-950'}`}>₱{je.price}</span>
                    <span className={`inline-flex items-center text-[9px] font-bold mt-0.5 ${isDark ? 'text-[#b4b0a9]' : 'text-slate-455'}`}>
                      <MapPin className="w-3 h-3 mr-0.5" />
                      Cordova, Cebu
                    </span>
                  </div>
                </div>

                {/* Description details */}
                <div className={`border rounded-2xl p-4 flex items-start space-x-3 transition-colors duration-200 ${
                  isDark ? 'bg-[#1c1b18] border-neutral-850' : 'bg-slate-50 border-slate-100'
                }`}>
                  <p className={`text-xs leading-relaxed ${je.description ? 'italic' : 'text-slate-400 dark:text-neutral-500'} ${isDark ? 'text-[#f2efe9]' : 'text-slate-600'}`}>
                    {je.description
                      ? `"${je.description}"`
                      : 'No description provided by the seeker.'}
                  </p>
                </div>

                {/* Accept/Decline Actions */}
                <div className={`pt-2 border-t flex items-center justify-end space-x-2.5 ${isDark ? 'border-neutral-855' : 'border-slate-100'}`}>
                  <button
                    disabled={!!loadingJobId}
                    onClick={() => handleRespond(je.id, false)}
                    className={`px-5 py-2.5 border font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                      loadingJobId === je.id && loadingAction === 'declining'
                        ? 'bg-[#1c1b18] border-neutral-800 text-neutral-500 cursor-not-allowed opacity-60'
                        : isDark 
                          ? 'border-neutral-800 hover:bg-red-955/20 hover:text-red-400 hover:border-red-900/30 text-[#b4b0a9]' 
                          : 'border-slate-200 hover:bg-red-50 hover:text-red-650 hover:border-red-200 text-slate-500'
                    }`}
                  >
                    {loadingJobId === je.id && loadingAction === 'declining' ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        <span>Declining...</span>
                      </>
                    ) : (
                      <span>Decline</span>
                    )}
                  </button>
                  <button
                    disabled={!!loadingJobId}
                    onClick={() => handleRespond(je.id, true)}
                    className={`px-5 py-2.5 font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center space-x-1 cursor-pointer ${
                      loadingJobId === je.id && loadingAction === 'accepting'
                        ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed opacity-60'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {loadingJobId === je.id && loadingAction === 'accepting' ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        <span>Accepting...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1" />
                        <span>Accept Job</span>
                      </>
                    )}
                  </button>
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
