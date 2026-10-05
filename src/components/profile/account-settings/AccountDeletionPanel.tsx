'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, CheckCircle2, Eye, EyeOff, LockKeyhole, RefreshCw, Trash2, X } from 'lucide-react';
import { isAxiosError } from 'axios';
import { apiDeleteOwnAccount, apiGetAccountDeletionEligibility, apiStartDeletionGoogleVerification, type AccountDeletionEligibility, type AccountDeletionVerification } from '../../../api/users.api';
import { getApiErrorMessage } from '../../../lib/api/errors';
import { clearAccessToken } from '../../../lib/api/axios';
import { disconnectSocket } from '../../../lib/socket';
import GoogleDeletionVerification from './GoogleDeletionVerification';
import './account-deletion.css';

interface Props { email: string; isDark: boolean }

const CHECKS = [
  { id: 'listings', title: 'Pause your service listings', empty: 'No published service listings.', types: ['activeListings'], labels: ['published service listing'], detail: 'Pause each listing in Service Manager to stop new bookings.', links: [{ href: '/provider/service-manager', label: 'Service Manager' }] },
  { id: 'requests', title: 'Pause your open requests', empty: 'No open service requests.', types: ['openRequests'], labels: ['open service request'], detail: 'Pause or remove each open request in Request Manager.', links: [{ href: '/seeker/request-manager', label: 'Request Manager' }] },
  { id: 'bookings', title: 'Settle your bookings and queue', empty: 'No unfinished bookings or queued jobs.', types: ['nonterminalBookings', 'queueJobs'], labels: ['unfinished booking', 'queued or serving job'], detail: 'Complete or properly cancel work in both workspaces. Pausing a listing keeps existing bookings active.', links: [{ href: '/seeker/seeker-activity', label: 'Seeker Activity' }, { href: '/provider/provider-activity', label: 'Provider Activity' }] },
  { id: 'payments', title: 'Finish payment and refund processing', empty: 'No outstanding payment processing.', types: ['heldPayments', 'paymentAttempts', 'unresolvedRefunds'], labels: ['held payment', 'pending payment or refund attempt', 'unresolved refund'], detail: 'Finish pending payments and let refunds settle. Contact support if a refund failed.', links: [{ href: '/seeker/seeker-activity', label: 'Seeker Activity' }, { href: '/provider/provider-activity', label: 'Provider Activity' }] },
  { id: 'cases', title: 'Resolve open cases', empty: 'No unresolved cases or document holds.', types: ['cancellations', 'reports', 'completionEscalations', 'banAppeals', 'contentCases', 'verificationHolds', 'resolutionOperations'], labels: ['cancellation case', 'booking report', 'completion review', 'ban appeal', 'content report or appeal', 'verification document hold', 'case resolution in progress'], detail: 'Respond to booking cases in Activity. Reports, appeals, and document holds must be resolved before deletion. Contact support about a document hold.', links: [{ href: '/seeker/seeker-activity', label: 'Seeker Activity' }, { href: '/provider/provider-activity', label: 'Provider Activity' }, { href: '/help', label: 'Help Center' }] },
];

