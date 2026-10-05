import { describe, expect, it } from 'vitest';
import type { JobEngagement } from '../../types';
import { getActivitySituation } from './ActivitySituation';
import { countSeekerActivityStatus, filterSeekerActivityEngagements } from '../seeker/activity/seekerActivity.utils';
import { countProviderActivityTab, filterProviderActivityItems } from '../provider/activity/providerActivity.utils';

const booking: JobEngagement = {
  id: 'booking-1', title: 'House Cleaning', seekerId: 'johncarlo', seekerName: 'John Carlo', seekerAvatar: '',
  providerId: 'ian', providerName: 'Ian', providerAvatar: '', serviceId: 'service-1',
  price: 250, status: 'queued', paymentMethod: 'GCash', paymentStatus: 'PAID_HELD', queuePaymentStatus: 'PAID_HELD', queuePosition: 1, queueStatus: 'WAITING',
  createdAt: '2026-09-27T09:00:00.000Z', started: false,
};

describe('Activity situation and filter semantics', () => {
  it('describes one online queue booking differently to each participant without calling it completed', () => {
    const seeker = getActivitySituation(booking, 'seeker', 'johncarlo');
    const provider = getActivitySituation(booking, 'provider', 'ian');
    expect(seeker.label).toBe('Waiting on provider');
    expect(seeker.title).toBe("First in this provider's paid queue");
    expect(seeker.next).toContain('provider can start');
    expect(provider.label).toBe('Ready to start');
    expect(provider.next).toContain('only one job');
    expect(getActivitySituation(booking, 'provider', 'ian', 'another-booking').label).toBe('Another job active');
  });

  it('keeps accepted cash before work distinct from a started job', () => {
    const accepted = { ...booking, status: 'in_progress' as const, paymentMethod: 'On-site Cash' as const, queuePosition: undefined };
    expect(getActivitySituation(accepted, 'seeker').title).toBe('Booking accepted, work not started');
    expect(getActivitySituation(accepted, 'provider').label).toBe('Ready to start');
    expect(getActivitySituation({ ...accepted, started: true }, 'seeker').title).toBe('Your service is in progress');
  });

  it('does not invite a provider to start cash work ahead of paid bookings', () => {
    const cash = { ...booking, status: 'in_progress' as const, paymentMethod: 'On-site Cash' as const, queuePosition: undefined };
    const provider = getActivitySituation(cash, 'provider', 'ian', undefined, true);
    expect(provider.label).toBe('Paid jobs ahead');
    expect(provider.next).toContain('Start the paid jobs first');
  });

  it('makes the seeker completion decision and provider waiting state explicit', () => {
    const awaiting = { ...booking, status: 'awaiting_seeker_approval' as const };
    expect(getActivitySituation(awaiting, 'seeker').label).toBe('Your confirmation needed');
    expect(getActivitySituation(awaiting, 'provider').label).toBe('Waiting on seeker');
    expect(getActivitySituation(awaiting, 'seeker').next).toContain('Report Issue');
  });

  it('does not describe an offer or an onsite-cash request as queued work', () => {
    const cashRequest = { ...booking, status: 'pending_provider' as const, paymentMethod: 'On-site Cash' as const };
    expect(getActivitySituation(cashRequest, 'provider').title).toBe('A direct request is waiting');
    expect(getActivitySituation(cashRequest, 'seeker').title).toBe('Your request is awaiting approval');
  });

  it('prioritizes an incoming cancellation decision and ignores stale requests on closed bookings', () => {
    const cancellationRequests = [{ id: 'cancel-1', status: 'PENDING', requestedBy: 'ian', reason: 'Unavailable' }];
    expect(getActivitySituation({ ...booking, cancellationRequests }, 'seeker', 'johncarlo').label).toBe('Your decision needed');
    expect(getActivitySituation({ ...booking, cancellationRequests }, 'provider', 'ian').label).toBe('Waiting on response');
    expect(getActivitySituation({ ...booking, status: 'completed', cancellationRequests }, 'seeker', 'johncarlo').label).toBe('Completed');
  });

  it('surfaces disputes and closed history without promising an automatic release', () => {
    expect(getActivitySituation({ ...booking, status: 'disputed' }, 'seeker').label).toBe('Admin review');
    expect(getActivitySituation({ ...booking, status: 'completed' }, 'provider').title).toBe('This booking is complete');
    expect(getActivitySituation({ ...booking, status: 'canceled' }, 'seeker').title).toBe('This booking was canceled');
  });

  it('filters accepted-but-not-started work into Before Work, not Work Underway', () => {
    const acceptedCash = { ...booking, id: 'cash-1', status: 'in_progress' as const, paymentMethod: 'On-site Cash' as const, started: false };
    const started = { ...acceptedCash, id: 'cash-2', started: true };
    const engagements = [acceptedCash, started];
    expect(countSeekerActivityStatus(engagements, 'before_work', 'johncarlo')).toBe(1);
    expect(countSeekerActivityStatus(engagements, 'in_progress', 'johncarlo')).toBe(1);
    expect(filterSeekerActivityEngagements({ activeTab: 'pending', engagements, searchQuery: '', sortBy: 'newest', categoryForEngagement: () => 'Cleaning', currentUserId: 'johncarlo' }).map((item) => item.id)).toEqual(['cash-1']);
    expect(countProviderActivityTab('waiting', engagements, [])).toBe(1);
    expect(countProviderActivityTab('in_progress', engagements, [])).toBe(1);
    expect(filterProviderActivityItems({ activeTab: 'in_progress', engagements, pendingBids: [], jobRequests: [], services: [], searchQuery: '', sortBy: 'newest' }).map((item) => item.data.id)).toEqual(['cash-2']);
  });

  it('includes incoming cancellation decisions in the seeker Action Required tab', () => {
    const incoming = { ...booking, cancellationRequests: [{ id: 'cancel-1', status: 'PENDING', requestedBy: 'ian' }] };
    const engagements = [incoming];
    expect(countSeekerActivityStatus(engagements, 'action_required', 'johncarlo')).toBe(1);
    expect(filterSeekerActivityEngagements({ activeTab: 'action_required', engagements, searchQuery: '', sortBy: 'newest', categoryForEngagement: () => 'Cleaning', currentUserId: 'johncarlo' })).toEqual([incoming]);
    expect(countSeekerActivityStatus(engagements, 'action_required', 'ian')).toBe(0);
  });
});
