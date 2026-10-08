import type { FormEvent } from "react";
import { Warning as AlertTriangle, CircleNotch as Loader2, X } from "@phosphor-icons/react";

import useDialogFocus from '../../../hooks/useDialogFocus';
import '../../ui/dialog.css';

interface ProviderCancellationDeclineModalProps {
  requestId: string | null;
  declineNote: string;
  isDark: boolean;
  isSubmitting: boolean;
  isActionDisabled: boolean;
  onDeclineNoteChange: (value: string) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent) => void;
}

export default function ProviderCancellationDeclineModal({
  requestId,
  declineNote,
  isDark,
  isSubmitting,
  isActionDisabled,
  onDeclineNoteChange,
  onClose,
  onSubmit,
}: ProviderCancellationDeclineModalProps) {
  const dialogRef = useDialogFocus(Boolean(requestId), isSubmitting, onClose);
  const validReason = declineNote.trim().length >= 3;
  if (!requestId) return null;

  return (
    <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="decline-cancellation-title" aria-describedby="decline-cancellation-description" aria-busy={isSubmitting} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`servicehub-dialog rounded-2xl max-w-lg w-full shadow-xl border animate-in zoom-in-95 duration-200 ${isDark ? "bg-charcoal-surface border-neutral-800/80 text-white" : "bg-white border-slate-200 text-ink"}`}>
        <div className={`p-5 border-b flex justify-between items-center ${isDark ? "border-neutral-850 bg-charcoal-inset/45" : "border-slate-100 bg-slate-50/50"}`}>
          <h3 id="decline-cancellation-title" className={`font-extrabold text-sm flex items-center space-x-1.5 ${isDark ? "text-white" : "text-ink"}`}>
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span>Decline Cancellation Request</span>
          </h3>
          <button type="button" aria-label="Close dialog" disabled={isSubmitting} onClick={onClose}
            className={`p-1.5 rounded-lg border transition-colors ${isDark ? "border-neutral-800 hover:bg-charcoal text-ink-subtle" : "border-slate-200 hover:bg-slate-100 text-ink-subtle"}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={(event) => { if (!validReason || isActionDisabled || isSubmitting) { event.preventDefault(); return; } onSubmit(event); }} className="p-5 space-y-4">
          <p id="decline-cancellation-description" className={`text-base leading-relaxed ${isDark ? "text-ink-muted" : "text-ink-muted"}`}>
            Provide an explanation note to the seeker explaining why you are declining their cancellation request (e.g. work already in progress, resources purchased).
          </p>

          <div>
            <label htmlFor="decline-cancellation-reason" className={`text-xs font-semibold mb-1.5 block ${isDark ? "text-ink-muted" : "text-ink-secondary"}`}>
              Decline Reason / Explanation Note
            </label>
            <textarea
              id="decline-cancellation-reason"
              aria-describedby="decline-cancellation-hint"
              disabled={isSubmitting}
              maxLength={1000}
              rows={4}
              required
              minLength={3}
              placeholder="Explain why you are declining the cancellation..."
              value={declineNote}
              onChange={(event) => onDeclineNoteChange(event.target.value)}
              className={`w-full px-4 py-3 rounded-xl border outline-none font-medium text-sm resize-none transition-all ${isDark ? "bg-charcoal-inset border-neutral-850 text-white focus:border-[#10b981]/80 focus:ring-1 focus:ring-[#10b981]/30" : "bg-slate-50 border-slate-200 text-ink-secondary focus:border-[#10b981]"}`}
            />
            <div id="decline-cancellation-hint" className="servicehub-dialog__hint">Enter at least 3 characters.</div>
          </div>

          <div className={`servicehub-dialog__actions border-t ${isDark ? "border-neutral-850" : "border-slate-100"}`}>
            <button
              type="button"
              disabled={isSubmitting} onClick={onClose}
              className={`px-4 py-2.5 border font-bold text-xs rounded-xl transition-all ${isDark ? "border-neutral-800 hover:bg-charcoal-hover text-ink-muted" : "border-slate-200 hover:bg-slate-50 text-ink-muted"}`}
            >
              Cancel
            </button>
            <button
              type="submit" data-dialog-action="danger"
              disabled={isActionDisabled || isSubmitting || !validReason}
              className={`px-5 py-2.5 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center space-x-1.5 cursor-pointer ${isSubmitting ? "bg-charcoal text-ink-muted cursor-not-allowed opacity-60" : "bg-red-600 hover:bg-red-700"}`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                  <span>Declining...</span>
                </>
              ) : (
                <span>Decline Request</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
