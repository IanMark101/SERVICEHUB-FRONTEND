export const CONCERNS: Record<string, string> = {
  POOR_SERVICE_QUALITY: 'Poor service quality', INCOMPLETE_SERVICE: 'Incomplete service', SCAM_OR_FRAUD: 'Scam or fraud',
  INAPPROPRIATE_BEHAVIOR: 'Inappropriate behavior', OVERPRICING: 'Overpricing', NO_SHOW: 'No-show',
  CANCELLATION_REVIEW: 'Cancellation review', COMPLETION_REVIEW: 'Completion review',
};
export const CASE_TYPES: Record<string, string> = { COMPLETION_DISPUTE: 'Completion dispute', SAFETY: 'Safety report', CANCELLATION_ESCALATION: 'Cancellation escalation', COMPLETION_ESCALATION: 'Completion escalation' };
const STATES: Record<string, string> = {
  PENDING: 'Pending', UNDER_REVIEW: 'Under review', RESOLVED: 'Resolved', DISMISSED: 'Dismissed',
  PENDING_APPROVAL: 'Awaiting provider approval', WAITING: 'In the paid queue', ACCEPTED: 'Ready to start',
  ONGOING: 'Work underway', AWAITING_CONFIRMATION: 'Awaiting seeker confirmation', DISPUTED: 'Paused for case review',
  COMPLETED: 'Completed', CANCELED: 'Cancelled', CANCELLED: 'Cancelled',
  PAID_HELD: 'Payment held until completion', FROZEN_HELD: 'Payment temporarily held for review', RELEASED: 'Released to provider ledger',
  REFUNDED: 'Refunded to seeker', UNPAID: 'No payment collected by ServiceHub', CASH_CONFIRMED: 'On-site cash confirmed',
  APPROVED: 'Verified', ACTIVE: 'Active', SUSPENDED: 'Temporarily suspended', BANNED: 'Banned',
  SUCCEEDED: 'Succeeded', FAILED: 'Failed', EXPIRED: 'Expired', SERVING: 'Current job',
  QUEUED: 'Waiting in queue', PROCESSING: 'Processing', FAILED_RETRYABLE: 'Decision needs retry',
  CASE_REVIEW_STARTED: 'Case review started', REPORT_DISMISS: 'Report dismissed', REPORT_RESOLVE_SAFETY: 'Safety finding recorded',
  REPORT_CANCEL_BOOKING: 'Booking cancelled', REPORT_RELEASE_PROVIDER_AND_COMPLETE: 'Booking completed',
  CANCELLATION_APPROVED: 'Cancellation approved', CANCELLATION_DENIED: 'Cancellation declined',
  CANCELLATION_CASE_CLOSED_BY_PARTICIPANT: 'Cancellation case closed after participant approval',
  COMPLETION_ESCALATION_KEEP_AWAITING: 'Kept awaiting confirmation', COMPLETION_ESCALATION_REFUND_SEEKER: 'Seeker refunded',
  COMPLETION_ESCALATION_RELEASE_PROVIDER_AND_COMPLETE: 'Completed in provider’s favor',
};
export function stateLabel(value?: string | null) { return value ? STATES[value] || value.toLowerCase().replace(/_/g, ' ').replace(/^./, s => s.toUpperCase()) : 'Not recorded'; }
export function caseStatusLabel(item: ModerationCase) {
  const approved = ['APPROVED', 'PARTICIPANT_APPROVED', 'IMMEDIATE_CANCEL'].includes(item.cancellation?.resolutionOutcome || '');
  return item.status === 'RESOLVED' && item.type === 'CANCELLATION_ESCALATION' && approved
    ? 'Resolved — Cancellation approved' : stateLabel(item.status);
}
export function money(value: number | string) { return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 2 }).format(Number(value)); }
export function dateLabel(value: string) { return new Date(value).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' }); }
export const DECISIONS: Record<string, { title: string; description: string; danger?: boolean }> = {
  dismiss: { title: 'Dismiss report', description: 'Close the report without a penalty. Restore the previous booking state once no other case blocks it.' },
  resolve_safety: { title: 'Record a supported safety finding', description: 'Resolve the safety report and restore the previous booking state once no other case blocks it. Existing completed or cancelled bookings keep their payment outcome.' },
  cancel_booking: { title: 'Cancel booking', description: 'Close the booking and remove it from the queue. Refund any held online payment. No platform refund is created for cash.', danger: true },
  refund_seeker: { title: 'Cancel and refund seeker', description: 'Close the booking and remove it from the queue. Refund any held online payment. No platform refund is created for cash.', danger: true },
  release_provider_and_complete: { title: 'Complete in provider’s favor', description: 'Record service completion. Release held online payment to the provider ledger, or record cash as externally confirmed. Apply the existing completion trust event once.' },
  keep_awaiting: { title: 'Keep awaiting confirmation', description: 'Close this escalation while the booking awaits the seeker. Payment remains held. The provider can escalate again after the 72-hour cooldown.' },
  approve_cancellation: { title: 'Approve cancellation', description: 'Close the linked cancellation case, cancel the booking and remove it from the queue. Refund any held online payment. Cash has no platform refund.', danger: true },
  deny_cancellation: { title: 'Decline cancellation', description: 'Close the linked cancellation case and keep the booking active. Other open cases may continue to block it. Payment is not released.' },
};
export const PENALTIES = { none: 'No account penalty', warn: 'Issue a formal warning', trust_deduct: 'Deduct 10 trust points', suspend: 'Suspend for 7 days', ban: 'Ban account' };
import type { ModerationCase } from './types';

