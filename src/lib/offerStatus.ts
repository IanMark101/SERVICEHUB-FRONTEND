import type { Bid } from '../types';

export function normalizeOfferStatus(status: string | undefined): Bid['status'] {
  switch (status?.toUpperCase()) {
    case 'PENDING': return 'pending';
    case 'PENDING_PAYMENT': return 'pending_payment';
    case 'ACCEPTED': return 'accepted';
    case 'WITHDRAWN': return 'withdrawn';
    case 'CANCELED': return 'canceled';
    default: return 'declined';
  }
}

export const isOfferAwaitingDecision = (offer: Pick<Bid, 'status'>) => ['pending', 'pending_payment'].includes(normalizeOfferStatus(offer.status));
export const isOfferClosed = (offer: Pick<Bid, 'status'>) => ['declined', 'withdrawn', 'canceled'].includes(normalizeOfferStatus(offer.status));
export const hasActiveOffer = (offer: Pick<Bid, 'status'>) => isOfferAwaitingDecision(offer) || normalizeOfferStatus(offer.status) === 'accepted';

export function offerSituation(offer: Pick<Bid, 'status' | 'requestStatus' | 'decisionReason'>) {
  const status = normalizeOfferStatus(offer.status);
  const canWithdraw = status === 'pending' && (!offer.requestStatus || offer.requestStatus === 'OPEN');
  if (status === 'pending_payment') return { title: 'GCash payment in progress', label: 'Awaiting payment', detail: 'The seeker selected your offer. A booking is created only after payment is confirmed.', next: 'Wait for payment confirmation. This offer cannot be withdrawn during checkout.', canWithdraw: false };
  if (status === 'withdrawn') return { title: 'Offer withdrawn', label: 'Withdrawn', detail: 'You withdrew this offer. It is no longer available to the seeker.', next: 'You can send a new offer if the request is still open.', canWithdraw: false };
  if (status === 'declined' || status === 'canceled') return {
    title: offer.decisionReason === 'DECLINED' ? 'Offer declined by seeker' : offer.decisionReason === 'NOT_SELECTED' ? 'Another offer was selected' : 'Offer closed',
    label: 'Closed', detail: 'This offer is no longer awaiting a decision.', next: 'Browse open requests for other work.', canWithdraw: false,
  };
  return { title: 'Offer sent to seeker', label: 'Waiting on seeker', detail: 'Your offer has been submitted. No booking exists yet.', next: canWithdraw ? 'The seeker may choose an offer. You can withdraw yours while it is pending.' : 'The request is paused or another checkout is in progress. Wait for the request to reopen.', canWithdraw };
}
