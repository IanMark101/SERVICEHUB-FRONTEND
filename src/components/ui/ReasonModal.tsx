"use client";

import { Loader2, MessageSquareText, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ReasonModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void | Promise<void>;
  confirmText?: string;
  label?: string;
  placeholder?: string;
  minLength?: number;
  isSubmitting?: boolean;
  variant?: 'primary' | 'danger';
}

export default function ReasonModal({
  isOpen,
  title,
  description,
  value,
  onChange,
  onClose,
  onSubmit,
  confirmText = 'Submit',
  label = 'Reason',
  placeholder = 'Provide a clear reason for the audit record.',
  minLength = 3,
  isSubmitting = false,
  variant = 'primary',
}: ReasonModalProps) {
  const { isDark } = useApp();
  if (!isOpen) return null;

  const trimmedLength = value.trim().length;
  const isValid = trimmedLength >= minLength;
  const buttonClass = variant === 'danger'
    ? 'bg-red-600 hover:bg-red-700'
    : 'bg-slate-950 hover:bg-slate-800 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-white';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="reason-modal-title">
      <form
        onSubmit={(event) => { event.preventDefault(); if (isValid && !isSubmitting) void onSubmit(); }}
        className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl ${isDark ? 'border-neutral-800 bg-[#22211e] text-[#f2efe9]' : 'border-slate-200 bg-white text-slate-900'}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className={`rounded-xl p-2.5 ${variant === 'danger' ? 'bg-red-500/10 text-red-500' : 'bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:text-neutral-300'}`}>
              <MessageSquareText className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 id="reason-modal-title" className="text-base font-extrabold">{title}</h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-neutral-400">{description}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} disabled={isSubmitting} aria-label="Close dialog" className="rounded-lg border border-slate-200 p-1.5 text-slate-400 hover:bg-slate-50 disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-800">
            <X className="h-4 w-4" />
          </button>
        </div>

        <label htmlFor="reason-modal-value" className="mt-5 block text-xs font-bold">{label}</label>
        <textarea
          id="reason-modal-value"
          autoFocus
          rows={5}
          maxLength={500}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          disabled={isSubmitting}
          className={`mt-2 w-full resize-none rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-500/15 ${isDark ? 'border-neutral-700 bg-[#191919]' : 'border-slate-300 bg-white'}`}
        />
        <div className="mt-1 flex justify-between text-[10px] text-slate-500">
          <span>{isValid ? 'Ready to submit.' : `Enter at least ${minLength} characters.`}</span>
          <span>{value.length}/500</span>
        </div>

        <div className="mt-5 flex gap-3 border-t border-slate-100 pt-4 dark:border-neutral-800">
          <button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold hover:bg-slate-50 disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-800">Cancel</button>
          <button type="submit" disabled={!isValid || isSubmitting} className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 ${buttonClass}`}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {isSubmitting ? 'Submitting...' : confirmText}
          </button>
        </div>
      </form>
    </div>
  );
}
