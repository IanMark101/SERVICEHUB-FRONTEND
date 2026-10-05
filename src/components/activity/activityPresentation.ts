import type { JobEngagement } from '../../types';
import { getActivitySituation } from './ActivitySituation';

export type ActivityRole = 'seeker' | 'provider';
export type ActivityGroup = 'your_turn' | 'work_underway' | 'waiting' | 'under_review' | 'history';

export const activityGroupOrder: ActivityGroup[] = [
  'your_turn', 'work_underway', 'waiting', 'under_review', 'history',
];

export const activityGroupLabels: Record<ActivityGroup, string> = {
  your_turn: 'Your Turn',
  work_underway: 'Work Underway',
  waiting: 'Waiting',
  under_review: 'Under Review',
  history: 'History',
};


export function getBookingActivityGroup(
  booking: JobEngagement,
  role: ActivityRole,
  currentUserId?: string,
  activeJobId?: string,
  paidWaiting?: boolean,
): ActivityGroup {
  if (booking.status === 'completed' || booking.status === 'canceled') return 'history';
  if (booking.status === 'disputed' || booking.cancellationRequests?.[0]?.status === 'ESCALATED' || booking.cancellationRequests?.[0]?.status === 'UNDER_REVIEW') return 'under_review';
  const situation = getActivitySituation(booking, role, currentUserId, activeJobId, paidWaiting);
  if (situation.tone === 'action') return 'your_turn';
  if (booking.status === 'in_progress' && booking.started) return 'work_underway';
  return 'waiting';
}

export interface ActivityPaymentCopy { label: string; detail: string }

export function getActivityPaymentCopy(booking: JobEngagement): ActivityPaymentCopy {
  if (booking.paymentMethod === 'On-site Cash') {
    switch (booking.paymentStatus) {
      case 'CASH_CONFIRMED': return { label: 'Cash payment confirmed', detail: 'The on-site cash transaction has been confirmed. ServiceHub did not collect this payment.' };
      case 'UNPAID': return { label: 'Pay on site', detail: 'This cash payment is arranged directly with the provider. ServiceHub has not collected it.' };
      default: return { label: 'On-site cash', detail: 'Payment is handled directly on site. Its current confirmation status is not available here.' };
    }
  }
  switch (booking.paymentStatus) {
    case 'PAID_HELD': return { label: 'Payment confirmed', detail: 'GCash Test Mode payment is confirmed. Funds remain in the internal hold until the service is resolved.' };
    case 'FROZEN_HELD': return { label: 'Funds temporarily held', detail: 'The GCash Test Mode payment is awaiting dispute resolution. It has not been released or refunded.' };
    case 'RELEASED': return { label: 'Payment released', detail: 'The internal Test Mode record was released after completion. This does not mean a real provider payout occurred.' };
    case 'REFUNDED': return { label: 'Payment refunded', detail: 'The GCash Test Mode payment was refunded after the booking was closed.' };
    default: return { label: 'GCash payment status updating', detail: 'The current payment result is not available here yet. Do not assume the service is paid or complete.' };
  }
}

export function getActivityQueueCopy(booking: JobEngagement): ActivityPaymentCopy {
  if (booking.paymentMethod === 'On-site Cash') return { label: 'Direct cash arrangement', detail: 'On-site cash bookings do not receive a numbered paid queue position.' };
  if (booking.status === 'disputed') return {
    label: booking.queuePosition ? `Position #${booking.queuePosition} paused` : 'Queue paused',
    detail: 'This booking is under review. Its place in the provider’s paid workload is preserved while the case is resolved.',
  };
  if (booking.status === 'completed' || booking.status === 'awaiting_seeker_approval') return { label: 'Queue finished', detail: 'The booking is no longer waiting in the provider’s paid work queue.' };
  if (booking.status === 'canceled') return { label: 'Left the queue', detail: 'This booking no longer has an active queue position.' };
  if (booking.queueStatus === 'SERVING' || (booking.status === 'in_progress' && booking.started)) return { label: 'Service underway', detail: 'This booking is being served, not waiting in line.' };
  if (booking.queueStatus === 'WAITING' || booking.status === 'queued') return {
    label: booking.queuePosition ? `Position #${booking.queuePosition}` : 'Waiting for position',
    detail: 'First-come, first-served across this provider’s paid jobs. The provider may perform only one active job at a time.',
  };
  if (booking.queueStatus === 'DONE') return { label: 'Queue finished', detail: 'The booking is no longer waiting in the provider’s paid work queue.' };
  if (booking.queueStatus === 'CANCELLED' || booking.queueStatus === 'REMOVED') return { label: 'Left the queue', detail: 'This booking no longer has an active queue position.' };
  return { label: 'Queue status updating', detail: 'The current position is not available here yet.' };
}
