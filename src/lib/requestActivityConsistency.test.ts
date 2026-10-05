import { describe, expect, it } from 'vitest';
import { mapBookingToEngagement, mapCompletedServiceToEngagement, mapEngagements, mapRequestToJobRequest } from '../context/mappers';
import { getBookingOutcome } from './bookingOutcome';
import { formatRequestUrgency, isRequestUrgency, requestUrgencyRank } from './requestUrgency';
import { countProviderActivityTab, filterProviderActivityItems } from '../components/provider/activity/providerActivity.utils';
import { getActivitySituation } from '../components/activity/ActivitySituation';

const booking = { id: 'booking', seekerId: 'seeker', providerId: 'provider', paymentMethod: 'On-site Cash', createdAt: '2026-10-02T02:00:00.000Z' };

describe('request and authoritative Activity data', () => {
  it.each([
    ['PENDING_APPROVAL', 'pending_provider', undefined],
    ['ACCEPTED', 'in_progress', undefined],
    ['ONGOING', 'in_progress', undefined],
    ['AWAITING_CONFIRMATION', 'awaiting_seeker_approval', undefined],
    ['DISPUTED', 'disputed', undefined],
    ['COMPLETED', 'completed', 'completed'],
    ['DECLINED', 'canceled', 'declined'],
    ['CANCELED', 'canceled', 'canceled'],
    ['REMOVED', 'canceled', 'removed'],
  ])('preserves %s and distinguishes its outcome from completion', (status, uiStatus, outcome) => {
    const engagement = mapBookingToEngagement({ ...booking, status });
    expect(engagement.status).toBe(uiStatus);
    expect(engagement.bookingStatus).toBe(status);
    expect(getBookingOutcome(engagement)).toBe(outcome);
    if (uiStatus === 'canceled') {
      expect(engagement.completedServiceId).toBeUndefined();
      expect(engagement.completedAt).toBeUndefined();
      expect(getActivitySituation(engagement, 'provider').detail).toBe('This engagement ended without completion.');
    }
  });

  it('maps ACCEPTED plus a waiting queue to queued, without claiming work started', () => {
    const engagement = mapBookingToEngagement({ ...booking, status: 'ACCEPTED', queue: { status: 'WAITING', position: 2 }, started: false });
    expect(engagement.status).toBe('queued');
    expect(getBookingOutcome(engagement)).toBeUndefined();
  });

  it('keeps canceled bookings authoritative over stale completion records after every refresh', () => {
    const canceled = { ...booking, status: 'CANCELED', offer: { id: 'offer', requestId: 'request', availability: 'Monday' } };
    const stale = { id: 'old-completion', bookingId: booking.id, booking: { ...booking, status: 'COMPLETED' }, seekerId: booking.seekerId, providerId: booking.providerId, finalPrice: 150 };
    for (let refresh = 0; refresh < 2; refresh++) {
      const mapped = mapEngagements([canceled], [stale]);
      expect(mapped).toHaveLength(1);
      expect(mapped[0].status).toBe('canceled');
      expect(mapped[0].completedServiceId).toBeUndefined();
      expect(mapped[0].providerAvailability).toBe('Monday');
      expect(countProviderActivityTab('completed', mapped, [])).toBe(0);
      expect(countProviderActivityTab('canceled', mapped, [])).toBe(1);
      expect(filterProviderActivityItems({ activeTab: 'canceled', engagements: mapped, pendingBids: [], jobRequests: [], services: [], searchQuery: '', sortBy: 'newest' })).toHaveLength(1);
    }
    expect(mapCompletedServiceToEngagement({ ...stale, booking: canceled }).status).toBe('canceled');
  });

  it('retains genuinely completed bookings with or without their completion enrichment', () => {
    const completedBooking = { ...booking, status: 'COMPLETED' };
    const record = { id: 'completion', bookingId: booking.id, booking: completedBooking, seekerId: booking.seekerId, providerId: booking.providerId, finalPrice: 150 };
    expect(mapEngagements([completedBooking], [])[0].status).toBe('completed');
    const mapped = mapEngagements([completedBooking], [record]);
    expect(mapped).toHaveLength(1);
    expect(mapped[0].completedServiceId).toBe('completion');
    expect(getBookingOutcome(mapped[0])).toBe('completed');
  });

  it('keeps historical urgency readable without making it a valid new choice', () => {
    const old = 'July 16 at 2 PM';
    expect(mapRequestToJobRequest({ id: 'request', title: 'Door repair', description: 'Fix this door.', status: 'OPEN', urgency: old }).urgency).toBe(old);
    expect(formatRequestUrgency(old)).toBe(old);
    expect(isRequestUrgency(old)).toBe(false);
    expect(formatRequestUrgency('medium')).toBe('Next 1-2 Days');
  });

  it('sorts and filters controlled urgency consistently while accepting no random new choices', () => {
    const values = ['ASAP / Today', 'Needs Tomorrow', 'Next 1-2 Days', 'This Week', 'Flexible Schedule'];
    expect(values.map(isRequestUrgency)).toEqual([true, true, true, true, true]);
    expect(values.map(requestUrgencyRank)).toEqual([4, 3, 2, 1, 0]);
    expect(isRequestUrgency('random words')).toBe(false);
  });
});
