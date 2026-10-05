"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle2, LogOut, Mail, RefreshCw } from 'lucide-react';
import { apiGetMe, apiLogout, apiResendVerification } from '@/api/auth.api';
import { useApp } from '@/context/AppContext';
import { clearAccessToken } from '@/lib/api/axios';
import { getApiErrorMessage } from '@/lib/api/errors';
import BrandLoading from '@/components/ui/BrandLoading';

export default function EmailVerificationRequiredPage() {
  const router = useRouter();
  const { authLoading, isAuthenticated, user, setUser, setIsAuthenticated } = useApp();
  const [busy, setBusy] = useState<'check' | 'resend' | 'logout' | null>(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !user) {
      router.replace('/login');
    } else if (user.role === 'admin' || user.emailVerified === true) {
      const workspace = user.role === 'admin' ? 'admin' : localStorage.getItem('workspaceRole') === 'provider' ? 'provider' : 'seeker';
      router.replace(`/${workspace}`);
    }
  }, [authLoading, isAuthenticated, user, router]);

  const checkStatus = async () => {
    setBusy('check');
    setNotice('');
    setError('');
    try {
      const response = await apiGetMe();
      const account = response?.data?.user;
      if (!response?.success || !account || account.id !== user?.id) throw new Error('Could not confirm your account. Please sign in again.');
      setUser((current) => current ? {
        ...current,
        emailVerified: account.emailVerified === true,
        verificationStatus: account.verificationStatus,
      } : current);
      if (account.emailVerified === true) {
        setNotice('Email verified. Opening your workspace…');
      } else {
        setNotice('Your email has not been verified yet. Open the link we sent, then check again.');
      }
    } catch (failure) {
      setError(getApiErrorMessage(failure, 'Could not check your email status. Please try again.'));
    } finally {
      setBusy(null);
    }
  };

  const resend = async () => {
    if (!user?.email) return;
    setBusy('resend');
    setNotice('');
    setError('');
    try {
      await apiResendVerification(user.email);
      setNotice(`If verification is still needed, we sent a new link to ${user.email}. Check your inbox and spam folder.`);
    } catch (failure) {
      setError(getApiErrorMessage(failure, 'Could not send a new link. Please try again shortly.'));
    } finally {
      setBusy(null);
    }
  };

  const logout = async () => {
    setBusy('logout');
    try { await apiLogout(); } catch { /* Clear local state even if the request fails. */ }
    clearAccessToken();
    setIsAuthenticated(false);
    setUser(null);
    router.replace('/login');
  };

  if (authLoading || !isAuthenticated || !user || user.role === 'admin' || user.emailVerified === true) {
    return <BrandLoading label="Checking account access" />;
  }

  return (
    <main className="min-h-screen bg-[#f7f6f3] px-4 py-10 text-ink dark:bg-[#141312] dark:text-ink sm:px-6 sm:py-16">
      <div className="mx-auto max-w-2xl overflow-hidden rounded-[28px] border border-stone-200 bg-white shadow-[0_24px_70px_-36px_rgba(42,30,17,0.35)] dark:border-neutral-700 dark:bg-[#22211e]">
        <div className="border-b border-stone-200 bg-[#fcf8f4] px-6 py-8 dark:border-neutral-700 dark:bg-[#282520] sm:px-9">
          <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950/30 dark:text-orange-300"><Mail aria-hidden="true" size={23} /></div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-700 dark:text-orange-300">ServiceHub account</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Verify your email to continue</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-ink-muted dark:text-ink-secondary">We sent a verification link to <strong className="break-all font-semibold text-ink dark:text-white">{user.email}</strong>. Open that link, then return here to check your status.</p>
        </div>
        <div className="space-y-6 px-6 py-7 sm:px-9">
          <div className="flex gap-3 rounded-2xl border border-stone-200 p-4 dark:border-neutral-700">
            <CheckCircle2 aria-hidden="true" className="mt-0.5 shrink-0 text-orange-700 dark:text-orange-300" size={19} />
            <div><p className="text-sm font-semibold">What happens after verification?</p><p className="mt-1 text-sm leading-6 text-ink-muted dark:text-ink-secondary">Your workspace opens. Cordova residency verification then determines whether you can book or offer services.</p></div>
          </div>
          {notice && <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">{notice}</p>}
          {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800 dark:bg-red-950/30 dark:text-red-200">{error}</p>}
          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={() => void checkStatus()} disabled={busy !== null} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#c86646] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#ad5032] disabled:opacity-50"><RefreshCw aria-hidden="true" size={16} />{busy === 'check' ? 'Checking…' : 'I verified my email'}<ArrowRight aria-hidden="true" size={16} /></button>
            <button type="button" onClick={() => void resend()} disabled={busy !== null} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-stone-300 px-5 py-2.5 text-sm font-semibold hover:bg-stone-50 disabled:opacity-50 dark:border-neutral-600 dark:hover:bg-neutral-800">{busy === 'resend' ? 'Sending…' : 'Resend verification link'}</button>
          </div>
          <button type="button" onClick={() => void logout()} disabled={busy !== null} className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-ink-muted hover:text-ink disabled:opacity-50 dark:text-ink-secondary dark:hover:text-white"><LogOut aria-hidden="true" size={16} />Sign out</button>
        </div>
      </div>
    </main>
  );
}
