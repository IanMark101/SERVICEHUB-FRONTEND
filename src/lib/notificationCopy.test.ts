import { describe, expect, it } from 'vitest';
import { notificationCopy } from './notificationCopy';
import { mapDbNotification } from '../context/mappers';

describe('plain-language notification copy', () => {
  it('simplifies a saved booking notification while preserving the exact service name', () => {
    expect(notificationCopy('New Direct Booking Request', 'A new Direct Arrangement booking request has arrived for "Direct Arrangement Plumbing". Review it in Incoming Requests.')).toEqual({
      title: 'New booking request', description: 'A new booking request has arrived for "Direct Arrangement Plumbing". Review it in Incoming Requests.',
    });
  });
  it('explains the next step after acceptance without suggesting the work has started', () => {
    expect(notificationCopy('Booking Accepted! 🎉', 'Your booking request was accepted! Messaging is now enabled — coordinate details with your provider via chat.')).toEqual({
      title: 'Booking accepted', description: 'Your booking request was accepted! You can now message your provider to arrange the work.',
    });
  });
  it('keeps unfamiliar notices and test-payment facts intact', () => {
    const body = 'Your Test Mode payment needs review. No real money was transferred.';
    expect(notificationCopy('Payment needs review', body)).toEqual({ title: 'Payment needs review', description: body });
  });
  it('clearly tells the provider what to do after their offer is accepted', () => {
    expect(notificationCopy('Offer Accepted! 💰', 'Your offer on "PIPE REPAIR" was accepted! Messaging is now enabled — chat to coordinate service details.')).toEqual({
      title: 'Offer accepted', description: 'Your offer on "PIPE REPAIR" was accepted! You can now message the seeker to arrange the work.',
    });
  });
  it('preserves notification ownership, read state and booking link when mapping saved data', () => {
    const result = mapDbNotification({ id: 'notice-1', userId: 'seeker-1', title: 'Booking Confirmed! 🎉', body: 'You accepted the offer for "PIPE REPAIR". Messaging is now enabled to coordinate with your provider.',
      isRead: false, link: '/seeker/seeker-activity?booking=booking-1', createdAt: new Date().toISOString() });
    expect(result).toMatchObject({ id: 'notice-1', userId: 'seeker-1', read: false, link: '/seeker/seeker-activity?booking=booking-1', title: 'Booking confirmed',
      desc: 'You accepted the offer for "PIPE REPAIR". You can now message your provider to arrange the work.' });
  });
});
