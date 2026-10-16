import type { JobEngagement } from '../types';

const WAIT_MS = 72 * 60 * 60 * 1000;

export function completionReviewForBooking(booking: JobEngagement) {
  if (booking.status !== 'awaiting_seeker_approval' || booking.paymentMethod !== 'GCash') return null;
  if (booking.completionReview !== undefined) return booking.completionReview;
  // A mark-complete mutation already contains its recorded event, before the next read refresh.
  const markedAt = Math.max(0, ...(booking.progressEvents || [])
    .filter(event => event.kind === 'WORK_MARKED_COMPLETE')
    .map(event => Date.parse(event.occurredAt)).filter(Number.isFinite));
  return markedAt ? { availableAt: new Date(markedAt + WAIT_MS).toISOString(), pending: false } : null;
}

export function canRequestCompletionReview(booking: JobEngagement, now = Date.now()) {
  const review = completionReviewForBooking(booking);
  return !!review && !review.pending && Date.parse(review.availableAt) <= now;
}
