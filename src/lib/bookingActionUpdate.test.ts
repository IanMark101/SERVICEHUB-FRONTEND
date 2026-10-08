import { describe, expect, it } from 'vitest';
import { mapBookingToEngagement } from '../context/mappers';
import { mergeBookingAction } from './bookingActionUpdate';

describe('Booking action acknowledgements', () => {
  const initial = mapBookingToEngagement({
    id: 'booking', status: 'ACCEPTED', seekerId: 'seeker', providerId: 'provider',
    seeker: { name: 'Ian', avatarUrl: '/ian.jpg', trustScore: 55 },
    provider: { name: 'John', avatarUrl: '/john.jpg', trustScore: 58 },
    service: { title: 'Fix faucet', category: { name: 'Plumbing' } },
    agreedAmount: 500, estimatedDurationMins: 60,
    paymentMethod: 'GCash', paymentStatus: 'PAID_HELD',
    queue: { status: 'WAITING', position: 1 }, started: false,
  });
  it('preserves participant profiles and details through start, mark, and confirmation', () => {
    let current = [initial];
    for (const [status, kind] of [['ONGOING', 'STARTED'], ['AWAITING_CONFIRMATION', 'WORK_MARKED_COMPLETE'], ['COMPLETED', 'COMPLETION_CONFIRMED']]) {
      current = mergeBookingAction(current, {
        id: 'booking', status, started: true,
        progressEvent: { id: kind, kind, actorRole: 'PROVIDER', occurredAt: '2026-10-08T10:00:00.000Z' },
      });
      expect(current[0]).toMatchObject({
        title: 'Fix faucet', category: 'Plumbing', price: 500, estimatedDurationMins: 60,
        seekerName: 'Ian', seekerAvatar: '/ian.jpg', seekerTrustScore: 55,
        providerName: 'John', providerAvatar: '/john.jpg', providerTrustScore: 58,
      });
    }
    expect(current[0].progressEvents).toHaveLength(3);
    expect(current[0].queueStatus).toBe('DONE');
  });
  it('enables reviews using the confirmed completion record and retains server timestamps', () => {
    const [completed] = mergeBookingAction([initial], {
      id: 'completion', bookingId: 'booking', completedAt: '2026-10-08T10:12:34.000Z',
      booking: { id: 'booking', seekerId: 'seeker', providerId: 'provider', status: 'COMPLETED', paymentStatus: 'RELEASED' },
    });
    expect(completed).toMatchObject({ completedServiceId: 'completion', status: 'completed',
      paymentStatus: 'RELEASED', completionRecordedAt: '2026-10-08T10:12:34.000Z' });
  });
  it('does not duplicate a progress event on retry or invent state for an incomplete response', () => {
    const event = { id: 'started', kind: 'STARTED', actorRole: 'PROVIDER' as const, occurredAt: '2026-10-08T10:00:00.000Z' };
    const started = mergeBookingAction([initial], { id: 'booking', status: 'ONGOING', progressEvent: event });
    expect(mergeBookingAction(started, { id: 'booking', status: 'ONGOING', progressEvent: event })[0].progressEvents).toHaveLength(1);
    expect(mergeBookingAction(started, { id: 'booking' })).toBe(started);
  });
  it('keeps an accepted paid job waiting until the provider actually starts it', () => {
    expect(mergeBookingAction([initial], { id: 'booking', status: 'ACCEPTED', started: false })[0])
      .toMatchObject({ status: 'queued', queueStatus: 'WAITING', started: false });
  });
  it('merges confirmed cancellation decisions, reviews, and removal without losing booking facts', () => {
    const cancellationRequest = { id: 'cancel', requestedBy: 'seeker', status: 'DECLINED', responderNote: 'Continue work', resolvedAt: '2026-10-09T01:00:00Z' };
    let current = mergeBookingAction([initial], { id: 'booking', cancellationRequest });
    expect(current[0]).toMatchObject({ status: 'queued', title: 'Fix faucet', seekerAvatar: '/ian.jpg', cancellationRequests: [cancellationRequest], progressCancellationRequests: [cancellationRequest] });
    current = mergeBookingAction(current, { id: 'booking', review: { id: 'review', authorId: 'seeker', rating: 5 } });
    current = mergeBookingAction(current, { id: 'booking', review: { id: 'review', authorId: 'seeker', rating: 4 } });
    expect(current[0].reviews).toHaveLength(1);
    expect(current[0].reviews?.[0].rating).toBe(4);
    current = mergeBookingAction(current, { id: 'booking', booking: { id: 'booking', status: 'CANCELED', paymentStatus: 'REFUNDED' } });
    expect(current[0]).toMatchObject({ status: 'canceled', paymentStatus: 'REFUNDED', queueStatus: 'CANCELLED', category: 'Plumbing', estimatedDurationMins: 60 });
    expect(mergeBookingAction(current, { id: 'booking', hidden: true })).toEqual([]);
  });
});
