'use client';

import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { X } from '@phosphor-icons/react';
import { apiGetGCashNumber, apiSaveGCashNumber } from '../../api/gcashNumber.api';
import { getApiErrorMessage } from '../../lib/api/errors';
import useDialogFocus from '../../hooks/useDialogFocus';
import form from './TransactionForm.module.css';
import styles from './GCashNumberField.module.css';
import PhilippineFlag from './PhilippineFlag';
import { formatPhilippineMobile } from '../../lib/philippine-phone';

export type GCashReadiness = { userId: string; ready: boolean };
interface Props { userId?: string; enabled: boolean; isDark: boolean; workspace: 'seeker' | 'provider'; disabled?: boolean; onReadinessChange?: (state: GCashReadiness) => void }

// Keyed to the signed-in account; no number is kept in browser storage or auth profiles.
export default function GCashNumberField({ userId, enabled, ...props }: Props) {
  return enabled && userId ? <GCashNumberControl key={userId} userId={userId} {...props} /> : null;
}

function GCashNumberControl({ userId, isDark, workspace, disabled, onReadinessChange }: Omit<Props, 'enabled'> & { userId: string }) {
  const [number, setNumber] = useState<string | null>(null);
  const [phase, setPhase] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => {
    onReadinessChange?.({ userId, ready: phase === 'ready' && /^09\d{9}$/.test(number ?? '') });
  }, [userId, phase, number, onReadinessChange]);
  useEffect(() => {
    const controller = new AbortController();
    apiGetGCashNumber(controller.signal).then(result => {
      if (!controller.signal.aborted) { setNumber(result.gcashNumber); setPhase('ready'); }
    }).catch(() => { if (!controller.signal.aborted) setPhase('error'); });
    return () => controller.abort();
  }, [attempt]);

  return <div className={styles.row} data-gcash-number data-theme={isDark ? 'dark' : 'light'} data-workspace={workspace}>
    <div className={styles.copy}>
      <strong>GCash number <span>(required)</span></strong>
      <p>{phase === 'loading' ? 'Loading…' : phase === 'error' ? 'Could not load your number. Retry or choose Cash only.' : number ? `Saved · ending in ${number.slice(-4)}` : 'Add a number or choose Cash only.'}</p>
      <p className={styles.note}>Private · no Test Mode payouts.</p>
      {workspace === 'provider' && <p className={styles.note}>10% platform fee on completed GCash bookings, including travel.</p>}
      <span className={styles.status} role="status">{message}</span>
    </div>
    <button className={styles.edit} type="button" disabled={disabled || phase === 'loading'} onClick={() => {
      setMessage('');
      if (phase === 'error') { setPhase('loading'); setAttempt(value => value + 1); }
      else setOpen(true);
    }}>{phase === 'error' ? 'Retry' : number ? 'Edit GCash number' : 'Add GCash number'}</button>
    {open && <GCashNumberModal initialNumber={number} isDark={isDark} workspace={workspace} onClose={() => setOpen(false)} onSaved={saved => {
      setNumber(saved); setOpen(false); setMessage(saved ? 'GCash number saved. Your contact number is unchanged.' : 'GCash number removed.');
    }} />}
  </div>;
}

interface ModalProps { initialNumber: string | null; isDark: boolean; workspace: 'seeker' | 'provider'; onClose: () => void; onSaved: (number: string | null) => void }

function GCashNumberModal({ initialNumber, isDark, workspace, onClose, onSaved }: ModalProps) {
  const id = useId();
  const [value, setValue] = useState(() => formatPhilippineMobile(initialNumber ?? ''));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const pending = useRef<AbortController | null>(null);
  const dialogRef = useDialogFocus(true, busy, onClose);
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; pending.current?.abort(); };
  }, []);

  async function save(number: string | null) {
    if (pending.current) return;
    const controller = new AbortController();
    pending.current = controller; setBusy(true); setError('');
    try {
      const result = await apiSaveGCashNumber(number, controller.signal);
      if (!controller.signal.aborted) onSaved(result.gcashNumber);
    } catch (cause) {
      if (!controller.signal.aborted) { setError(getApiErrorMessage(cause, 'Could not save your GCash number. Please try again.')); setBusy(false); }
    } finally { if (pending.current === controller) pending.current = null; }
  }

  function submit(event: FormEvent) {
    event.preventDefault(); event.stopPropagation();
    const digits = value.replace(/\D/g, '');
    if (!/^9\d{9}$/.test(digits)) { setError('Enter 10 digits starting with 9 after +63, for example 917 123 4567.'); return; }
    void save(`0${digits}`);
  }

  return createPortal(<div className={`${form.overlay} ${styles.overlay}`} onMouseDown={event => { if (event.target === event.currentTarget && !busy) onClose(); }}>
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`} aria-busy={busy} tabIndex={-1} onKeyDown={event => event.stopPropagation()} className={`${form.panel} ${styles.panel}`} data-theme={isDark ? 'dark' : 'light'} data-workspace={workspace}>
      <div className={form.header}><h3 id={`${id}-title`}>{initialNumber ? 'Edit GCash number' : 'Add GCash number'}</h3><button type="button" className={form.close} aria-label="Close GCash number" disabled={busy} onClick={onClose}><X size={20} aria-hidden="true" /></button></div>
      <form className={form.form} onSubmit={submit} noValidate aria-label="Save GCash number">
        <div className={form.body}>
          <p id={`${id}-description`} className={styles.description}>Private payment number. Separate from your contact number.</p>
          <label className={form.label} htmlFor={`${id}-number`}>GCash mobile number</label>
          <div className={`${styles.phone} form-control-group`} data-invalid={Boolean(error)}>
            <span className={styles.prefix} aria-hidden="true"><PhilippineFlag />+63</span>
            <input data-form-unstyled id={`${id}-number`} type="tel" inputMode="numeric" autoComplete="off" placeholder="917 123 4567" value={value} disabled={busy} aria-invalid={!!error} aria-describedby={`${id}-help${error ? ` ${id}-error` : ''}`} onChange={event => { setValue(formatPhilippineMobile(event.target.value)); setError(''); }} />
          </div>
          <div className={styles.phoneHelp}><p id={`${id}-help`} className={form.hint}>10 digits starting with 9. No MPIN or OTP.</p><span aria-hidden="true">{value.replace(/\D/g, '').length}/10 digits</span></div>
          <p className={form.notice}>Test Mode: no real money is transferred. Saving does not verify the wallet.</p>
          {error && <p id={`${id}-error`} role="alert" className={form.error}>{error}</p>}
        </div>
        <div className={form.footer}><div className={form.actions}>
          {initialNumber && <button type="button" className={`${form.button} ${styles.remove}`} disabled={busy} onClick={() => void save(null)}>Remove number</button>}
          <button type="button" className={form.button} disabled={busy} onClick={onClose}>Cancel</button>
          <button type="submit" className={`${form.button} ${form.primary}`} disabled={busy}>{busy ? 'Saving…' : 'Save number'}</button>
        </div></div>
      </form>
    </div>
  </div>, document.body);
}
