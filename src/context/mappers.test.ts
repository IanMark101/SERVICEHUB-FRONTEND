import { describe, expect, it } from 'vitest';
import { mapBookingToEngagement, mapCompletedServiceToEngagement, mapOfferToBid, mapRequestToJobRequest, mapServiceToListing } from './mappers';

const service = (queueEntries: unknown[], bookings: unknown[]) => ({
  id: 'service-1',
  providerId: 'provider-1',
  title: 'Repair',
  description: 'Repair service',
  price: 500,
  queueEntries,
  bookings,
});

describe('workspace API mappers', () => {
  it('retains offer Seeker metadata without a loaded request list', () => {
    const bid = mapOfferToBid({ id: 'offer-1', requestId: 'closed-request', providerId: 'provider-1',
      provider: { name: 'John' }, estimatedDuration: 90, availability: 'Saturday morning',
      decisionAt: '2026-10-03T05:15:00.000Z', status: 'REJECTED', decisionReason: 'DECLINED',
      request: { seeker: { id: 'ian', name: 'Ian', avatarUrl: '/ian-avatar.png', trustScore: 82 }, category: { name: 'Electrical repair' } } });
    expect(bid).toMatchObject({ seekerId: 'ian', seekerName: 'Ian', seekerAvatar: '/ian-avatar.png',
      seekerTrustScore: 82, category: 'Electrical repair', estimatedDuration: 90, availability: 'Saturday morning',
      decisionAt: '2026-10-03T05:15:00.000Z', providerName: 'John' });
  });

  it('preserves booking category and timing metadata when completed history replaces the active record', () => {
    const source = { id: 'booking-1', seekerId: 'seeker', providerId: 'provider', status: 'COMPLETED',
      createdAt: '2026-10-02T02:30:00.000Z', estimatedDurationMins: 90,
      seeker: { avatarUrl: '/ian-avatar.png', trustScore: 82 },
      offer: { id: 'offer', requestId: 'archived-request', estimatedDuration: 120, availability: 'Saturday morning',
        request: { category: { name: 'Electrical repair' } } },
      directRequest: { schedule: 'Saturday 10 AM' } };
    const metadata = { category: 'Electrical repair', estimatedDurationMins: 90,
      providerAvailability: 'Saturday morning', preferredSchedule: 'Saturday 10 AM' };
    expect(mapBookingToEngagement(source)).toMatchObject(metadata);
    expect(mapCompletedServiceToEngagement({ id: 'completed', seekerId: 'seeker', providerId: 'provider',
      booking: source, completedAt: '2026-10-03T05:15:00.000Z' })).toMatchObject({ ...metadata,
      seekerAvatar: '/ian-avatar.png', seekerTrustScore: 82, bookingCreatedAt: source.createdAt });
  });

  it('uses a direct service category when the booking has no public offer', () => {
    expect(mapBookingToEngagement({ id: 'direct', seekerId: 's', providerId: 'p',
      service: { category: { name: 'Aircon repair' }, estimatedDurationMins: 60 } })).toMatchObject({ category: 'Aircon repair', estimatedDurationMins: 60 });
  });

  it('keeps the original public request reachable from completed Activity without depending on Request Manager', () => {
    const booking = { id: 'booking-archived', status: 'COMPLETED', seekerId: 'seeker', providerId: 'provider',
      offer: { id: 'offer', requestId: 'archived-request', request: { title: 'Tutor request', targetServiceId: null } } };
    expect(mapBookingToEngagement(booking).repostRequestId).toBe('archived-request');
    expect(mapCompletedServiceToEngagement({ id: 'completed', seekerId: 'seeker', providerId: 'provider', booking, finalPrice: 250 }).repostRequestId).toBe('archived-request');
    expect(mapBookingToEngagement({ ...booking, status: 'ONGOING' }).repostRequestId).toBeUndefined();
    expect(mapBookingToEngagement({ ...booking, offer: { ...booking.offer, request: { ...booking.offer.request, targetServiceId: 'direct-service' } } }).repostRequestId).toBeUndefined();
  });
  it('preserves client reputation without borrowing provider reviews', () => {
    const request = mapRequestToJobRequest({
      id: 'request-1', title: 'Door repair', description: 'Repair a door.', status: 'OPEN',
      seeker: { id: 'resident-1', trustScore: 79, verificationStatus: 'APPROVED', clientRating: 3.5, clientReviewCount: 2, reviewsReceived: [{ rating: 5 }] },
    });
    expect(request).toMatchObject({ seekerTrustScore: 79, seekerVerificationStatus: 'APPROVED', seekerRating: 3.5, seekerReviewCount: 2 });
    const unknown = mapRequestToJobRequest({ id: 'request-2', title: 'Repair', description: '', status: 'OPEN', seeker: { reviewsReceived: [{ rating: 5 }] } });
    expect(unknown.seekerTrustScore).toBeUndefined();
    expect(unknown.seekerRating).toBeUndefined();
    expect(unknown.seekerReviewCount).toBeUndefined();
  });
  it('identifies a completed request from its linked booking, not the ambiguous CLOSED status', () => {
    const request = mapRequestToJobRequest({
      id: 'old-request', title: 'Pipe repair', description: 'Fix the leaking pipe', status: 'CLOSED',
      offers: [{ booking: { status: 'COMPLETED' } }],
    });
    expect(request.hasCompletedBooking).toBe(true);
    expect(request.status).toBe('CLOSED');
  });
  it('maps an Admin-reserved UNDER_REVIEW booking to the paused disputed UI state', () => {
    const engagement = mapBookingToEngagement({
      id: 'booking-review',
      status: 'UNDER_REVIEW',
      seekerId: 'seeker-1',
      providerId: 'provider-1',
      paymentMethod: 'GCash',
    });
    expect(engagement.status).toBe('disputed');
  });

  it('preserves server payment and queue status for role-specific Activity wording', () => {
    const engagement = mapBookingToEngagement({
      id: 'booking-queued', seekerId: 'seeker-1', providerId: 'provider-1',
      status: 'QUEUED', paymentMethod: 'GCash', paymentStatus: 'PAID_HELD',
      queue: { status: 'WAITING', position: 2 },
    });
    expect(engagement.paymentStatus).toBe('PAID_HELD');
    expect(engagement.queueStatus).toBe('WAITING');
    expect(engagement.queuePosition).toBe(2);
  });

  it.each([
    ['one online SERVING row', [{}], [{}], 1],
    ['SERVING plus WAITING rows', [{}, {}], [{}, {}], 2],
    ['one ongoing cash booking', [], [{}], 0],
    ['one disputed online SERVING row', [{}], [{}], 1],
  ])('uses canonical Queue occupancy for %s', (_name, queueEntries, bookings, expected) => {
    expect(mapServiceToListing(service(queueEntries, bookings)).queueSize).toBe(expected);
  });
});
