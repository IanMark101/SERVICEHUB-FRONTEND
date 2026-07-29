import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useTransactionPermission } from '../../hooks/useTransactionPermission';
import { VerificationStatus } from '../../types';
import { ShieldAlert, ShieldCheck, X, ArrowRight } from 'lucide-react';

interface LimitedModeDashboardCardProps {
  role?: 'seeker' | 'provider';
}

export default function LimitedModeDashboardCard({ role }: LimitedModeDashboardCardProps = {}) {
  const { isDark, user } = useApp();
  const { verificationStatus, navigateToVerification, canTransact } = useTransactionPermission();
  const [dismissed, setDismissed] = useState<boolean>(true); // start true to prevent flash

  // Determine active workspace theme: 'provider' -> emerald green, 'seeker' -> orange
  const activeRole = role || (user?.role === 'provider' ? 'provider' : 'seeker');
  const isProvider = activeRole === 'provider';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDismissed = sessionStorage.getItem('limited_mode_card_dismissed') === 'true';
      setDismissed(isDismissed);
    }
  }, []);

  // If the user can already transact, don't show the card
  if (canTransact) return null;

  // Don't show if dismissed in this session
  if (dismissed) return null;

  const handleDismiss = () => {
    sessionStorage.setItem('limited_mode_card_dismissed', 'true');
    setDismissed(true);
  };

  const isPending = verificationStatus === VerificationStatus.PENDING_REVIEW;
  const isRejected = verificationStatus === VerificationStatus.REJECTED;

  const ctaTextColor = isProvider
    ? isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-700'
    : isDark ? 'text-orange-400 hover:text-orange-300' : 'text-orange-600 hover:text-orange-700';

  return (
    <div className={`rounded-3xl border p-5 relative shadow-sm transition-all duration-200 ${
      isPending
        ? isDark
          ? 'bg-amber-955/15 border-amber-900/30 text-amber-100'
          : 'bg-amber-50/70 border-amber-200 text-amber-900'
        : isDark
          ? 'bg-red-955/10 border-red-905/20 text-[#f2efe9]'
          : 'bg-red-50/50 border-red-100 text-slate-800'
    }`}>
      
      {/* Dismiss Button */}
      <button
        onClick={handleDismiss}
        title="Dismiss for this session"
        className={`absolute top-4 right-4 p-1 rounded-lg transition-colors ${
          isDark 
            ? 'hover:bg-neutral-800/40 text-neutral-450' 
            : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'
        }`}
      >
        <X className="w-3.5 h-3.5" />
      </button>

      <div className="flex items-start space-x-4">
        {/* Banner Icon */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 flex-shrink-0 ${
          isPending
            ? isDark
              ? 'bg-amber-950/20 border-amber-900/30 text-amber-400'
              : 'bg-amber-100 border-amber-250 text-amber-700'
            : isDark
              ? 'bg-red-955/20 border-red-900/30 text-red-400'
              : 'bg-red-100 border-red-150 text-red-700'
        }`}>
          {isPending ? <ShieldCheck className="w-5 h-5 animate-pulse" /> : <ShieldAlert className="w-5 h-5" />}
        </div>

        {/* Content & Details */}
        <div className="space-y-1.5 flex-1 pr-6 select-none">
          <h4 className={`text-sm font-extrabold tracking-tight ${
            isPending 
              ? isDark ? 'text-amber-300' : 'text-amber-850'
              : isDark ? 'text-red-400' : 'text-red-800'
          }`}>
            {isPending ? 'Verification Under Review' : 'Limited Mode'}
          </h4>

          <p className={`text-xs leading-relaxed font-semibold ${
            isDark ? 'text-[#b4b0a9]' : 'text-slate-550'
          }`}>
            {isPending
              ? 'Verification submitted. Our administrators usually review submissions within 24 hours. Until approval, you may continue browsing but marketplace actions remain disabled.'
              : isRejected
                ? 'Your previous residency verification was rejected by administrators. Please resubmit clear proofs of your Cordova residency to unlock marketplace actions.'
                : 'You can explore ServiceHub and view available services, but marketplace transactions are locked until your Cordova Residency Verification is approved.'}
          </p>

          {!isPending && (
            <button
              onClick={navigateToVerification}
              className={`inline-flex items-center space-x-1 text-xs font-extrabold hover:underline mt-2 cursor-pointer transition-colors ${ctaTextColor}`}
            >
              <span>Verify Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

    </div>
  );
}

