'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Check, CheckCircle2, Circle, LockKeyhole, Loader2, Mail, ShieldCheck } from 'lucide-react';
import { apiChangePassword, apiGetSecurityMethods, apiSetPassword, apiStartPasswordSetup, apiVerifyPasswordSetup, type SecurityMethods } from '../../../api/auth.api';
import { getApiErrorBody, getApiErrorMessage } from '../../../lib/api/errors';
import { clearAccessToken } from '../../../lib/api/axios';
import { disconnectSocket } from '../../../lib/socket';
import { passwordFormSchema, passwordRequirements, strongPasswordSchema } from '../../../schema/auth/passwordValidation';
import GoogleDeletionVerification from './GoogleDeletionVerification';
import PasswordField from './PasswordField';
import './password-security.css';

export default function PasswordSecurityPanel({ isDark }: { isDark: boolean }) {
  const [methods, setMethods] = useState<SecurityMethods | null>(null);
  const [loadError, setLoadError] = useState(''); const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false); const [busy, setBusy] = useState(false);
  const [legacyPasswordMode, setLegacyPasswordMode] = useState(false);
  const [challenge, setChallenge] = useState<{ nonce: string; challenge: string } | null>(null);
  const [grant, setGrant] = useState(''); const [expiresAt, setExpiresAt] = useState(0);
  const [current, setCurrent] = useState(''); const [password, setPassword] = useState(''); const [confirm, setConfirm] = useState('');
  const [currentError, setCurrentError] = useState(''); const [error, setError] = useState(''); const [success, setSuccess] = useState('');
  const [passwordTouched, setPasswordTouched] = useState(false); const [confirmTouched, setConfirmTouched] = useState(false);
  const lock = useRef(false); const generation = useRef(0); const requestId = useRef(0); const newInput = useRef<HTMLInputElement>(null); const currentInput = useRef<HTMLInputElement>(null); const trigger = useRef<HTMLButtonElement>(null);
  const requirementsId = useId();
  // Unclassified legacy email accounts can prove their known password here.
  // Connected Google accounts always get setup until a password is confirmed.
  const unresolvedLegacy = Boolean(methods?.legacyPasswordUnconfirmed && !methods.googleConnected);
  const changing = Boolean(methods?.passwordEnabled || legacyPasswordMode);
  const googleConfigured = Boolean(methods?.googleAvailable && process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
  const passwordResult = strongPasswordSchema.safeParse(password);
  const passwordError = passwordTouched && !passwordResult.success ? passwordResult.error.issues[0].message : '';
  const mismatch = (confirm.length > 0 || confirmTouched) && confirm !== password;
  const confirmationError = mismatch ? 'Passwords do not match.' : confirmTouched && !confirm ? 'Confirm your new password.' : '';
  const valid = passwordFormSchema.safeParse({ newPassword: password, confirmPassword: confirm }).success;

  const load = useCallback(async () => {
    const version = ++requestId.current; setLoading(true); setLoadError('');
    try { const response = await apiGetSecurityMethods(); if (version === requestId.current) setMethods(response.data); }
    catch (cause) { if (version === requestId.current) { setMethods(null); setLoadError(getApiErrorMessage(cause, 'Could not load your sign-in methods. Try again.')); } }
    finally { if (version === requestId.current) setLoading(false); }
  }, []);
  useEffect(() => {
    const requestCounter = requestId; const verificationCounter = generation;
    const timer = window.setTimeout(() => void load(), 0);
    return () => { clearTimeout(timer); requestCounter.current++; verificationCounter.current++; };
  }, [load]);
  useEffect(() => {
    if (!expiresAt) return;
    const timer = window.setTimeout(() => {
      generation.current++; setGrant(''); setChallenge(null); setExpiresAt(0); setPassword(''); setConfirm(''); setError('Google verification expired. Verify with Google again.');
    }, Math.max(0, expiresAt - Date.now()));
    return () => clearTimeout(timer);
  }, [expiresAt]);
  useEffect(() => { if (open && (changing || grant)) (changing ? currentInput : newInput).current?.focus(); }, [open, changing, grant]);
  useEffect(() => { if (currentError && !busy) currentInput.current?.focus(); }, [currentError, busy]);

  const reset = () => { generation.current++; setCurrent(''); setPassword(''); setConfirm(''); setGrant(''); setChallenge(null); setExpiresAt(0); setError(''); setCurrentError(''); setPasswordTouched(false); setConfirmTouched(false); };
  const beginGoogle = async () => {
    if (lock.current) return; lock.current = true; setBusy(true); setError('');
    const version = ++generation.current;
    try {
      const response = await apiStartPasswordSetup();
      if (version === generation.current) { setChallenge(response.data); setExpiresAt(Date.now() + response.data.expiresInSeconds * 1000); }
    } catch (cause) { if (version === generation.current) setError(getApiErrorMessage(cause, 'Could not start Google verification. Try again.')); }
    finally { lock.current = false; setBusy(false); }
  };
  const verifyGoogle = async (credential: string) => {
    if (!challenge || lock.current) return; lock.current = true; setBusy(true); setError('');
    const version = generation.current;
    try {
      const response = await apiVerifyPasswordSetup({ credential, challenge: challenge.challenge });
      if (version === generation.current) { setGrant(response.data.grant); setChallenge(null); setMethods(previous => previous ? { ...previous, googleConnected: true } : previous); setExpiresAt(Date.now() + response.data.expiresInSeconds * 1000); }
    } catch (cause) { if (version === generation.current) { setChallenge(null); setExpiresAt(0); setError(getApiErrorMessage(cause, 'Google could not verify your identity. Try again.')); } }
    finally { lock.current = false; setBusy(false); }
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (lock.current || !valid || currentError || (changing ? !current : !grant || Date.now() >= expiresAt)) return;
    lock.current = true; setBusy(true); setError(''); setSuccess('');
    try {
      if (changing) {
        await apiChangePassword({ currentPassword: current, newPassword: password, confirmPassword: confirm });
        sessionStorage.setItem('servicehub:auth-notice', 'password-changed'); clearAccessToken(); disconnectSocket();
        localStorage.removeItem('userSession'); window.location.replace('/login?reason=password-changed');
      } else {
        await apiSetPassword({ grant, newPassword: password, confirmPassword: confirm });
        reset(); setOpen(false); setMethods(previous => previous ? { ...previous, passwordEnabled: true, legacyPasswordUnconfirmed: false } : previous);
        setSuccess('Password created. You can now sign in with Google or email and password. Other devices have been signed out.');
        window.dispatchEvent(new Event('account_updated')); requestAnimationFrame(() => trigger.current?.focus());
      }
    } catch (cause) {
      const code = getApiErrorBody(cause)?.code;
      if (code === 'CURRENT_PASSWORD_INCORRECT' || code === 'CURRENT_PASSWORD_CHANGED') { setCurrentError(getApiErrorMessage(cause, 'Current password is incorrect. Try again.')); setCurrent(''); currentInput.current?.focus(); }
      else { setError(getApiErrorMessage(cause, 'Could not save your password. Try again.')); if (code === 'GOOGLE_VERIFICATION_EXPIRED') { setGrant(''); setExpiresAt(0); } if (code === 'PASSWORD_ALREADY_SET' || code === 'PASSWORD_NOT_SET') { reset(); setOpen(false); void load(); } }
    } finally { lock.current = false; setBusy(false); }
  };

  return <section id="password-security" className="security-password" aria-busy={busy || loading}>
    <header><LockKeyhole size={20} /><div><h2>Password &amp; Security</h2><p>Manage how you sign in to ServiceHub.</p></div></header>
    {loading ? <div className="security-password__loading" role="status">Loading your sign-in methods…</div> : loadError ? <div className="security-password__error" role="alert">{loadError}<button type="button" onClick={() => void load()}>Try again</button></div> : methods && <>
      <h3>Sign-in methods</h3>
      <ul className="security-password__methods">
        <li><ShieldCheck size={20} /><div><strong>Google</strong><span>{methods.googleConnected ? 'Connected' : unresolvedLegacy ? 'Not confirmed yet' : 'Not connected'}</span></div>{methods.googleConnected && <CheckCircle2 size={18} className="security-password__valid" aria-label="Google connected" />}</li>
        <li><Mail size={20} /><div><strong>Email &amp; Password</strong><span>{methods.passwordEnabled ? 'Enabled' : methods.legacyPasswordUnconfirmed && !methods.googleConnected ? 'Verify your existing password' : 'Not enabled'}</span></div>{methods.passwordEnabled && <CheckCircle2 size={18} className="security-password__valid" aria-label="Email and password enabled" />}</li>
      </ul>
      {success && <div className="security-password__success" role="status"><CheckCircle2 size={20} /><p>{success}</p></div>}
      <div className="security-password__summary"><div><h3>Password</h3><p>{methods.passwordEnabled ? 'Password is set.' : changing ? 'Confirm your current password to update it securely.' : unresolvedLegacy ? 'Password status needs confirmation.' : 'No password set.'}</p>
        {!changing && <p>{unresolvedLegacy ? 'This older account did not record its sign-in methods. If you sign in through Google, verify it to set a password. If you already use a ServiceHub password, confirm it to change it.' : 'You currently sign in through Google. Create an optional ServiceHub password to also sign in with your email and password.'}</p>}</div>
        {!open && <button ref={trigger} type="button" className="workspace-primary-button security-password__button" onClick={() => { reset(); setLegacyPasswordMode(false); setSuccess(''); setOpen(true); }} disabled={!methods.passwordEnabled && ((!methods.googleConnected && !unresolvedLegacy) || !googleConfigured)}>{methods.passwordEnabled ? 'Change Password' : 'Set Password'}</button>}
      </div>
      {unresolvedLegacy && !open && <button type="button" className="security-password__cancel" onClick={() => { reset(); setLegacyPasswordMode(true); setOpen(true); }}>I already use a ServiceHub password</button>}
      {!changing && !googleConfigured && <p className="security-password__field-error">Google verification is temporarily unavailable. Try again later.</p>}
      {open && <div className="security-password__editor">
        <h3>{changing ? 'Change Password' : grant ? 'Create your ServiceHub password' : 'Verify your identity'}</h3>
        {!changing && !grant && <><p>Verify with your Google account for {methods.email}. Then choose your new password.</p>
          {challenge ? <GoogleDeletionVerification nonce={challenge.nonce} isDark={isDark} disabled={busy} onSuccess={credential => void verifyGoogle(credential)} onError={message => { setError(message); setChallenge(null); setExpiresAt(0); }} /> : <button type="button" className="security-password__secondary" onClick={() => void beginGoogle()} disabled={busy}>{busy ? 'Starting verification…' : 'Verify with Google'}</button>}
          {challenge && <p className="security-password__help">Complete Google verification to continue. Verification expires after 5 minutes.</p>}
        </>}
        {!changing && grant && <p className="security-password__verified"><ShieldCheck size={18} />Google identity verified. Choose your password within 5 minutes.</p>}
        {(changing || grant) && <form onSubmit={submit} noValidate>
          <input type="text" name="username" autoComplete="username" value={methods.email} readOnly hidden />
          {changing && <PasswordField label="Current Password" value={current} inputRef={currentInput} onChange={value => { setCurrent(value); setCurrentError(''); }} error={currentError} disabled={busy} autoComplete="current-password" />}
          <div className="security-password__fields">
            <PasswordField label="New Password" value={password} inputRef={newInput} onChange={value => { setPassword(value); setPasswordTouched(true); }} onBlur={() => setPasswordTouched(true)} error={passwordError} valid={password.length > 0 && passwordResult.success} disabled={busy} describedBy={requirementsId} />
            <PasswordField label="Confirm New Password" value={confirm} onChange={value => { setConfirm(value); setConfirmTouched(true); }} onBlur={() => setConfirmTouched(true)} error={confirmationError} valid={confirm.length > 0 && confirm === password} disabled={busy} />
          </div>
          <div id={requirementsId} className="security-password__requirements"><p>Your new password needs:</p><ul>{passwordRequirements.map(rule => <li key={rule.label} className={rule.test(password) ? 'is-met' : ''}>{rule.test(password) ? <Check size={15} /> : <Circle size={13} />}<span>{rule.label}</span><span className="sr-only">{rule.test(password) ? ' — satisfied' : ' — missing'}</span></li>)}</ul></div>
          {changing && <p className="security-password__help">For security, changing your password signs you out on every device. Sign in again with your new password.</p>}
          <button type="submit" className="workspace-primary-button security-password__button" disabled={busy || !valid || Boolean(currentError) || (changing ? !current : !grant)}>{busy && <Loader2 size={16} className="security-password__spinner" />}{busy ? 'Saving password…' : changing ? 'Save New Password' : 'Create Password'}</button>
        </form>}
        {busy && !changing && !grant && <p role="status">Verifying your identity…</p>}
        {error && <p className="security-password__error" role="alert">{error}</p>}
        <button type="button" className="security-password__cancel" disabled={busy} onClick={() => { reset(); setOpen(false); requestAnimationFrame(() => trigger.current?.focus()); }}>Cancel</button>
      </div>}
    </>}
  </section>;
}
