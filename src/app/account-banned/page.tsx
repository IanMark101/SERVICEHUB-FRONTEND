'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';
import { apiGetBanAppeal, apiGetMe, apiLogout, apiSubmitBanAppeal } from '@/api/auth.api';
import { useApp } from '@/context/AppContext';
import { clearAccessToken } from '@/lib/api/axios';
import { getApiErrorMessage } from '@/lib/api/errors';
import BrandLoading from '@/components/ui/BrandLoading';

type Appeal = { id: string; status: string; message: string; decisionReason?: string | null; createdAt: string };

export default function AccountBannedPage() {
  const router = useRouter();
  const { user, isAuthenticated, authLoading, setUser, setIsAuthenticated } = useApp();
  const [appeal, setAppeal] = useState<Appeal | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !user) { router.replace('/login'); return; }
    if (user.moderationStatus !== 'BANNED') { router.replace(user.role === 'admin' ? '/admin' : '/seeker'); return; }
    let active = true;
    apiGetBanAppeal().then((response) => {
      if (active) setAppeal(response.data.appeal);
    }).catch((cause: unknown) => {
      if (active) setError(getApiErrorMessage(cause, 'Could not load your appeal status.'));
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [authLoading, isAuthenticated, user, router]);

  useEffect(() => {
    if (authLoading || !isAuthenticated || user?.moderationStatus !== 'BANNED') return;
    let active = true;
    const check = async () => {
      try {
        const identity = await apiGetMe();
        if (!active) return;
        if (identity.data.user.moderationStatus !== 'BANNED') {
          setUser(previous => previous ? { ...previous, moderationStatus: identity.data.user.moderationStatus } : previous);
          router.replace(user.role === 'admin' ? '/admin' : '/seeker');
          return;
        }
        const result = await apiGetBanAppeal();
        if (active) setAppeal(result.data.appeal);
      } catch { /* Keep the existing notice if the status check is unavailable. */ }
    };
    const interval = window.setInterval(() => { void check(); }, 15000);
    return () => { active = false; window.clearInterval(interval); };
  }, [authLoading, isAuthenticated, user?.moderationStatus, user?.role, router, setUser]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting || message.trim().length < 20) return;
    setSubmitting(true);
    setError('');
    try {
      await apiSubmitBanAppeal(message.trim());
      const response = await apiGetBanAppeal();
      setAppeal(response.data.appeal);
      setMessage('');
    } catch (cause: unknown) {
      setError(getApiErrorMessage(cause, 'Could not submit your appeal.'));
    } finally { setSubmitting(false); }
  };

  const logout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    setError('');
    try {
      await apiLogout();
      clearAccessToken();
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('workspaceRole');
      router.replace('/login');
    } catch (cause: unknown) {
      setError(getApiErrorMessage(cause, 'Could not log out. Please try again.'));
    } finally { setLoggingOut(false); }
  };

  if (authLoading || !isAuthenticated || user?.moderationStatus !== 'BANNED') return <BrandLoading label="Checking account status" />;

  return <main className="flex min-h-screen items-center justify-center bg-[#f8f5f2] px-4 py-12 text-ink dark:bg-[#151313] dark:text-[#f7eeea]">
    <section className="w-full max-w-xl rounded-3xl border border-red-200 bg-white p-7 shadow-xl shadow-red-950/5 dark:border-red-900/50 dark:bg-[#211c1b] sm:p-10" aria-labelledby="ban-title">
      <div className="mb-6 flex size-12 items-center justify-center rounded-2xl bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300"><ShieldAlert size={25} /></div>
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-red-700 dark:text-red-300">Account status</p>
      <h1 id="ban-title" className="text-2xl font-bold tracking-tight sm:text-3xl">Your ServiceHub account has been banned.</h1>
      <p className="mt-3 leading-7 text-ink-muted dark:text-ink-secondary">Normal ServiceHub access is unavailable. If you believe this decision should be reviewed, you may submit one appeal for this ban.</p>
      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-zinc-700 dark:bg-zinc-900/60">
        {loading ? <p>Loading appeal status…</p> : appeal ? <div>
          <p className="font-semibold">Appeal {appeal.status === 'PENDING' ? 'awaiting Admin review' : appeal.status.toLowerCase()}</p>
          <p className="mt-1 text-sm text-ink-muted dark:text-ink-secondary">Submitted {new Date(appeal.createdAt).toLocaleDateString()}.</p>
          {appeal.decisionReason && <p className="mt-3 text-sm">Decision reason: {appeal.decisionReason}</p>}
        </div> : <form onSubmit={submit} className="space-y-3">
          <label htmlFor="appeal-message" className="block text-sm font-semibold">Appeal Ban</label>
          <p className="text-sm text-ink-muted dark:text-ink-secondary">Explain why this decision should be reviewed.</p>
          <textarea id="appeal-message" required minLength={20} maxLength={2000} rows={5} value={message} onChange={(event) => setMessage(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-ink outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/20 dark:border-zinc-600 dark:bg-[#211c1b] dark:text-white" />
          <button type="submit" disabled={submitting || message.trim().length < 20} className="rounded-xl bg-red-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-50">{submitting ? 'Submitting…' : 'Submit appeal'}</button>
        </form>}
      </div>
      {error && <p role="alert" className="mt-4 text-sm text-red-700 dark:text-red-300">{error}</p>}
      <button type="button" onClick={logout} disabled={loggingOut} className="mt-6 rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold hover:bg-slate-100 disabled:opacity-50 dark:border-zinc-600 dark:hover:bg-zinc-800">{loggingOut ? 'Logging out…' : 'Log Out'}</button>
    </section>
  </main>;
}
