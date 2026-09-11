import React, { useState, useEffect } from 'react';
import { Check, Mail, ShieldCheck, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
import { apiResendVerification } from '../../api/auth.api';
import { getApiErrorMessage, getApiErrorStatus } from '../../lib/api/errors';

interface RegistrationSuccessProps {
  email: string;
  emailSent: boolean;
  onGoToLogin: () => void;
}

export default function RegistrationSuccess({ email, emailSent, onGoToLogin }: RegistrationSuccessProps) {
  const [cooldown, setCooldown] = useState<number>(60);
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
    } catch (err: unknown) {
      if (getApiErrorStatus(err) === 429) {
        setResendStatus({
          type: 'error',
          message: getApiErrorMessage(err, 'Please wait 60 seconds before requesting another verification email.'),
        });
        setCooldown(60); // Sync frontend with backend limit
      } else {
        setResendStatus({
          type: 'error',
          message: getApiErrorMessage(err, 'Something went wrong. Please try again later.'),
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
        <h2 className="font-sans text-2xl font-semibold text-[#0a0a0a] dark:text-white tracking-tight mb-2">
          Registration Successful!
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 text-xs sm:text-sm leading-relaxed max-w-sm mx-auto">
          {emailSent ? (
            <>We&apos;ve sent a verification email to <span className="font-semibold text-[#0a0a0a] dark:text-white">{email}</span>. Please verify your email before using marketplace actions.</>
          ) : (
            <>Your account was created, but we could not deliver the verification email to <span className="font-semibold text-[#0a0a0a] dark:text-white">{email}</span>. Sign in, then request a new link.</>
          )}
        </p>
      </div>

      {/* Spam Warning Callout */}
      <div className="p-3 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/10 dark:border-amber-500/20 rounded-xl flex items-start space-x-2 text-amber-600 dark:text-amber-400 text-xs">
        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <p className="leading-relaxed">
          <span className="font-bold">Didn&apos;t receive the email?</span> Please check your Spam or Junk folder before requesting another verification email.
        </p>
      </div>

      {/* Onboarding Checklist Box */}
      <div className="p-4 bg-slate-50/70 dark:bg-zinc-900/60 border border-black/[0.06] dark:border-white/10 rounded-2xl shadow-xs">
        <h4 className="text-xs font-bold text-slate-400 dark:text-zinc-500 tracking-wider uppercase mb-3">
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
            <div className={`flex items-center justify-center w-5 h-5 rounded-full ${emailSent ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
              {emailSent ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
            </div>
            <span className={`font-medium ${emailSent ? 'text-slate-500 dark:text-slate-400 line-through' : 'text-amber-700 dark:text-amber-300'}`}>{emailSent ? 'Verification email sent' : 'Verification email delivery needs retry'}</span>
          </div>

          {/* Item 3: Verify Your Email */}
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-5 h-5 rounded-lg border border-black/[0.08] dark:border-white/10 flex items-center justify-center text-slate-400 dark:text-zinc-500 bg-white dark:bg-zinc-800 font-semibold text-xs">
              3
            </div>
            <span className="font-bold text-slate-900 dark:text-white">Verify your email</span>
          </div>

          {/* Item 4: Identity Verification */}
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-5 h-5 rounded-lg border border-black/[0.08] dark:border-white/10 flex items-center justify-center text-slate-400 dark:text-zinc-500 bg-white dark:bg-zinc-800 font-semibold text-xs">
              4
            </div>
            <span className="font-medium text-slate-600 dark:text-zinc-400 flex items-center space-x-1.5">
              <span>Complete Identity Verification after logging in</span>
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            </span>
          </div>
        </div>
      </div>

      {/* Action Status Banner */}
      {resendStatus && (
        <div className={`p-3 text-center text-xs rounded-xl border font-semibold ${
          resendStatus.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-300'
            : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300'
        } animate-in fade-in duration-100`}>
          {resendStatus.message}
        </div>
      )}

      {/* Success CTA Buttons */}
      <div className="space-y-3 pt-2">
        <button
          type="button"
          onClick={onGoToLogin}
          className="w-full py-3 bg-[#c86544] hover:bg-[#aa5032] active:scale-[0.98] text-white rounded-xl font-bold text-sm shadow-md shadow-orange-950/15 transition-all flex items-center justify-center space-x-2 cursor-pointer"
        >
          <span>Go to Login</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0}
          className={`w-full py-2.5 border rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer ${
            cooldown > 0
              ? 'bg-slate-50 dark:bg-zinc-900/50 border-black/[0.08] dark:border-white/10 text-slate-400 dark:text-zinc-500'
              : 'border-black/[0.08] dark:border-white/10 bg-white dark:bg-zinc-800/80 hover:bg-slate-50 text-slate-700 dark:text-zinc-200'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${cooldown > 0 ? 'animate-spin' : ''}`} />
          <span>{cooldown > 0 ? `Resend Email (${cooldown}s)` : 'Resend Verification Email'}</span>
        </button>
      </div>

    </div>
  );
}
