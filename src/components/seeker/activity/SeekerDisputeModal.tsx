import { FormEvent } from 'react';
import { Warning as AlertTriangle, CircleNotch as Loader2, X } from '@phosphor-icons/react';
import { JobEngagement } from '../../../types';

import useDialogFocus from '../../../hooks/useDialogFocus';
import '../../ui/dialog.css';

interface SeekerDisputeModalProps {
  engagement: JobEngagement | null;
  reason: string;
  isDark: boolean;
  isSubmitting: boolean;
  isActionDisabled: boolean;
  onReasonChange: (reason: string) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export default function SeekerDisputeModal({
  engagement,
  reason,
  isDark,
  isSubmitting,
  isActionDisabled,
  onReasonChange,
  onClose,
  onSubmit
}: SeekerDisputeModalProps) {
  const dialogRef = useDialogFocus(Boolean(engagement), isSubmitting, onClose);
  const validReason = reason.trim().length >= 10;
  if (!engagement) return null;

  return (
    <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="service-dispute-title" aria-describedby="service-dispute-description" aria-busy={isSubmitting} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`servicehub-dialog rounded-2xl max-w-lg w-full shadow-xl border animate-in zoom-in-95 duration-200 ${isDark ? 'bg-charcoal-surface border-neutral-800/80 text-white' : 'bg-white border-slate-200 text-ink'}`}>
        <div className={`p-5 border-b flex justify-between items-center ${isDark ? 'border-neutral-850 bg-charcoal-inset/45' : 'border-slate-100 bg-slate-50/50'}`}>
          <h3 id="service-dispute-title" className={`font-extrabold text-sm flex items-center space-x-1.5 ${isDark ? 'text-white' : 'text-ink'}`}>
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span>File a Service Dispute</span>
          </h3>
          <button type="button" aria-label="Close dialog" disabled={isSubmitting} onClick={onClose} className={`p-1.5 rounded-lg border transition-colors ${isDark ? 'border-neutral-800 hover:bg-charcoal text-ink-subtle' : 'border-slate-200 hover:bg-slate-100 text-ink-subtle'}`}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={(event) => { if (!validReason || isActionDisabled || isSubmitting) { event.preventDefault(); return; } onSubmit(event); }} className="p-5 space-y-4">
          <p id="service-dispute-description" className={`text-base leading-relaxed ${isDark ? 'text-ink-muted' : 'text-ink-muted'}`}>
            Disputing will freeze this contract and alert a ServiceHub administrator. Describe the issues with the provider&apos;s work in detail.
          </p>
          <div>
            <label htmlFor="service-dispute-reason" className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-ink-muted' : 'text-ink-secondary'}`}>
              Reason for Dispute
            </label>
            <textarea
              id="service-dispute-reason"
              aria-describedby="service-dispute-hint"
              disabled={isSubmitting}
              maxLength={2000}
              rows={4}
              required
              minLength={10}
              placeholder="Describe what went wrong (e.g. work not finished, poor quality, provider did not show up)..."
              value={reason}
              onChange={(event) => onReasonChange(event.target.value)}
              className={`w-full px-4 py-3 rounded-xl border outline-none font-medium text-sm resize-none transition-all ${isDark ? 'bg-charcoal-inset border-neutral-850 text-white focus:border-orange-500/80 focus:ring-1 focus:ring-orange-500/30' : 'bg-slate-50 border-slate-200 text-ink-secondary focus:border-orange-500'}`}
            />
            <div id="service-dispute-hint" className="servicehub-dialog__hint">Enter at least 10 characters.</div>
          </div>
          <div className={`servicehub-dialog__actions border-t ${isDark ? 'border-neutral-850' : 'border-slate-100'}`}>
            <button type="button" disabled={isSubmitting} onClick={onClose} className={`px-4 py-2.5 border font-bold text-xs rounded-xl transition-all ${isDark ? 'border-neutral-800 hover:bg-charcoal-hover text-ink-muted' : 'border-slate-200 hover:bg-slate-50 text-ink-muted'}`}>
              Cancel
            </button>
            <button type="submit" data-dialog-action="danger" disabled={isActionDisabled || isSubmitting || !validReason} className={`px-5 py-2.5 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center space-x-1.5 cursor-pointer ${isSubmitting ? 'bg-charcoal text-ink-muted cursor-not-allowed opacity-60' : 'bg-red-600 hover:bg-red-700'}`}>
              {isSubmitting ? <><Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /><span>Filing Dispute...</span></> : <span>File Dispute</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
