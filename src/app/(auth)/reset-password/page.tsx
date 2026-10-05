'use client';

import { Suspense, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Check, CheckCircle2, Circle, KeyRound, Loader2 } from 'lucide-react';
import { apiResetPassword } from '@/api/auth.api';
import { getApiErrorMessage } from '@/lib/api/errors';
import BrandLoading from '@/components/ui/BrandLoading';
import PasswordField from '@/components/profile/account-settings/PasswordField';
import { passwordFormSchema, passwordRequirements, strongPasswordSchema } from '@/schema/auth/passwordValidation';
import '@/components/profile/account-settings/password-security.css';

function ResetPasswordContent() {
  const token = useSearchParams().get('token') || '';
  const [password, setPassword] = useState(''); const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false); const [success, setSuccess] = useState(false); const [error, setError] = useState('');
  const lock = useRef(false);
  const validation = strongPasswordSchema.safeParse(password);
  const valid = passwordFormSchema.safeParse({ newPassword: password, confirmPassword: confirm }).success;
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); if (lock.current || !token || !valid) return;
    lock.current = true; setBusy(true); setError('');
    try { await apiResetPassword({ token, password, confirmPassword: confirm }); setPassword(''); setConfirm(''); setSuccess(true); }
    catch (cause) { setError(getApiErrorMessage(cause, 'Could not reset your password. Request a new link if this one expired.')); }
    finally { lock.current = false; setBusy(false); }
  };
  return <main className="workspace-shell min-h-dvh px-4 py-12 sm:py-20">
    <section className="security-password mx-auto max-w-xl" aria-busy={busy}>
      <header><KeyRound size={22} /><div><h2>Reset your password</h2><p>Choose a new ServiceHub password. Every device will be signed out for security.</p></div></header>
      {!token ? <div className="security-password__error" role="alert">This reset link is missing its verification token. Use the complete link from your email.<p><Link href="/login?mode=forgot">Get a new reset link</Link></p></div> : success ? <><div className="security-password__success mt-6" role="status"><CheckCircle2 size={20} /><p>Password reset successfully. Sign in with your new password or your connected Google account.</p></div><Link href="/login" className="workspace-primary-button security-password__button">Back to sign in</Link></> : <form className="mt-6 space-y-5" onSubmit={submit} noValidate>
        <PasswordField label="New Password" value={password} onChange={value => { setPassword(value); setError(''); }} error={password && !validation.success ? validation.error.issues[0].message : ''} valid={Boolean(password) && validation.success} disabled={busy} describedBy="reset-password-requirements" />
        <div id="reset-password-requirements" className="security-password__requirements"><p>Your new password needs:</p><ul>{passwordRequirements.map(rule => <li key={rule.label} className={rule.test(password) ? 'is-met' : ''}>{rule.test(password) ? <Check size={15} /> : <Circle size={13} />}{rule.label}</li>)}</ul></div>
        <PasswordField label="Confirm New Password" value={confirm} onChange={setConfirm} error={confirm && password !== confirm ? 'Passwords do not match.' : ''} valid={Boolean(confirm) && password === confirm} disabled={busy} />
        {error && <div className="security-password__error" role="alert">{error}<p><Link href="/login?mode=forgot">Get a new reset link</Link></p></div>}
        <button type="submit" className="workspace-primary-button security-password__button w-full" disabled={busy || !valid}>{busy && <Loader2 size={16} className="security-password__spinner" />}{busy ? 'Resetting password…' : 'Reset Password'}</button>
      </form>}
      {!success && <Link href="/login" className="security-password__cancel">Back to sign in</Link>}
    </section>
  </main>;
}
export default function ResetPasswordPage() { return <Suspense fallback={<BrandLoading label="Preparing password reset" />}><ResetPasswordContent /></Suspense>; }
