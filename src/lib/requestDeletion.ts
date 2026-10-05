import type { Bid, JobRequest } from '../types';

/** Server metadata is authoritative; newer local offer/status data can only protect further. */
export function requestDeleteBlockedReason(request: JobRequest, bids: Bid[] = []): string | null {
  const status = request.status.toUpperCase();
  if (request.canDelete === false && request.deleteBlockedReason) return request.deleteBlockedReason;
  if (request.hasCompletedBooking) return 'This request can’t be deleted because it has a completed booking. Its booking history must be kept.';
  if (status === 'IN_PROGRESS' || status === 'FILLED' || request.hasActiveBooking) return 'This request can’t be deleted while it has an active booking. Manage the booking in Activity.';
  const offers = bids.filter(bid => bid.requestId === request.id);
  if (request.hasAcceptedOffer || offers.some(offer => offer.status.toUpperCase() === 'ACCEPTED')) return 'This request can’t be deleted because an offer has already been accepted. Review the booking in Activity.';
  if (status === 'PAYMENT_PENDING' || request.hasPendingPaymentOffer || offers.some(offer => offer.status.toUpperCase() === 'PENDING_PAYMENT')) return 'This request can’t be deleted while a payment or refund is being processed. Check its payment status in Activity.';
  if (status !== 'OPEN') return 'Reopen this paused request before deleting it. Requests with booking history must be kept.';
  return request.canDelete === false ? 'This request can’t be deleted right now because it is already involved in an active service.' : null;
}
