import { describe, expect, it } from 'vitest';
import { mutationResources, socketResources } from './cachePolicy';

describe('Booking transition refresh scope', () => {
  it.each([
    ['started', '/bookings/queue/booking/start'],
    ['awaiting_confirmation', '/bookings/queue/booking/complete'],
    ['completed', '/bookings/booking/confirm'],
    ['created', '/bookings/direct'],
    ['accepted', '/bookings/direct/booking/respond'],
    ['accepted_offer', '/bookings/direct-from-offer'],
    ['disputed', '/bookings/booking/dispute'],
    ['safety_report', '/bookings/booking/reports'],
    ['completion_escalated', '/bookings/booking/completion-escalations'],
    ['cancellation_escalated', '/bookings/cancellation-requests/request/escalate'],
    ['reviewed', '/reviews'],
  ])('refreshes the same state for the actor and recipient on %s', (type, path) => {
    expect(socketResources('ENGAGEMENT_CHANGED', { type })).toEqual(mutationResources(path));
    expect(mutationResources(path)).toContain('bookings');
    expect(mutationResources(path)).toContain('notifications');
  });
  it('does not reload offers, requests, or balances just to start/finish work', () => {
    for (const type of ['started', 'awaiting_confirmation']) {
      const resources = socketResources('ENGAGEMENT_CHANGED', { type });
      expect(resources).not.toContain('offers');
      expect(resources).not.toContain('requests');
      expect(resources).not.toContain('transactions');
    }
    expect(socketResources('ENGAGEMENT_CHANGED', { type: 'completed' })).toEqual(expect.arrayContaining(['transactions', 'profiles', 'requests']));
  });
  it('scopes removal to the actor activity and conversations', () => {
    expect(mutationResources('/bookings/booking/hide')).toEqual(['bookings', 'messages']);
    expect(socketResources('ENGAGEMENT_CHANGED', { type: 'hidden' })).toEqual(['bookings', 'messages']);
  });
  it('does not reload unrelated feeds for reports, disputes, or escalation', () => {
    for (const type of ['disputed', 'safety_report', 'cancellation_requested', 'cancellation_declined', 'cancellation_escalated', 'completion_escalated']) {
      expect(socketResources('ENGAGEMENT_CHANGED', { type })).toEqual(['bookings', 'notifications', 'admin']);
    }
    expect(mutationResources('/reviews/review')).toContain('bookings');
  });
  it('keeps broad invalidation for financial cancellation decisions and unknown events', () => {
    for (const payload of [undefined, { type: 'cancelled' }, { type: 'cancellation_approved' }, { type: 'unknown' }]) {
      expect(socketResources('ENGAGEMENT_CHANGED', payload)).toEqual(mutationResources('/bookings'));
    }
  });
});
