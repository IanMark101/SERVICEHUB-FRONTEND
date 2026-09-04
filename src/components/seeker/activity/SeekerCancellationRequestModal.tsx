import { FormEvent } from 'react';
import { AlertCircle, Loader2, X } from 'lucide-react';
import { JobEngagement } from '../../../types';

interface SeekerCancellationRequestModalProps {
  engagement: JobEngagement | null;
  reason: string;
  isDark: boolean;
  isSubmitting: boolean;
  isActionDisabled: boolean;
  onReasonChange: (reason: string) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export default function SeekerCancellationRequestModal({
  engagement,
  reason,
  isDark,
  isSubmitting,
  isActionDisabled,
  onReasonChange,
  onClose,
  onSubmit
}: SeekerCancellationRequestModalProps) {
  if (!engagement) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm select-none animate-in fade-in duration-200">
      <div className={`rounded-[24px] max-w-lg w-full overflow-hidden shadow-xl border animate-in zoom-in-95 duration-200 ${isDark ? 'bg-[#22211e] border-neutral-800/80 text-[#f2efe9]' : 'bg-white border-slate-200 text-slate-800'}`}>
        <div className={`p-5 border-b flex justify-between items-center ${isDark ? 'border-neutral-850 bg-[#1c1b18]/45' : 'border-slate-100 bg-slate-50/50'}`}>
          <h3 className={`font-extrabold text-sm flex items-center space-x-1.5 ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
            <AlertCircle className="w-4 h-4 text-orange-500" />
            <span>{engagement.started ? 'Submit Cancellation Request' : 'Cancel Booking'}</span>
          </h3>
          <button onClick={onClose} className={`p-1.5 rounded-lg border transition-colors ${isDark ? 'border-neutral-800 hover:bg-slate-800 text-neutral-450' : 'border-slate-200 hover:bg-slate-100 text-slate-400'}`}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-5 space-y-4">
          <p className={`text-[10px] leading-relaxed ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>
            {engagement.started
              ? 'Work has started, so the other participant must review this request before cancellation. A declined request can be escalated to Admin.'
              : 'Work has not started. Cancellation is immediate, but a reason is required for the booking audit trail and notifications.'}
          </p>
          <div>
            <label className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-655'}`}>
              Reason for Cancellation
            </label>
            <textarea
              rows={4}
              required
              placeholder="Explain why you want to cancel this service booking..."
              value={reason}
              onChange={(event) => onReasonChange(event.target.value)}
              className={`w-full px-4 py-3 rounded-xl border outline-none font-medium text-sm resize-none transition-all ${isDark ? 'bg-[#1c1b18] border-neutral-850 text-[#f2efe9] focus:border-orange-500/80 focus:ring-1 focus:ring-orange-500/30' : 'bg-slate-50 border-slate-200 text-slate-700 focus:border-orange-500'}`}
            />
          </div>
          <div className={`pt-3 border-t flex items-center justify-end space-x-2.5 ${isDark ? 'border-neutral-850' : 'border-slate-100'}`}>
            <button type="button" onClick={onClose} className={`px-4 py-2.5 border font-bold text-xs rounded-xl transition-all ${isDark ? 'border-neutral-800 hover:bg-[#2c2b27] text-[#b4b0a9]' : 'border-slate-200 hover:bg-slate-50 text-slate-500'}`}>
              Cancel
            </button>
            <button type="submit" disabled={isActionDisabled} className={`px-5 py-2.5 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center space-x-1.5 cursor-pointer ${isSubmitting ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed opacity-60' : 'bg-orange-600 hover:bg-orange-700'}`}>
              {isSubmitting ? <><Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /><span>Cancelling...</span></> : <span>{engagement.started ? 'Submit Request' : 'Cancel Booking'}</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
