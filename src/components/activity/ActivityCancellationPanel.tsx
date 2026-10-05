import { CheckCircle, CircleNotch, Clock, WarningCircle } from '@phosphor-icons/react';
import type { JobEngagement } from '../../types';
import './booking-workroom.css';

interface Props {
  booking: JobEngagement;
  role: 'seeker' | 'provider';
  currentUserId?: string;
  loadingItemId: string | null;
  loadingActionType: string | null;
  onApprove: (requestId: string) => void;
  onDecline: (requestId: string) => void;
  onEscalate: (requestId: string) => void;
}

export default function ActivityCancellationPanel({ booking, role, currentUserId, loadingItemId, loadingActionType, onApprove, onDecline, onEscalate }: Props) {
  const request = booking.cancellationRequests?.[0];
  if (!request || !['PENDING', 'UNDER_REVIEW', 'DECLINED', 'ESCALATED', 'RESOLVED'].includes(request.status)) return null;
  if (['completed', 'canceled'].includes(booking.status) && request.status !== 'RESOLVED') return null;

  const mine = request.requestedBy === currentUserId;
  const other = role === 'provider' ? 'seeker' : 'provider';
  const disabled = Boolean(loadingItemId);
  const approving = loadingItemId === request.id && loadingActionType === 'approve_cancellation';
  const escalating = loadingItemId === request.id && ['escalate', 'escalate_cancellation'].includes(loadingActionType ?? '');
  const pending = request.status === 'PENDING';
  const declined = request.status === 'DECLINED';
  const processing = request.status === 'UNDER_REVIEW';
  const resolved = request.status === 'RESOLVED';
  const canRetry = processing && !request.adminId && !mine;
  const title = pending
    ? mine ? 'Your Cancellation Request' : `Cancellation Requested by ${role === 'provider' ? 'Seeker' : 'Provider'}`
    : declined
      ? mine ? `Cancellation declined by ${other}` : 'You declined the cancellation request'
      : processing ? 'Cancellation is being processed'
        : resolved ? 'Admin resolved the cancellation request' : 'Cancellation is under Admin review';
  const note = pending ? request.reason : declined ? request.responderNote || request.providerNote : resolved ? request.adminNote : null;
  const Icon = resolved ? CheckCircle : declined ? WarningCircle : Clock;

  return (
    <section aria-label="Cancellation request" className="booking-cancellation" data-tone={declined ? 'danger' : pending ? 'warning' : 'neutral'} aria-busy={approving || escalating}>
      <div className="booking-cancellation__heading"><Icon size={20} aria-hidden="true" /><h3>{title}</h3></div>
      {(pending || declined || resolved) && <div className="booking-cancellation__reason">
        <p className="booking-cancellation__label">{pending ? 'Reason for cancellation' : declined ? 'Reason for declining' : 'Admin explanation'}</p>
        <p>{note || 'No explanation provided.'}</p>
      </div>}
      {pending && <p>{mine ? `Waiting for the ${other} to approve or decline. The booking remains open.` : booking.paymentMethod === 'GCash'
        ? 'Approving cancels the booking and processes any eligible GCash Test Mode refund.'
        : 'Approving cancels the booking. Cash payments are arranged directly; ServiceHub does not issue a cash refund.'}</p>}
      {declined && <p>{booking.status === 'awaiting_seeker_approval'
        ? role === 'seeker' ? 'The provider has since marked the work finished. Review the completion decision below. You can still ask Admin to review the declined cancellation.' : 'You have marked the work finished. The seeker must review completion.'
        : mine ? 'The booking remains open. You can ask Admin to review this decision.' : `The ${other} has been notified and can ask Admin to review this decision.`}</p>}
      {processing && <p>{request.adminId ? 'An administrator is processing the decision. The booking will update when processing finishes.' : 'Cancellation approval is awaiting settlement. Check the booking status before trying again.'}</p>}
      {request.status === 'ESCALATED' && <p>An administrator is reviewing the cancellation. You will be notified when a decision is made.</p>}
      {((pending && !mine) || canRetry || (declined && mine)) && <div className="booking-cancellation__actions">
        {((pending && !mine) || canRetry) && <button type="button" className="booking-decision-button" data-variant="approve" disabled={disabled} onClick={() => onApprove(request.id)}>
          {approving && <CircleNotch size={18} className="animate-spin" aria-hidden="true" />}
          {approving ? canRetry ? 'Retrying…' : role === 'provider' ? 'Approving...' : 'Approving…' : canRetry ? 'Retry approval' : role === 'seeker' ? 'Approve' : booking.paymentMethod === 'GCash' ? 'Approve & Refund' : 'Approve Cancellation'}
        </button>}
        {pending && !mine && <button type="button" className="booking-decision-button" data-variant="decline" disabled={disabled} onClick={() => onDecline(request.id)}>{role === 'provider' ? 'Decline Request' : 'Decline'}</button>}
        {declined && mine && <button type="button" className="booking-decision-button" data-variant="danger" disabled={disabled} onClick={() => onEscalate(request.id)}>
          {escalating && <CircleNotch size={18} className="animate-spin" aria-hidden="true" />}{escalating ? 'Escalating...' : 'Escalate to Admin'}
        </button>}
      </div>}
      {approving && <p role="status">Processing cancellation and any eligible refund…</p>}
      {escalating && <p role="status">Sending the cancellation to Admin for review…</p>}
    </section>
  );
}
