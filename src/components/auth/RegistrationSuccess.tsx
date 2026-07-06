import React, { useState, useEffect } from 'react';
import { Check, Mail, ShieldCheck, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
import { apiResendVerification } from '../../api/auth.api';

interface RegistrationSuccessProps {
  email: string;
  onGoToLogin: () => void;
}

export default function RegistrationSuccess({ email, onGoToLogin }: RegistrationSuccessProps) {
  const [cooldown, setCooldown] = useState<number>(0);
  const [resendStatus, setResendStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0) return;
    setResendStatus(null);
    try {
      const res = await apiResendVerification(email);
      if (res.success) {
        setResendStatus({
          type: 'success',
          message: 'Verification email has been resent successfully!',
        });
        setCooldown(60);
      } else {
        setResendStatus({
          type: 'error',
          message: res.error || 'Failed to resend verification email.',
        });
      }
    } catch (err: any) {
      if (err.response?.status === 429) {
        setResendStatus({
          type: 'error',
          message: 'Too many requests. Please wait before trying again.',
        });
        setCooldown(60); // Sync frontend with backend limit
      } else {
        setResendStatus({
          type: 'error',
          message: err.response?.data?.error || 'Something went wrong. Please try again later.',
        });
      }
    }
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-[#f2efe9] animate-in fade-in slide-in-from-right-4 duration-300">
      
      {/* Header Section */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-4 animate-bounce">
          <Mail className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
          Registration Successful!
        </h2>
        <p className="text-slate-500 dark:text-[#b4b0a9] text-xs leading-relaxed max-w-sm mx-auto">
          We've sent a verification email to <span className="font-bold text-slate-900 dark:text-[#f2efe9]">{email}</span>.
          Please verify your email before logging in. Once verified, you can access your ServiceHub Cordova account.
        </p>
      </div>

      {/* Spam Warning Callout */}
      <div className="p-3 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/10 dark:border-amber-500/20 rounded-xl flex items-start space-x-2 text-amber-600 dark:text-amber-400 text-xs">
        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <p className="leading-relaxed">
          <span className="font-bold">Didn't receive the email?</span> Please check your Spam or Junk folder before requesting another verification email.
        </p>
      </div>

      {/* Onboarding Checklist Box */}
      <div className="p-4 bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm">
        <h4 className="text-xs font-bold text-slate-400 dark:text-[#8e8a82] tracking-wider uppercase mb-3">
          Onboarding Checklist
        </h4>
        <div className="space-y-3">
          {/* Item 1: Account Created */}
          <div className="flex items-center space-x-3 text-sm">
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span className="font-medium text-slate-500 dark:text-slate-400 line-through">Account created</span>
          </div>

          {/* Item 2: Verification Email Sent */}
          <div className="flex items-center space-x-3 text-sm">
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span className="font-medium text-slate-500 dark:text-slate-400 line-through">Verification email sent</span>
          </div>

          {/* Item 3: Verify Your Email */}
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-5 h-5 rounded border border-slate-350 dark:border-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-650 bg-slate-50 dark:bg-[#121214] font-semibold text-xs">
              3
            </div>
            <span className="font-bold text-slate-800 dark:text-[#f2efe9]">Verify your email</span>
          </div>

          {/* Item 4: Identity Verification */}
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-5 h-5 rounded border border-slate-350 dark:border-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-650 bg-slate-50 dark:bg-[#121214] font-semibold text-xs">
              4
            </div>
            <span className="font-medium text-slate-600 dark:text-[#b4b0a9] flex items-center space-x-1.5">
              <span>Complete Identity Verification after logging in</span>
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            </span>
          </div>
        </div>
      </div>

      {/* Action Status Banner */}
      {resendStatus && (
        <div className={`p-2.5 text-center text-xs rounded-xl border font-semibold ${
          resendStatus.type === 'success'
            ? 'bg-emerald-950/20 dark:bg-emerald-950/40 border-emerald-550 dark:border-emerald-900/35 text-emerald-600 dark:text-emerald-400'
            : 'bg-red-950/20 dark:bg-red-950/40 border-red-550 dark:border-red-900/35 text-red-600 dark:text-red-400'
        } animate-in fade-in duration-100`}>
          {resendStatus.message}
        </div>
      )}

      {/* Success CTA Buttons */}
      <div className="space-y-3 pt-2">
        <button
          type="button"
          onClick={onGoToLogin}
          className="w-full py-3 bg-[#FF5A1F] hover:bg-[#e04f1a] active:scale-[0.98] text-white rounded-lg font-bold text-sm shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer"
        >
          <span>Go to Login</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0}
          className={`w-full py-2.5 border rounded-lg font-bold text-xs shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer ${
            cooldown > 0
              ? 'bg-slate-50 dark:bg-[#22211e] border-slate-200 dark:border-slate-800 text-slate-400 dark:text-[#8e8a82]'
              : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#22211e] text-slate-500 dark:text-[#b4b0a9]'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${cooldown > 0 ? 'animate-spin' : ''}`} />
          <span>{cooldown > 0 ? `Resend Email (${cooldown}s)` : 'Resend Verification Email'}</span>
        </button>
      </div>

    </div>
  );
}
