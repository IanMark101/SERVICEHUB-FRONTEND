import { Trash2 } from 'lucide-react';
import type { AccountDeletionRequest } from '../../../api/users.api';

interface AccountDangerZoneProps {
  isOpen: boolean;
  confirmation: string;
  deleting: boolean;
  request: AccountDeletionRequest | null;
  cardBg: string;
  innerBg: string;
  headingText: string;
  labelText: string;
  inputClass: string;
  onOpen: () => void;
  onClose: () => void;
  onConfirmationChange: (value: string) => void;
  onDelete: () => void;
}

const BLOCKER_LABELS: Record<string, string> = {
  nonterminalBookings: 'active bookings',
  heldPayments: 'held online payments',
  cancellations: 'open cancellation cases',
  reports: 'unresolved reports',
  completionEscalations: 'completion escalations',
};

export default function AccountDangerZone({
  isOpen,
  confirmation,
  deleting,
  request,
  cardBg,
  innerBg,
  headingText,
  labelText,
  inputClass,
  onOpen,
  onClose,
  onConfirmationChange,
  onDelete,
}: AccountDangerZoneProps) {
  return (
    <>
      <div className="space-y-3 rounded-[24px] border border-rose-500/20 bg-rose-500/5 p-6">
        <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-rose-500">
          <Trash2 size={17} /> Danger Zone
        </h3>
        <p className="text-xs leading-relaxed text-rose-400/90">
          Request account deletion for administrator review. Financial transactions, moderation records,
          audit history, and documents under retention or legal hold may be retained or anonymized as required.
        </p>
        {request && request.status !== 'CANCELLED' && (
          <div className={`rounded-xl border p-3 text-xs ${innerBg} ${headingText}`}>
            <p className="font-bold">Request status: {request.status.replace(/_/g, ' ')}</p>
            {request.status === 'BLOCKED' && request.blockers && request.blockers.length > 0 && (
              <ul className={`mt-2 list-disc space-y-1 pl-4 ${labelText}`}>
                {request.blockers.map((blocker) => (
                  <li key={blocker.type}>{blocker.count} {BLOCKER_LABELS[blocker.type] || blocker.type}</li>
                ))}
              </ul>
            )}
          </div>
        )}
        <button type="button" onClick={onOpen} className="rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-rose-700 active:scale-95">
          Request Account Deletion
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className={`${cardBg} w-full max-w-md space-y-4 rounded-3xl border p-6 shadow-2xl`}>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-500">
              <Trash2 size={24} />
            </div>
            <h4 className={`text-base font-black ${headingText}`}>Request Account Deletion</h4>
            <p className={`text-xs leading-relaxed ${labelText}`}>
              Type <strong className="text-rose-500">DELETE</strong> to submit a deletion request. This does not
              immediately erase your account. Active bookings, held payments, cancellations, reports, or
              escalations must be resolved first, and retained financial or audit records are preserved.
            </p>
            <input type="text" value={confirmation} onChange={(event) => onConfirmationChange(event.target.value)} placeholder="Type DELETE" className={inputClass} />
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={onClose} className={`flex-1 rounded-xl border py-2.5 text-xs font-bold ${innerBg} ${headingText}`}>Cancel</button>
              <button type="button" disabled={confirmation !== 'DELETE' || deleting} onClick={onDelete} className="flex-1 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white transition-all hover:bg-rose-700 disabled:opacity-50">
                {deleting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
