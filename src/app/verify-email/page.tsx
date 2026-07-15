"use client";
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, ArrowRight, Mail } from 'lucide-react';
import { apiVerifyEmail } from '../../api/auth.api';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMsg('No verification token found. Please use the link from your email.');
      return;
    }

    apiVerifyEmail(token)
      .then((res) => {
        if (res.success) {
          setStatus('success');
        } else {
          setStatus('error');
          setErrorMsg(res.error || 'Verification failed. The link may have expired.');
        }
      })
      .catch((err) => {
        setStatus('error');
        setErrorMsg(
          err?.response?.data?.error ||
          'This verification link is invalid or has already been used.'
        );
      });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fbfaf7] dark:bg-[#191919] px-4">
      <div className="w-full max-w-md bg-white dark:bg-[#22211e] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl p-8 text-center space-y-6">

        {/* Logo */}
        <div className="flex items-center justify-center space-x-2.5 mb-2">
          <img src="/logo.png" alt="ServiceHub Cordova" className="w-8 h-8 object-contain rounded-xl shadow-sm" />
          <span className="text-sm font-extrabold tracking-tight text-slate-800 dark:text-white">ServiceHub Cordova</span>
        </div>

        {/* Loading State */}
        {status === 'loading' && (
          <>
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 text-blue-500 mx-auto">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Verifying Your Email
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Please wait while we confirm your email address...
              </p>
            </div>
          </>
        )}

        {/* Success State */}
        {status === 'success' && (
          <>
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto animate-bounce">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Email Verified!
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 leading-relaxed">
                Your email address has been confirmed. You can now log in to your ServiceHub Cordova account.
              </p>
            </div>

            {/* Onboarding reminder */}
            <div className="p-4 bg-amber-500/5 border border-amber-500/15 rounded-2xl text-left space-y-2">
              <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Next Step</p>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                After logging in, remember to complete your <span className="font-bold text-[#FF5A1F]">Barangay Residency Verification</span> in your profile so you can book services, place bids, and post listings.
              </p>
            </div>

            <button
              onClick={() => router.push('/login')}
              className="w-full py-3 bg-[#FF5A1F] hover:bg-[#e04f1a] active:scale-[0.98] text-white rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Go to Login</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Error State */}
        {status === 'error' && (
          <>
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 text-red-500 mx-auto">
              <XCircle className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Verification Failed
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 leading-relaxed">
                {errorMsg}
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-[#1c1b18] border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-500 dark:text-slate-400 flex items-start space-x-2 text-left">
              <Mail className="w-4 h-4 flex-shrink-0 mt-0.5 text-slate-400" />
              <span>
                If your link expired, go back to the login page and use <span className="font-semibold">Resend Verification Email</span> to get a fresh link.
              </span>
            </div>

            <button
              onClick={() => router.push('/login')}
              className="w-full py-3 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#2a2927] text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Back to Login</span>
            </button>
          </>
        )}

      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#fbfaf7] dark:bg-[#191919]">
        <div className="w-8 h-8 border-4 border-[#FF5A1F] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
