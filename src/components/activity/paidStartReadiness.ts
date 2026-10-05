import type { JobEngagement } from '../../types';

export function getPaidStartBlockReason(booking: JobEngagement, activeJobId?: string): string | null {
  if (booking.queueStatus !== 'WAITING') return 'This booking is no longer waiting in the paid queue.';
  if (booking.queuePosition !== 1) return 'Earlier paid bookings must finish before this one can start.';
  if (activeJobId && activeJobId !== booking.id) return 'Finish your current job before starting another one.';
  if (booking.started) return 'This job has already started.';
  if (booking.paymentStatus !== 'PAID_HELD' || booking.queuePaymentStatus !== 'PAID_HELD') return 'The GCash payment is not ready for work. Check the booking details.';
  if (booking.status !== 'queued') return 'This booking is not ready to start.';
  return null;
}
