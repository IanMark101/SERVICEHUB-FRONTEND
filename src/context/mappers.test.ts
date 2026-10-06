import { describe, expect, it } from 'vitest';
import { mapBookingToEngagement, mapRequestToJobRequest, mapServiceToListing } from './mappers';

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
