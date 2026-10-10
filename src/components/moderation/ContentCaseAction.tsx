"use client";

import { useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { Flag } from '@phosphor-icons/react';
import { apiSubmitContentCase, type ContentCaseType, type ModeratedContentType } from '../../api/contentCases.api';
import { getApiErrorMessage } from '../../lib/api/errors';
import { useToast } from '../ui/Toast';
import useDialogFocus from '../../hooks/useDialogFocus';
import '../ui/dialog.css';

export default function ContentCaseAction({
  caseType,
  contentType,
  resourceId,
  label,
  isDark = false,
  variant = 'link',
  className = '',
  title: customTitle,
}: {
  caseType: ContentCaseType;
  contentType: ModeratedContentType;
  resourceId?: string;
  label?: string;
  isDark?: boolean;
  variant?: 'link' | 'icon';
  className?: string;
  title?: string;
}) {
  const { success, error: toastError } = useToast();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [sending, setSending] = useState(false);
  const dialogRef = useDialogFocus(open, sending, () => { setOpen(false); setReason(''); });
  const title = caseType === 'REPORT' ? 'Report public content' : 'Request an Admin review';
  const submitTone = caseType === 'REPORT'
    ? 'bg-red-700 text-white enabled:hover:bg-red-800 focus-visible:outline-red-700 disabled:bg-red-100 disabled:text-red-800 dark:disabled:bg-red-950/60 dark:disabled:text-red-300'
    : 'bg-brand-action text-white enabled:hover:bg-brand-action-hover focus-visible:outline-brand-focus disabled:opacity-50';
  const close = () => { setOpen(false); setReason(''); };
  const send = async (event: FormEvent) => {
    event.preventDefault();
    if (sending || reason.trim().length < 10) return;
    setSending(true);
    try {
      await apiSubmitContentCase({ caseType, contentType, ...(resourceId ? { resourceId } : {}), reason: reason.trim() });
      success(caseType === 'REPORT' ? 'Report sent' : 'Appeal sent', 'An Admin will review your explanation. This does not automatically change publication status.');
      close();
    } catch (error) { toastError('Could not submit', getApiErrorMessage(error, 'Please try again.')); }
    finally { setSending(false); }
  };

  const actionText = label || (caseType === 'REPORT' ? 'Report content' : 'Appeal decision');

  return <>
    {variant === 'icon' ? (
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={customTitle || actionText}
        aria-label={customTitle || actionText}
        className={
          className ||
          `p-1.5 rounded-lg transition-colors flex items-center justify-center cursor-pointer select-none ${
            isDark
              ? 'text-neutral-500 hover:text-red-400 hover:bg-charcoal'
              : 'text-slate-400 hover:text-red-600 hover:bg-slate-100'
          }`
        }
      >
        <Flag className="w-3.5 h-3.5" weight="duotone" />
      </button>
    ) : (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          className ||
          `rounded-lg px-2 py-1 text-xs font-semibold   focus-visible:outline-2 focus-visible:outline-offset-2 ${
            isDark ? 'text-neutral-300' : 'text-ink-muted'
          }`
        }
      >
        {actionText}
      </button>
    )}
    {open && typeof document !== 'undefined' && createPortal(<div ref={dialogRef} tabIndex={-1} className="fixed inset-0 z-[80] flex items-center justify-center bg-charcoal/70 p-4" role="presentation">
      <form onSubmit={send} role="dialog" aria-modal="true" aria-labelledby="content-case-title" aria-busy={sending} className={`servicehub-dialog w-full max-w-lg space-y-4 rounded-2xl border p-6 shadow-2xl ${isDark ? 'border-neutral-700 bg-charcoal-surface text-white' : 'border-slate-200 bg-white text-ink'}`}>
        <h2 id="content-case-title" className="text-lg font-bold">{title}</h2>
        <p id="content-case-description" className="leading-6">{caseType === 'REPORT' ? 'Explain the content concern. Admin review is separate from booking safety or payment disputes.' : 'Explain why this submission or removal deserves another look. An appeal does not publish it automatically.'}</p>
        <label htmlFor="content-case-reason" className="block text-sm font-semibold">Your explanation</label>
        <textarea id="content-case-reason" aria-describedby="content-case-hint" required minLength={10} maxLength={1000} disabled={sending} value={reason} onChange={(event) => setReason(event.target.value)} className={`min-h-28 w-full rounded-xl border p-3 text-sm ${isDark ? 'border-neutral-700 bg-charcoal-inset' : 'border-slate-300 bg-white'}`} />
        <div id="content-case-hint" className="servicehub-dialog__hint">Enter at least 10 characters.</div>
        <div className="servicehub-dialog__actions"><button type="button" onClick={close} disabled={sending} className="rounded-xl border px-4 py-2 text-sm font-semibold">Cancel</button><button type="submit" data-dialog-action={caseType === 'REPORT' ? 'danger' : 'warning'} disabled={sending || reason.trim().length < 10} className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed ${submitTone}`}>{sending ? 'Sending…' : caseType === 'REPORT' ? 'Send report' : 'Send appeal'}</button></div>
      </form>
    </div>, document.body)}
  </>;
}