export default function AccountDeletionPanel({ email, isDark }: Props) {
  const [eligibility, setEligibility] = useState<AccountDeletionEligibility | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'confirm' | 'verify'>('confirm');
  const [confirmation, setConfirmation] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [method, setMethod] = useState<'password' | 'google'>('password');
  const [challenge, setChallenge] = useState<{ nonce: string; challenge: string } | null>(null);
  const [googleCredential, setGoogleCredential] = useState('');
  const [startingGoogle, setStartingGoogle] = useState(false);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const confirmationInput = useRef<HTMLInputElement>(null);
  const passwordInput = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const busy = useRef(false);
  const generation = useRef(0);
  const googleGeneration = useRef(0);

  const refresh = useCallback(async () => {
    const request = ++generation.current;
    setLoading(true); setLoadError('');
    try {
      const response = await apiGetAccountDeletionEligibility();
      if (request === generation.current) setEligibility(response.data);
      return request === generation.current ? response.data : null;
    } catch (cause) {
      if (request === generation.current) { setEligibility(null); setLoadError(getApiErrorMessage(cause, 'Could not check your account. Try again.')); }
      return null;
    } finally { if (request === generation.current) setLoading(false); }
  }, []);

  useEffect(() => {
    const request = ++generation.current;
    const requestCounter = generation;
    const googleCounter = googleGeneration;
    apiGetAccountDeletionEligibility().then(response => {
      if (request === requestCounter.current) setEligibility(response.data);
    }).catch(cause => {
      if (request === requestCounter.current) setLoadError(getApiErrorMessage(cause, 'Could not check your account. Try again.'));
    }).finally(() => { if (request === requestCounter.current) setLoading(false); });
    return () => { requestCounter.current++; googleCounter.current++; };
  }, []);
  useEffect(() => {
    const element = dialog.current;
    if (open && element && !element.open) element.showModal();
    if (!open && element?.open) element.close();
    if (open && !deleting) (step === 'confirm' ? confirmationInput : passwordInput).current?.focus();
  }, [open, step, method, deleting, error]);

  const close = () => {
    if (busy.current) return;
    googleGeneration.current++;
    setOpen(false); setStep('confirm'); setConfirmation(''); setPassword(''); setShowPassword(false);
    setChallenge(null); setGoogleCredential(''); setError(''); setMethod('password'); setStartingGoogle(false);
    trigger.current?.focus();
  };
  const begin = async () => {
    const latest = await refresh();
    if (!latest?.eligible) return;
    setStep('confirm'); setConfirmation(''); setPassword(''); setError(''); setOpen(true);
  };
  const chooseGoogle = async () => {
    const request = ++googleGeneration.current;
    setMethod('google'); setPassword(''); setError(''); setStartingGoogle(true); setGoogleCredential(''); setChallenge(null);
    try {
      const response = await apiStartDeletionGoogleVerification();
      if (request === googleGeneration.current) setChallenge(response.data);
    } catch (cause) { if (request === googleGeneration.current) setError(getApiErrorMessage(cause, 'Google verification could not start. Try again.')); }
    finally { if (request === googleGeneration.current) setStartingGoogle(false); }
  };

  const submit = async () => {
    if (busy.current || confirmation !== 'DELETE' || !eligibility?.eligible || step !== 'verify') return;
    let verification: AccountDeletionVerification;
    if (method === 'password') { if (!password) return; verification = { method, password }; }
    else { if (!challenge || !googleCredential) return; verification = { method, credential: googleCredential, challenge: challenge.challenge }; }
    busy.current = true; setDeleting(true); setError('');
    try {
      await apiDeleteOwnAccount(verification);
      clearAccessToken(); disconnectSocket();
      localStorage.removeItem('userSession'); localStorage.removeItem('workspaceRole');
      sessionStorage.setItem('servicehub:auth-notice', 'account-deleted');
      window.location.replace('/login?reason=account-deleted');
    } catch (cause) {
      if (isAxiosError<{ code?: string; data?: AccountDeletionEligibility }>(cause) && cause.response?.data?.code === 'ACCOUNT_DELETION_BLOCKED' && cause.response.data.data) {
        setEligibility(cause.response.data.data); busy.current = false; close();
        setLoadError('Your account changed. Resolve the updated checklist before continuing.');
      } else {
        setError(getApiErrorMessage(cause, 'Your account could not be deleted. Try again.'));
        setPassword(''); setGoogleCredential(''); setChallenge(null);
        passwordInput.current?.focus();
      }
    } finally { busy.current = false; setDeleting(false); }
  };
  const googleAvailable = eligibility?.googleAvailable && Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

  return <section className="account-deletion" aria-labelledby="account-deletion-heading">
    <div className="account-deletion__intro">
      <Trash2 size={20} aria-hidden="true" />
      <div><h2 id="account-deletion-heading">Delete account</h2><p>You control this decision. Clear your marketplace commitments, then verify your account to continue.</p></div>
    </div>
    <div className="account-deletion__check-heading"><h3>Before you delete</h3><button type="button" onClick={() => void refresh()} disabled={loading || deleting} className="account-deletion__text-button"><RefreshCw size={15} aria-hidden="true" />{loading ? 'Checking…' : 'Check again'}</button></div>
    {loading ? <div className="account-deletion__loading" role="status">Checking listings, bookings, payments, and cases…<div /><div /><div /></div> : eligibility && <ul className="account-deletion__checklist">
      {CHECKS.map(check => {
        const pending = check.types.some(type => (eligibility.counts[type] || 0) > 0);
        const summary = check.types.flatMap((type, i) => { const count = eligibility.counts[type] || 0; return count ? [`${count} ${check.labels[i]}${count === 1 ? '' : 's'}`] : []; }).join(' · ');
        return <li key={check.id} className={pending ? 'is-pending' : 'is-clear'}>
          {pending ? <AlertTriangle size={18} aria-hidden="true" /> : <CheckCircle2 size={18} aria-hidden="true" />}
          <div><h4>{check.title}<span>{pending ? 'Action needed' : 'Clear'}</span></h4><p>{pending ? summary : check.empty}</p>{pending && <><p>{check.detail}</p><div className="account-deletion__links">{check.links.map(link => <Link key={link.href} href={link.href}>{link.label}<ArrowRight size={14} aria-hidden="true" /></Link>)}</div></>}</div>
        </li>;
      })}
    </ul>}
    {loadError && <div className="account-deletion__error" role="alert">{loadError}{!eligibility && <button type="button" onClick={() => void refresh()}>Try again</button>}</div>}
    <div className="account-deletion__footer"><p id="deletion-availability">{eligibility?.eligible && !loading ? 'Your checklist is clear. Next: confirm deletion and verify your account.' : 'Resolve every item marked “Action needed” to unlock account deletion.'}</p><button type="button" ref={trigger} className="account-deletion__danger" disabled={loading || !eligibility?.eligible} onClick={() => void begin()} aria-describedby="deletion-availability">Continue to account deletion<ArrowRight size={16} aria-hidden="true" /></button></div>

    <dialog ref={dialog} className="account-deletion__dialog" aria-labelledby="deletion-dialog-title" aria-describedby="deletion-dialog-description" onCancel={event => { event.preventDefault(); close(); }}>
      <form onSubmit={event => { event.preventDefault(); if (step === 'confirm') { if (confirmation === 'DELETE') { setStep('verify'); setError(''); if (eligibility?.passwordAvailable === false) void chooseGoogle(); } } else void submit(); }}>
        <div className="account-deletion__dialog-header"><span>{step === 'confirm' ? <Trash2 size={22} aria-hidden="true" /> : <LockKeyhole size={22} aria-hidden="true" />}</span><button type="button" onClick={close} disabled={deleting} aria-label="Close deletion dialog"><X size={20} /></button></div>
        <ol className="account-deletion__steps" aria-label="Account deletion steps"><li aria-current={step === 'confirm' ? 'step' : undefined}>1. Confirm deletion</li><li aria-current={step === 'verify' ? 'step' : undefined}>2. Verify account</li></ol>
        <h2 id="deletion-dialog-title">{step === 'confirm' ? 'Delete your ServiceHub account?' : 'Verify that this is your account'}</h2>
        <p id="deletion-dialog-description">{step === 'confirm' ? 'Deletion is permanent. Review what happens before you continue.' : 'A signed-in session is not enough. Complete fresh verification before deleting your account.'}</p>
        {step === 'confirm' ? <>
          <ul className="account-deletion__consequences"><li>Your account, profile, login details, and verification records will be permanently deleted from our database.</li><li>Your listings, requests, offers, reviews, chats, notifications, and related database records will be deleted.</li><li>Closed bookings and their payment and case history will be removed for both participants. This cannot be undone.</li><li>You will be signed out on every device.</li></ul>
          <label htmlFor="deletion-confirmation">Type <strong>DELETE</strong> to continue</label><input id="deletion-confirmation" ref={confirmationInput} autoComplete="off" spellCheck={false} maxLength={6} value={confirmation} onChange={event => setConfirmation(event.target.value)} />
        </> : <>
          <p className="account-deletion__identity">{email}</p>
          {method === 'password' ? <>
            <label htmlFor="deletion-password">Current account password</label><div className="account-deletion__password"><input id="deletion-password" ref={passwordInput} type={showPassword ? 'text' : 'password'} autoComplete="current-password" maxLength={128} value={password} disabled={deleting} onChange={event => { setPassword(event.target.value); setError(''); }} aria-invalid={Boolean(error)} aria-describedby={error ? 'deletion-verification-error' : 'deletion-password-help'} /><button type="button" onClick={() => setShowPassword(value => !value)} disabled={deleting} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button></div>
            <p id="deletion-password-help" className="account-deletion__hint">Use your ServiceHub password. Don’t have one? <Link href="/login?mode=forgot">Reset your password</Link>{googleAvailable ? ' or verify with Google below.' : '.'}</p>
            {googleAvailable && <button type="button" disabled={deleting} className="account-deletion__text-button" onClick={() => void chooseGoogle()}>Verify with Google instead<ArrowRight size={15} aria-hidden="true" /></button>}
          </> : <>
            <p className="account-deletion__hint">Choose the Google account matching the email above. Verification expires after five minutes.</p>
            {startingGoogle ? <p role="status">Preparing secure Google verification…</p> : challenge ? <GoogleDeletionVerification nonce={challenge.nonce} isDark={isDark} disabled={deleting || Boolean(googleCredential)} onSuccess={credential => { setGoogleCredential(credential); setError(''); }} onError={setError} /> : <button type="button" disabled={deleting} onClick={() => void chooseGoogle()} className="account-deletion__secondary">Start Google verification again</button>}
            {googleCredential && <p role="status" className="account-deletion__verified"><CheckCircle2 size={17} />Google verification received. Select Delete account to finish.</p>}
            {eligibility?.passwordAvailable !== false && <button type="button" disabled={deleting} className="account-deletion__text-button" onClick={() => { googleGeneration.current++; setMethod('password'); setChallenge(null); setGoogleCredential(''); setError(''); }}>Use your password instead</button>}
          </>}
          {error && <p id="deletion-verification-error" role="alert" className="account-deletion__error">{error}</p>}
        </>}
        <div className="account-deletion__dialog-footer"><button type="button" className="account-deletion__secondary" disabled={deleting} onClick={step === 'confirm' ? close : () => { googleGeneration.current++; setStep('confirm'); setPassword(''); setChallenge(null); setGoogleCredential(''); setMethod('password'); setError(''); }}> {step === 'confirm' ? 'Keep my account' : 'Back'}</button><button type="submit" className="account-deletion__danger" disabled={deleting || (step === 'confirm' ? confirmation !== 'DELETE' : method === 'password' ? !password : !googleCredential)}>{deleting ? 'Deleting account…' : step === 'confirm' ? 'Continue to verification' : 'Delete account'}</button></div>
      </form>
    </dialog>
  </section>;
}
