import { describe, expect, it } from 'vitest';
import { mapBookingToEngagement, mapServiceToListing } from './mappers';

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
