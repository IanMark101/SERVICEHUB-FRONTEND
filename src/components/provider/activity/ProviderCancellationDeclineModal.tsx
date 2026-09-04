import type { FormEvent } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";

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
  if (!requestId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm select-none animate-in fade-in duration-200">
      <div className={`rounded-[24px] max-w-lg w-full overflow-hidden shadow-xl border animate-in zoom-in-95 duration-200 ${isDark ? "bg-[#22211e] border-neutral-800/80 text-[#f2efe9]" : "bg-white border-slate-200 text-slate-800"}`}>
        <div className={`p-5 border-b flex justify-between items-center ${isDark ? "border-neutral-850 bg-[#1c1b18]/45" : "border-slate-100 bg-slate-50/50"}`}>
          <h3 className={`font-extrabold text-sm flex items-center space-x-1.5 ${isDark ? "text-[#f2efe9]" : "text-slate-900"}`}>
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span>Decline Cancellation Request</span>
          </h3>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg border transition-colors ${isDark ? "border-neutral-800 hover:bg-slate-800 text-neutral-455" : "border-slate-200 hover:bg-slate-100 text-slate-400"}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-5 space-y-4">
          <p className={`text-[10px] leading-relaxed ${isDark ? "text-[#b4b0a9]" : "text-slate-500"}`}>
            Provide an explanation note to the seeker explaining why you are declining their cancellation request (e.g. work already in progress, resources purchased).
          </p>

          <div>
            <label className={`text-xs font-semibold mb-1.5 block ${isDark ? "text-[#b4b0a9]" : "text-slate-655"}`}>
              Decline Reason / Explanation Note
            </label>
            <textarea
              rows={4}
              required
              placeholder="Explain why you are declining the cancellation..."
              value={declineNote}
              onChange={(event) => onDeclineNoteChange(event.target.value)}
              className={`w-full px-4 py-3 rounded-xl border outline-none font-medium text-sm resize-none transition-all ${isDark ? "bg-[#1c1b18] border-neutral-850 text-[#f2efe9] focus:border-[#10b981]/80 focus:ring-1 focus:ring-[#10b981]/30" : "bg-slate-50 border-slate-200 text-slate-700 focus:border-[#10b981]"}`}
            />
          </div>

          <div className={`pt-3 border-t flex items-center justify-end space-x-2.5 ${isDark ? "border-neutral-850" : "border-slate-100"}`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2.5 border font-bold text-xs rounded-xl transition-all ${isDark ? "border-neutral-800 hover:bg-[#2c2b27] text-[#b4b0a9]" : "border-slate-200 hover:bg-slate-50 text-slate-500"}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isActionDisabled}
              className={`px-5 py-2.5 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center space-x-1.5 cursor-pointer ${isSubmitting ? "bg-neutral-800 text-neutral-500 cursor-not-allowed opacity-60" : "bg-red-600 hover:bg-red-700"}`}
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
